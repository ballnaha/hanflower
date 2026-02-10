
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all albums for admin with optional category filter
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const excludeCategory = searchParams.get('excludeCategory');

        const where: any = {};

        if (category) {
            where.category = { contains: category };
        } else if (excludeCategory) {
            where.category = { not: { contains: excludeCategory } };
        }

        const albums = await (prisma as any).eventAlbum.findMany({
            where,
            orderBy: {
                priority: 'desc'
            },
            include: {
                _count: {
                    select: { eventphotos: true }
                }
            }
        });

        const transformed = albums.map((album: any) => ({
            ...album,
            _count: {
                photos: album._count?.eventphotos || 0
            }
        }));

        return NextResponse.json(transformed);
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
                eventphotos: photos && Array.isArray(photos) ? {
                    create: photos.map((p: any, idx: number) => ({
                        url: p.url,
                        caption: p.caption || '',
                        order: p.order !== undefined ? p.order : idx
                    }))
                } : undefined
            },
            include: {
                eventphotos: true
            }
        });

        return NextResponse.json(album);
    } catch (error) {
        console.error('Error creating admin event album:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
