
import { Suspense } from 'react';
import { Metadata } from 'next';
import { Box, Skeleton } from "@mui/material";
import ProductsClient from '@/components/product/ProductsClient';
import { prisma } from '@/lib/prisma';

export const revalidate = 3600; // Cache for 1 hour

interface PageProps {
    searchParams: Promise<{ category?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const categoryName = (await searchParams).category;

    if (!categoryName) {
        return {
            title: 'สินค้าทั้งหมด | Han Flower ร้านดอกไม้พรีเมียม',
            description: 'เลือกชมสินค้าดอกไม้และของขวัญพรีเมียมจาก Han Flower ทั้งช่อดอกไม้สด ไม้อวบน้ำ และ Feeling Card QR Code บอกความในใจ ส่งด่วนพร้อมบริการจัดทำด้วยความประณีตทุกขั้นตอน',
            keywords: ['ร้านดอกไม้ใกล้ฉัน', 'ช่อดอกไม้ออนไลน์', 'ของขวัญ QR Code', 'ส่งดอกไม้พรีเมียม', 'ดอกไม้สด'],
        };
    }

    // Try to find category details for better metadata
    const category = await prisma.category.findFirst({
        where: {
            subtitle: categoryName
        }
    });

    if (category) {
        return {
            title: `${category.title} | Han Flower ร้านดอกไม้พรีเมียม`,
            description: category.description || `เลือกชมคอลเลกชัน ${category.title} จาก Han Flower จัดทำด้วยความใส่ใจ พร้อมเทคโนโลยี QR Code บอกความในใจ`,
            openGraph: {
                title: `${category.title} | Han Flower`,
                description: category.description || `คอลเลกชัน ${category.title} พิเศษเพื่อคุณ`,
                images: category.image ? [{ url: category.image }] : [],
            }
        };
    }

    return {
        title: `${categoryName} | Han Flower`,
        description: `เลือกชมสินค้าในหมวดหมู่ ${categoryName} จาก Han Flower`,
    };
}

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <Box sx={{ pt: { xs: '100px', md: '120px' }, pb: { xs: 8, md: 14 }, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Skeleton variant="rectangular" width="100%" height="100vh" />
            </Box>
        }>
            <ProductsClient />
        </Suspense>
    );
}
