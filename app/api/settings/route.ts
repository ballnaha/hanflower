import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { unlink } from 'fs/promises';
import path from 'path';

// Public: GET all settings
export async function GET() {
    try {
        const settings = await prisma.setting.findMany();
        // Convert array to object key-value
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(settingsMap);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// Protected: POST/PATCH updates
export async function PATCH(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { settings, urlsToDelete } = body;

        if (settings && typeof settings === 'object') {
            const updates = Object.entries(settings).map(([key, value]) => {
                return prisma.setting.upsert({
                    where: { key },
                    update: { value: String(value) },
                    create: { key, value: String(value) },
                });
            });

            await prisma.$transaction(updates);
        }

        // Handle file deletions
        if (urlsToDelete && Array.isArray(urlsToDelete)) {
            for (const url of urlsToDelete) {
                if (!url) continue;

                let filePath = '';
                if (url.startsWith('/uploads/')) {
                    filePath = path.join(process.cwd(), 'public', url);
                } else if (url.startsWith('/api/images/')) {
                    const filename = url.replace('/api/images/', '');
                    filePath = path.join(process.cwd(), 'public', 'uploads', filename);
                }

                if (filePath) {
                    try {
                        await unlink(filePath);
                        console.log(`Deleted file: ${filePath}`);
                    } catch (err: any) {
                        if (err.code !== 'ENOENT') {
                            console.error(`Error deleting file ${url}:`, err);
                        }
                    }
                }
            }
        }

        return NextResponse.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
