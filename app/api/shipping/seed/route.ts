import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Seed shipping methods with defaults
export async function GET() {
    try {
        const shippingMethods = [
            { code: 'standard', name: 'ขนส่งพัสดุ (Standard)', description: '1-2 วันทำการ • ทั่วประเทศ', price: 50, estimatedDays: '1-2 วัน', enabled: true, priority: 0 },
            { code: 'express', name: 'ส่งด่วน (Lalamove/Grab)', description: 'กทม. และปริมณฑล', price: 150, estimatedDays: 'ภายในวันเดียว', enabled: true, priority: 1 },
            { code: 'pickup', name: 'รับสินค้าเอง', description: 'รับสินค้าที่ร้าน ซอยวัดลาดปลาดุก นนทบุรี', price: 0, estimatedDays: 'นัดรับสินค้า', enabled: false, priority: 2 },
            { code: 'cod', name: 'เก็บเงินปลายทาง (COD)', description: 'ชำระเงินเมื่อรับสินค้า • ค่าบริการเพิ่ม', price: 30, estimatedDays: '2-3 วัน', enabled: false, priority: 3 }
        ];

        for (const method of shippingMethods) {
            await prisma.shippingmethod.upsert({
                where: { code: method.code },
                update: {},  // Don't update if exists
                create: method
            });
        }

        return NextResponse.json({ success: true, message: 'Shipping methods seeded successfully' });
    } catch (error) {
        console.error('Error seeding shipping methods:', error);
        return NextResponse.json({ error: 'Failed to seed shipping methods' }, { status: 500 });
    }
}
