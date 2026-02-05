'use client';

import { Box, Typography, Button, Container, TextField, IconButton } from '@mui/material';
import { ArrowLeft, Notification, Instagram, Facebook, Send2 } from 'iconsax-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function ComingSoonPage() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setEmail('');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #FFF5F6 0%, #FFF0F2 50%, #FCE4E8 100%)',
            }}
        >
            {/* Decorative Elements */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-5%',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(183, 110, 121, 0.15) 0%, transparent 70%)',
                    animation: 'pulse 4s ease-in-out infinite',
                    '@keyframes pulse': {
                        '0%, 100%': { transform: 'scale(1)', opacity: 0.5 },
                        '50%': { transform: 'scale(1.1)', opacity: 0.8 },
                    },
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '-15%',
                    left: '-10%',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(183, 110, 121, 0.1) 0%, transparent 70%)',
                    animation: 'float 6s ease-in-out infinite',
                    '@keyframes float': {
                        '0%, 100%': { transform: 'translateY(0)' },
                        '50%': { transform: 'translateY(-20px)' },
                    },
                }}
            />

            {/* Floating Petals */}
            {[...Array(6)].map((_, i) => (
                <Box
                    key={i}
                    sx={{
                        position: 'absolute',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50% 0 50% 50%',
                        bgcolor: `rgba(183, 110, 121, ${0.1 + i * 0.05})`,
                        top: `${10 + i * 15}%`,
                        left: `${5 + i * 15}%`,
                        animation: `petal${i} ${6 + i}s ease-in-out infinite`,
                        [`@keyframes petal${i}`]: {
                            '0%, 100%': {
                                transform: 'rotate(0deg) translateY(0)',
                                opacity: 0.4
                            },
                            '50%': {
                                transform: `rotate(${180 + i * 30}deg) translateY(-30px)`,
                                opacity: 0.8
                            },
                        },
                    }}
                />
            ))}

            <Container maxWidth="sm">
                <Box
                    sx={{
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 1,
                        py: 6,
                    }}
                >
                    {/* Logo */}
                    <Box
                        sx={{
                            mb: 4,
                            animation: 'fadeInDown 1s ease-out',
                            '@keyframes fadeInDown': {
                                from: { opacity: 0, transform: 'translateY(-30px)' },
                                to: { opacity: 1, transform: 'translateY(0)' },
                            },
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: { xs: '2rem', md: '2.5rem' },
                                fontFamily: 'var(--font-playfair), serif',
                                fontWeight: 600,
                                color: '#B76E79',
                                letterSpacing: '0.05em',
                            }}
                        >
                            Hanflower
                        </Typography>
                    </Box>

                    {/* Main Content */}
                    <Box
                        sx={{
                            animation: 'fadeInUp 1s ease-out 0.3s both',
                            '@keyframes fadeInUp': {
                                from: { opacity: 0, transform: 'translateY(30px)' },
                                to: { opacity: 1, transform: 'translateY(0)' },
                            },
                        }}
                    >
                        <Typography
                            variant="h1"
                            sx={{
                                fontSize: { xs: '2.5rem', md: '4rem' },
                                fontFamily: 'var(--font-playfair), serif',
                                fontWeight: 700,
                                color: '#1A1A1A',
                                mb: 2,
                                lineHeight: 1.2,
                            }}
                        >
                            Coming Soon
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: { xs: '1rem', md: '1.25rem' },
                                color: '#666',
                                mb: 4,
                                maxWidth: '400px',
                                mx: 'auto',
                                lineHeight: 1.8,
                            }}
                        >
                            เรากำลังเตรียมสิ่งพิเศษให้คุณ
                            <br />
                            รอติดตามได้เร็วๆ นี้
                        </Typography>

                        {/* Flower Icon */}
                        <Box
                            sx={{
                                fontSize: '4rem',
                                mb: 4,
                                animation: 'bounce 2s ease-in-out infinite',
                                '@keyframes bounce': {
                                    '0%, 100%': { transform: 'translateY(0)' },
                                    '50%': { transform: 'translateY(-10px)' },
                                },
                            }}
                        >
                            🌸
                        </Box>

                        {/* Back to Home */}
                        <Button
                            component={Link}
                            href="/"
                            startIcon={<ArrowLeft size={18} variant="Linear" color="currentColor" />}
                            sx={{
                                color: '#666',
                                textTransform: 'none',
                                '&:hover': {
                                    color: '#B76E79',
                                    bgcolor: 'transparent',
                                },
                            }}
                        >
                            กลับหน้าหลัก
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
