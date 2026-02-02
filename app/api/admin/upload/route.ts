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
            // Already exists
        }

        const uploadedPaths: string[] = [];

        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create unique filename - force .webp for optimization
            const filename = `${crypto.randomUUID()}.webp`;
            const path = join(uploadDir, filename);

            // Use sharp to resize and compress
            // - Resize to max 1200px width/height while maintaining aspect ratio
            // - Convert to webp with 80% quality
            await sharp(buffer)
                .resize(1200, 1200, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ quality: 80 })
                .toFile(path);

            uploadedPaths.push(`/uploads/${filename}`);
        }

        return NextResponse.json({ paths: uploadedPaths });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
