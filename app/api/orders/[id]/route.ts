
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
            whereCondition.customerPhone = tel;
        }

        const order = await prisma.order.findFirst({
            where: whereCondition,
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Format items to include product details directly
        const formattedItems = order.items.map((item: any) => ({
            ...item,
            title: item.product?.title || 'Unknown Product',
            image: item.product?.image || null,
        }));

        // Map order for consistency with both frontend pages
        const formattedOrder = {
            ...order,
            items: formattedItems,
            orderitem: formattedItems, // Support admin page
            tel: order.customerPhone,
            grandTotal: order.totalAmount,
            shippingCost: order.shippingFee,
            // Assuming subtotal is total - shipping for now if discount is not stored
            subtotal: Number(order.totalAmount) - Number(order.shippingFee),
            discount: 0 // Default to 0 if not in DB
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
