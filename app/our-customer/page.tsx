
import { Metadata } from "next";
import OurCustomerClient from "./OurCustomerClient";

export const metadata: Metadata = {
    title: 'ลูกค้าของเรา | Han Flower รีวิวและความประทับใจ',
    description: 'ความประทับใจและรอยยิ้มจากลูกค้า Han Flower ทั่วประเทศ ช่อดอกไม้และของขวัญที่สร้างความสุขให้ทั้งผู้ให้และผู้รับ',
    keywords: ['รีวิว Han Flower', 'ลูกค้า Han Flower', 'ความประทับใจลูกค้า', 'ร้านดอกไม้แนะนำ', 'รีวิวช่อดอกไม้'],
    openGraph: {
        title: 'ลูกค้าของเรา | Han Flower',
        description: 'รอยยิ้มของลูกค้าคือความภูมิใจของเรา',
        images: ['/images/logo5.png'],
    }
};

export default function OurCustomerPage() {
    return <OurCustomerClient />;
}
