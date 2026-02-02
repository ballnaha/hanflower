
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { code, cartTotal } = body;

        if (!code) {
            return NextResponse.json({ error: 'Please provide a coupon code' }, { status: 400 });
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!coupon) {
            return NextResponse.json({ error: 'ไม่พบคูปองนี้' }, { status: 404 });
        }

        if (!coupon.isActive) {
            return NextResponse.json({ error: 'คูปองนี้ถูกปิดใช้งานแล้ว' }, { status: 400 });
        }

        if (coupon.expireAt && new Date(coupon.expireAt) < new Date()) {
            return NextResponse.json({ error: 'คูปองหมดอายุแล้ว' }, { status: 400 });
        }

        if (coupon.limit && coupon.used >= coupon.limit) {
            return NextResponse.json({ error: 'สิทธิ์คูปองเต็มแล้ว' }, { status: 400 });
        }

        const orderTotal = parseFloat(cartTotal);
        if (coupon.minSpend && orderTotal < parseFloat(coupon.minSpend.toString())) {
            return NextResponse.json({
                error: `ต้องมียอดซื้อขั้นต่ำ ฿${parseFloat(coupon.minSpend.toString()).toLocaleString()}`
            }, { status: 400 });
        }

        let discountAmount = 0;
        const discountValue = parseFloat(coupon.discount.toString());

        if (coupon.type === 'percent') {
            discountAmount = (orderTotal * discountValue) / 100;
            if (coupon.maxDiscount) {
                const maxDisc = parseFloat(coupon.maxDiscount.toString());
                if (discountAmount > maxDisc) {
                    discountAmount = maxDisc;
                }
            }
        } else {
            discountAmount = discountValue;
        }

        // Ensure discount doesn't exceed total
        if (discountAmount > orderTotal) {
            discountAmount = orderTotal;
        }

        return NextResponse.json({
            valid: true,
            code: coupon.code,
            discountAmount: Math.floor(discountAmount), // Round down
            couponId: coupon.id
        });

    } catch (error) {
        console.error('Error checking coupon:', error);
        return NextResponse.json({ error: 'Failed to check coupon' }, { status: 500 });
    }
}
