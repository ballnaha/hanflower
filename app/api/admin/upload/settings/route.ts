
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file received' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Ensure upload directory exists: public/uploads
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });

        // Create unique filename
        const filename = `settings_popup_${crypto.randomUUID()}.webp`;
        const filePath = path.join(uploadDir, filename);

        try {
            // Process image using sharp
            await sharp(buffer)
                .resize(1000, 1000, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ quality: 80 })
                .toFile(filePath);

            console.log('Processed settings image with Sharp:', filename);
        } catch (sharpError) {
            console.error('Sharp processing failed for settings image, falling back to original:', sharpError);
            // Fallback: save original with its original extension if possible, or just keep it simple
            const originalFilename = `settings_fallback_${crypto.randomUUID()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
            const originalPath = path.join(uploadDir, originalFilename);
            await writeFile(originalPath, buffer);

            return NextResponse.json({
                success: true,
                url: `/api/images/${originalFilename}`
            });
        }

        return NextResponse.json({
            success: true,
            url: `/api/images/${filename}`
        });
    } catch (error) {
        console.error('Settings Image Upload failed:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
