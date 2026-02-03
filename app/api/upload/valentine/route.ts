
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const slug = formData.get('slug') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file received' }, { status: 400 });
        }

        if (!slug) {
            return NextResponse.json({ error: 'No slug provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Sanitize filename to be safe
        const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${Date.now()}_${safeFilename}`;

        // Ensure upload directory exists: public/uploads/valentine/[slug]
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'valentine', slug);
        await mkdir(uploadDir, { recursive: true });

        await writeFile(path.join(uploadDir, filename), buffer);

        return NextResponse.json({
            success: true,
            url: `/uploads/valentine/${slug}/${filename}`
        });
    } catch (error) {
        console.error('Valentine Upload failed:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
