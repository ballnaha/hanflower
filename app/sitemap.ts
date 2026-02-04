import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://hanflowerthailand.com';

// Revalidate sitemap every 1 hour (3600 seconds)
// This means the sitemap will be cached and regenerated every hour
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Fetch all products
    const products = await prisma.product.findMany({
        select: {
            slug: true,
            updatedAt: true,
        },
        orderBy: {
            updatedAt: 'desc',
        },
    });

    // Fetch all categories
    const categories = await prisma.category.findMany({
        select: {
            slug: true,
            updatedAt: true,
        },
    });

    // Static pages with their priorities and change frequencies
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/products`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
    ];

    // Dynamic product pages
    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
        url: `${BASE_URL}/products/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // Category filter pages
    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
        url: `${BASE_URL}/products?category=${encodeURIComponent(category.slug)}`,
        lastModified: category.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // Combine all pages
    return [...staticPages, ...productPages, ...categoryPages];
}
