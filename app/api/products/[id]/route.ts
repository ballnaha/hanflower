import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const identifier = decodeURIComponent((await params).id);
        console.log(`Product API: Fetching product for identifier: "${identifier}"`);

        // Try to find by slug first, then by id
        let product = null;
        try {
            console.log(`Product API: Attempting lookup by SLUG: "${identifier}"`);
            product = await prisma.product.findUnique({
                where: { slug: identifier },
                include: {
                    productimage: true,
                    productdetail: true,
                    productfeature: true,
                    productshipping: true
                }
            });
            console.log(`Product API: Slug lookup result: ${product ? 'FOUND' : 'NOT FOUND'}`);
        } catch (slugError: any) {
            console.error('Product API: Error searching by slug:', slugError.message);
        }

        if (!product) {
            try {
                console.log(`Product API: Attempting lookup by ID: "${identifier}"`);
                product = await prisma.product.findUnique({
                    where: { id: identifier },
                    include: {
                        productimage: true,
                        productdetail: true,
                        productfeature: true,
                        productshipping: true
                    }
                });
                console.log(`Product API: ID lookup result: ${product ? 'FOUND' : 'NOT FOUND'}`);
            } catch (idError: any) {
                console.error('Product API: Error searching by id:', idError.message);
            }
        }

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Transform for frontend
        try {
            return NextResponse.json({
                ...product,
                price: product.price.toString(),
                originalPrice: product.originalPrice?.toString() || null,
                priceVelvet: product.priceVelvet?.toString() || null,
                originalPriceVelvet: product.originalPriceVelvet?.toString() || null,
                images: product.productimage.map(img => img.url),
                details: product.productdetail.map(det => det.text),
                features: product.productfeature.map(feat => feat.text),
                shipping: product.productshipping?.map(ship => ship.text) || [],
                categoryId: product.categoryId,
                hasQrCode: product.hasQrCode,
                qrCodePrice: product.qrCodePrice?.toString() || "0",
                isNew: product.isNew,
                isBestSeller: product.isBestSeller
            });
        } catch (err: any) {
            console.error('Product API: Error transforming product:', err.message);
            return NextResponse.json({ error: 'Failed to transform product data', details: err.message }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Product API: Global Error fetching product:', error.message);
        return NextResponse.json({ error: 'Failed to fetch product', message: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        console.log(`Product API PUT: Updating product with ID: "${id}"`);

        const body = await request.json();
        console.log('Product API PUT: Request body received');

        const {
            title, sku, slug, type, price, originalPrice,
            discount, priceVelvet, originalPriceVelvet, discountVelvet,
            description, image, images,
            details, features, shipping, stock, stockVelvet, priority,
            categoryId, hasQrCode, qrCodePrice, isNew, isBestSeller
        } = body;

        if (!id) {
            console.error('Product API PUT: Missing ID in params');
            return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
        }

        // Update product using a transaction to handle relations
        const updatedProduct = await prisma.$transaction(async (tx: any) => {
            console.log('Product API PUT: Starting transaction');

            // 1. Delete old relations
            await tx.productimage.deleteMany({ where: { productId: id } });
            await tx.productdetail.deleteMany({ where: { productId: id } });
            await tx.productfeature.deleteMany({ where: { productId: id } });
            await tx.productshipping.deleteMany({ where: { productId: id } });

            console.log('Product API PUT: Old relations deleted');

            // 2. Update main product info
            const updateData: any = {
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
                stock: parseInt(stock.toString()),
                stockVelvet: parseInt(stockVelvet?.toString() || '0'),
                priority: parseInt(priority.toString()),
                categoryId: categoryId || null,
                hasQrCode: hasQrCode !== undefined ? hasQrCode : true,
                qrCodePrice: qrCodePrice ? parseFloat(qrCodePrice.toString().replace(/,/g, '')) : 0,
                isNew: !!isNew,
                isBestSeller: !!isBestSeller,
                updatedAt: new Date(),
                productimage: {
                    create: images.filter((url: string) => url && url.trim() !== '').map((url: string) => ({ url }))
                },
                productdetail: {
                    create: details.filter((text: string) => text && text.trim() !== '').map((text: string) => ({ text }))
                },
                productfeature: {
                    create: features.filter((text: string) => text && text.trim() !== '').map((text: string) => ({ text }))
                },
                productshipping: {
                    create: shipping ? shipping.filter((text: string) => text && text.trim() !== '').map((text: string) => ({ text })) : []
                }
            };

            console.log('Product API PUT: Executing update');
            return await tx.product.update({
                where: { id: id },
                data: updateData
            });
        }, {
            maxWait: 10000, // Maximum time to wait for transaction to start (10 seconds)
            timeout: 30000  // Maximum time for transaction to complete (30 seconds)
        });

        console.log('Product API PUT: Success');
        return NextResponse.json(updatedProduct);
    } catch (error: any) {
        console.error('Update Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
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
        return NextResponse.json({ message: 'Product deleted' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
