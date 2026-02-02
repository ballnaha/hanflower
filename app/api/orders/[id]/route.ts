
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: { orderitem: true }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Transform for frontend compatibility
        const transformedOrder = {
            ...order,
            items: order.orderitem // Map orderitem to items for frontend
        };

        return NextResponse.json(transformedOrder);
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    try {
        const body = await request.json();
        const { status, slipUrl } = body;

        const order = await prisma.order.update({
            where: { id },
            data: { status, slipUrl }
        });

        return NextResponse.json({ success: true, order });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
