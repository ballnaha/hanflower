import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limitParam = searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam, 10) : undefined;

        const products = await prisma.product.findMany({
            include: {
                images: true,
                details: true,
                features: true
            },
            orderBy: [
                { priority: 'desc' }, // Higher priority first (desc)
                { createdAt: 'desc' } // Then by newest
            ],
            ...(limit && { take: limit })
        });

        // Transform to match existing frontend interface
        const transformedProducts = products.map(product => ({
            id: product.id,
            sku: product.sku,
            slug: product.slug,
            title: product.title,
            type: product.type,
            price: product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
            originalPrice: product.originalPrice?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "",
            discount: product.discount?.toString() || "",
            priceVelvet: product.priceVelvet?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "",
            originalPriceVelvet: product.originalPriceVelvet?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "",
            image: product.image,
            images: product.images.map(img => img.url),
            description: product.description,
            details: product.details.map(d => d.text),
            features: product.features.map(f => f.text),
            stock: product.stock,
            priority: product.priority
        }));

        return NextResponse.json(transformedProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            title, sku, slug, type, price, originalPrice,
            discount, priceVelvet, originalPriceVelvet,
            description, image, images,
            details, features, stock, priority
        } = body;

        const newProduct = await prisma.product.create({
            data: {
                id: randomUUID(),
                title,
                sku,
                slug,
                type,
                price: parseFloat(price.toString().replace(/,/g, '')),
                originalPrice: originalPrice ? parseFloat(originalPrice.toString().replace(/,/g, '')) : null,
                discount: discount ? parseInt(discount.toString()) : null,
                priceVelvet: priceVelvet ? parseFloat(priceVelvet.toString().replace(/,/g, '')) : null,
                originalPriceVelvet: originalPriceVelvet ? parseFloat(originalPriceVelvet.toString().replace(/,/g, '')) : null,
                description,
                image,
                stock: parseInt(stock.toString() || '0'),
                priority: parseInt(priority.toString() || '0'),
                images: {
                    create: images?.map((url: string) => ({ url })) || []
                },
                details: {
                    create: details?.map((text: string) => ({ text })) || []
                },
                features: {
                    create: features?.map((text: string) => ({ text })) || []
                }
            },
            include: {
                images: true,
                details: true,
                features: true
            }
        });

        return NextResponse.json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
