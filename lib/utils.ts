
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

    // If it already starts with /
    if (src.startsWith('/')) {
        // If it starts with /uploads, return as is (Next.js serves from public/)
        if (src.startsWith('/uploads/')) {
            return src;
        }
        return src;
    }

    // If it's an uploaded file (contains 'uploads/') but not starting with /
    if (src.includes('uploads/')) {
        // If it has more than one segment after uploads/ (i.e. subfolders), return with leading /
        if (src.split('uploads/')[1].includes('/')) {
            return src.startsWith('/') ? src : `/${src}`;
        }
        // Legacy: route simple upload filenames through the API
        const filename = src.split('/').pop();
        return filename ? `/api/images/${filename}` : FALLBACK_IMAGE;
    }

    // If it's just a raw filename (no slashes), assume legacy upload served via API
    if (!src.includes('/')) {
        return `/api/images/${src}`;
    }

    // Otherwise, assume it's a path in the public directory and prepend /
    return src.startsWith('/') ? src : `/${src}`;
};
