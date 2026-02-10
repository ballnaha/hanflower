import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const categories = await (prisma as any).eventAlbum.findMany({
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
