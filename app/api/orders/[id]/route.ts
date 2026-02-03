
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const { searchParams } = new URL(request.url);
        const tel = searchParams.get('tel');

        const whereCondition: any = {
            OR: [
                { id: id },
                { id: { endsWith: id } }
            ]
        };

        // If phone number is provided, verify it matches
        if (tel) {
            whereCondition.tel = tel;
        }

        const order = await prisma.order.findFirst({
            where: whereCondition,
            include: {
                orderitem: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Map orderitem to items for consistency with frontend
        const formattedOrder = {
            ...order,
            items: order.orderitem
        };

        return NextResponse.json(formattedOrder);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const body = await request.json();

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { ...body }
        });

        return NextResponse.json(updatedOrder);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
