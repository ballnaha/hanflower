
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const params = await context.params;
        const { slug } = params;
        const now = new Date();

        const valentine = await prisma.valentinecard.findFirst({
            where: {
                slug: slug,
                status: 'active',
                // Check that card is not expired (disabledAt is null OR in the future)
                OR: [
                    { disabledAt: null },
                    { disabledAt: { gt: now } }
                ]
            },
            include: {
                valentinememory: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });

        if (!valentine) {
            return NextResponse.json(
                { error: 'Valentine card not found or expired' },
                { status: 404 }
            );
        }

        // Transform for frontend
        const transformed = {
            ...valentine,
            memories: valentine.valentinememory
        };
        delete (transformed as any).valentinememory;

        return NextResponse.json(transformed);
    } catch (error) {
        console.error('Error fetching valentine card:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
