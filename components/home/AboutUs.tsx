'use client';

import { Container, Typography, Box } from "@mui/material";
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export default function AboutUs() {

    const storySlides = [
        {
            overline: "OUR HERITAGE",
            title: "ศิลปะแห่งการ",
            titleItalic: "ส่งต่อความรู้สึก",
            desc: "ที่ HanFlower เราเชื่อว่าดอกไม้คือเรื่องราวแห่งความรู้สึก เราจึงผสานศาสตร์แห่งศิลป์และนวัตกรรมดิจิทัลเข้าด้วยกัน เพื่อให้ทุกความทรงจำยังคงงดงาม"
        },
        {
            overline: "THE CRAFTSMANSHIP",
            title: "คัดสรรด้วย",
            titleItalic: "ความพิถีพิถัน",
            desc: "เราคัดเลือกดอกไม้ที่สดใหม่ที่สุดและไม้อวบน้ำสายพันธุ์พรีเมียมจากแหล่งที่ดีที่สุด เพื่อมอบประสบการณ์ที่สมบูรณ์แบบให้กับผู้รับในทุกโอกาส"
        },
        {
            overline: "THE INNOVATION",
            title: "นวัตกรรม",
            titleItalic: "แห่งจินตนาการ",
            desc: "สัมผัสประสบการณ์ใหม่ที่ทำให้ความทรงจำมีชีวิต ด้วยเทคโนโลยี AR Scan ที่จะเปลี่ยนการ์ดอวยพรธรรมดาให้เป็นการบอกความในใจที่น่าประทับใจที่สุด"
        }
    ];

    return (
        <Box component="section" sx={{ py: { xs: 10, md: 14 }, bgcolor: '#FFF9F8', overflow: 'hidden' }}>
            <Container maxWidth="xl">
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 8, md: 15 },
                    alignItems: 'center'
                }}>
                    <Box sx={{ width: { xs: '100%', md: '50%' }, position: 'relative' }}>
                        <Box sx={{ position: 'relative' }}>
                            {/* Focused Soft Glow behind path */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '-10%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '120%',
                                    height: '110%',
                                    background: 'radial-gradient(circle, rgba(183, 110, 121, 0.15) 0%, transparent 70%)',
                                    filter: 'blur(50px)',
                                    zIndex: 0,
                                }}
                            />

                            {/* Elegant Arch Frame */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: -15,
                                    left: -15,
                                    right: -15,
                                    bottom: 0,
                                    border: '1px solid rgba(183, 110, 121, 0.25)',
                                    borderRadius: '500px 500px 20px 20px', // Perfect Arch shape
                                    zIndex: 0,
                                    display: { xs: 'none', md: 'block' },
                                    transition: 'all 0.6s ease'
                                }}
                            />

                            <Box sx={{
                                position: 'relative',
                                zIndex: 1,
                                overflow: 'hidden',
                                borderRadius: '500px 500px 20px 20px', // Arch shape for image
                                boxShadow: '0 40px 80px rgba(0,0,0,0.12)',
                                transition: 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                '&:hover': {
                                    transform: 'translateY(-15px)',
                                    boxShadow: '0 60px 100px rgba(183, 110, 121, 0.15)',
                                    '& img': { transform: 'scale(1.05)' }
                                }
                            }}>
                                <Image
                                    src="/images/about.webp"
                                    alt="Our Story"
                                    width={800}
                                    height={1000}
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        display: 'block',
                                        filter: 'brightness(1.02) contrast(0.98)',
                                        transition: 'transform 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
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
                                <Typography variant="h4" sx={{ color: '#E0BFB8', mb: 1, fontFamily: '"Playfair Display", serif', fontSize: '1.2rem', letterSpacing: '0.2em' }}>
                                    ESTD
                                </Typography>
                                <Typography variant="caption" sx={{ letterSpacing: '0.3em', opacity: 0.8, fontWeight: 700 }}>
                                    SINCE 2020
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ width: { xs: '100%', md: '50%' }, textAlign: { xs: 'center', md: 'left' } }}>
                        <Box sx={{ width: '100%', minHeight: { xs: '380px', md: '450px' } }}>
                            <Swiper
                                modules={[Pagination, Autoplay, EffectFade]}
                                effect="fade"
                                fadeEffect={{ crossFade: true }}
                                spaceBetween={0}
                                slidesPerView={1}
                                pagination={{ clickable: true }}
                                autoplay={{ delay: 5000, disableOnInteraction: false }}
                                style={{ paddingBottom: '60px' }}
                            >
                                {storySlides.map((slide, idx) => (
                                    <SwiperSlide key={idx} style={{ backgroundColor: 'transparent' }}>
                                        <Typography
                                            variant="overline"
                                            sx={{
                                                color: '#B76E79',
                                                fontWeight: 600,
                                                letterSpacing: '0.4em',
                                                mb: { xs: 2, md: 3 },
                                                display: 'block'
                                            }}
                                        >
                                            {slide.overline}
                                        </Typography>

                                        <Typography
                                            variant="h2"
                                            sx={{
                                                mb: { xs: 3, md: 4 },
                                                fontSize: { xs: '2rem', md: '3.5rem' },
                                                lineHeight: 1.2,
                                                color: '#1A1A1A'
                                            }}
                                        >
                                            {slide.title} <br />
                                            <span style={{ fontStyle: 'italic', fontFamily: '"Playfair Display", serif', color: '#B76E79' }}>{slide.titleItalic}</span>
                                        </Typography>

                                        <Box sx={{ width: '60px', height: '1px', bgcolor: '#E0BFB8', mb: { xs: 4, md: 5 }, mx: { xs: 'auto', md: 0 } }} />

                                        <Typography
                                            variant="body1"
                                            sx={{
                                                mb: { xs: 4, md: 6 },
                                                color: '#5D4037',
                                                lineHeight: 1.8,
                                                fontSize: { xs: '0.95rem', md: '1.1rem' },
                                                fontWeight: 300,
                                                maxWidth: { xs: '100%', md: '90%' }
                                            }}
                                        >
                                            {slide.desc}
                                        </Typography>

                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: { xs: 'center', md: 'flex-start' },
                                                gap: 2,
                                                pt: 2
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    color: '#B76E79',
                                                    letterSpacing: '0.3em',
                                                    fontWeight: 700,
                                                    fontSize: '0.7rem',
                                                    textTransform: 'uppercase'
                                                }}
                                            >
                                                WHERE ART MEETS NATURE
                                            </Typography>
                                            <Box sx={{ width: '30px', height: '1px', bgcolor: 'rgba(183, 110, 121, 0.4)' }} />
                                        </Box>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </Box>
                    </Box>
                </Box>
            </Container>

            {/* Custom Style for Swiper Pagination */}
            <style jsx global>{`
                .swiper-pagination {
                    bottom: 0px !important;
                    display: flex !important;
                    justify-content: flex-start !important;
                    align-items: center;
                    gap: 8px;
                }
                @media (max-width: 900px) {
                    .swiper-pagination {
                        justify-content: center !important;
                    }
                }
                .swiper-pagination-bullet {
                    width: 6px;
                    height: 6px;
                    background: #E5E5E5;
                    opacity: 1;
                    transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
                    margin: 0 !important;
                }
                .swiper-pagination-bullet-active {
                    width: 24px;
                    height: 4px;
                    background: #B76E79 !important;
                    border-radius: 4px;
                }
            `}</style>
        </Box>
    );
}
