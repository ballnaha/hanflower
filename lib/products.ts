
export interface Product {
    id: string;
    sku: string;
    slug: string;
    title: string;
    type: string;
    price: string;
    originalPrice: string;
    discount: string;
    image: string;
    images: string[];
    description: string;
    details: string[];
    features: string[];
    stock: number;
}

// Mock data removed - now using database
// Use API: /api/products to fetch products
