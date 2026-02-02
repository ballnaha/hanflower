import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all shipping methods
export async function GET() {
    try {
        const methods = await prisma.shippingmethod.findMany({
            orderBy: { priority: 'asc' }
        });

        // Also get free shipping threshold from settings
        const freeShippingSetting = await prisma.setting.findUnique({
            where: { key: 'freeShippingThreshold' }
        });

        const enableFreeShippingSetting = await prisma.setting.findUnique({
            where: { key: 'enableFreeShipping' }
        });

        return NextResponse.json({
            methods,
            freeShippingThreshold: freeShippingSetting ? parseFloat(freeShippingSetting.value) : 0,
            enableFreeShipping: enableFreeShippingSetting?.value === 'true'
        });
    } catch (error) {
        console.error('Error fetching shipping methods:', error);
        return NextResponse.json({ error: 'Failed to fetch shipping methods' }, { status: 500 });
    }
}

// POST - Create or update shipping methods
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { methods, freeShippingThreshold, enableFreeShipping } = body;

        // Upsert each shipping method
        for (const method of methods) {
            await prisma.shippingmethod.upsert({
                where: { code: method.code },
                update: {
                    name: method.name,
                    description: method.description,
                    price: method.price,
                    estimatedDays: method.estimatedDays,
                    enabled: method.enabled,
                    priority: method.priority || 0
                },
                create: {
                    code: method.code,
                    name: method.name,
                    description: method.description,
                    price: method.price,
                    estimatedDays: method.estimatedDays,
                    enabled: method.enabled,
                    priority: method.priority || 0
                }
            });
        }

        // Upsert free shipping settings
        await prisma.setting.upsert({
            where: { key: 'freeShippingThreshold' },
            update: { value: freeShippingThreshold.toString() },
            create: { key: 'freeShippingThreshold', value: freeShippingThreshold.toString() }
        });

        await prisma.setting.upsert({
            where: { key: 'enableFreeShipping' },
            update: { value: enableFreeShipping.toString() },
            create: { key: 'enableFreeShipping', value: enableFreeShipping.toString() }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving shipping methods:', error);
        return NextResponse.json({ error: 'Failed to save shipping methods' }, { status: 500 });
    }
}
