const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const albums = await prisma.eventAlbum.findMany({
            select: { category: true }
        })
        console.log('Categories:', [...new Set(albums.map(a => a.category))])
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
