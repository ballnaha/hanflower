
import { Metadata } from 'next';
import PaymentClient from './PaymentClient';

export const metadata: Metadata = {
    title: 'ช่องทางการชำระเงิน | Han Flower',
    description: 'เลือกช่องทางการชำระเงินที่สะดวกสบาย ทั้งโอนผ่านบัญชีธนาคาร หรือช่องทางอื่นๆ พร้อมระบบความปลอดภัยพรีเมียม',
    robots: 'noindex, follow',
};

export default function PaymentPage() {
    return <PaymentClient />;
}
