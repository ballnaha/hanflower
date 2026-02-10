import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

// Helper to check if a file is used by other albums or products
async function isFileUsed(url: string, currentAlbumId: string): Promise<boolean> {
    if (!url) return false;

    // 1. Check in OTHER event albums (cover image)
    const albumCount = await (prisma as any).eventalbum.count({
        where: {
            coverImage: url,
            id: { not: currentAlbumId }
        }
    });
    if (albumCount > 0) return true;

    // 2. Check in OTHER event photos
    const photoCount = await (prisma as any).eventphoto.count({
        where: {
            url: url,
            albumId: { not: currentAlbumId }
        }
    });
    if (photoCount > 0) return true;

    // 3. Check in products (main image)
    const productCount = await (prisma as any).product.count({
        where: { image: url }
    });
    if (productCount > 0) return true;

    // 4. Check in product gallery images
    const productImageCount = await (prisma as any).productimage.count({
        where: { url }
    });
    if (productImageCount > 0) return true;

    // 5. Check in valentine memories
    const valentineCount = await (prisma as any).valentinememory.count({
        where: { url }
    });
    if (valentineCount > 0) return true;

    return false;
}

// Helper to delete physical file
async function deletePhysicalFile(url: string, currentAlbumId: string) {
    if (!url) return;

    // 1. Check if the file is used elsewhere before deleting
    const isUsed = await isFileUsed(url, currentAlbumId);
    if (isUsed) {
        console.log(`Skipping deletion of shared file: ${url}`);
        return;
    }

    let filepath = '';

    // Normalize URL path for file system lookup
    // Covers: /uploads/events/xxx, /uploads/xxx, uploads/xxx
    if (url.includes('uploads/')) {
        const relativePath = url.startsWith('/') ? url.substring(1) : url;
        filepath = path.join(process.cwd(), 'public', relativePath);
    }
    // Covers legacy API served images
    else if (url.startsWith('/api/images/')) {
        const filename = url.replace('/api/images/', '');
        filepath = path.join(process.cwd(), 'public', 'uploads', filename);
    }

    if (filepath) {
        try {
            await fs.unlink(filepath).catch((err: any) => {
                // Ignore if file already doesn't exist
                if (err.code !== 'ENOENT') {
                    console.error(`Error deleting physical file at ${filepath}:`, err);
                }
            });
            console.log(`Successfully deleted physical file: ${filepath}`);
        } catch (err) {
            console.error("File deletion error in logic:", err);
        }
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const album = await (prisma as any).eventalbum.findUnique({
            where: { id },
            include: {
                eventphoto: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });

        if (!album) {
            return NextResponse.json({ error: 'Album not found' }, { status: 404 });
        }

        // Transform for frontend
        const transformedAlbum = {
            ...album,
            photos: album.eventphoto
        };
        delete (transformedAlbum as any).eventphoto;

        return NextResponse.json(transformedAlbum);
    } catch (error) {
        console.error('Error fetching admin event album:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, category, location, date, coverImage, priority, isActive, photos } = body;

        // Collect old data for cleanup
        const oldAlbum = await (prisma as any).eventalbum.findUnique({
            where: { id },
            include: { eventphoto: true }
        });

        if (!oldAlbum) {
            return NextResponse.json({ error: 'Album not found' }, { status: 404 });
        }

        // Update album details
        const updatedAlbum = await (prisma as any).eventalbum.update({
            where: { id },
            data: {
                title,
                category,
                location,
                date,
                coverImage,
                priority: parseInt(String(priority)) || 0,
                isActive: isActive !== undefined ? isActive : true
            }
        });

        // If photos are provided, update them
        if (photos && Array.isArray(photos)) {
            // Get current URLs to find which ones are removed
            const oldPhotoUrls = oldAlbum.eventphoto.map((p: any) => p.url);
            const newPhotoUrls = photos.map((p: any) => p.url);

            await (prisma as any).eventphoto.deleteMany({
                where: { albumId: id }
            });

            if (photos.length > 0) {
                await (prisma as any).eventphoto.createMany({
                    data: photos.map((photo: any, index: number) => ({
                        albumId: id,
                        url: photo.url,
                        caption: photo.caption,
                        order: photo.order !== undefined ? photo.order : index
                    }))
                });
            }

            // Cleanup removed photos
            const removedUrls = oldPhotoUrls.filter((url: string) => !newPhotoUrls.includes(url) && url !== coverImage);
            for (const url of removedUrls) {
                await deletePhysicalFile(url, id);
            }
        }

        // Cleanup old cover image if changed and not used in photos
        if (oldAlbum.coverImage !== coverImage) {
            const isUsedInNewPhotos = photos?.some((p: any) => p.url === oldAlbum.coverImage);
            if (!isUsedInNewPhotos) {
                await deletePhysicalFile(oldAlbum.coverImage, id);
            }
        }

        return NextResponse.json(updatedAlbum);
    } catch (error) {
        console.error('Error updating admin event album:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Fetch album first to get file URLs
        const album = await (prisma as any).eventalbum.findUnique({
            where: { id },
            include: { eventphoto: true }
        });

        if (!album) {
            return NextResponse.json({ error: 'Album not found' }, { status: 404 });
        }

        // Collect all files to delete
        const filesToDelete = new Set<string>();
        if (album.coverImage) filesToDelete.add(album.coverImage);
        album.eventphoto.forEach((p: any) => {
            if (p.url) filesToDelete.add(p.url);
        });

        // Delete related photos from DB first
        await (prisma as any).eventphoto.deleteMany({
            where: { albumId: id }
        });

        // Delete album from DB
        await (prisma as any).eventalbum.delete({
            where: { id }
        });

        // Cleanup physical files
        for (const url of Array.from(filesToDelete)) {
            await deletePhysicalFile(url, id);
        }

        return NextResponse.json({ message: 'Album deleted successfully' });
    } catch (error) {
        console.error('Error deleting admin event album:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
