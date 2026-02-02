
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
