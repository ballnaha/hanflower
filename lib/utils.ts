
/**
 * Utility to get the correct image URL for product and category images.
 * Handles both public assets, absolute URLs, and images served via the API.
 */
export const getImageUrl = (src: string | null | undefined): string => {
    const FALLBACK_IMAGE = "/images/placeholder-product.png";

    if (!src) return FALLBACK_IMAGE;

    // If it's an absolute URL (http/https), use as is
    if (src.startsWith('http')) {
        return src;
    }

    // Handle images in /uploads directory
    if (src.includes('uploads/')) {
        // Extract the path after /uploads/ or uploads/
        const parts = src.split('uploads/');
        const pathAfterUploads = parts[parts.length - 1];

        // Route through the API image server
        return `/api/images/${pathAfterUploads}`;
    }

    // If it already starts with /
    if (src.startsWith('/')) {
        return src;
    }

    // If it's just a raw filename (no slashes), assume legacy upload served via API
    if (!src.includes('/')) {
        return `/api/images/${src}`;
    }

    // Otherwise, assume it's a path in the public directory and prepend /
    return src.startsWith('/') ? src : `/${src}`;
};
