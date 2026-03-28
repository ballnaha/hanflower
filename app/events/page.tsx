
import { Metadata } from "next";
import EventsClient from "./EventsClient";

export const metadata: Metadata = {
    title: 'อัลบั้มผลงาน | Han Flower รับจัดดอกไม้งานแต่งและอีเว้นท์',
    description: 'รวมผลงานการจัดดอกไม้ในโอกาสต่างๆ ทั้งงานแต่งงาน งานมงคล และงานอีเว้นท์พรีเมียม โดยทีมงานมืออาชีพจาก Han Flower',
    keywords: ['ผลงานจัดดอกไม้', 'อัลบั้มงานแต่ง', 'รีวิวงานอีเว้นท์', 'Han Flower Portfolio', 'ภาพจัดดอกไม้นอกสถานที่'],
    openGraph: {
        title: 'อัลบั้มผลงาน | Han Flower',
        description: 'รวมทุกความประทับใจในวันสำคัญของคุณ',
        images: ['/images/logo5.png'],
    }
};

export default function EventsPage() {
    return <EventsClient />;
}
