import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' }
            ]
        });
        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching admin categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, subtitle, slug, description, image, priority, isActive } = body;

        if (!title || !slug) {
            return NextResponse.json({ error: 'Title and Slug are required' }, { status: 400 });
        }

        const category = await prisma.category.create({
            data: {
                id: randomUUID(),
                title,
                name: title,
                subtitle: subtitle || null,
                slug,
                description: description || '',
                image: image || '',
                priority: Number(priority) || 0,
                isActive: isActive !== undefined ? isActive : true,
                updatedAt: new Date(),
            }
        });

        return NextResponse.json(category);
    } catch (error: any) {
        console.error('Error creating category:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
