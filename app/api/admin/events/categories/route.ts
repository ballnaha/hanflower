import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

        const categories = await (prisma as any).eventAlbum.findMany({
            where,
            select: {
                category: true
            },
            distinct: ['category'],
        });

        const result = categories
            .map((item: any) => item.category)
            .filter((cat: any) => cat !== null && cat !== '');

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching event categories:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
