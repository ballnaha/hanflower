const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const categories = await prisma.category.findMany();
    console.log('Total Categories in DB:', categories.length);
    console.log(JSON.stringify(categories, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
