'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Container,
    Typography,
    Box,
    Button,
    Breadcrumbs,
    useTheme,
    alpha,
    Chip,
    Stack,
    CircularProgress,
    Skeleton
} from "@mui/material";
import { ArrowRight, Gallery, Location, Calendar } from "iconsax-react";

import { getImageUrl } from '@/lib/utils';

export default function EventsPage() {
    const theme = useTheme();
    const [filter, setFilter] = useState('All');
    const [albums, setAlbums] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

    const handleImageLoad = (id: string) => {
        setLoadedImages(prev => {
            const newSet = new Set(prev);
            newSet.add(id);
            return newSet;
        });
    };

    const [filters, setFilters] = useState<string[]>(['All']);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/admin/events/categories?excludeCategory=Customer');
                const data = await response.json();
                if (Array.isArray(data)) {
                    setFilters(['All', ...data]);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchAlbums = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/events${filter !== 'All' ? `?category=${filter}` : ''}`);
                const data = await response.json();
                setAlbums(data || []);
            } catch (error) {
                console.error('Error fetching albums:', error);
                setAlbums([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAlbums();
    }, [filter]);

    return (
        <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
            {/* Refined Minimalist Hero Section - Matches Our Customer style */}
            <Box component="section" sx={{
                position: 'relative',
                pt: { xs: '120px', md: '160px' },
                pb: { xs: 6, md: 8 },
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
                            Event Portfolio & Collections
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
                        Capture Your <span style={{ fontStyle: 'italic', fontWeight: 500, color: '#D4AF37' }}>Memories</span>
                    </Typography>

                    <Box sx={{ width: '40px', height: '1px', bgcolor: '#D4AF37', mx: 'auto', mb: 3 }} />

                    <Typography variant="body1" sx={{
                        color: '#666',
                        fontSize: { xs: '1rem', md: '1.15rem' },
                        maxWidth: '600px',
                        mx: 'auto',
                        lineHeight: 1.8,
                        fontWeight: 300,
                        letterSpacing: '0.01em',
                        mb: 4
                    }}>
                        "เพราะวันสำคัญมีเพียงครั้งเดียว เราจึงถักทอความสวยงามด้วยหัวใจ เพื่อบันทึกความประทับใจที่จะคงอยู่ตลอดไป"
                    </Typography>

                </Container>
            </Box>

            {/* Main Content */}
            <Container maxWidth="xl" sx={{ py: { xs: 8, md: 12 } }}>
                {/* Breadcrumbs & Filter */}
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', md: 'flex-end' }}
                    spacing={3}
                    sx={{ mb: { xs: 6, md: 8 } }}
                >
                    <Box>
                        <Breadcrumbs sx={{ mb: 2 }}>
                            <Link href="/" style={{ textDecoration: 'none', color: theme.palette.text.secondary }}>Home</Link>
                            <Typography color="text.primary">Event Albums</Typography>
                        </Breadcrumbs>
                        <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
                            Our Memory <span style={{ fontStyle: 'italic', color: theme.palette.warning.main }}>Collection</span>
                        </Typography>
                    </Box>

                    <Box sx={{
                        width: { xs: '100%', md: 'auto' },
                        overflowX: 'auto',
                        pb: { xs: 1, md: 0 },
                        '&::-webkit-scrollbar': { display: 'none' },
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none'
                    }}>
                        <Stack direction="row" spacing={1.5} sx={{ minWidth: 'max-content' }}>
                            {filters.map((f) => (
                                <Chip
                                    key={f}
                                    label={f}
                                    onClick={() => setFilter(f)}
                                    sx={{
                                        borderRadius: '0px',
                                        px: { xs: 3, md: 2 },
                                        py: 2.5,
                                        bgcolor: filter === f ? theme.palette.text.primary : 'transparent',
                                        color: filter === f ? '#FFF' : theme.palette.text.primary,
                                        border: '1px solid',
                                        borderColor: theme.palette.text.primary,
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        letterSpacing: '0.1em',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            bgcolor: filter === f ? theme.palette.text.primary : alpha(theme.palette.text.primary, 0.05),
                                        }
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>
                </Stack>

                {/* Album Grid & Loading State */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress color="warning" />
                    </Box>
                ) : (
                    <>
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
                            gap: { xs: 4, md: 6 }
                        }}>
                            {albums.map((album) => (
                                <Box
                                    component={Link}
                                    href={`/events/${album.id}`}
                                    key={album.id}
                                    sx={{
                                        textDecoration: 'none',
                                        display: 'block',
                                        group: 'album-card',
                                        position: 'relative',
                                        transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            transform: 'translateY(-10px)',
                                            '& .album-image': { transform: 'scale(1.05)' },
                                            '& .album-overlay': { opacity: 1 },
                                            '& .album-content': { transform: 'translateY(-10px)' }
                                        }
                                    }}
                                >
                                    {/* Image Wrapper */}
                                    <Box sx={{
                                        position: 'relative',
                                        aspectRatio: '4/5',
                                        overflow: 'hidden',
                                        mb: 3,
                                        bgcolor: '#F0EBE9'
                                    }}>
                                        {!loadedImages.has(album.id) && (
                                            <Skeleton
                                                variant="rectangular"
                                                width="100%"
                                                height="100%"
                                                sx={{ position: 'absolute', inset: 0, zIndex: 1 }}
                                            />
                                        )}
                                        <Image
                                            src={getImageUrl(album.image)}
                                            alt={album.title}
                                            fill
                                            className="album-image"
                                            onLoad={() => handleImageLoad(album.id)}
                                            style={{
                                                objectFit: 'cover',
                                                transition: 'transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                                opacity: loadedImages.has(album.id) ? 1 : 0
                                            }}
                                        />

                                        {/* Photo Count Badge */}
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 20,
                                            right: 20,
                                            bgcolor: 'rgba(255,255,255,0.9)',
                                            px: 1.5,
                                            py: 0.8,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            zIndex: 2
                                        }}>
                                            <Gallery size="14" color={theme.palette.text.primary} />
                                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                                                {album.imagesCount} PHOTOS
                                            </Typography>
                                        </Box>

                                        {/* Hover Overlay */}
                                        <Box className="album-overlay" sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            bgcolor: alpha(theme.palette.text.primary, 0.2),
                                            opacity: 0,
                                            transition: 'opacity 0.4s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 1
                                        }}>
                                            <Box sx={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '50%',
                                                bgcolor: '#FFF',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                                            }}>
                                                <ArrowRight color={theme.palette.text.primary} variant="Outline" />
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Album Description */}
                                    <Box className="album-content" sx={{ transition: 'transform 0.4s ease' }}>
                                        <Typography
                                            variant="overline"
                                            sx={{
                                                color: theme.palette.warning.main,
                                                fontWeight: 700,
                                                display: 'block',
                                                mb: 1
                                            }}
                                        >
                                            {album.category}
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontSize: '1.4rem', mb: 2, lineHeight: 1.3 }}>
                                            {album.title}
                                        </Typography>

                                        <Stack direction="row" spacing={3} sx={{ color: theme.palette.text.secondary }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Location size="16" variant="Outline" color={theme.palette.warning.main} />
                                                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>{album.location}</Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Calendar size="16" variant="Outline" color={theme.palette.warning.main} />
                                                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>{album.date}</Typography>
                                            </Stack>
                                        </Stack>
                                    </Box>
                                </Box>
                            ))}
                        </Box>

                        {/* Empty State */}
                        {albums.length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 15 }}>
                                <Typography variant="h6" sx={{ color: theme.palette.text.secondary, fontWeight: 300 }}>
                                    ขออภัย ยังไม่มีอัลบั้มในหมวดหมู่นี้
                                </Typography>
                                <Button
                                    variant="text"
                                    onClick={() => setFilter('All')}
                                    sx={{ mt: 2, color: theme.palette.warning.main }}
                                >
                                    ดูทั้งหมด
                                </Button>
                            </Box>
                        )}

                        {/* More Work Section */}
                        <Box sx={{ mt: 15, textAlign: 'center' }}>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontSize: { xs: '1.5rem', md: '2.2rem' },
                                    mb: 3,
                                    color: theme.palette.text.primary
                                }}
                            >
                                Want to create your own <span style={{ fontStyle: 'italic', color: theme.palette.warning.main }}>Event?</span>
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 6, opacity: 0.7 }}>
                                ให้เราช่วยเนรมิตความสวยงามในแบบที่เป็นคุณ
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                component="a"
                                href="https://line.me/ti/p/~fonms2"
                                target="_blank"
                                sx={{
                                    px: { xs: 5, md: 10 },
                                    py: 2.5,
                                    width: { xs: '100%', sm: 'auto' },
                                    bgcolor: theme.palette.text.primary,
                                    color: '#FFF',
                                    borderColor: theme.palette.text.primary,
                                    '&:hover': {
                                        bgcolor: theme.palette.warning.main,
                                        borderColor: theme.palette.warning.main,
                                        color: '#FFF',
                                    }
                                }}
                            >
                                คุยกับนักจัดดอกไม้
                            </Button>
                        </Box>
                    </>
                )}
            </Container>

            {/* Footer Style Decoration */}
            <Box sx={{ height: '200px', width: '100%', position: 'relative', opacity: 0.5 }}>
                <Image
                    src="/images/about-florist.webp"
                    alt="Footer decor"
                    fill
                    style={{ objectFit: 'cover' }}
                />
                <Box sx={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(to top, ${theme.palette.background.default}, transparent)`
                }} />
            </Box>
        </Box >
    );
}
