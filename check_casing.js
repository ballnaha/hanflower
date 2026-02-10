const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
console.log('valentinecard:', !!prisma.valentinecard);
console.log('valentineCard:', !!prisma.valentineCard);
process.exit(0);
