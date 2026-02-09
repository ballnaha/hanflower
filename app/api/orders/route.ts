
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all orders (for admin)
export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                items: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Map Prisma fields to frontend-expected fields
        const formattedOrders = orders.map(order => ({
            ...order,
            tel: order.customerPhone,
            grandTotal: order.totalAmount,
            shippingCost: order.shippingFee,
            subtotal: Number(order.totalAmount) - Number(order.shippingFee),
            discount: 0
        }));

        return NextResponse.json(formattedOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Order Request Body:', JSON.stringify(body, null, 2));
        const {
            customerName,
            tel,
            address,
            note,
            cartItems,
            subtotal,
            shippingCost,
            shippingMethod,
            discount,
            grandTotal,
            paymentMethod,
            email // Add email
        } = body;

        // Validation (Detailed)
        let missingFields = [];
        if (!customerName) missingFields.push('customerName');
        if (!tel) missingFields.push('tel');
        if (!address) missingFields.push('address');
        if (!cartItems || cartItems.length === 0) missingFields.push('cartItems');

        if (missingFields.length > 0) {
            console.log('Validation Failed. Missing:', missingFields);
            return NextResponse.json({
                error: `Missing required fields: ${missingFields.join(', ')}`,
                details: body
            }, { status: 400 });
        }

        // Verify Products exist to prevent FK errors
        // Cart IDs may have -fresh or -velvet suffix, so we need to extract the original product ID
        const extractProductId = (cartId: string): string => {
            if (!cartId) return '';
            // Cart ID format: uuid-flowerType-cardType
            // Potential suffixes: -fresh, -velvet, -standard, -custom
            return cartId
                .replace(/-fresh(-\w+)?$/, '')
                .replace(/-velvet(-\w+)?$/, '')
                .split('-standard')[0]
                .split('-custom')[0];
        };

        const productIds = cartItems.map((item: any) => extractProductId(item.id)).filter(Boolean);
        console.log('Verifying Product IDs (after stripping suffix):', productIds);

        const validProducts = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true }
        });

        console.log('Valid Products found in DB:', validProducts);

        const validProductIds = new Set(validProducts.map((p: { id: string }) => p.id));

        // Filter cart items based on extracted product IDs
        const validCartItems = cartItems.filter((item: any) => {
            const originalId = extractProductId(item.id);
            return validProductIds.has(originalId);
        });

        console.log('Valid Cart Items count:', validCartItems.length);

        if (validCartItems.length === 0) {
            console.log('Error: No valid products found in cart. Cart IDs might be outdated.');
            return NextResponse.json({ error: 'Products in cart no longer exist. Please clear cart and try again.' }, { status: 400 });
        }

        const cleanPrice = (val: any) => {
            if (typeof val === 'string') return parseFloat(val.replace(/,/g, ''));
            return parseFloat(val);
        };

        const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const order = await prisma.order.create({
            data: {
                id: orderId,
                orderNumber: orderId, // Required unique field
                customerName,
                customerPhone: tel,
                customerEmail: email || '',
                customerAddress: address,
                notes: note,
                shippingFee: cleanPrice(shippingCost),
                shippingMethod,
                totalAmount: cleanPrice(grandTotal),
                paymentMethod,
                status: 'pending',
                paymentStatus: 'unpaid',
                items: {
                    create: validCartItems.map((item: any) => ({
                        id: `ITEM-${Math.random().toString(36).substr(2, 9)}`,
                        productId: extractProductId(item.id), // Use original product ID without suffix
                        price: cleanPrice(item.price),
                        quantity: item.quantity
                    }))
                }
            }
        });

        return NextResponse.json({ success: true, orderId: order.id });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
