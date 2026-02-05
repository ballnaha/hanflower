
import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    // Await params if it's a promise (Next.js 15+ requirement)
    const { path } = await params;

    // Join the path segments
    const filename = path.join('/');

    // Path to the uploads directory
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filePath = join(uploadDir, filename);

    // Basic security: prevent directory traversal by checking if the resolved path is inside uploadDir
    if (!filePath.startsWith(uploadDir)) {
        return new NextResponse('Access Denied', { status: 403 });
    }

    // Check if file exists
    if (!existsSync(filePath)) {
        return new NextResponse('Image Not Found', { status: 404 });
    }

    try {
        const fileBuffer = await readFile(filePath);

        // Determine content type based on extension
        const ext = filename.split('.').pop()?.toLowerCase();
        let contentType = 'application/octet-stream';

        switch (ext) {
            case 'webp':
                contentType = 'image/webp';
                break;
            case 'jpg':
            case 'jpeg':
                contentType = 'image/jpeg';
                break;
            case 'png':
                contentType = 'image/png';
                break;
            case 'gif':
                contentType = 'image/gif';
                break;
            case 'svg':
                contentType = 'image/svg+xml';
                break;
            case 'mp3':
                contentType = 'audio/mpeg';
                break;
            case 'mp4':
                contentType = 'video/mp4';
                break;
        }

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Error reading file through proxy:', error);
        return new NextResponse('Error loading file', { status: 500 });
    }
}
