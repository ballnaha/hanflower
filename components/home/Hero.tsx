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
                    src="/images/cover4.png"
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

            {/* Minimalist Left-Aligned Content */}
            <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10, textAlign: { xs: 'center', md: 'left' }, px: { xs: 3, md: 10 } }}>
                <Box sx={{
                    maxWidth: '800px',
                    mt: { md: 10 },
                    opacity: 0,
                    animation: 'fadeInUp 2s ease forwards',
                    '@keyframes fadeInUp': {
                        'from': { opacity: 0, transform: 'translateY(40px)' },
                        'to': { opacity: 1, transform: 'translateY(0)' }
                    }
                }}>
                    <Typography variant="overline" sx={{ color: '#D4AF37', letterSpacing: { xs: '0.3em', md: '0.6em' }, fontWeight: 600, display: 'block', mb: { xs: 2, md: 1 } }}>
                        ฮันฟลาวเวอร์
                    </Typography>

                    <Typography variant="h1" sx={{
                        fontSize: { xs: '2.2rem', sm: '4rem', md: '5rem' },
                        color: '#FFFFFF',
                        lineHeight: 1.1,
                        mb: { xs: 2, md: 4 },
                        textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    }}>
                        <span style={{ fontStyle: 'italic', fontWeight: 400, color: '#FFFFFF' }}>บอกรัก ยังไง ...</span> <br />
                        <span style={{ fontStyle: 'italic', fontWeight: 400, color: '#D4AF37' }}>ให้โลกจำ</span>
                    </Typography>

                    <Typography variant="h6" sx={{
                        color: 'rgba(255,255,255,0.8)',
                        fontWeight: 300,
                        letterSpacing: '0.1em',
                        mb: 2,
                        fontSize: { xs: '0.9rem', md: '1.1rem' }
                    }}>
                        ช่อดอกไม้แห่งความทรงจำ
                    </Typography>

                    <Box sx={{ width: '60px', height: '1px', bgcolor: '#D4AF37', mb: { xs: 3, md: 5 }, mx: { xs: 'auto', md: 0 } }} />

                    <Typography variant="body1" sx={{
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: { xs: '1.1rem', md: '1.4rem' },
                        mb: { xs: 4, md: 6 },
                        lineHeight: 1.6,
                        fontWeight: 400,
                        maxWidth: '600px',
                    }}>
                        "ช่อ QR CODE เจ้าแรก และเจ้าเดียวในไทย"
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 3, md: 5 }, justifyContent: { xs: 'center', md: 'flex-start' }, alignItems: 'center' }}>
                        <Button
                            variant="outlined"
                            component={Link}
                            href="/products"
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
                            SHOP NOW
                        </Button>


                    </Box>
                </Box>
            </Container>

            {/* Scroll Down Indicator */}
            <Box sx={{
                position: 'absolute',
                bottom: '20px',
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
                    height: { xs: '30px', md: '60px' },
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
