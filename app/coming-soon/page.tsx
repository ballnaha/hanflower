
import { Metadata } from 'next';
import ComingSoonClient from './ComingSoonClient';

export const metadata: Metadata = {
    title: 'พบกันเร็วๆ นี้ | Han Flower',
    description: 'เรากำลังเตรียมสิ่งพิเศษให้คุณที่ Han Flower ร้านดอกไม้พรีเมียมที่ผสานเทคโนโลยีสมัยใหม่',
    robots: 'noindex, nofollow',
};

export default function ComingSoonPage() {
    return <ComingSoonClient />;
}
