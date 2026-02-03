
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

    // If it already starts with /, it's a root-relative path
    if (src.startsWith('/')) {
        return src;
    }

    // If it's an uploaded file (contains 'uploads/'), route it through the API
    if (src.includes('uploads/')) {
        const filename = src.split('/').pop();
        return filename ? `/api/images/${filename}` : FALLBACK_IMAGE;
    }

    // If it's just a raw filename (no slashes), assume it's an upload served via API
    if (!src.includes('/')) {
        return `/api/images/${src}`;
    }

    // Otherwise, assume it's a path in the public directory and prepend /
    return `/${src}`;
};
