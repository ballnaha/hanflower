const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({ select: { id: true, image: true } });
    const categories = await prisma.category.findMany({ select: { id: true, image: true } });
    console.log('Products:', JSON.stringify(products, null, 2));
    console.log('Categories:', JSON.stringify(categories, null, 2));
}

main().finally(() => prisma.$disconnect());
