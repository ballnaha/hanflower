
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(coupons);
    } catch (error) {
        console.error('Error fetching coupons:', error);
        return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { code, discount, type, minSpend, maxDiscount, limit, expireAt, isActive } = body;

        // Check availability
        const existing = await prisma.coupon.findUnique({
            where: { code }
        });

        if (existing) {
            return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
        }

        const coupon = await prisma.coupon.create({
            data: {
                code,
                discount,
                type,
                minSpend: minSpend || 0,
                maxDiscount,
                limit,
                expireAt: expireAt ? new Date(expireAt) : null,
                isActive: isActive ?? true
            }
        });

        return NextResponse.json(coupon);
    } catch (error) {
        console.error('Error creating coupon:', error);
        return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
    }
}
