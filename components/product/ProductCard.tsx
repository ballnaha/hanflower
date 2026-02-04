'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Typography, Box } from "@mui/material";
import { getImageUrl } from '@/lib/utils';

// Fallback image for production when product image is missing or fails to load
const FALLBACK_IMAGE = "/images/placeholder-product.png";

export interface ProductCardData {
    id: string;
    slug: string;
    title: string;
    image: string;
    images?: string[]; // Additional images for slideshow
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

interface ProductCardProps {
    product: ProductCardData;
    showQrCard?: boolean; // Option to show/hide QR card on hover
}

export default function ProductCard({ product, showQrCard = true }: ProductCardProps) {
    // Combine main image with additional images for slideshow
    const allImages = [product.image, ...(product.images || [])].filter((img, index, self) =>
        img && self.indexOf(img) === index // Remove duplicates and empty
    );
    const hasMultipleImages = allImages.length > 1;

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imgError, setImgError] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<'fresh' | 'velvet'>('fresh');

    // Touch/Swipe state
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);
    const minSwipeDistance = 50; // minimum distance for swipe detection

    // Auto-slide effect for multiple images
    useEffect(() => {
        if (!hasMultipleImages) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
        }, 5000); // Slide every 5 seconds

        return () => clearInterval(interval);
    }, [hasMultipleImages, allImages.length]);

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
        }
    };

    // Handle variant toggle without navigating
    const handleVariantClick = (e: React.MouseEvent, variant: 'fresh' | 'velvet') => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedVariant(variant);
    };

    // Touch handlers for swipe
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (!hasMultipleImages) return;
        touchStartX.current = e.touches[0].clientX;
        touchEndX.current = null;
    }, [hasMultipleImages]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!hasMultipleImages) return;
        touchEndX.current = e.touches[0].clientX;
    }, [hasMultipleImages]);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (!hasMultipleImages || touchStartX.current === null || touchEndX.current === null) return;

        const distance = touchStartX.current - touchEndX.current;
        const isSwipe = Math.abs(distance) > minSwipeDistance;

        if (isSwipe) {
            e.preventDefault();
            e.stopPropagation();

            if (distance > 0) {
                // Swipe left - next image
                setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
            } else {
                // Swipe right - previous image
                setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
            }
        }

        // Reset
        touchStartX.current = null;
        touchEndX.current = null;
    }, [hasMultipleImages, allImages.length]);

    return (
        <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                    {/* Main product image container with swipe support */}
                    <Box
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        sx={{
                            position: 'relative',
                            aspectRatio: '3/4',
                            overflow: 'hidden',
                            bgcolor: '#F2F2F2',
                            border: '1px solid rgba(0,0,0,0.03)',
                            transition: 'all 0.5s ease',
                            touchAction: hasMultipleImages ? 'pan-y' : 'auto', // Allow vertical scroll but capture horizontal
                            '&:hover': {
                                borderColor: '#B76E79',
                                boxShadow: '0 10px 40px rgba(183, 110, 121, 0.15)',
                            }
                        }}>
                        {/* Image slideshow with fade transition */}
                        {allImages.map((img, index) => (
                            <Image
                                key={img}
                                src={imgError ? FALLBACK_IMAGE : getImageUrl(img)}
                                alt={`${product.title} - ${index + 1}`}
                                fill
                                style={{
                                    objectFit: 'cover',
                                    padding: '1%',
                                    opacity: index === currentImageIndex ? 1 : 0,
                                    transition: 'opacity 0.8s ease-in-out',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                }}
                                onError={handleImageError}
                            />
                        ))}

                        {/* Image indicators (dots) */}
                        {hasMultipleImages && (
                            <Box sx={{
                                position: 'absolute',
                                bottom: { xs: 35, md: 45 },
                                left: '50%',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                gap: 0.5,
                                zIndex: 4,
                            }}>
                                {allImages.map((_, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            width: { xs: 4, md: 6 },
                                            height: { xs: 4, md: 6 },
                                            borderRadius: '50%',
                                            bgcolor: index === currentImageIndex ? '#B76E79' : 'rgba(255,255,255,0.6)',
                                            border: '1px solid rgba(0,0,0,0.1)',
                                            transition: 'all 0.3s ease',
                                        }}
                                    />
                                ))}
                            </Box>
                        )}

                        {/* Badges Overlay */}
                        <Box sx={{
                            position: 'absolute',
                            top: { xs: 8, md: 15 },
                            left: { xs: 8, md: 15 },
                            display: 'flex',
                            flexDirection: 'column',
                            gap: { xs: 0.5, md: 1 },
                            zIndex: 3
                        }}>
                            {product.isNew && (
                                <Box sx={{
                                    bgcolor: '#B76E79',
                                    color: '#FFFFFF',
                                    px: { xs: 0.8, md: 1.5 },
                                    py: { xs: 0.25, md: 0.5 },
                                    fontSize: { xs: '0.45rem', md: '0.6rem' },
                                    fontWeight: 800,
                                    letterSpacing: { xs: '0.1em', md: '0.15em' },
                                    textTransform: 'uppercase',
                                    borderRadius: '2px',
                                    boxShadow: '0 2px 8px rgba(183, 110, 121, 0.3)',
                                    animation: 'pulse 2s infinite'
                                }}>
                                    New
                                </Box>
                            )}
                            {product.isBestSeller && (
                                <Box sx={{
                                    bgcolor: '#D4AF37',
                                    color: '#FFFFFF',
                                    px: { xs: 0.8, md: 1.5 },
                                    py: { xs: 0.25, md: 0.5 },
                                    fontSize: { xs: '0.45rem', md: '0.6rem' },
                                    fontWeight: 800,
                                    letterSpacing: { xs: '0.1em', md: '0.15em' },
                                    textTransform: 'uppercase',
                                    borderRadius: '2px',
                                    boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)'
                                }}>
                                    Best Seller
                                </Box>
                            )}
                        </Box>

                        {/* Discount Badge Overlay */}
                        {currentDiscount && parseInt(currentDiscount) > 0 && (
                            <Box sx={{
                                position: 'absolute',
                                top: { xs: 8, md: 15 },
                                right: { xs: 8, md: 15 },
                                bgcolor: '#B76E79',
                                color: '#FFFFFF',
                                px: { xs: 1, md: 1.5 },
                                py: { xs: 0.3, md: 0.5 },
                                fontSize: { xs: '0.5rem', md: '0.65rem' },
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
                                    px: { xs: 2, md: 3 },
                                    py: { xs: 0.5, md: 1 },
                                    fontSize: { xs: '0.7rem', md: '0.85rem' },
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
                                    bottom: { xs: 8, md: 15 },
                                    left: 0,
                                    right: 0,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    zIndex: 2
                                }}
                            >
                                <Box sx={{
                                    display: 'inline-flex',
                                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(8px)',
                                    borderRadius: { xs: '16px', md: '30px' },
                                    p: { xs: 0.3, md: 0.5 },
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
                                }}>
                                    <Box
                                        onClick={(e) => handleVariantClick(e, 'fresh')}
                                        sx={{
                                            px: { xs: 1, md: 2 },
                                            py: { xs: 0.3, md: 0.6 },
                                            borderRadius: { xs: '12px', md: '20px' },
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
                                        <Typography sx={{
                                            fontSize: { xs: '0.6rem', md: '0.85rem' },
                                            fontWeight: selectedVariant === 'fresh' ? 700 : 500,
                                            whiteSpace: 'nowrap'
                                        }}>
                                            🌸 สด
                                        </Typography>
                                    </Box>
                                    <Box
                                        onClick={(e) => handleVariantClick(e, 'velvet')}
                                        sx={{
                                            px: { xs: 1, md: 2 },
                                            py: { xs: 0.3, md: 0.6 },
                                            borderRadius: { xs: '12px', md: '20px' },
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
                                        <Typography sx={{
                                            fontSize: { xs: '0.6rem', md: '0.85rem' },
                                            fontWeight: selectedVariant === 'velvet' ? 700 : 500,
                                            whiteSpace: 'nowrap'
                                        }}>
                                            🌹 กำมะหยี่
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {/* QR Code Card - Hidden on right side, slides out on hover */}
                    {showQrCard && product.hasQrCode !== false && (
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
                    <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', md: '1.1rem' }, fontWeight: 500, color: '#1A1A1A', mb: 1, letterSpacing: '0.05em' }}>
                        {product.title}
                    </Typography>

                    <Box sx={{ mt: 'auto' }}>
                        {/* Hide price when out of stock */}
                        {product.stock !== undefined && product.stock <= 0 ? (
                            <Typography variant="subtitle1" sx={{ color: '#D32F2F', fontWeight: 600, fontSize: { xs: '0.85rem', md: '0.95rem' } }}>
                                สินค้าหมด
                            </Typography>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: { xs: 1, md: 1.5 } }}>
                                <Typography variant="subtitle1" sx={{ color: '#B76E79', fontWeight: 700, fontSize: { xs: '1rem', md: '1.2rem' } }}>
                                    ฿{currentPrice}
                                </Typography>
                                {currentOriginalPrice && (
                                    <Typography variant="body2" sx={{ color: '#BBB', textDecoration: 'line-through', fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
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
