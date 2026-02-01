import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
    try {
        const { path } = await request.json();

        if (!path || !path.startsWith('/uploads/')) {
            return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
        }

        const fullPath = join(process.cwd(), 'public', path);

        try {
            await unlink(fullPath);
            return NextResponse.json({ success: true });
        } catch (err: any) {
            // If file doesn't exist, we still consider it a success/no-op
            if (err.code === 'ENOENT') {
                return NextResponse.json({ success: true, message: 'File not found' });
            }
            throw err;
        }
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
