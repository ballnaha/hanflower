
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const { id } = params;

        // 1. Fetch the original card
        const originalCard = await prisma.valentineCard.findUnique({
            where: { id },
            include: {
                memories: true,
                orderedProducts: true
            }
        });

        if (!originalCard) {
            return NextResponse.json({ error: "Card not found" }, { status: 404 });
        }

        // 2. Generate new unique slug
        // 2. Generate new unique random slug
        const generateSlug = () => Math.random().toString(36).substring(2, 8);
        let newSlug = generateSlug();
        while (await prisma.valentineCard.findUnique({ where: { slug: newSlug } })) {
            newSlug = generateSlug();
        }

        // 3. Create the new card
        // Only exclude unique IDs and timestamps
        const { id: _, createdAt, updatedAt, memories, orderedProducts, slug, jobName, ...cardData } = originalCard;

        const newCard = await prisma.valentineCard.create({
            data: {
                ...cardData,
                slug: newSlug,
                jobName: jobName ? `${jobName} (Copy)` : null,
                title: originalCard.title, // Title can be same
                memories: {
                    create: memories.map(m => ({
                        type: m.type,
                        url: m.url, // Reusing the same image URL
                        caption: m.caption,
                        thumbnail: m.thumbnail,
                        order: m.order
                    }))
                },
                orderedProducts: {
                    connect: orderedProducts.map(p => ({ id: p.id }))
                }
            }
        });

        revalidatePath('/valentine');

        return NextResponse.json(newCard, { status: 201 });

    } catch (error) {
        console.error("Error duplicating card:", error);
        return NextResponse.json({ error: "Failed to duplicate card" }, { status: 500 });
    }
}
