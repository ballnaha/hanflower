'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Container, Typography, Button, Box, Skeleton } from "@mui/material";
import { getImageUrl } from '@/lib/utils';

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
    discountVelvet?: string;
    stock?: number;
    hasQrCode?: boolean;
    isNew?: boolean;
    isBestSeller?: boolean;
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
                        <Typography variant="h2" sx={{ fontSize: { xs: '1.7rem', sm: '2.2rem', md: '2.5rem' }, color: '#1A1A1A', letterSpacing: '0.05em', fontWeight: 600 }}>
                            <span style={{ fontStyle: 'normal' }}>สินค้า</span><span style={{ fontStyle: 'italic', color: '#B76E79' }}>ยอดนิยม</span>
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
    const [imgSrc, setImgSrc] = useState(getImageUrl(product.image));
    const [imgError, setImgError] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<'fresh' | 'velvet'>('fresh');

    // Check if velvet variant exists
    const hasVelvet = product.priceVelvet && product.priceVelvet !== '';

    // Get current price, original price, and discount based on selected variant
    const currentPrice = selectedVariant === 'velvet' && hasVelvet ? product.priceVelvet : product.price;
    const currentOriginalPrice = selectedVariant === 'velvet' && hasVelvet ? product.originalPriceVelvet : product.originalPrice;
    const currentDiscount = selectedVariant === 'velvet' && hasVelvet ? product.discountVelvet : product.discount;

    // Handle image error - use fallback
    const handleImageError = () => {
        if (!imgError) {
            setImgError(true);
            setImgSrc(FALLBACK_IMAGE);
        }
    };

    // Check if image URL is valid (absolute URL or starts with /)
    const getImageSrc = (src: string) => {
        return getImageUrl(src);
    };

    // Handle variant toggle without navigating
    const handleVariantClick = (e: React.MouseEvent, variant: 'fresh' | 'velvet') => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedVariant(variant);
    };

    return (
        <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{ cursor: 'pointer', group: 'true', height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Outer wrapper for QR card visibility */}
                <Box sx={{
                    position: 'relative',
                    mb: 3,
                    overflow: 'hidden',
                    '&:hover .qr-card-slide': {
                        right: '5%',
                        opacity: 1,
                    },
                    '&:hover .qr-hint': {
                        opacity: 1,
                    }
                }}>
                    {/* Main product image container */}
                    <Box sx={{
                        position: 'relative',
                        aspectRatio: '3/4',
                        overflow: 'hidden',
                        bgcolor: '#F2F2F2',
                        border: '1px solid rgba(0,0,0,0.03)',
                        transition: 'all 0.5s ease',
                        '&:hover': {
                            borderColor: '#B76E79',
                            boxShadow: '0 10px 40px rgba(183, 110, 121, 0.15)',
                            '& img': { transform: 'scale(1.05)' },
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

                        {/* Badges Overlay */}
                        <Box sx={{
                            position: 'absolute',
                            top: 15,
                            left: 15,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            zIndex: 3
                        }}>
                            {product.isNew && (
                                <Box sx={{
                                    bgcolor: '#B76E79',
                                    color: '#FFFFFF',
                                    px: 1.5,
                                    py: 0.5,
                                    fontSize: '0.6rem',
                                    fontWeight: 800,
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    borderRadius: '2px',
                                    boxShadow: '0 4px 12px rgba(183, 110, 121, 0.3)',
                                    animation: 'pulse 2s infinite'
                                }}>
                                    New
                                </Box>
                            )}
                            {product.isBestSeller && (
                                <Box sx={{
                                    bgcolor: '#D4AF37',
                                    color: '#FFFFFF',
                                    px: 1.5,
                                    py: 0.5,
                                    fontSize: '0.6rem',
                                    fontWeight: 800,
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    borderRadius: '2px',
                                    boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                                }}>
                                    Best Seller
                                </Box>
                            )}
                        </Box>

                        {/* Discount Badge Overlay */}
                        {currentDiscount && parseInt(currentDiscount) > 0 && (
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
                                -{currentDiscount}%
                            </Box>
                        )}

                        {/* Out of Stock Overlay */}
                        {product.stock !== undefined && product.stock <= 0 && (
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                bgcolor: 'rgba(0,0,0,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 3
                            }}>
                                <Box sx={{
                                    bgcolor: '#333',
                                    color: '#FFF',
                                    px: 3,
                                    py: 1,
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.1em'
                                }}>
                                    สินค้าหมด
                                </Box>
                            </Box>
                        )}

                        {/* Variant Selector Overlay - Always Visible */}
                        {hasVelvet && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 15,
                                    left: 0,
                                    right: 0,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    zIndex: 2
                                }}
                            >
                                <Box sx={{
                                    display: 'inline-flex',
                                    bgcolor: 'rgba(255, 255, 255, 0.85)',
                                    backdropFilter: 'blur(8px)',
                                    borderRadius: '30px',
                                    p: 0.5,
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                                }}>
                                    <Box
                                        onClick={(e) => handleVariantClick(e, 'fresh')}
                                        sx={{
                                            px: 2,
                                            py: 0.6,
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            bgcolor: selectedVariant === 'fresh' ? '#FFFFFF' : 'transparent',
                                            boxShadow: selectedVariant === 'fresh' ? '0 2px 8px rgba(183, 110, 121, 0.2)' : 'none',
                                            color: selectedVariant === 'fresh' ? '#B76E79' : '#666',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5
                                        }}
                                    >
                                        <Typography sx={{ fontSize: '0.85rem', fontWeight: selectedVariant === 'fresh' ? 700 : 500 }}>
                                            ดอกไม้สด
                                        </Typography>
                                    </Box>
                                    <Box
                                        onClick={(e) => handleVariantClick(e, 'velvet')}
                                        sx={{
                                            px: 2,
                                            py: 0.6,
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            bgcolor: selectedVariant === 'velvet' ? '#FFFFFF' : 'transparent',
                                            boxShadow: selectedVariant === 'velvet' ? '0 2px 8px rgba(183, 110, 121, 0.2)' : 'none',
                                            color: selectedVariant === 'velvet' ? '#B76E79' : '#666',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5
                                        }}
                                    >
                                        <Typography sx={{ fontSize: '0.85rem', fontWeight: selectedVariant === 'velvet' ? 700 : 500 }}>
                                            กำมะหยี่
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {/* QR Code Card - Hidden on right side, slides out on hover */}
                    {product.hasQrCode !== false && (
                        <Box
                            className="qr-card-slide"
                            sx={{
                                display: { xs: 'none', md: 'block' },
                                position: 'absolute',
                                top: '30%',
                                right: '-18%',
                                transform: 'translateY(-50%)',
                                width: '25%',
                                aspectRatio: '1/1.3',
                                zIndex: 10,
                                filter: 'drop-shadow(-3px 5px 10px rgba(0,0,0,0.15))',
                                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                opacity: 0.7,
                                pointerEvents: 'none',
                            }}>
                            <Image
                                src="/images/qr_code_mockup.webp"
                                alt="QR Code Feeling Card"
                                fill
                                style={{ objectFit: 'contain' }}
                            />
                            {/* Small hint text */}
                            <Box
                                className="qr-hint"
                                sx={{
                                    position: 'absolute',
                                    bottom: -18,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    bgcolor: '#B76E79',
                                    color: '#FFF',
                                    px: 1,
                                    py: 0.3,
                                    borderRadius: '10px',
                                    fontSize: '0.7rem',
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    opacity: 0,
                                    transition: 'opacity 0.3s ease 0.2s',
                                }}
                            >
                                ฟรี!
                            </Box>
                        </Box>
                    )}
                </Box>

                <Box sx={{ textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="caption" sx={{ color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5, display: 'block' }}>
                        {product.type}
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500, color: '#1A1A1A', mb: 1, letterSpacing: '0.05em' }}>
                        {product.title}
                    </Typography>

                    <Box sx={{ mt: 'auto' }}>
                        {/* Hide price when out of stock */}
                        {product.stock !== undefined && product.stock <= 0 ? (
                            <Typography variant="subtitle1" sx={{ color: '#D32F2F', fontWeight: 600, fontSize: '0.95rem' }}>
                                สินค้าหมด
                            </Typography>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                                <Typography variant="subtitle1" sx={{ color: '#B76E79', fontWeight: 700, fontSize: '1.2rem' }}>
                                    ฿{currentPrice}
                                </Typography>
                                {currentOriginalPrice && (
                                    <Typography variant="body2" sx={{ color: '#BBB', textDecoration: 'line-through', fontSize: '0.9rem' }}>
                                        ฿{currentOriginalPrice}
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </Link>
    );
}
