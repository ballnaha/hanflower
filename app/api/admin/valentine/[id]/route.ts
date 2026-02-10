
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from 'fs/promises';
import path from 'path';

// Helper to check if a file is used by other cards
async function isFileUsed(url: string, currentCardId: string): Promise<boolean> {
    if (!url) return false;

    // Check memory usage in OTHER cards
    const memoryCount = await (prisma as any).valentineMemory.count({
        where: {
            url: url,
            cardId: { not: currentCardId }
        }
    });

    if (memoryCount > 0) return true;

    // Check background music usage in OTHER cards
    const musicCount = await (prisma as any).valentineCard.count({
        where: {
            backgroundMusicUrl: url,
            id: { not: currentCardId }
        }
    });

    if (musicCount > 0) return true;

    return false;
}

// GET - Get single valentine card with memories
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const { id } = params;

        const card = await (prisma as any).valentineCard.findUnique({
            where: { id },
            include: {
                valentinememories: {
                    orderBy: { order: 'asc' }
                },
                valentinecardtoproduct: true
            }
        });

        if (!card) {
            return NextResponse.json({ error: "Valentine card not found" }, { status: 404 });
        }

        // Transform for frontend
        const transformed = {
            ...card,
            memories: card.valentinememories,
            orderedProducts: card.valentinecardtoproduct?.map((p: any) => p.B) || []
        };

        return NextResponse.json(transformed);
    } catch (error) {
        console.error("Error fetching valentine card:", error);
        return NextResponse.json({ error: "Failed to fetch valentine card" }, { status: 500 });
    }
}

// PUT - Update valentine card and its memories
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const { id } = params;
        const body = await req.json();
        const {
            slug, jobName, title, openingText, greeting, subtitle, message,
            signer, backgroundColor, backgroundMusicYoutubeId, backgroundMusicUrl, swipeHintColor, swipeHintText, showGame, campaignName, customerPhone, customerAddress, note, status, disabledAt, memories, orderedProducts
        } = body;

        if (!slug || !title) {
            return NextResponse.json({ error: "Slug and title are required" }, { status: 400 });
        }

        // Validate and filter product IDs
        let validProductIds: string[] = [];
        if (orderedProducts && Array.isArray(orderedProducts) && orderedProducts.length > 0) {
            const products = await (prisma as any).product.findMany({
                where: {
                    id: { in: orderedProducts }
                },
                select: { id: true }
            });
            validProductIds = products.map((p: any) => p.id);
        }

        // Update main card data
        const card = await (prisma as any).valentineCard.update({
            where: { id },
            data: {
                slug,
                jobName,
                title,
                openingText,
                greeting,
                subtitle,
                message,
                signer,
                backgroundColor,
                backgroundMusicYoutubeId,
                backgroundMusicUrl,
                swipeHintColor,
                swipeHintText,
                showGame: showGame ?? true,
                campaignName,
                customerPhone,
                customerAddress,
                note,
                status,
                disabledAt: disabledAt ? new Date(disabledAt) : null,
                valentinecardtoproduct: {
                    deleteMany: {},
                    create: validProductIds.map(pid => ({ B: pid }))
                }
            }
        });

        // Handle memories update if provided (DELETE first, then Create)
        if (memories && Array.isArray(memories)) {
            await (prisma as any).valentineMemory.deleteMany({
                where: { cardId: id }
            });

            if (memories.length > 0) {
                await (prisma as any).valentineMemory.createMany({
                    data: memories.map((m: any, index: number) => ({
                        cardId: id,
                        type: m.type || 'image',
                        url: m.url,
                        caption: m.caption,
                        thumbnail: m.thumbnail,
                        order: m.order ?? index
                    }))
                });
            }
        }

        // Delete specified files if urlsToDelete is provided
        const { urlsToDelete } = body;
        if (urlsToDelete && Array.isArray(urlsToDelete)) {
            for (const url of urlsToDelete) {
                if (!url) continue;

                const isUsed = await isFileUsed(url, id);
                if (isUsed) {
                    console.log(`Skipping deletion of shared file: ${url}`);
                    continue;
                }

                let filepath = '';
                if (url.startsWith('/uploads')) {
                    filepath = path.join(process.cwd(), 'public', url.startsWith('/') ? url.substring(1) : url);
                } else if (url.startsWith('/api/images/')) {
                    const filename = url.replace('/api/images/', '');
                    filepath = path.join(process.cwd(), 'public', 'uploads', filename);
                }

                if (filepath) {
                    try {
                        await fs.unlink(filepath).catch((err: any) => {
                            if (err.code !== 'ENOENT') console.error("Error deleting file:", err);
                        });
                    } catch (err) {
                        console.error("File deletion logic error:", err);
                    }
                }
            }
        }

        revalidatePath('/valentine');
        revalidatePath(`/valentine/${slug}`);

        return NextResponse.json(card);
    } catch (error: any) {
        console.error("Error updating valentine card:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update valentine card" }, { status: 500 });
    }
}

// DELETE - Delete valentine card
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const { id } = params;

        const card = await (prisma as any).valentineCard.findUnique({
            where: { id },
            include: { valentinememories: true }
        });

        if (!card) {
            return NextResponse.json({ error: "Valentine card not found" }, { status: 404 });
        }

        // Step 1: Collect files to potentially delete
        const filesToDelete = new Set<string>();
        if (card.backgroundMusicUrl) filesToDelete.add(card.backgroundMusicUrl);
        if (card.valentinememories) {
            card.valentinememories.forEach((m: any) => {
                if (m.url) filesToDelete.add(m.url);
            });
        }

        // Step 2: Delete from DB
        await (prisma as any).valentineCard.delete({
            where: { id }
        });

        // Step 3: Check usage and delete physical files if unused
        for (const url of Array.from(filesToDelete)) {
            const isUsed = await isFileUsed(url, id);
            if (isUsed) {
                console.log(`Skipping deletion of shared file: ${url}`);
                continue;
            }

            let filepath = '';
            if (url.startsWith('/uploads')) {
                filepath = path.join(process.cwd(), 'public', url.startsWith('/') ? url.substring(1) : url);
            } else if (url.startsWith('/api/images/')) {
                const filename = url.replace('/api/images/', '');
                filepath = path.join(process.cwd(), 'public', 'uploads', filename);
            }

            if (filepath) {
                try {
                    await fs.unlink(filepath).catch(() => { });
                } catch (err) {
                    console.error("File deletion error:", err);
                }
            }
        }

        if (card.slug) {
            try {
                const folderPath = path.join(process.cwd(), 'public', 'uploads', 'valentine', card.slug);
                const stats = await fs.stat(folderPath).catch(() => null);
                if (stats && stats.isDirectory()) {
                    await fs.rm(folderPath, { recursive: true, force: true }).catch(() => { });
                }
            } catch (err) {
                // Ignore folder deletion errors
            }
        }

        revalidatePath('/valentine');
        revalidatePath(`/valentine/`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting valentine card:", error);
        return NextResponse.json({ error: "Failed to delete valentine card" }, { status: 500 });
    }
}
