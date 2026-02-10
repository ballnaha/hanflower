
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
        const originalCard = await (prisma as any).valentineCard.findUnique({
            where: { id },
            include: {
                valentinememories: true,
                valentinecardtoproduct: true
            }
        });

        if (!originalCard) {
            return NextResponse.json({ error: "Card not found" }, { status: 404 });
        }

        // 2. Generate new unique slug
        const generateSlug = () => Math.random().toString(36).substring(2, 8);
        let newSlug = generateSlug();
        while (await (prisma as any).valentineCard.findUnique({ where: { slug: newSlug } })) {
            newSlug = generateSlug();
        }

        // 3. Create the new card
        const { id: _, createdAt, updatedAt, valentinememories, valentinecardtoproduct, slug, jobName, ...cardData } = originalCard as any;

        const newCard = await (prisma as any).valentineCard.create({
            data: {
                ...cardData,
                slug: newSlug,
                jobName: jobName ? `${jobName} (Copy)` : null,
                valentinememories: {
                    create: valentinememories.map((m: any) => ({
                        type: m.type,
                        url: m.url, // Reusing the same image URL
                        caption: m.caption,
                        thumbnail: m.thumbnail,
                        order: m.order
                    }))
                },
                valentinecardtoproduct: {
                    create: valentinecardtoproduct.map((p: any) => ({ B: p.B }))
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
