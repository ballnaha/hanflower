import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all albums for admin
export async function GET() {
    try {
        const albums = await (prisma as any).eventAlbum.findMany({
            orderBy: {
                priority: 'desc'
            },
            include: {
                _count: {
                    select: { photos: true }
                }
            }
        });

        return NextResponse.json(albums);
    } catch (error) {
        console.error('Error fetching admin events:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST create new album
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, category, location, date, coverImage, priority, isActive, photos } = body;

        if (!title || !coverImage) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const album = await (prisma as any).eventAlbum.create({
            data: {
                title,
                category,
                location,
                date,
                coverImage,
                priority: parseInt(String(priority)) || 0,
                isActive: isActive !== undefined ? isActive : true,
                photos: photos && Array.isArray(photos) ? {
                    create: photos.map((p: any, idx: number) => ({
                        url: p.url,
                        caption: p.caption || '',
                        order: p.order !== undefined ? p.order : idx
                    }))
                } : undefined
            },
            include: {
                photos: true
            }
        });

        return NextResponse.json(album);
    } catch (error) {
        console.error('Error creating admin event album:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
