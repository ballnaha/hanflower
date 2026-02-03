import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

const deleteFile = async (imageUrl: string) => {
    if (!imageUrl || imageUrl.startsWith('http')) return;

    try {
        let filename = '';
        if (imageUrl.includes('/api/images/')) {
            filename = imageUrl.split('/').pop() || '';
        } else if (imageUrl.includes('uploads/')) {
            filename = imageUrl.split('/').pop() || '';
        } else if (imageUrl.startsWith('/')) {
            // If it's just a root-relative path, try to delete it directly from public
            const filePath = path.join(process.cwd(), 'public', imageUrl.slice(1));
            await fs.unlink(filePath);
            console.log(`Deleted file: ${filePath}`);
            return;
        }

        if (filename) {
            const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
            await fs.unlink(filePath);
            console.log(`Deleted file from uploads: ${filePath}`);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

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

        if (image !== undefined) {
            const oldCategory = await prisma.category.findUnique({
                where: { id },
                select: { image: true }
            });

            if (oldCategory?.image && oldCategory.image !== image) {
                await deleteFile(oldCategory.image);
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

        // Get the category first to find the image path
        const category = await prisma.category.findUnique({
            where: { id },
            select: { image: true }
        });

        if (category?.image) {
            await deleteFile(category.image);
        }

        await prisma.category.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
