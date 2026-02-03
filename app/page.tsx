import Hero from "@/components/home/Hero";
import AboutUs from "@/components/home/AboutUs";
import Features from "@/components/home/Features";
import ProductSneakPeek from "@/components/home/ProductSneakPeek";
import QRCardPromo from "@/components/home/QRCardPromo";
import { prisma } from "@/lib/prisma";

export const revalidate = 0; // Ensure fresh data on every visit

// Define interface locally since prisma generate failed or is locked
interface Category {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const metadata = {
  title: 'Han Flower | ร้านดอกไม้ รับจัดช่อดอกไม้ งานแต่งงาน งานอีเว้นท์ ของขวัญวาเลนไทน์',
  description: 'ร้านดอกไม้ Han Flower บริการจัดช่อดอกไม้สด ดอกไม้ประดิษฐ์ รับจัดดอกไม้งานแต่งงาน งานอีเว้นท์ และพิธีการต่างๆ พร้อมการ์ด QR Code สุดล้ำ ส่งมอบความรู้สึกได้มากกว่าที่เคย',
  keywords: ['ร้านดอกไม้', 'รับจัดดอกไม้งานแต่ง', 'ดอกไม้งานอีเว้นท์', 'จัดดอกไม้พิธีการ', 'ช่อดอกไม้วาเลนไทน์', 'ร้านดอกไม้ใกล้ฉัน', 'Han Flower', 'Backdrop ดอกไม้', 'ซุ้มถ่ายรูปงานแต่ง'],
  openGraph: {
    title: 'Han Flower | ร้านดอกไม้ รับจัดงานแต่งงานและอีเว้นท์',
    description: 'ครบเครื่องเรื่องดอกไม้ จากช่อดอกไม้แทนใจ สู่การเนรมิตสถานที่งานแต่งงานและอีเว้นท์ครั้งสำคัญของคุณ พร้อมเทคโนโลยี QR Code ความทรงจำที่คุณเลือกได้',
    images: [
      {
        url: '/images/cover.webp',
        width: 1200,
        height: 630,
        alt: 'Han Flower - Wedding & Event Florist',
      },
    ],
    locale: 'th_TH',
    type: 'website',
  },
};

export default async function Home() {
  const categoriesRaw = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { priority: 'asc' },
  });

  // Ensure only serializable data is passed and handle empty images
  const categories = categoriesRaw.map((cat: Category) => ({
    id: cat.id,
    title: cat.title,
    subtitle: cat.subtitle,
    description: cat.description,
    image: cat.image || '/images/img2.webp', // Fallback for missing images
  }));

  return (
    <>
      <Hero />
      <AboutUs />
      <QRCardPromo />
      <Features categories={categories} />
      <ProductSneakPeek />
    </>
  );
}
