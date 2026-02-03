import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
    const username = 'admin';
    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
        where: { username },
        update: {
            password: hashedPassword,
        },
        create: {
            id: randomUUID(),
            username,
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    console.log('Admin user created/updated:', admin.username);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
