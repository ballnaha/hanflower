import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

// Set max duration to 5 minutes for large file uploads
export const maxDuration = 300;

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];
        const folder = formData.get('folder') as string || '';

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
        }

        const baseUploadDir = join(process.cwd(), 'public', 'uploads');
        const uploadDir = folder ? join(baseUploadDir, folder) : baseUploadDir;

        // Ensure upload directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (err) {
            console.log('Upload directory check:', err);
        }

        const uploadedPaths: string[] = [];

        for (const file of files as File[]) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
            const isGif = file.type === 'image/gif' || fileExt === 'gif';

            // Create unique filename
            const uniqueId = crypto.randomUUID();

            // If it's a GIF, use original extension and bypass sharp optimization to preserve animation
            if (isGif) {
                const filename = `${uniqueId}.gif`;
                const filePath = join(uploadDir, filename);
                const relativePath = folder ? `/uploads/${folder}/${filename}` : `/uploads/${filename}`;

                // Write original buffer directly
                await writeFile(filePath, buffer);
                console.log('Saved GIF directly (bypassed optimization):', filename);
                uploadedPaths.push(relativePath);
                continue; // Skip sharp processing for this file
            }

            // For non-GIF images, try sharp optimization
            const filename = `${uniqueId}.webp`;
            const filePath = join(uploadDir, filename);
            const relativePath = folder ? `/uploads/${folder}/${filename}` : `/uploads/${filename}`;

            try {
                await sharp(buffer)
                    .resize(1200, 1200, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .webp({ quality: 80 })
                    .toFile(filePath);

                console.log('Successfully processed image with Sharp:', filename);
                uploadedPaths.push(relativePath);
            } catch (sharpError) {
                console.error('Sharp processing failed, falling back to original upload:', sharpError);

                // Fallback: save original file
                const originalFilename = `${uniqueId}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                const originalFilePath = join(uploadDir, originalFilename);
                const originalRelativePath = folder ? `/uploads/${folder}/${originalFilename}` : `/uploads/${originalFilename}`;

                await writeFile(originalFilePath, buffer);
                uploadedPaths.push(originalRelativePath);
            }
        }

        return NextResponse.json({ paths: uploadedPaths });
    } catch (error) {
        console.error('Core Upload error:', error);
        return NextResponse.json({ error: 'Upload failed', details: String(error) }, { status: 500 });
    }
}
