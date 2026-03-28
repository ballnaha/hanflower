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
  subtitle: string | null;
  description: string | null;
  image: string | null;
  name: string | null;
  slug: string;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const metadata = {
  title: 'Han Flower | ร้านดอกไม้สด ช่อดอกไม้ และของขวัญ QR Code',
  description: 'ร้านดอกไม้ Han Flower รับจัดช่อดอกไม้สด งานแต่งงาน และอีเว้นท์ พร้อมการ์ด QR Code บอกความในใจ ส่งมอบความรู้สึกได้มากกว่าที่เคย สั่งออนไลน์ได้เลย',
  keywords: ['ร้านดอกไม้', 'รับจัดดอกไม้งานแต่ง', 'ดอกไม้งานอีเว้นท์', 'จัดดอกไม้พิธีการ', 'ช่อดอกไม้วาเลนไทน์', 'ร้านดอกไม้ใกล้ฉัน', 'Han Flower', 'Backdrop ดอกไม้', 'ซุ้มถ่ายรูปงานแต่ง'],
  openGraph: {
    title: 'Han Flower | ร้านดอกไม้ รับจัดงานแต่งงานและอีเว้นท์',
    description: 'เนรมิตสถานที่งานแต่งงานและอีเว้นท์ของคุณด้วยดอกไม้สวยสะดุดตา พร้อมเทคโนโลยี QR Code ความทรงจำที่คุณเลือกได้',
    images: [
      {
        url: '/images/logo5.png',
        width: 1200,
        height: 630,
        alt: 'Han Flower - Wedding & Event Florist',
      },
    ],
    locale: 'th_TH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Han Flower | ร้านดอกไม้ และของขวัญ QR Code',
    description: 'ร้านดอกไม้รับจัดช่อดอกไม้สด งานแต่งงาน และอีเว้นท์ พร้อมการ์ด QR Code สุดล้ำ',
    images: ['/images/logo5.png'],
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
    subtitle: cat.subtitle || '',
    description: cat.description || '',
    image: cat.image || '/images/img2.webp', // Fallback for missing images
  }));

  return (
    <>
      <Hero />
      <AboutUs />
      <ProductSneakPeek />
      <QRCardPromo />
      <Features categories={categories} />

    </>
  );
}
