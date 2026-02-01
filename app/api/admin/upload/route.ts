import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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
            // Already exists or other error handled by writeFile later
        }

        const uploadedPaths: string[] = [];

        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create unique filename
            const ext = file.name.split('.').pop();
            const filename = `${crypto.randomUUID()}.${ext}`;
            const path = join(uploadDir, filename);

            await writeFile(path, buffer);
            uploadedPaths.push(`/uploads/${filename}`);
        }

        return NextResponse.json({ paths: uploadedPaths });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
