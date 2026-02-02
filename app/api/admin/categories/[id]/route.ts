import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, subtitle, slug, description, image, priority, isActive } = body;

        const data: any = {};
        if (title !== undefined) data.title = title;
        if (subtitle !== undefined) data.subtitle = subtitle;
        if (slug !== undefined) data.slug = slug;
        if (description !== undefined) data.description = description;
        if (image !== undefined) data.image = image;
        if (priority !== undefined) data.priority = Number(priority);
        if (isActive !== undefined) data.isActive = isActive;

        if (image) {
            const oldCategory = await prisma.category.findUnique({
                where: { id },
                select: { image: true }
            });

            if (oldCategory?.image && oldCategory.image !== image) {
                try {
                    // Remove leading slash if present to get relative path in public
                    const relativePath = oldCategory.image.startsWith('/')
                        ? oldCategory.image.slice(1)
                        : oldCategory.image;

                    const filePath = path.join(process.cwd(), 'public', relativePath);
                    await fs.unlink(filePath);
                    console.log(`Deleted old image: ${filePath}`);
                } catch (error) {
                    console.error('Error deleting old image:', error);
                    // Continue even if delete fails
                }
            }
        }

        const category = await prisma.category.update({
            where: { id },
            data,
        });

        return NextResponse.json(category);
    } catch (error: any) {
        console.error('Error updating category:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.category.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
