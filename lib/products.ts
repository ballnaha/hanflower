
export interface Product {
    id: string;
    sku: string;
    slug: string;
    title: string;
    type: string;
    price: string;
    originalPrice: string;
    discount: string;
    priceVelvet?: string;
    originalPriceVelvet?: string;
    discountVelvet?: string;
    image: string;
    images: string[];
    description: string;
    details: string[];
    features: string[];
    shipping: string[];
    stock: number;
    stockVelvet: number;
    priority?: number;
    hasQrCode?: boolean;
    qrCodePrice?: string;
    isNew?: boolean;
    isBestSeller?: boolean;
}

// Mock data removed - now using database
// Use API: /api/products to fetch products
