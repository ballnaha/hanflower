import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { orders } = await request.json(); // Array of { id: string, priority: number }

        if (!Array.isArray(orders)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        // Use a transaction to update all priorities
        await (prisma as any).$transaction(
            orders.map((item: { id: string, priority: number }) =>
                (prisma as any).product.update({
                    where: { id: item.id },
                    data: { priority: item.priority }
                })
            )
        );

        return NextResponse.json({ message: 'Reordered successfully' });
    } catch (error: any) {
        console.error('Reorder Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
