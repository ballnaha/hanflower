import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    try {
        const where: any = {
            isActive: true,
        };

        if (category && category !== 'All') {
            where.category = category;
        } else {
            // By default, exclude "Customer" albums from Events page
            where.category = {
                not: {
                    contains: 'Customer'
                }
            };
        }

        const albums = await (prisma as any).eventalbum.findMany({
            where,
            orderBy: {
                priority: 'desc',
            },
            include: {
                _count: {
                    select: { eventphoto: true }
                }
            }
        });

        // Transform for frontend
        const result = albums.map((album: any) => ({
            id: album.id,
            title: album.title,
            category: album.category,
            location: album.location,
            date: album.date,
            image: album.coverImage,
            imagesCount: album._count?.eventphoto || 0
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching events:', error);
        // If table doesn't exist yet, return empty array to avoid crash
        return NextResponse.json([]);
    }
}
