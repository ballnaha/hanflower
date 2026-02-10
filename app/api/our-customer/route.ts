import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const photos = await (prisma as any).eventPhoto.findMany({
            where: {
                eventalbum: {
                    OR: [
                        { category: 'Our Customer' },
                        { category: { startsWith: 'Customer:' } }
                    ],
                    isActive: true
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                eventalbum: {
                    select: {
                        title: true
                    }
                }
            }
        });

        const result = photos.map((photo: any) => ({
            id: photo.id,
            url: photo.url,
            caption: photo.caption || photo.eventalbum.title
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching our customer photos:', error);
        return NextResponse.json([]);
    }
}
