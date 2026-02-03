import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
        }

        const uploadDir = join(process.cwd(), 'public', 'uploads');

        // Ensure upload directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (err) {
            // Already exists or permission issue
            console.log('Upload directory check:', err);
        }

        const uploadedPaths: string[] = [];

        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create unique filename
            const filename = `${crypto.randomUUID()}.webp`;
            const filePath = join(uploadDir, filename);

            try {
                // Try to use sharp for optimization
                await sharp(buffer)
                    .resize(1200, 1200, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .webp({ quality: 80 })
                    .toFile(filePath);

                console.log('Successfully processed image with Sharp:', filename);
                uploadedPaths.push(`/api/images/${filename}`);
            } catch (sharpError) {
                console.error('Sharp processing failed, falling back to original upload:', sharpError);

                // Fallback: Save original file if sharp fails
                // Change extension to original if it's not webp, but here we'll keep it simple
                const originalFilename = `${crypto.randomUUID()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                const originalPath = join(uploadDir, originalFilename);
                await writeFile(originalPath, buffer);
                uploadedPaths.push(`/api/images/${originalFilename}`);
            }
        }

        return NextResponse.json({ paths: uploadedPaths });
    } catch (error) {
        console.error('Core Upload error:', error);
        return NextResponse.json({ error: 'Upload failed', details: String(error) }, { status: 500 });
    }
}
