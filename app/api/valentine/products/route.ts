
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const products = await prisma.valentineProduct.findMany({
            where: {
                status: "active"
            },
            include: {
                images: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error("Error fetching valentine products:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
