import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const identifier = decodeURIComponent((await params).id);

        // Try to find by slug first, then by id
        let product = await prisma.product.findUnique({
            where: { slug: identifier },
            include: {
                images: true,
                details: true,
                features: true
            }
        });

        // If not found by slug, try by id
        if (!product) {
            product = await prisma.product.findUnique({
                where: { id: identifier },
                include: {
                    images: true,
                    details: true,
                    features: true
                }
            });
        }

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Transform to match existing frontend interface
        const transformedProduct = {
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
        };

        return NextResponse.json(transformedProduct);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const body = await request.json();
        const {
            title, sku, slug, type, price, originalPrice,
            discount, priceVelvet, originalPriceVelvet,
            description, image, images,
            details, features, stock, priority
        } = body;

        // Update product using a transaction to handle relations
        const updatedProduct = await prisma.$transaction(async (tx) => {
            // 1. Delete old relations
            await tx.productImage.deleteMany({ where: { productId: id } });
            await tx.productDetail.deleteMany({ where: { productId: id } });
            await tx.productFeature.deleteMany({ where: { productId: id } });

            // 2. Update main product info
            return await tx.product.update({
                where: { id },
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
                    description,
                    image,
                    stock: parseInt(stock.toString()),
                    priority: parseInt(priority.toString()),
                    images: {
                        create: images.map((url: string) => ({ url }))
                    },
                    details: {
                        create: details.map((text: string) => ({ text }))
                    },
                    features: {
                        create: features.map((text: string) => ({ text }))
                    }
                },
                include: {
                    images: true,
                    details: true,
                    features: true
                }
            });
        });

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;

        await prisma.product.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
