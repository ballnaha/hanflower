
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from 'fs/promises';
import path from 'path';

// GET - Get single valentine card with memories
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const { id } = params;

        const card = await prisma.valentineCard.findUnique({
            where: { id },
            include: {
                memories: {
                    orderBy: { order: 'asc' }
                },
                orderedProducts: true
            }
        });

        if (!card) {
            return NextResponse.json({ error: "Valentine card not found" }, { status: 404 });
        }

        return NextResponse.json(card);
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
            const products = await prisma.product.findMany({
                where: {
                    id: { in: orderedProducts }
                },
                select: { id: true }
            });
            validProductIds = products.map((p: any) => p.id);
        }

        // Update main card data
        const card = await prisma.valentineCard.update({
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
                orderedProducts: {
                    set: validProductIds.map(id => ({ id }))
                }
            }
        });

        // Delete specified files if urlsToDelete is provided (handle both memories and music)
        const { urlsToDelete } = body;
        if (urlsToDelete && Array.isArray(urlsToDelete)) {
            for (const url of urlsToDelete) {
                if (!url) continue;

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

        // Handle memories update if provided
        if (memories && Array.isArray(memories)) {

            // Simple approach: delete all and recreate
            await prisma.valentineMemory.deleteMany({
                where: { cardId: id }
            });

            if (memories.length > 0) {
                await prisma.valentineMemory.createMany({
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

        const card = await prisma.valentineCard.findUnique({
            where: { id },
            include: { memories: true }
        });

        if (!card) {
            return NextResponse.json({ error: "Valentine card not found" }, { status: 404 });
        }

        // Delete background music file
        if (card.backgroundMusicUrl) {
            let musicPath = '';
            if (card.backgroundMusicUrl.startsWith('/uploads')) {
                musicPath = path.join(process.cwd(), 'public', card.backgroundMusicUrl.startsWith('/') ? card.backgroundMusicUrl.substring(1) : card.backgroundMusicUrl);
            } else if (card.backgroundMusicUrl.startsWith('/api/images/')) {
                const filename = card.backgroundMusicUrl.replace('/api/images/', '');
                musicPath = path.join(process.cwd(), 'public', 'uploads', filename);
            }

            if (musicPath) {
                try {
                    await fs.unlink(musicPath).catch(() => { });
                } catch (err) {
                    console.error("Music file deletion error:", err);
                }
            }
        }

        // Delete all memory files
        if (card.memories && card.memories.length > 0) {
            for (const memory of card.memories) {
                if (!memory.url) continue;

                let memoryPath = '';
                if (memory.url.startsWith('/uploads')) {
                    memoryPath = path.join(process.cwd(), 'public', memory.url.startsWith('/') ? memory.url.substring(1) : memory.url);
                } else if (memory.url.startsWith('/api/images/')) {
                    const filename = memory.url.replace('/api/images/', '');
                    memoryPath = path.join(process.cwd(), 'public', 'uploads', filename);
                }

                if (memoryPath) {
                    try {
                        await fs.unlink(memoryPath).catch(() => { });
                    } catch (err) {
                        console.error("Memory file deletion error:", err);
                    }
                }
            }
        }

        // Delete the legacy folder for this slug if it exists (backward compatibility)
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

        await prisma.valentineCard.delete({
            where: { id }
        });

        revalidatePath('/valentine');
        revalidatePath(`/valentine/${card.slug}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting valentine card:", error);
        return NextResponse.json({ error: "Failed to delete valentine card" }, { status: 500 });
    }
}
