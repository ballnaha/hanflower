'use client';

import { Box, Container, Typography, Button } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { Home2 } from 'iconsax-react';

export default function NotFound() {
    return (
        <Box
            sx={{
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#FFF9F8',
                textAlign: 'center',
                px: 2,
                pt: { xs: 10, md: 10 } // Add padding top for mobile header
            }}
        >
            <Container maxWidth="sm">
                <Box
                    sx={{
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 4
                    }}
                >
                    <Box
                        sx={{
                            width: { xs: 200, md: 280 },
                            height: { xs: 200, md: 280 },
                            bgcolor: '#fff',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 20px 40px rgba(183, 110, 121, 0.15)',
                            position: 'relative',
                            overflow: 'hidden',
                            border: '5px solid #fff'
                        }}
                    >
                        <Image
                            src="/images/product5.png"
                            alt="Flower Basket"
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                    </Box>
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 10,
                            right: 0,
                            bgcolor: '#fff',
                            px: 2,
                            py: 1,
                            borderRadius: '12px',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                            transform: 'rotate(-10deg)'
                        }}
                    >
                        <Typography variant="h3" sx={{ fontFamily: 'Prompt', color: '#B76E79', fontWeight: 700 }}>
                            404
                        </Typography>
                    </Box>
                </Box>

                <Typography
                    variant="h2"
                    sx={{
                        fontFamily: 'Prompt',
                        color: '#2C1A1D',
                        fontSize: { xs: '2rem', md: '3rem' },
                        mb: 2,
                        fontWeight: 600
                    }}
                >
                    ไม่พบหน้านี้
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        color: '#666',
                        fontSize: '1.1rem',
                        lineHeight: 1.8,
                        mb: 5
                    }}
                >
                    ดูเหมือนว่าหน้าที่คุณกำลังตามหาอาจจะถูกย้าย ลบ <Box component="br" sx={{ display: { xs: 'none', sm: 'block' } }} />
                    หรือไม่มีอยู่จริงในสวนของเราแล้ว
                </Typography>

                <Link href="/" passHref style={{ textDecoration: 'none' }}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<Home2 variant="Bold" />}
                        sx={{
                            bgcolor: '#B76E79',
                            color: '#fff',
                            px: 4,
                            py: 1.5,
                            borderRadius: '50px',
                            fontFamily: 'Prompt',
                            fontSize: '1rem',
                            boxShadow: '0 10px 20px rgba(183, 110, 121, 0.3)',
                            '&:hover': {
                                bgcolor: '#8E4D58',
                                boxShadow: '0 15px 30px rgba(183, 110, 121, 0.4)',
                                transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        กลับสู่หน้าหลัก
                    </Button>
                </Link>
            </Container>
        </Box>
    );
}
