import Hero from "@/components/home/Hero";
import AboutUs from "@/components/home/AboutUs";
import Features from "@/components/home/Features";
import ProductSneakPeek from "@/components/home/ProductSneakPeek";
import QRCardPromo from "@/components/home/QRCardPromo";
import { prisma } from "@/lib/prisma";

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
