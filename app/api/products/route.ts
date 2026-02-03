import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limitParam = searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam, 10) : undefined;

        const products = await prisma.product.findMany({
            include: {
                productimage: true,
                productdetail: true,
                productfeature: true,
                productshipping: true
            },
            orderBy: [
                { priority: 'desc' }, // Higher priority first (desc)
                { createdAt: 'desc' } // Then by newest
            ],
            ...(limit && { take: limit })
        });

        console.log(`Fetched ${products.length} products`);

        // Transform to match existing frontend interface
        const transformedProducts = products.map((product: any) => {
            try {
                return {
                    id: product.id,
                    sku: product.sku,
                    slug: product.slug,
                    title: product.title,
                    type: product.type,
                    price: product.price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0",
                    originalPrice: product.originalPrice?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "",
                    discount: product.discount?.toString() || "",
                    priceVelvet: product.priceVelvet?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "",
                    originalPriceVelvet: product.originalPriceVelvet?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "",
                    discountVelvet: product.discountVelvet?.toString() || "",
                    image: product.image,
                    images: product.productimage?.map((img: any) => img.url) || [],
                    description: product.description,
                    details: product.productdetail?.map((d: any) => d.text) || [],
                    features: product.productfeature?.map((f: any) => f.text) || [],
                    shipping: product.productshipping?.map((s: any) => s.text) || [],
                    stock: product.stock,
                    stockVelvet: product.stockVelvet,
                    priority: product.priority,
                    categoryId: product.categoryId,
                    hasQrCode: product.hasQrCode,
                    qrCodePrice: product.qrCodePrice?.toString() || "0"
                };
            } catch (err) {
                console.error(`Error transforming product ${product.id}:`, err);
                return null;
            }
        }).filter(Boolean);

        return NextResponse.json(transformedProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products', message: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            title, sku, slug, type, price, originalPrice,
            discount, priceVelvet, originalPriceVelvet, discountVelvet,
            description, image, images,
            details, features, shipping, stock, stockVelvet, priority,
            categoryId, hasQrCode, qrCodePrice
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
                discountVelvet: discountVelvet ? parseInt(discountVelvet.toString()) : null,
                description,
                image,
                stock: parseInt(stock.toString() || '0'),
                stockVelvet: parseInt(stockVelvet?.toString() || '0'),
                priority: parseInt(priority.toString() || '0'),
                categoryId: categoryId || null,
                hasQrCode: hasQrCode !== undefined ? hasQrCode : true,
                qrCodePrice: qrCodePrice ? parseFloat(qrCodePrice.toString().replace(/,/g, '')) : 0,
                updatedAt: new Date(),
                productimage: {
                    create: images?.map((url: string) => ({ url })) || []
                },
                productdetail: {
                    create: details?.map((text: string) => ({ text })) || []
                },
                productfeature: {
                    create: features?.map((text: string) => ({ text })) || []
                },
                productshipping: {
                    create: shipping?.map((text: string) => ({ text })) || []
                }
            },
            include: {
                productimage: true,
                productdetail: true,
                productfeature: true,
                productshipping: true
            }
        });

        return NextResponse.json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
