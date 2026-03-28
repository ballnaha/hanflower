
import { Metadata } from 'next';
import ARScanClient from './ARScanClient';

export const metadata: Metadata = {
    title: 'ระบบสแกน AR | Han Flower ประสบการณ์ดอกไม้รูปแบบใหม่',
    description: 'สัมผัสประสบการณ์ความหรูหราผ่านเทคโนโลยี AR บนโทรศัพท์มือถือของคุณ ส่องกล้องเพื่อรับชมข้อความที่ซ่อนอยู่หลังกลีบดอกไม้',
    keywords: ['สแกน AR', 'Han Flower AR', 'การ์ด QR Code', 'ประสบการณ์ดิจิทัล'],
};

export default function ARScanPage() {
    return <ARScanClient />;
}
