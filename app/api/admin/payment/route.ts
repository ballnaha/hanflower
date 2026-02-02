
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const settings = await prisma.setting.findMany({
            where: {
                key: {
                    in: ['payment_bank', 'payment_qr']
                }
            }
        });

        const config = {
            bank: {
                enabled: true,
                bankName: 'ธนาคารกสิกรไทย (KBANK)',
                accountNo: '012 345 6789',
                accountName: 'HAN FLOWER CO., LTD.',
                branch: 'สาขาสยามพารากอน',
                bankLogo: ''
            },
            qr: {
                enabled: true,
                image: ''
            }
        };

        settings.forEach(s => {
            if (s.key === 'payment_bank') {
                try {
                    config.bank = { ...config.bank, ...JSON.parse(s.value) };
                } catch (e) { }
            } else if (s.key === 'payment_qr') {
                try {
                    config.qr = { ...config.qr, ...JSON.parse(s.value) };
                } catch (e) { }
            }
        });

        return NextResponse.json(config);
    } catch (error) {
        console.error('Error fetching payment settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { bank, qr } = body;

        // Save Bank Settings
        if (bank) {
            await prisma.setting.upsert({
                where: { key: 'payment_bank' },
                update: { value: JSON.stringify(bank) },
                create: { key: 'payment_bank', value: JSON.stringify(bank) }
            });
        }

        // Save QR Settings
        if (qr) {
            await prisma.setting.upsert({
                where: { key: 'payment_qr' },
                update: { value: JSON.stringify(qr) },
                create: { key: 'payment_qr', value: JSON.stringify(qr) }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving payment settings:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
