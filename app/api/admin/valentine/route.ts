
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// GET - List all valentine cards for admin
export async function GET() {
    try {
        const cards = await prisma.valentineCard.findMany({
            include: {
                _count: {
                    select: { memories: true }
                },
                orderedProducts: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(cards);
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

        if (!slug || !title) {
            return NextResponse.json({ error: "Slug and title are required" }, { status: 400 });
        }

        const card = await prisma.valentineCard.create({
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
                memories: {
                    create: memories && Array.isArray(memories) ? memories.map((m: any, index: number) => ({
                        type: m.type || 'image',
                        url: m.url,
                        caption: m.caption,
                        thumbnail: m.thumbnail,
                        order: m.order ?? index
                    })) : []
                },
                orderedProducts: {
                    connect: orderedProducts && Array.isArray(orderedProducts) ? orderedProducts.map((id: string) => ({ id })) : []
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
