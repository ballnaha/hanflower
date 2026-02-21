
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';

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
            product = await (prisma as any).product.findUnique({
                where: { slug: identifier },
                include: {
                    productimages: true,
                    productdetails: true,
                    productfeatures: true,
                    productshippings: true
                }
            });
            console.log(`Product API: Slug lookup result: ${product ? 'FOUND' : 'NOT FOUND'}`);
        } catch (slugError: any) {
            console.error('Product API: Error searching by slug:', slugError.message);
        }

        if (!product) {
            try {
                console.log(`Product API: Attempting lookup by ID: "${identifier}"`);
                product = await (prisma as any).product.findUnique({
                    where: { id: identifier },
                    include: {
                        productimages: true,
                        productdetails: true,
                        productfeatures: true,
                        productshippings: true
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
        return NextResponse.json({
            ...product,
            price: product.price.toString(),
            originalPrice: product.originalPrice?.toString() || null,
            priceVelvet: product.priceVelvet?.toString() || null,
            originalPriceVelvet: product.originalPriceVelvet?.toString() || null,
            images: product.productimages.map((img: any) => img.url),
            details: product.productdetails.map((det: any) => det.text),
            features: product.productfeatures.map((feat: any) => feat.text),
            shipping: product.productshippings?.map((ship: any) => ship.text) || [],
            categoryId: product.categoryId,
            hasQrCode: product.hasQrCode,
            qrCodePrice: product.qrCodePrice?.toString() || "0",
            isNew: product.isNew,
            isBestSeller: product.isBestSeller
        });
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
        const {
            title, sku, slug, type, price, originalPrice,
            discount, priceVelvet, originalPriceVelvet, discountVelvet,
            description, image, images,
            details, features, shipping, stock, stockVelvet, priority,
            categoryId, hasQrCode, qrCodePrice, isNew, isBestSeller, isActive
        } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
        }

        const updatedProduct = await (prisma as any).$transaction(async (tx: any) => {
            // 1. Delete old relations
            await tx.productImage.deleteMany({ where: { productId: id } });
            await tx.productDetail.deleteMany({ where: { productId: id } });
            await tx.productFeature.deleteMany({ where: { productId: id } });
            await tx.productShipping.deleteMany({ where: { productId: id } });

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
                hasQrCode: hasQrCode !== undefined ? hasQrCode : false,
                qrCodePrice: qrCodePrice ? parseFloat(qrCodePrice.toString().replace(/,/g, '')) : 0,
                isNew: !!isNew,
                isBestSeller: !!isBestSeller,
                isActive: isActive !== undefined ? !!isActive : true,
                productimages: {
                    create: images.filter((url: string) => url && url.trim() !== '').map((url: string) => ({ url }))
                },
                productdetails: {
                    create: details.filter((text: string) => text && text.trim() !== '').map((text: string) => ({ text }))
                },
                productfeatures: {
                    create: features.filter((text: string) => text && text.trim() !== '').map((text: string) => ({ text }))
                },
                productshippings: {
                    create: shipping ? shipping.filter((text: string) => text && text.trim() !== '').map((text: string) => ({ text })) : []
                }
            };

            return await tx.product.update({
                where: { id: id },
                data: updateData
            });
        });

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

        // Fetch product to get images and check order items before deletion
        const product = await (prisma as any).product.findUnique({
            where: { id },
            include: {
                productimages: true,
                orderitems: true
            }
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Professional approach:
        // If product has been ordered, we just deactivate it (isActive: false)
        // If it has NEVER been ordered, we can safely hard delete it and its images.
        if (product.orderitems && product.orderitems.length > 0) {
            await (prisma as any).product.update({
                where: { id },
                data: { isActive: false }
            });
            return NextResponse.json({
                message: 'Product deactivated (kept in system because it has orders)',
                action: 'deactivated'
            });
        }

        // NO orders found - proceed with hard delete
        if (product) {
            // Collect all image URLs
            const imagesToDelete: string[] = [];
            if (product.image) imagesToDelete.push(product.image);
            if (product.productimages && product.productimages.length > 0) {
                product.productimages.forEach((img: any) => {
                    if (img.url) imagesToDelete.push(img.url);
                });
            }

            for (const imgUrl of imagesToDelete) {
                if (typeof imgUrl === 'string' && imgUrl.trim() !== '' && !imgUrl.startsWith('http')) {
                    try {
                        let filePath = '';
                        if (imgUrl.includes('/uploads/')) {
                            const pathParts = imgUrl.split('/').filter(Boolean);
                            filePath = join(process.cwd(), 'public', ...pathParts);
                        } else if (!imgUrl.includes('/')) {
                            filePath = join(process.cwd(), 'public', 'uploads', imgUrl);
                        } else {
                            // Assume it starts with / and it's inside public
                            const pathParts = imgUrl.split('/').filter(Boolean);
                            filePath = join(process.cwd(), 'public', ...pathParts);
                        }

                        if (filePath) {
                            await unlink(filePath);
                            console.log(`Deleted file: ${filePath}`);
                        }
                    } catch (err: any) {
                        console.warn(`Failed to delete file ${imgUrl}:`, err.message);
                    }
                }
            }
        }

        await (prisma as any).product.delete({
            where: { id }
        });

        return NextResponse.json({
            message: 'Product deleted successfully',
            action: 'deleted'
        });
    } catch (error: any) {
        console.error('Delete Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
