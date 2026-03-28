
import { Metadata } from 'next';
import PaymentNotificationClient from './PaymentNotificationClient';

export const metadata: Metadata = {
    title: 'ติดตามสถานะและแจ้งโอนเงิน | Han Flower',
    description: 'ตรวจสอบสถานะคำสั่งซื้อและส่งหลักฐานการชำระเงินของท่านได้ที่นี่ เพื่อความรวดเร็วในการจัดเตรียมสินค้า',
    keywords: ['แจ้งโอนเงิน', 'ติดตามสถานะออเดอร์', 'เช็คเลขพัสดุ', 'Han Flower payment'],
};

export default function PaymentNotificationPage() {
    return <PaymentNotificationClient />;
}
