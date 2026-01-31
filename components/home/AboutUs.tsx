'use client';

import { Container, Typography, Box, Button } from "@mui/material";
import Image from "next/image";
import { ArrowRight } from "iconsax-react";

export default function AboutUs() {
    return (
        <Box component="section" sx={{ py: { xs: 10, md: 14 }, bgcolor: '#FDFBF7', overflow: 'hidden' }}>
            <Container maxWidth="xl">
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 8, md: 15 },
                    alignItems: 'center'
                }}>
                    <Box sx={{ width: { xs: '100%', md: '50%' }, position: 'relative' }}>
                        <Box sx={{ position: 'relative' }}>
                            {/* Decorative Background Box */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: -40,
                                    left: -40,
                                    width: '80%',
                                    height: '100%',
                                    border: '1px solid rgba(212, 175, 55, 0.3)',
                                    zIndex: 0,
                                    display: { xs: 'none', md: 'block' }
                                }}
                            />

                            <Box sx={{ position: 'relative', zIndex: 1, overflow: 'hidden', borderRadius: 0 }}>
                                <Image
                                    src="/images/about-florist.webp"
                                    alt="Our Story"
                                    width={800}
                                    height={1000}
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        display: 'block',
                                        filter: 'brightness(0.95)'
                                    }}
                                />
                            </Box>

                            {/* Floating Stats/Mini-info */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 40,
                                    right: -40,
                                    bgcolor: '#5D4037',
                                    color: '#FFFFFF',
                                    p: 4,
                                    display: { xs: 'none', lg: 'block' },
                                    zIndex: 2,
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                                }}
                            >
                                <Typography variant="h4" sx={{ color: '#D4AF37', mb: 1, fontFamily: '"Playfair Display", serif', fontSize: '1.2rem', letterSpacing: '0.2em' }}>
                                    ESTD
                                </Typography>
                                <Typography variant="caption" sx={{ letterSpacing: '0.3em', opacity: 0.8, fontWeight: 700 }}>
                                    SINCE 2020
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                        <Box>
                            <Typography
                                variant="overline"
                                sx={{
                                    color: '#D4AF37',
                                    fontWeight: 600,
                                    letterSpacing: '0.4em',
                                    mb: 3,
                                    display: 'block'
                                }}
                            >
                                OUR HERITAGE
                            </Typography>

                            <Typography
                                variant="h2"
                                sx={{
                                    mb: 4,
                                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                                    lineHeight: 1.2,
                                    color: '#1A1A1A'
                                }}
                            >
                                ศิลปะแห่งการ <br />
                                <span style={{ fontStyle: 'italic', fontFamily: '"Playfair Display", serif', color: '#D4AF37' }}>ส่งต่อความรู้สึก</span>
                            </Typography>

                            <Box sx={{ width: '60px', height: '1px', bgcolor: '#D4AF37', mb: 5 }} />

                            <Typography
                                variant="body1"
                                sx={{
                                    mb: 4,
                                    color: '#5D4037',
                                    lineHeight: 2,
                                    fontSize: '1.1rem',
                                    fontWeight: 300
                                }}
                            >
                                ที่ HanFlower เราเชื่อว่าดอกไม้ไม่ใช่เป็นเพียงแค่ของขวัญ แต่คือการถ่ายทอดอารมณ์และเรื่องราว
                                จากจุดเริ่มต้นที่หลงใหลในความงดงามของธรรมชาติ สู่การรังสรรค์สตูดิโอที่ผสาน
                                ศาสตร์แห่งศิลป์และนวัตกรรมดิจิทัลเข้าด้วยกันอย่างลงตัว
                            </Typography>

                            <Typography
                                variant="body1"
                                sx={{
                                    mb: 6,
                                    color: '#5D4037',
                                    lineHeight: 2,
                                    fontSize: '1.1rem',
                                    fontWeight: 300,
                                    opacity: 0.8
                                }}
                            >
                                เราคัดสรรดอกไม้ที่สดที่สุดและไม้อวบน้ำสายพันธุ์พรีเมียม พร้อมด้วยเทคโนโลยี AR Scan
                                ที่จะทำให้การ์ดอวยพรของคุณมีชีวิตขึ้นมา เพื่อให้ทุกความทรงจำยังคงงดงามตราบนานเท่านาน
                            </Typography>

                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    pt: 2
                                }}
                            >
                                <Typography
                                    sx={{
                                        color: '#D4AF37',
                                        letterSpacing: '0.3em',
                                        fontWeight: 700,
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase'
                                    }}
                                >
                                    WHERE ART MEETS NATURE
                                </Typography>
                                <Box sx={{ width: '40px', height: '1px', bgcolor: 'rgba(212, 175, 55, 0.4)' }} />
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
