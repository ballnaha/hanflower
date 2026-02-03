const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting Image Path Migration ---');

    // 1. Update Category images
    const categories = await prisma.category.findMany({
        where: { image: { contains: '/uploads/' } }
    });
    console.log(`Found ${categories.length} categories to update.`);
    for (const cat of categories) {
        const newPath = cat.image.replace('/uploads/', '/api/images/');
        await prisma.category.update({
            where: { id: cat.id },
            data: { image: newPath }
        });
        console.log(`Updated Category ${cat.id}: ${cat.image} -> ${newPath}`);
    }

    // 2. Update Product images
    const products = await prisma.product.findMany({
        where: { image: { contains: '/uploads/' } }
    });
    console.log(`Found ${products.length} products to update.`);
    for (const prod of products) {
        const newPath = prod.image.replace('/uploads/', '/api/images/');
        await prisma.product.update({
            where: { id: prod.id },
            data: { image: newPath }
        });
        console.log(`Updated Product ${prod.id}: ${prod.image} -> ${newPath}`);
    }

    // 3. Update ProductImage table (extra images)
    const productImages = await prisma.productimage.findMany({
        where: { url: { contains: '/uploads/' } }
    });
    console.log(`Found ${productImages.length} product images to update.`);
    for (const img of productImages) {
        const newPath = img.url.replace('/uploads/', '/api/images/');
        await prisma.productimage.update({
            where: { id: img.id },
            data: { url: newPath }
        });
        console.log(`Updated ProductImage ${img.id}: ${img.url} -> ${newPath}`);
    }

    // 4. Update OrderItem images (if any)
    const orderItems = await prisma.orderitem.findMany({
        where: { image: { contains: '/uploads/' } }
    });
    console.log(`Found ${orderItems.length} order items to update.`);
    for (const item of orderItems) {
        const newPath = item.image.replace('/uploads/', '/api/images/');
        await prisma.orderitem.update({
            where: { id: item.id },
            data: { image: newPath }
        });
        console.log(`Updated OrderItem ${item.id}: ${item.image} -> ${newPath}`);
    }

    // 5. Update Valentine models
    // ValentineProduct
    const vProducts = await prisma.valentineProduct.findMany({
        where: { image: { contains: '/uploads/' } }
    });
    for (const vp of vProducts) {
        if (vp.image) {
            const newPath = vp.image.replace('/uploads/', '/api/images/');
            await prisma.valentineProduct.update({
                where: { id: vp.id },
                data: { image: newPath }
            });
        }
    }

    // ValentineProductImage
    const vProductImages = await prisma.valentineProductImage.findMany({
        where: { url: { contains: '/uploads/' } }
    });
    for (const vpi of vProductImages) {
        const newPath = vpi.url.replace('/uploads/', '/api/images/');
        await prisma.valentineProductImage.update({
            where: { id: vpi.id },
            data: { url: newPath }
        });
    }

    console.log('--- Migration Completed ---');
}

main()
    .catch(e => {
        console.error('Migration failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
