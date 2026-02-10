
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limitParam = searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam, 10) : undefined;

        const products = await (prisma as any).product.findMany({
            include: {
                productimages: true,
                productdetails: true,
                productfeatures: true,
                productshippings: true,
                category: true
            },
            orderBy: [
                { priority: 'asc' },
                { createdAt: 'desc' }
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
                    images: product.productimages?.map((img: any) => img.url) || [],
                    description: product.description,
                    details: product.productdetails?.map((d: any) => d.text) || [],
                    features: product.productfeatures?.map((f: any) => f.text) || [],
                    shipping: product.productshippings?.map((s: any) => s.text) || [],
                    stock: product.stock,
                    stockVelvet: product.stockVelvet,
                    priority: product.priority,
                    categoryId: product.categoryId,
                    hasQrCode: product.hasQrCode,
                    qrCodePrice: product.qrCodePrice?.toString() || "0",
                    isNew: product.isNew,
                    isBestSeller: product.isBestSeller,
                    category: product.category?.title || "General"
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
            categoryId, hasQrCode, qrCodePrice, isNew, isBestSeller
        } = body;

        const newProduct = await (prisma as any).product.create({
            data: {
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
                isNew: !!isNew,
                isBestSeller: !!isBestSeller,
                productimages: {
                    create: images?.map((url: string) => ({ url })) || []
                },
                productdetails: {
                    create: details?.map((text: string) => ({ text })) || []
                },
                productfeatures: {
                    create: features?.map((text: string) => ({ text })) || []
                },
                productshippings: {
                    create: shipping?.map((text: string) => ({ text })) || []
                }
            },
            include: {
                productimages: true,
                productdetails: true,
                productfeatures: true,
                productshippings: true
            }
        });

        return NextResponse.json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
