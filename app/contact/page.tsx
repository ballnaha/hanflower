import { Metadata } from 'next';
import ContactContent from '@/components/contact/ContactContent';

export const metadata: Metadata = {
    title: 'ติดต่อเรา | Han Flower ร้านดอกไม้ รับจัดงานแต่ง อีเว้นท์',
    description: 'ติดต่อ Han Flower เพื่อสอบถามข้อมูล จัดช่อดอกไม้ งานแต่งงาน หรือกิจกรรมต่างๆ เรายินดีให้บริการด้วยความเต็มใจ',
    keywords: ['ติดต่อเรา', 'ร้านดอกไม้', 'จัดดอกไม้งานแต่ง', 'Han Flower', 'เบอร์โทรศัพท์ร้านดอกไม้', 'Line ID ร้านดอกไม้'],
};

export default function ContactPage() {
    return <ContactContent />;
}
