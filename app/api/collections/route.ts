import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('active') !== 'false';

        const collections = await prisma.collection.findMany({
            where: activeOnly ? { isActive: true } : undefined,
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        return NextResponse.json(collections);
    } catch (error) {
        console.error('Error fetching collections:', error);
        return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
    }
}
