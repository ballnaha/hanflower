import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const albums = await prisma.eventAlbum.findMany({
        select: { category: true }
    })
    console.log('Categories:', [...new Set(albums.map(a => a.category))])
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
