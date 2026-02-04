
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

        // Resize image using sharp
        const resizedBuffer = await sharp(buffer)
            .resize(800, 800, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: 80 })
            .toBuffer();

        const filename = `popup_${Date.now()}.webp`;

        // Ensure upload directory exists: public/uploads/settings
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'settings');
        await mkdir(uploadDir, { recursive: true });

        await writeFile(path.join(uploadDir, filename), resizedBuffer);

        return NextResponse.json({
            success: true,
            url: `/uploads/settings/${filename}`
        });
    } catch (error) {
        console.error('Settings Image Upload failed:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
