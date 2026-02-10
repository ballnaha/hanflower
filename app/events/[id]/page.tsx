'use client';

import React, { useState, useEffect, use } from 'react';
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
    Button
} from "@mui/material";
import {
    ArrowLeft,
    Location,
    Calendar,
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
    order: number;
}

interface Album {
    id: string;
    title: string;
    category: string;
    location: string;
    date: string;
    coverImage: string;
    photos: Photo[];
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const theme = useTheme();
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    const [album, setAlbum] = useState<Album | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<number | null>(null);

    useEffect(() => {
        const fetchAlbum = async () => {
            try {
                const res = await fetch(`/api/admin/events/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setAlbum(data);
                }
            } catch (error) {
                console.error('Error fetching album detail:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAlbum();
    }, [id]);

    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Minimum distance for a swipe to be recognized
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
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            handleNext(null as any);
        } else if (isRightSwipe) {
            handlePrev(null as any);
        }
    };

    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedImage !== null && album) {
            setSelectedImage((selectedImage - 1 + album.photos.length) % album.photos.length);
        }
    };

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedImage !== null && album) {
            setSelectedImage((selectedImage + 1) % album.photos.length);
        }
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress color="warning" />
            </Box>
        );
    }

    if (!album) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                <Typography variant="h5" sx={{ mb: 4 }}>ไม่พบข้อมูลอัลบั้ม</Typography>
                <Button component={Link} href="/events" variant="outlined" sx={{ color: '#B76E79', borderColor: '#B76E79' }}>กลับหน้าแกลเลอรี</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: '#FFF', minHeight: '100vh', pt: { xs: '100px', md: '140px' } }}>
            {/* Album Info Summary */}
            <Box sx={{ px: { xs: 2, md: 4 }, pb: 6, textAlign: 'center' }}>
                <Typography variant="overline" sx={{ color: '#B76E79', letterSpacing: '0.2em', fontWeight: 700, lineHeight: 1 }}>
                    {album.category}
                </Typography>
                <Typography variant="h2" sx={{
                    fontSize: { xs: '1.8rem', md: '2.8rem' },
                    fontWeight: 300,
                    fontStyle: 'italic',
                    color: '#1A1A1A',
                    my: 1.5,
                    fontFamily: 'var(--font-playfair)'
                }}>
                    {album.title}
                </Typography>
                <Stack direction="row" spacing={3} justifyContent="center" sx={{ color: '#999' }}>
                    {album.location && (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <Location size="14" variant="Bold" color="#B76E79" />
                            <Typography sx={{ fontSize: '0.85rem' }}>{album.location}</Typography>
                        </Stack>
                    )}
                    {album.date && (
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <Calendar size="14" variant="Bold" color="#B76E79" />
                            <Typography sx={{ fontSize: '0.85rem' }}>{album.date}</Typography>
                        </Stack>
                    )}
                </Stack>
            </Box>

            {/* Gallery Section - Refined Masonry */}
            <Container maxWidth="xl" sx={{ px: { xs: 1, md: 2 }, pb: 8 }}>
                <Box sx={{
                    columnCount: { xs: 2, sm: 3, md: 4, lg: 4 },
                    columnGap: '12px',
                }}>
                    {album.photos.map((photo, index) => (
                        <Box
                            key={photo.id}
                            onClick={() => setSelectedImage(index)}
                            sx={{
                                breakInside: 'avoid',
                                mb: '12px',
                                position: 'relative',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                borderRadius: '8px',
                                transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                bgcolor: '#F5F5F5',
                                '&:hover': {
                                    transform: 'scale(1.02)',
                                    zIndex: 1,
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                    '& .photo-overlay': { opacity: 1 }
                                }
                            }}
                        >
                            <img
                                src={getImageUrl(photo.url)}
                                alt={photo.caption || album.title}
                                style={{
                                    width: '100%',
                                    display: 'block',
                                    borderRadius: '8px',
                                }}
                            />
                            {/* Hover Overlay */}
                            <Box className="photo-overlay" sx={{
                                position: 'absolute',
                                inset: 0,
                                bgcolor: 'rgba(0,0,0,0.15)',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Maximize4 color="#FFF" size={28} />
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Container>

            {/* Social Share / Contact CTA */}
            <Box sx={{ py: 10, textAlign: 'center', bgcolor: '#F9F7F6' }}>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 300, fontStyle: 'italic' }}>Like this arrangement?</Typography>
                <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>ติดต่อสอบถามเพื่อเนรมิตวันสำคัญของคุณในสไตล์นี้</Typography>
                <Button
                    variant="contained"
                    component="a"
                    href="https://line.me/ti/p/~fonms2"
                    target="_blank"
                    sx={{
                        bgcolor: '#000',
                        color: '#FFF',
                        px: 6,
                        py: 2,
                        borderRadius: 0,
                        '&:hover': { bgcolor: '#D4AF37', color: "#FFF" }
                    }}
                >
                    CONTACT US
                </Button>
            </Box>

            {/* Lightbox Modal - Premium Cinematic Theme */}
            <Modal
                open={selectedImage !== null}
                onClose={() => setSelectedImage(null)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 400,
                    sx: {
                        bgcolor: 'rgba(0,0,0,0.96)',
                        backdropFilter: 'blur(15px)'
                    }
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
                            touchAction: 'none',
                            userSelect: 'none'
                        }}
                    >
                        {/* Top Toolbar */}
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            p: 3,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            zIndex: 20
                        }}>
                            {/* Counter */}
                            <Typography sx={{
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                letterSpacing: '0.2em'
                            }}>
                                {selectedImage !== null && album ? `${selectedImage + 1} / ${album.photos.length}` : ''}
                            </Typography>

                            {/* Close Button */}
                            <IconButton
                                onClick={() => setSelectedImage(null)}
                                sx={{
                                    color: '#FFF',
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)', transform: 'rotate(90deg)' },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <CloseCircle size={28} variant="Outline" color="#FFF" />
                            </IconButton>
                        </Box>

                        {/* Main Container */}
                        <Box sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                        }}>
                            {/* Navigation Buttons (Desktop Only) */}
                            <IconButton
                                onClick={handlePrev}
                                sx={{
                                    position: 'absolute',
                                    left: 20,
                                    color: '#FFF',
                                    zIndex: 10,
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    display: { xs: 'none', lg: 'flex' },
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
                                }}
                            >
                                <ArrowLeft2 size={32} variant='Outline' color='#FFF' />
                            </IconButton>

                            <IconButton
                                onClick={handleNext}
                                sx={{
                                    position: 'absolute',
                                    right: 20,
                                    color: '#FFF',
                                    zIndex: 10,
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    display: { xs: 'none', lg: 'flex' },
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
                                }}
                            >
                                <ArrowRight2 size={32} variant='Outline' color='#FFF' />
                            </IconButton>

                            {/* Image with Dynamic Loading */}
                            {selectedImage !== null && album && (
                                <Box sx={{
                                    maxWidth: '100vw',
                                    maxHeight: { xs: '70vh', md: '80vh' },
                                    px: { xs: 2, md: 10 },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}>
                                    <Box sx={{
                                        position: 'relative',
                                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                                        animation: 'slideInUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
                                    }}>
                                        <img
                                            key={selectedImage}
                                            src={getImageUrl(album.photos[selectedImage].url)}
                                            alt="Gallery"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '75vh',
                                                objectFit: 'contain',
                                                display: 'block',
                                                borderRadius: '2px'
                                            }}
                                        />
                                    </Box>

                                    {/* Caption Box */}
                                    <Box sx={{
                                        mt: 5,
                                        textAlign: 'center',
                                        maxWidth: '600px',
                                        animation: 'fadeIn 0.8s ease'
                                    }}>
                                        <Typography sx={{
                                            color: '#FFF',
                                            fontSize: { xs: '1rem', md: '1.25rem' },
                                            fontWeight: 300,
                                            fontStyle: 'italic',
                                            fontFamily: 'var(--font-playfair)',
                                            letterSpacing: '0.02em',
                                            mb: 1
                                        }}>
                                            {album.photos[selectedImage].caption || album.title}
                                        </Typography>
                                        <Typography sx={{
                                            color: 'rgba(255,255,255,0.4)',
                                            fontSize: '0.7rem',
                                            letterSpacing: '0.3em',
                                            textTransform: 'uppercase'
                                        }}>
                                            Swipe to navigate
                                        </Typography>
                                    </Box>

                                    {/* Preload Indicator / Hidden Prefetch */}
                                    {selectedImage + 1 < album.photos.length && (
                                        <img src={getImageUrl(album.photos[selectedImage + 1].url)} style={{ display: 'none' }} alt="preload" />
                                    )}
                                </Box>
                            )}
                        </Box>

                        <style jsx global>{`
                            @keyframes slideInUp {
                                from { opacity: 0; transform: translateY(20px) scale(0.98); }
                                to { opacity: 1; transform: translateY(0) scale(1); }
                            }
                            @keyframes fadeIn {
                                from { opacity: 0; }
                                to { opacity: 1; }
                            }
                        `}</style>
                    </Box>
                </Fade>
            </Modal>
        </Box>
    );
}
