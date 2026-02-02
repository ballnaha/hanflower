
import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        const { filePath } = await req.json();

        if (!filePath) {
            return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
        }

        // Security check: Ensure the file is within the public/uploads directory
        if (!filePath.startsWith('/uploads/')) {
            return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
        }

        // Construct the absolute path
        const absolutePath = path.join(process.cwd(), 'public', filePath);

        try {
            await unlink(absolutePath);
            return NextResponse.json({ success: true });
        } catch (err: any) {
            // Include error code in log for debugging
            console.error(`Failed to delete file ${absolutePath}:`, err);

            // If file doesn't exist, technically it's already "deleted", so we can return success or a specific message.
            if (err.code === 'ENOENT') {
                return NextResponse.json({ success: true, message: 'File was already deleted or not found' });
            }
            return NextResponse.json({ error: 'Failed to delete file on server' }, { status: 500 });
        }

    } catch (error) {
        console.error('Delete file error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
