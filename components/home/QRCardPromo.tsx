'use client';

import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { Heart, Gift } from 'iconsax-react';
import Image from 'next/image';
import Link from 'next/link';

export default function QRCardPromo() {
    return (
        <Box
            component="section"
            sx={{
                py: { xs: 8, md: 12 },
                bgcolor: '#FFF9F8',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Decorative Background */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.03,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B76E79' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                zIndex: 0
            }} />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'center',
                    gap: { xs: 6, md: 10 }
                }}>
                    {/* Left: Card Mockup */}
                    <Box sx={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        position: 'relative'
                    }}>
                        <Box sx={{
                            position: 'relative',
                            width: { xs: 280, md: 360 },
                            height: { xs: 180, md: 230 },
                            perspective: '1000px'
                        }}>
                            {/* Card Design */}
                            <Box sx={{
                                position: 'relative',
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(135deg, #B76E79 0%, #D4A5AA 50%, #C9888F 100%)',
                                borderRadius: '16px',
                                boxShadow: '0 25px 50px -12px rgba(183, 110, 121, 0.35)',
                                p: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                transform: 'rotateY(-5deg) rotateX(5deg)',
                                transition: 'all 0.5s ease',
                                '&:hover': {
                                    transform: 'rotateY(0deg) rotateX(0deg)',
                                    boxShadow: '0 30px 60px -15px rgba(183, 110, 121, 0.45)'
                                }
                            }}>
                                {/* Top Section */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography sx={{
                                            fontFamily: '"Playfair Display", serif',
                                            fontSize: { xs: '1.2rem', md: '1.5rem' },
                                            fontWeight: 600,
                                            color: '#FFF',
                                            textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                        }}>
                                            HAN FLOWER
                                        </Typography>
                                        <Typography sx={{
                                            fontSize: { xs: '0.6rem', md: '0.7rem' },
                                            letterSpacing: '0.2em',
                                            color: 'rgba(255,255,255,0.8)',
                                            mt: 0.5
                                        }}>
                                            FEELING CARD
                                        </Typography>
                                    </Box>
                                    <Heart size={24} variant="Bold" color="#FFF" />
                                </Box>

                                {/* Bottom Section */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <Box>
                                        <Typography sx={{
                                            fontSize: { xs: '0.65rem', md: '0.75rem' },
                                            color: 'rgba(255,255,255,0.7)',
                                            mb: 0.5
                                        }}>
                                            แสกนเพื่ออ่านข้อความ
                                        </Typography>
                                        <Typography sx={{
                                            fontSize: { xs: '0.9rem', md: '1rem' },
                                            fontWeight: 600,
                                            color: '#FFF',
                                            letterSpacing: '0.05em'
                                        }}>
                                            ส่งความรู้สึกผ่านดอกไม้
                                        </Typography>
                                    </Box>

                                    {/* QR Code Placeholder */}
                                    <Box sx={{
                                        width: { xs: 50, md: 65 },
                                        height: { xs: 50, md: 65 },
                                        bgcolor: '#FFF',
                                        borderRadius: '8px',
                                        p: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Box sx={{
                                            width: '100%',
                                            height: '100%',
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23B76E79' x='10' y='10' width='20' height='20'/%3E%3Crect fill='%23B76E79' x='40' y='10' width='10' height='10'/%3E%3Crect fill='%23B76E79' x='60' y='10' width='10' height='10'/%3E%3Crect fill='%23B76E79' x='70' y='10' width='20' height='20'/%3E%3Crect fill='%23B76E79' x='10' y='40' width='10' height='10'/%3E%3Crect fill='%23B76E79' x='30' y='40' width='10' height='10'/%3E%3Crect fill='%23B76E79' x='50' y='40' width='10' height='10'/%3E%3Crect fill='%23B76E79' x='80' y='40' width='10' height='10'/%3E%3Crect fill='%23B76E79' x='10' y='60' width='10' height='10'/%3E%3Crect fill='%23B76E79' x='40' y='60' width='10' height='10'/%3E%3Crect fill='%23B76E79' x='60' y='60' width='20' height='10'/%3E%3Crect fill='%23B76E79' x='10' y='70' width='20' height='20'/%3E%3Crect fill='%23B76E79' x='40' y='70' width='10' height='10'/%3E%3Crect fill='%23B76E79' x='70' y='70' width='20' height='20'/%3E%3C/svg%3E")`,
                                            backgroundSize: 'contain',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center'
                                        }} />
                                    </Box>
                                </Box>

                                {/* Decorative Circles */}
                                <Box sx={{
                                    position: 'absolute',
                                    top: -20,
                                    right: -20,
                                    width: 100,
                                    height: 100,
                                    borderRadius: '50%',
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    filter: 'blur(20px)'
                                }} />
                            </Box>

                            {/* Shadow Card Behind */}
                            <Box sx={{
                                position: 'absolute',
                                top: 15,
                                left: 15,
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(135deg, #9D5D66 0%, #B8888E 100%)',
                                borderRadius: '16px',
                                zIndex: -1,
                                opacity: 0.5
                            }} />
                        </Box>
                    </Box>

                    {/* Right: Content */}
                    <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                        <Typography
                            variant="overline"
                            sx={{
                                color: '#B76E79',
                                fontWeight: 600,
                                letterSpacing: '0.2em',
                                mb: 1,
                                display: 'block'
                            }}
                        >
                            ฟรีทุกช่อดอกไม้
                        </Typography>

                        <Typography
                            variant="h2"
                            sx={{
                                fontSize: { xs: '1.8rem', md: '2.5rem' },
                                fontWeight: 600,
                                color: '#1A1A1A',
                                mb: 2,
                                lineHeight: 1.3
                            }}
                        >
                            Feeling Card
                            <Box component="span" sx={{
                                fontFamily: '"Playfair Display", serif',
                                fontStyle: 'italic',
                                color: '#B76E79',
                                display: 'block'
                            }}>
                                ส่งความรู้สึกผ่าน QR Code
                            </Box>
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                color: '#666',
                                mb: 3,
                                fontSize: '1rem',
                                lineHeight: 1.8,
                                maxWidth: { md: 480 }
                            }}
                        >
                            ทุกช่อดอกไม้มาพร้อม <strong style={{ color: '#B76E79' }}>Feeling Card</strong> ฟรี!
                            เพียงแสกน QR Code ผู้รับจะได้เปิดอ่านข้อความพิเศษจากคุณ
                            พร้อมใส่รูปภาพ คลิปวิดีโอ หรือลิงก์ TikTok/YouTube ที่คุณอยากแชร์
                        </Typography>

                        {/* What's included */}
                        <Box sx={{
                            mb: 3,
                            p: 2.5,
                            bgcolor: 'rgba(183, 110, 121, 0.05)',
                            borderRadius: '12px',
                            border: '1px dashed rgba(183, 110, 121, 0.2)',
                            maxWidth: { md: 480 }
                        }}>
                            <Typography variant="caption" sx={{
                                color: '#B76E79',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                display: 'block',
                                mb: 1.5
                            }}>
                                ใส่ได้มากกว่าแค่ข้อความ
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1.5}>
                                {/* Image */}
                                <Box sx={{
                                    px: 2,
                                    py: 0.75,
                                    bgcolor: '#FFF',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    color: '#555',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.75
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#B76E79">
                                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                    </svg>
                                    รูปภาพ
                                </Box>

                                {/* Video */}
                                <Box sx={{
                                    px: 2,
                                    py: 0.75,
                                    bgcolor: '#FFF',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    color: '#555',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.75
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#B76E79">
                                        <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
                                    </svg>
                                    คลิปวิดีโอ
                                </Box>

                                {/* TikTok */}
                                <Box sx={{
                                    px: 2,
                                    py: 0.75,
                                    bgcolor: '#FFF',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    color: '#555',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.75
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" fill="#000" />
                                    </svg>
                                    TikTok
                                </Box>

                                {/* YouTube */}
                                <Box sx={{
                                    px: 2,
                                    py: 0.75,
                                    bgcolor: '#FFF',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    color: '#555',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.75
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FF0000" />
                                    </svg>
                                    YouTube
                                </Box>
                            </Stack>
                        </Box>

                        {/* Features */}
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={3}
                            sx={{ mb: 3, justifyContent: { xs: 'center', md: 'flex-start' } }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '10px',
                                    bgcolor: 'rgba(183, 110, 121, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Gift size={20} color="#B76E79" variant="Bold" />
                                </Box>
                                <Box>
                                    <Typography variant="body2" fontWeight={600} color="#333">
                                        ฟรีทุกออเดอร์
                                    </Typography>
                                    <Typography variant="caption" color="#888">
                                        การ์ดมาตรฐาน
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '10px',
                                    bgcolor: 'rgba(183, 110, 121, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Heart size={20} color="#B76E79" variant="Bold" />
                                </Box>
                                <Box>
                                    <Typography variant="body2" fontWeight={600} color="#333">
                                        ปรับแต่งพิเศษ
                                    </Typography>
                                    <Typography variant="caption" color="#888">
                                        เริ่มต้นเพียง ฿150
                                    </Typography>
                                </Box>
                            </Box>
                        </Stack>

                        {/* Note */}
                        <Typography
                            variant="caption"
                            sx={{
                                color: '#888',
                                display: 'block',
                                mb: 3,
                                fontStyle: 'italic',
                                maxWidth: { md: 450 }
                            }}
                        >
                            * การ์ดมาตรฐานฟรีทุกออเดอร์ หากต้องการดีไซน์เฉพาะหรือปรับแต่งให้เข้ากับผู้รับ
                            มีค่าบริการเพิ่มเติม
                        </Typography>

                        <Button
                            component={Link}
                            href="/products"
                            variant="contained"
                            sx={{
                                bgcolor: '#B76E79',
                                color: '#FFF',
                                px: 5,
                                py: 1.5,
                                borderRadius: '0px',
                                fontWeight: 600,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                fontSize: '0.85rem',
                                boxShadow: '0 8px 25px rgba(183, 110, 121, 0.3)',
                                '&:hover': {
                                    bgcolor: '#9D5D66',
                                    boxShadow: '0 12px 35px rgba(183, 110, 121, 0.4)'
                                }
                            }}
                        >
                            สั่งซื้อพร้อมการ์ด
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
