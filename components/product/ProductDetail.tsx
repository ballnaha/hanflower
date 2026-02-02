
'use client';

import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    IconButton,
    Breadcrumbs,
    Divider,
    Skeleton,
    Tabs,
    Tab,
    Stack,
    Chip,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Heart,
    Minus,
    Add,
    Share,
    Truck,
    ShieldTick,
    RotateRight,
    ArrowRight2,
    Star1,
    Box as BoxIcon,
    DirectRight
} from 'iconsax-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/products';
import ProductSidebar from './ProductSidebar';

interface ProductDetailProps {
    productId: string;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [activeTab, setActiveTab] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch current product
                const prodRes = await fetch(`/api/products/${productId}`);
                if (!prodRes.ok) {
                    const errorMsg = await prodRes.json().catch(() => ({}));
                    throw new Error(errorMsg.error || 'Product not found');
                }
                const prodData = await prodRes.json();
                setProduct(prodData);

                // Fetch all products for related section
                const allRes = await fetch('/api/products');
                if (allRes.ok) {
                    const allData = await allRes.json();
                    setRelatedProducts(allData.filter((p: Product) => p.id !== productId).slice(0, 4));
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [productId]);

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 8 }}>
                    <Skeleton variant="rectangular" height={600} sx={{ borderRadius: 0 }} />
                    <Box>
                        <Skeleton variant="text" width="30%" height={30} sx={{ mb: 2 }} />
                        <Skeleton variant="text" width="80%" height={60} sx={{ mb: 2 }} />
                        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 4 }} />
                        <Skeleton variant="rectangular" height={150} sx={{ mb: 4 }} />
                        <Skeleton variant="rectangular" height={50} width="100%" sx={{ mb: 2 }} />
                        <Skeleton variant="rectangular" height={50} width="100%" />
                    </Box>
                </Box>
            </Container>
        );
    }

    if (!product) {
        return (
            <Container sx={{ py: 20, textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: '#5D4037', mb: 4 }}>ไม่พบสินค้าที่คุณต้องการ</Typography>
                <Link href="/" passHref style={{ textDecoration: 'none' }}>
                    <Button variant="outlined">กลับสู่หน้าหลัก</Button>
                </Link>
            </Container>
        );
    }

    const increaseQty = () => setQuantity(prev => prev + 1);
    const decreaseQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    // Combine cover image and additional images for display
    const allImages = [
        product.image,
        ...(product.images || [])
    ].filter(url => url && url.trim() !== '');

    return (
        <Box sx={{
            position: 'relative',
            bgcolor: 'transparent',
            pb: 0,
            pt: { xs: '80px', md: '100px' },
            minHeight: '100vh',
            animation: 'fadeIn 0.8s ease-out',
            '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(10px)' },
                to: { opacity: 1, transform: 'translateY(0)' }
            }
        }}>
            <Box sx={{
                width: '100%',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'flex-start',
                position: 'relative',
                zIndex: 1
            }}>

                {/* Left Side: Dior-Style Full Edge Gallery */}
                <Box sx={{
                    width: { xs: '100%', md: '50%' },
                    bgcolor: 'rgba(242, 242, 242, 0.7)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)'
                }}>
                    {/* Desktop View: Vertical Stack */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column' }}>
                        {allImages.map((img, idx) => (
                            <Box
                                key={idx}
                                sx={{
                                    position: 'relative',
                                    width: '100%',
                                    aspectRatio: '1/1',
                                    overflow: 'hidden'
                                }}
                            >
                                <Image
                                    src={img}
                                    alt={`${product.title} - ${idx + 1}`}
                                    fill
                                    style={{ objectFit: 'contain', padding: '10%' }}
                                    priority={idx === 0}
                                />
                                {idx === 0 && (
                                    <>
                                        <Typography sx={{
                                            position: 'absolute',
                                            bottom: 30,
                                            left: 30,
                                            fontSize: '0.75rem',
                                            color: '#666',
                                            fontWeight: 500,
                                            zIndex: 2
                                        }}>
                                            New
                                        </Typography>
                                        {/* QR Code Card Overlay */}
                                        {product.hasQrCode !== false && (
                                            <Box sx={{
                                                position: 'absolute',
                                                bottom: 40,
                                                right: 40,
                                                width: '22%',
                                                aspectRatio: '1/1.3',
                                                zIndex: 5,
                                                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))',
                                                animation: 'float 3s ease-in-out infinite',
                                                '@keyframes float': {
                                                    '0%, 100%': { transform: 'translateY(0) rotate(5deg)' },
                                                    '50%': { transform: 'translateY(-10px) rotate(8deg)' }
                                                }
                                            }}>
                                                <Image
                                                    src="/images/qr_code.png"
                                                    alt="QR Code Feeling Card"
                                                    fill
                                                    style={{ objectFit: 'contain' }}
                                                />
                                            </Box>
                                        )}
                                    </>
                                )}
                            </Box>
                        ))}
                    </Box>

                    {/* Mobile View: Swiper Carousel */}
                    <Box sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .swiper-pagination-bullet': {
                            width: '8px',
                            height: '8px',
                            bgcolor: '#E0E0E0',
                            opacity: 1,
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        },
                        '& .swiper-pagination-bullet-active': {
                            width: '24px',
                            borderRadius: '12px',
                            bgcolor: '#B76E79',
                            opacity: 1,
                            boxShadow: '0 2px 8px rgba(183, 110, 121, 0.4)'
                        }
                    }}>
                        <Swiper
                            modules={[Pagination]}
                            pagination={{ clickable: true, dynamicBullets: true }}
                            spaceBetween={0}
                            slidesPerView={1}
                            style={{ width: '100%', height: '100%' }}
                        >
                            {allImages.map((img, idx) => (
                                <SwiperSlide key={idx}>
                                    <Box sx={{
                                        position: 'relative',
                                        width: '100%',
                                        aspectRatio: '1/1',
                                        bgcolor: '#F2F2F2'
                                    }}>
                                        <Image
                                            src={img}
                                            alt={`${product.title} - ${idx + 1}`}
                                            fill
                                            style={{ objectFit: 'contain', padding: '12%' }}
                                            priority={idx === 0}
                                        />
                                        {idx === 0 && (
                                            <>
                                                <Typography sx={{
                                                    position: 'absolute',
                                                    bottom: 20,
                                                    left: 20,
                                                    fontSize: '0.75rem',
                                                    color: '#666',
                                                    fontWeight: 500,
                                                    zIndex: 2
                                                }}>
                                                    New
                                                </Typography>
                                                {/* QR Code Card Overlay for Mobile */}
                                                {product.hasQrCode !== false && (
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        bottom: 30,
                                                        right: 30,
                                                        width: '28%',
                                                        aspectRatio: '1/1.3',
                                                        zIndex: 5,
                                                        filter: 'drop-shadow(0 8px 15px rgba(0,0,0,0.12))'
                                                    }}>
                                                        <Image
                                                            src="/images/qr_code.png"
                                                            alt="QR Code Feeling Card"
                                                            fill
                                                            style={{ objectFit: 'contain' }}
                                                        />
                                                    </Box>
                                                )}
                                            </>
                                        )}
                                    </Box>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </Box>
                </Box>

                {/* Right Side: Dior Sticky Details Content */}
                <ProductSidebar
                    product={product}
                    quantity={quantity}
                    increaseQty={increaseQty}
                    decreaseQty={decreaseQty}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
            </Box>
        </Box>
    );
}

// Custom Grid wrapper to avoid lint with Grid vs Grid2 etc in newer MUI
function Grid({ children, container, item, spacing, xs, sm, md, sx }: any) {
    if (container) {
        return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', m: spacing ? -(spacing * 4) / 2 : 0, ...sx }}>
                {children}
            </Box>
        );
    }
    return (
        <Box sx={{
            flexBasis: xs ? `${(xs / 12) * 100}%` : 'auto',
            p: spacing ? (spacing * 4) / 2 : 0,
            maxWidth: xs ? `${(xs / 12) * 100}%` : 'none',
            flexGrow: 1,
            ...sx
        }}>
            {children}
        </Box>
    );
}
