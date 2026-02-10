
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

// Set max duration for large file uploads
export const maxDuration = 300;

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const slug = formData.get('slug') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file received' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');

        // Ensure upload directory exists: public/uploads
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });

        // Create unique filename
        const uuid = crypto.randomUUID();
        // OPTIMIZED: Preserve GIF extension to keep animation, otherwise use webp for images, or original for others
        const extension = (isImage && !isGif) ? 'webp' : file.name.split('.').pop();
        const filename = `val_${slug || 'anon'}_${uuid}.${extension}`;
        const filePath = path.join(uploadDir, filename);

        if (isImage && !isGif) {
            try {
                // Try to use sharp for optimization (Only for non-GIF regular images)
                await sharp(buffer)
                    .resize(1200, 1200, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .webp({ quality: 80 })
                    .toFile(filePath);

                console.log('Successfully processed Valentine image with Sharp:', filename);
            } catch (sharpError) {
                console.error('Sharp processing failed, falling back to original upload:', sharpError);
                // Fallback for images if sharp fails
                const originalFilename = `val_${slug || 'anon'}_${uuid}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                const originalPath = path.join(uploadDir, originalFilename);
                await writeFile(originalPath, buffer);

                return NextResponse.json({
                    success: true,
                    url: `/api/images/${originalFilename}`
                });
            }
        } else {
            // GIFs, Videos or other files - SAVE ORIGINAL BUFFER
            await writeFile(filePath, buffer);
            console.log(`Saved original file (GIF/Video/Other): ${filename}`);
        }

        return NextResponse.json({
            success: true,
            url: `/api/images/${filename}`
        });
    } catch (error) {
        console.error('Valentine Upload failed:', error);
        return NextResponse.json({ error: 'Upload failed', details: String(error) }, { status: 500 });
    }
}
