
import { Metadata } from 'next';
import AboutContent from '@/components/about/AboutContent';

export const metadata: Metadata = {
    title: 'เกี่ยวกับเรา | Han Flower ร้านดอกไม้ รับจัดงานแต่ง อีเว้นท์',
    description: 'รู้จัก Han Flower ทีมงานมืออาชีพ รับจัดดอกไม้งานแต่งงาน งานอีเว้นท์ และพิธีการต่างๆ ผสมผสานศิลปะดอกไม้และเทคโนโลยี QR Code เพื่อวันสำคัญของคุณ',
    keywords: ['ร้านดอกไม้', 'รับจัดดอกไม้งานแต่ง', 'ดอกไม้งานอีเว้นท์', 'ทีมจัดดอกไม้', 'Han Flower', 'QR Code ดอกไม้', 'จัดดอกไม้นอกสถานที่', 'Backdrop ดอกไม้'],
    openGraph: {
        title: 'เกี่ยวกับเรา | Han Flower มืออาชีพงานดอกไม้และอีเว้นท์',
        description: 'จากความรักในดอกไม้ สู่ทีมงานมืออาชีพที่พร้อมเนรมิตงานแต่งและอีเว้นท์ของคุณให้สวยงาม และน่าจดจำด้วยเทคโนโลยี QR Code Story',
        images: [
            {
                url: '/images/cover1.png',
                width: 1200,
                height: 630,
                alt: 'Han Flower Team & Services',
            },
        ],
    },
};

export default function AboutPage() {
    return <AboutContent />;
}
