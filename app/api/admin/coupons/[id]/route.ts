
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        const coupon = await prisma.coupon.findUnique({
            where: { id }
        });

        if (!coupon) {
            return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
        }

        return NextResponse.json(coupon);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch coupon' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        const body = await req.json();
        const { code, discount, type, minSpend, maxDiscount, limit, expireAt, isActive } = body;

        // Check if code exists for other coupons
        const existing = await prisma.coupon.findFirst({
            where: {
                code,
                id: { not: id }
            }
        });

        if (existing) {
            return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
        }

        const coupon = await prisma.coupon.update({
            where: { id },
            data: {
                code,
                discount,
                type,
                minSpend: minSpend || 0,
                maxDiscount,
                limit,
                expireAt: expireAt ? new Date(expireAt) : null,
                isActive
            }
        });

        return NextResponse.json(coupon);
    } catch (error) {
        console.error('Error updating coupon:', error);
        return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        await prisma.coupon.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
    }
}
