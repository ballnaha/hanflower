
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

// GET - List all valentine cards for admin
export async function GET() {
    try {
        const cards = await (prisma as any).valentineCard.findMany({
            include: {
                _count: {
                    select: { valentinememories: true }
                },
                valentinecardtoproduct: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Transform for frontend
        const transformed = cards.map((card: any) => ({
            ...card,
            _count: {
                memories: card._count?.valentinememories || 0
            },
            orderedProducts: card.valentinecardtoproduct
        }));

        return NextResponse.json(transformed);
    } catch (error) {
        console.error("Error fetching valentine cards:", error);
        return NextResponse.json({ error: "Failed to fetch valentine cards" }, { status: 500 });
    }
}

// POST - Create new valentine card
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { slug, jobName, title, openingText, greeting, subtitle, message, signer, backgroundColor, backgroundMusicYoutubeId, backgroundMusicUrl, swipeHintColor, swipeHintText, showGame, campaignName, customerPhone, customerAddress, note, status, disabledAt, memories, orderedProducts } = body;

        console.log("Creating Valentine Card with orderedProducts:", orderedProducts);

        if (!slug || !title) {
            return NextResponse.json({ error: "Slug and title are required" }, { status: 400 });
        }

        // Validate and filter product IDs
        let validProductIds: string[] = [];
        if (orderedProducts && Array.isArray(orderedProducts) && orderedProducts.length > 0) {
            // Filter invalid IDs (empty strings, etc.)
            const potentialIds = orderedProducts.filter((id: any) => !!id && typeof id === 'string');

            if (potentialIds.length > 0) {
                const products = await (prisma as any).product.findMany({
                    where: {
                        id: { in: potentialIds }
                    },
                    select: { id: true }
                });
                validProductIds = products.map((p: any) => p.id);
            }
        }

        const card = await (prisma as any).valentineCard.create({
            data: {
                slug,
                jobName: jobName || null,
                title,
                openingText: openingText || null,
                greeting: greeting || null,
                subtitle: subtitle || null,
                message: message || null,
                signer: signer || null,
                backgroundColor: backgroundColor || "#FFF0F3",
                backgroundMusicYoutubeId: backgroundMusicYoutubeId || null,
                backgroundMusicUrl: backgroundMusicUrl || null,
                swipeHintColor: swipeHintColor || "white",
                swipeHintText: swipeHintText || "Swipe to see more",
                showGame: showGame ?? true,
                campaignName: campaignName || "Valentine's",
                customerPhone: customerPhone || null,
                customerAddress: customerAddress || null,
                note: note || null,
                status: status || "active",
                disabledAt: disabledAt ? new Date(disabledAt) : null,
                valentinememories: {
                    create: memories && Array.isArray(memories) ? memories.map((m: any, index: number) => ({
                        type: m.type || 'image',
                        url: m.url,
                        caption: m.caption,
                        thumbnail: m.thumbnail,
                        order: m.order ?? index
                    })) : []
                },
                valentinecardtoproduct: {
                    create: validProductIds.map(id => ({ B: id })) // Use create for the join table since it's an explicit many-to-many model in schema
                }
            }
        });

        revalidatePath('/valentine');
        revalidatePath(`/valentine/${slug}`);

        return NextResponse.json(card, { status: 201 });
    } catch (error: any) {
        console.error("Error creating valentine card:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to create valentine card" }, { status: 500 });
    }
}
