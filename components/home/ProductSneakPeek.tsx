'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Container, Typography, Button, Box, Skeleton } from "@mui/material";

// Fallback image for production when product image is missing or fails to load
const FALLBACK_IMAGE = "/images/placeholder-product.png";

interface Product {
    id: string;
    slug: string;
    title: string;
    image: string;
    type: string;
    price: string;
    originalPrice: string;
    discount: string;
    priceVelvet?: string;
    originalPriceVelvet?: string;
}

export default function ProductSneakPeek() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products?limit=12');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('ไม่สามารถโหลดสินค้าได้');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <Box component="section" sx={{ pb: { xs: 6, md: 14 }, pt: { xs: 10, md: 14 }, bgcolor: '#FFF9F8', borderTop: '1px solid #F5F5F5' }}>
            <Container maxWidth="xl">
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        mb: 8,
                        borderBottom: '1px solid #E5E5E5',
                        pb: 2
                    }}
                >
                    <Box>
                        <Typography variant="overline" sx={{ color: '#B76E79', fontWeight: 600, letterSpacing: '0.2em', mb: 1, display: 'block' }}>
                            RECOMMENDED
                        </Typography>
                        <Typography variant="h2" sx={{ fontSize: { xs: '1.7rem', sm: '2.2rem', md: '2.5rem' }, color: '#1A1A1A', letterSpacing: '0.05em' }}>
                            สินค้า<span style={{ fontStyle: 'italic', fontFamily: '"Playfair Display", serif', color: '#B76E79' }}>ยอดนิยม</span>
                        </Typography>
                    </Box>
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Link
                            href="/products"
                            style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#1A1A1A',
                                textTransform: 'uppercase',
                                letterSpacing: '0.2em',
                                textDecoration: 'none',
                                borderBottom: '1px solid #1A1A1A',
                                paddingBottom: '4px',
                                transition: 'all 0.3s'
                            }}
                        >
                            ดูสินค้าทั้งหมด
                        </Link>
                    </Box>
                </Box>

                {/* Loading State */}
                {loading && (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                            gap: { xs: 2, md: 4 }
                        }}
                    >
                        {[...Array(12)].map((_, idx) => (
                            <Box key={idx}>
                                <Skeleton variant="rectangular" sx={{ aspectRatio: '3/4', mb: 3, bgcolor: '#F2F2F2' }} />
                                <Skeleton variant="text" sx={{ width: '60%', mx: 'auto' }} />
                                <Skeleton variant="text" sx={{ width: '80%', mx: 'auto' }} />
                                <Skeleton variant="text" sx={{ width: '50%', mx: 'auto' }} />
                            </Box>
                        ))}
                    </Box>
                )}

                {/* Error State */}
                {error && !loading && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="body1" sx={{ color: '#888' }}>
                            {error}
                        </Typography>
                    </Box>
                )}

                {/* Products Grid */}
                {!loading && !error && products.length > 0 && (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                            gap: { xs: 2, md: 4 }
                        }}
                    >
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </Box>
                )}

                {/* Empty State */}
                {!loading && !error && products.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="body1" sx={{ color: '#888' }}>
                            ยังไม่มีสินค้า
                        </Typography>
                    </Box>
                )}

                <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mt: 6 }}>
                    <Button
                        variant="outlined"
                        component={Link}
                        href="/products"
                        sx={{
                            borderColor: '#1A1A1A',
                            color: '#1A1A1A',
                            borderRadius: '0px',
                            px: 5,
                            py: 1.5,
                        }}
                    >
                        ดูสินค้าทั้งหมด
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}

function ProductCard({ product }: { product: Product }) {
    const [imgSrc, setImgSrc] = useState(product.image || FALLBACK_IMAGE);
    const [imgError, setImgError] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<'fresh' | 'velvet'>('fresh');

    // Check if velvet variant exists
    const hasVelvet = product.priceVelvet && product.priceVelvet !== '';

    // Get current price based on selected variant
    const currentPrice = selectedVariant === 'velvet' && hasVelvet ? product.priceVelvet : product.price;
    const currentOriginalPrice = selectedVariant === 'velvet' && hasVelvet ? product.originalPriceVelvet : product.originalPrice;

    // Handle image error - use fallback
    const handleImageError = () => {
        if (!imgError) {
            setImgError(true);
            setImgSrc(FALLBACK_IMAGE);
        }
    };

    // Check if image URL is valid (absolute URL or starts with /)
    const getImageSrc = (src: string) => {
        if (!src) return FALLBACK_IMAGE;
        // If it's an absolute URL (http/https) or starts with /, use as is
        if (src.startsWith('http') || src.startsWith('/')) {
            return src;
        }
        // Otherwise, prepend /
        return `/${src}`;
    };

    // Handle variant toggle without navigating
    const handleVariantClick = (e: React.MouseEvent, variant: 'fresh' | 'velvet') => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedVariant(variant);
    };

    return (
        <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{ cursor: 'pointer', group: 'true' }}>
                <Box sx={{
                    position: 'relative',
                    aspectRatio: '3/4',
                    overflow: 'hidden',
                    mb: 3,
                    bgcolor: '#F2F2F2',
                    border: '1px solid rgba(0,0,0,0.03)',
                    transition: 'all 0.5s ease',
                    '&:hover': {
                        borderColor: '#B76E79',
                        boxShadow: '0 10px 40px rgba(183, 110, 121, 0.15)',
                        '& img': { transform: 'scale(1.05)' },
                        '& .view-overlay': { transform: 'translateY(0)' }
                    }
                }}>
                    <Image
                        src={getImageSrc(imgSrc)}
                        alt={product.title}
                        fill
                        style={{
                            objectFit: 'cover',
                            padding: '10%',
                            transition: 'transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
                        }}
                        onError={handleImageError}
                    />

                    {/* Discount Badge Overlay */}
                    {product.discount && parseInt(product.discount) > 0 && (
                        <Box sx={{
                            position: 'absolute',
                            top: 15,
                            right: 15,
                            bgcolor: '#B76E79',
                            color: '#FFFFFF',
                            px: 1.5,
                            py: 0.5,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            zIndex: 2
                        }}>
                            -{product.discount}%
                        </Box>
                    )}

                    {/* VIEW DETAILS Overlay */}
                    <Box
                        className="view-overlay"
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            bgcolor: 'rgba(255, 255, 255, 0.7)',
                            backdropFilter: 'blur(10px)',
                            py: 2,
                            textAlign: 'center',
                            transform: 'translateY(100%)',
                            transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        }}
                    >
                        <Typography variant="button" sx={{ fontSize: '0.75rem', color: '#1A1A1A', letterSpacing: '0.15em', fontWeight: 700 }}>
                            VIEW DETAILS
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5, display: 'block' }}>
                        {product.type}
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500, color: '#1A1A1A', mb: 1, letterSpacing: '0.05em' }}>
                        {product.title}
                    </Typography>

                    {/* Variant Selector */}
                    {hasVelvet && (
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 0.5,
                            mb: 1.5,
                            px: 1
                        }}>
                            <Box
                                onClick={(e) => handleVariantClick(e, 'fresh')}
                                sx={{
                                    flex: 1,
                                    py: 0.8,
                                    px: 1,
                                    cursor: 'pointer',
                                    border: '1px solid',
                                    borderColor: selectedVariant === 'fresh' ? '#B76E79' : '#E0E0E0',
                                    bgcolor: selectedVariant === 'fresh' ? 'rgba(183, 110, 121, 0.08)' : 'transparent',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        borderColor: '#B76E79'
                                    }
                                }}
                            >
                                <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: selectedVariant === 'fresh' ? '#B76E79' : '#666', letterSpacing: '0.05em' }}>
                                    🌸 ดอกไม้สด
                                </Typography>
                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: selectedVariant === 'fresh' ? '#B76E79' : '#1A1A1A', mt: 0.3 }}>
                                    ฿{product.price}
                                </Typography>
                            </Box>
                            <Box
                                onClick={(e) => handleVariantClick(e, 'velvet')}
                                sx={{
                                    flex: 1,
                                    py: 0.8,
                                    px: 1,
                                    cursor: 'pointer',
                                    border: '1px solid',
                                    borderColor: selectedVariant === 'velvet' ? '#B76E79' : '#E0E0E0',
                                    bgcolor: selectedVariant === 'velvet' ? 'rgba(183, 110, 121, 0.08)' : 'transparent',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        borderColor: '#B76E79'
                                    }
                                }}
                            >
                                <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: selectedVariant === 'velvet' ? '#B76E79' : '#666', letterSpacing: '0.05em' }}>
                                    💎 กำมะหยี่
                                </Typography>
                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: selectedVariant === 'velvet' ? '#B76E79' : '#1A1A1A', mt: 0.3 }}>
                                    ฿{product.priceVelvet}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {/* Price Display for products without velvet option */}
                    {!hasVelvet && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                            <Typography variant="subtitle1" sx={{ color: '#B76E79', fontWeight: 700, fontSize: '1.1rem' }}>
                                ฿{currentPrice}
                            </Typography>
                            {currentOriginalPrice && (
                                <Typography variant="body2" sx={{ color: '#BBB', textDecoration: 'line-through', fontSize: '0.85rem' }}>
                                    ฿{currentOriginalPrice}
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>
            </Box>
        </Link>
    );
}
