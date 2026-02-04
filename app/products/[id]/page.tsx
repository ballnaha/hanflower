
import ProductDetail from "@/components/product/ProductDetail";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getProduct(identifier: string) {
    const decodedId = decodeURIComponent(identifier);

    // Try to find by id first, then by slug
    let product = await prisma.product.findUnique({
        where: { id: decodedId },
        include: {
            productimage: true,
            productdetail: true,
            productfeature: true,
            productshipping: true
        }
    });

    if (!product) {
        product = await prisma.product.findUnique({
            where: { slug: decodedId },
            include: {
                productimage: true,
                productdetail: true,
                productfeature: true,
                productshipping: true
            }
        });
    }

    if (!product) return null;

    // Normalize for the rest of the file
    return {
        ...product,
        images: product.productimage.map(img => img.url),
        details: product.productdetail.map(d => d.text),
        features: product.productfeature.map(f => f.text),
        shipping: product.productshipping.map(s => s.text)
    };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const slug = (await params).id;
    const product = await getProduct(slug);

    if (!product) {
        return {
            title: 'ไม่พบสินค้า | Hanflower',
            description: 'ไม่พบสินค้าที่คุณต้องการ',
        };
    }

    const price = product.price.toString();
    const title = `${product.title} | ฿${price} | Hanflower`;
    const description = product.description.substring(0, 160);
    const imageUrl = product.image.startsWith('http')
        ? product.image
        : `https://hanflowerthailand.com${product.image}`;

    return {
        title,
        description,
        keywords: `${product.title}, ${product.type}, ดอกไม้, ของขวัญ, Hanflower, ช่อดอกไม้, ไม้อวบน้ำ`,
        openGraph: {
            title,
            description,
            type: 'website',
            locale: 'th_TH',
            siteName: 'Hanflower',
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: product.title,
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
        alternates: {
            canonical: `/products/${product.slug}`,
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

// Generate static params for static generation (optional, for performance)
export async function generateStaticParams() {
    const products = await prisma.product.findMany({
        select: { slug: true }
    });

    return products.map((product: { slug: string }) => ({
        id: product.slug,
    }));
}

export default async function Page({ params }: PageProps) {
    const id = (await params).id;

    // JSON-LD Structured Data for SEO
    const product = await getProduct(id);

    const jsonLd = product ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: product.description,
        image: product.image.startsWith('http')
            ? product.image
            : `https://hanflowerthailand.com${product.image}`,
        offers: {
            '@type': 'Offer',
            price: product.price.toString(),
            priceCurrency: 'THB',
            availability: product.stock > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: 'Hanflower'
            }
        },
        brand: {
            '@type': 'Brand',
            name: 'Hanflower'
        },
        category: product.type
    } : null;

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <main>
                <ProductDetail productId={id} />
            </main>
        </>
    );
}
