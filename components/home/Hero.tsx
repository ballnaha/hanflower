'use client';

import Image from "next/image";
import Link from "next/link";
import { Container, Typography, Button, Box } from "@mui/material";
import { ScanBarcode } from "iconsax-react";

export default function Hero() {
    return (
        <Box component="section" sx={{
            position: 'relative',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#000', // Dark base for immersion
            overflow: 'hidden'
        }}>

            {/* Full Screen Cinematic Image */}
            <Box sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                animation: 'kenBurnsSlow 30s linear infinite alternate',
                '@keyframes kenBurnsSlow': {
                    '0%': { transform: 'scale(1.1)' },
                    '100%': { transform: 'scale(1)' },
                }
            }}>
                <Image
                    src="/images/cover.webp"
                    alt="HanFlower Immersive"
                    fill
                    style={{
                        objectFit: 'cover',
                        filter: 'brightness(0.7) contrast(1.1)' // Moody cinematic look
                    }}
                    priority
                />
            </Box>

            {/* Elegant Vignette Overlay */}
            <Box sx={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.4) 100%)',
                zIndex: 1
            }} />

            {/* Minimalist Centered Content */}
            <Container maxWidth="md" sx={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                <Box sx={{
                    opacity: 0,
                    animation: 'fadeInUp 2s ease forwards',
                    '@keyframes fadeInUp': {
                        'from': { opacity: 0, transform: 'translateY(40px)' },
                        'to': { opacity: 1, transform: 'translateY(0)' }
                    }
                }}>
                    <Typography variant="overline" sx={{ color: '#D4AF37', letterSpacing: { xs: '0.3em', md: '0.6em' }, fontWeight: 600, display: 'block', mb: 4 }}>
                        HANFLOWER
                    </Typography>

                    <Typography variant="h1" sx={{
                        fontSize: { xs: '2.5rem', sm: '4.5rem', md: '7rem' },
                        color: '#FFFFFF',
                        lineHeight: 1.1,
                        mb: 4,
                        textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        fontFamily: '"Playfair Display", serif'
                    }}>
                        เอกลักษณ์ <br />
                        <span style={{ fontStyle: 'italic', fontWeight: 400, color: '#D4AF37' }}>แห่งรสนิยม</span>
                    </Typography>

                    <Box sx={{ width: '60px', height: '1px', bgcolor: '#D4AF37', mx: 'auto', mb: 5 }} />

                    <Typography variant="body1" sx={{
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: { xs: '1rem', md: '1.2rem' },
                        mb: { xs: 6, md: 8 },
                        lineHeight: 2,
                        fontWeight: 300,
                        maxWidth: '600px',
                        mx: 'auto'
                    }}>
                        "ยกระดับการให้ของขวัญ ด้วยดีไซน์ที่สะท้อนตัวตนอันเหนือระดับของคุณ"
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 3, md: 5 }, justifyContent: 'center', alignItems: 'center' }}>
                        <Button
                            variant="outlined"
                            sx={{
                                px: { xs: 8, md: 10 },
                                py: 2.5,
                                borderColor: '#FFFFFF',
                                color: '#FFFFFF',
                                borderRadius: '0',
                                letterSpacing: '0.3em',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                width: { xs: '100%', sm: 'auto' },
                                '&:hover': {
                                    bgcolor: '#FFFFFF',
                                    color: '#000000',
                                    borderColor: '#FFFFFF',
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                                }
                            }}
                        >
                            THE COLLECTIONS
                        </Button>

                        <a href="/ar-scan" style={{ textDecoration: 'none' }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                py: 2,
                                position: 'relative',
                                cursor: 'pointer',
                                group: 'true',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: 10,
                                    left: 0,
                                    width: '0%',
                                    height: '1px',
                                    bgcolor: '#D4AF37',
                                    transition: 'width 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                },
                                '&:hover::after': {
                                    width: '100%',
                                }
                            }}>
                                <Typography sx={{
                                    color: '#D4AF37',
                                    fontSize: '0.75rem',
                                    letterSpacing: '0.4em',
                                    fontWeight: 700,
                                    textTransform: 'uppercase'
                                }}>
                                    VIRTUAL AR EXPERT
                                </Typography>
                                <ScanBarcode size="18" variant="Outline" color="#D4AF37" />
                            </Box>
                        </a>
                    </Box>
                </Box>
            </Container>

            {/* Scroll Down Indicator */}
            <Box sx={{
                position: 'absolute',
                bottom: '40px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
            }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                    Scroll
                </Typography>
                <Box sx={{
                    width: '1px',
                    height: '60px',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        bgcolor: '#D4AF37',
                        animation: 'scrollLine 2s ease-in-out infinite',
                        '@keyframes scrollLine': {
                            '0%': { transform: 'translateY(-100%)' },
                            '100%': { transform: 'translateY(100%)' }
                        }
                    }
                }} />
            </Box>
        </Box>
    );
}
