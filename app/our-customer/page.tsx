'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Container,
    Typography,
    Box,
    IconButton,
    CircularProgress,
    alpha,
    useTheme,
    Stack,
    Modal,
    Fade,
    Backdrop,
    Button,
    Breadcrumbs,
    Skeleton
} from "@mui/material";
import {
    Location,
    Maximize4,
    CloseCircle,
    ArrowLeft2,
    ArrowRight2
} from "iconsax-react";
import { getImageUrl } from '@/lib/utils';

interface Photo {
    id: string;
    url: string;
    caption: string;
}

export default function OurCustomerPage() {
    const theme = useTheme();
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<number | null>(null);
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

    const handleImageLoad = (id: string) => {
        setLoadedImages(prev => {
            const newSet = new Set(prev);
            newSet.add(id);
            return newSet;
        });
    };

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const res = await fetch('/api/our-customer');
                if (res.ok) {
                    const data = await res.json();
                    setPhotos(data);
                }
            } catch (error) {
                console.error('Error fetching our customer photos:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPhotos();
    }, []);

    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > minSwipeDistance) handleNext();
        else if (distance < -minSwipeDistance) handlePrev();
    };

    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedImage !== null && photos.length > 0) {
            setSelectedImage((selectedImage - 1 + photos.length) % photos.length);
        }
    };

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedImage !== null && photos.length > 0) {
            setSelectedImage((selectedImage + 1) % photos.length);
        }
    };

    return (
        <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
            {/* Refined Minimalist Hero Section */}
            <Box component="section" sx={{
                position: 'relative',
                pt: { xs: '120px', md: '160px' },
                pb: { xs: 6, md: 10 },
                background: 'linear-gradient(to bottom, #FFF9F8 0%, #FFFFFF 100%)',
                textAlign: 'center',
                overflow: 'hidden'
            }}>
                <Container maxWidth="md">
                    <Box sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1.5,
                        mb: 3,
                        px: 2,
                        py: 0.5,
                        borderRadius: '100px',
                        bgcolor: alpha('#D4AF37', 0.1),
                    }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#D4AF37' }} />
                        <Typography variant="overline" sx={{ color: '#D4AF37', letterSpacing: '0.2em', fontWeight: 700 }}>
                            Portfolio & Testimonials
                        </Typography>
                    </Box>

                    <Typography variant="h1" sx={{
                        fontSize: { xs: '2.5rem', md: '4rem' },
                        color: '#1A1A1A',
                        fontFamily: 'var(--font-playfair)',
                        fontWeight: 400,
                        lineHeight: 1.2,
                        mb: 3
                    }}>
                        Heartfelt <span style={{ fontStyle: 'italic', fontWeight: 500, color: '#D4AF37' }}>Smiles</span>
                    </Typography>

                    <Box sx={{ width: '40px', height: '1px', bgcolor: '#D4AF37', mx: 'auto', mb: 3 }} />

                    <Typography variant="body1" sx={{
                        color: '#666',
                        fontSize: { xs: '1rem', md: '1.15rem' },
                        maxWidth: '600px',
                        mx: 'auto',
                        lineHeight: 1.8,
                        fontWeight: 300,
                        letterSpacing: '0.01em'
                    }}>
                        "เพราะทุกรอยยิ้มของลูกค้า คือแรงบันดาลใจในการสร้างสรรค์งานศิลปะจากดอกไม้ของเรา"
                    </Typography>
                </Container>
            </Box>

            {/* Main Content Sections */}
            <Container maxWidth="xl" sx={{ py: { xs: 8, md: 12 } }}>
                {/* Breadcrumbs & Header */}
                <Box sx={{ mb: { xs: 6, md: 8 } }}>
                    <Breadcrumbs sx={{ mb: 2 }}>
                        <Link href="/" style={{ textDecoration: 'none', color: theme.palette.text.secondary }}>Home</Link>
                        <Typography color="text.primary" sx={{ fontWeight: 500 }}>Our Customers</Typography>
                    </Breadcrumbs>
                    <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
                        Our Dear <span style={{ fontStyle: 'italic', color: theme.palette.warning.main }}>Customers</span>
                    </Typography>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress color="warning" />
                    </Box>
                ) : photos.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 10, borderRadius: '16px' }}>
                        <Typography variant="h6" color="text.secondary">เร็วๆ นี้... ขอบคุณที่ติดตามเรา</Typography>
                    </Box>
                ) : (
                    <Box sx={{
                        columnCount: { xs: 2, sm: 3, md: 4, lg: 4 },
                        columnGap: '16px',
                    }}>
                        {photos.map((photo, index) => (
                            <Box
                                key={photo.id}
                                onClick={() => setSelectedImage(index)}
                                sx={{
                                    breakInside: 'avoid',
                                    mb: '16px',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    borderRadius: '12px',
                                    transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                                        '& .photo-overlay': { opacity: 1 }
                                    }
                                }}
                            >
                                {!loadedImages.has(photo.id) && (
                                    <Skeleton
                                        variant="rectangular"
                                        width="100%"
                                        height={200}
                                        sx={{ borderRadius: '12px' }}
                                    />
                                )}
                                <img
                                    src={getImageUrl(photo.url)}
                                    alt={photo.caption}
                                    onLoad={() => handleImageLoad(photo.id)}
                                    style={{
                                        width: '100%',
                                        display: loadedImages.has(photo.id) ? 'block' : 'none',
                                        borderRadius: '12px',
                                    }}
                                />
                                <Box className="photo-overlay" sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    bgcolor: 'rgba(0,0,0,0.2)',
                                    opacity: 0,
                                    transition: 'opacity 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Maximize4 color="#FFF" size={32} />
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            </Container>

            {/* Lightbox Modal */}
            <Modal
                open={selectedImage !== null}
                onClose={() => setSelectedImage(null)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 400,
                    sx: { bgcolor: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)' }
                }}
            >
                <Fade in={selectedImage !== null}>
                    <Box
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            outline: 'none',
                            p: { xs: 0, md: 4 },
                            touchAction: 'none'
                        }}
                    >
                        {/* Toolbar */}
                        <Box sx={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, p: 3,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            zIndex: 20
                        }}>
                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', letterSpacing: '0.2em' }}>
                                {selectedImage !== null ? `${selectedImage + 1} / ${photos.length}` : ''}
                            </Typography>
                            <IconButton onClick={() => setSelectedImage(null)} sx={{ color: '#FFF' }}>
                                <CloseCircle size={32} variant="Outline" color="#FFF" />
                            </IconButton>
                        </Box>

                        {/* Image & Nav */}
                        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            <IconButton onClick={handlePrev} sx={{ position: 'absolute', left: 20, color: '#FFF', display: { xs: 'none', lg: 'flex' } }}>
                                <ArrowLeft2 size={40} variant="Outline" color="#FFF" />
                            </IconButton>
                            <IconButton onClick={handleNext} sx={{ position: 'absolute', right: 20, color: '#FFF', display: { xs: 'none', lg: 'flex' } }}>
                                <ArrowRight2 size={40} variant="Outline" color="#FFF" />
                            </IconButton>

                            {selectedImage !== null && (
                                <Box sx={{ maxWidth: '100vw', maxHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', px: 2 }}>
                                    <img
                                        key={selectedImage}
                                        src={getImageUrl(photos[selectedImage].url)}
                                        alt="Customer"
                                        style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                                    />
                                    {photos[selectedImage].caption && (
                                        <Typography sx={{ color: '#FFF', mt: 4, fontStyle: 'italic', fontFamily: 'var(--font-playfair)', fontSize: '1.2rem', textAlign: 'center' }}>
                                            {photos[selectedImage].caption}
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Fade>
            </Modal>
        </Box>
    );
}
