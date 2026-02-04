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
            overline: "HAN FLOWER",
            title: "ความละมุนดอกไม้",
            titleItalic: "VS เทคโนโลยี",
            desc: "เกิดจากความรักในดอกไม้... สู่ความตั้งใจที่จริงจัง เราผสมผสานศาสตร์แห่งศิลป์และนวัตกรรมดิจิทัลเข้าด้วยกัน เพื่อให้ทุกความทรงจำยังคงงดงาม"
        },
        {
            overline: "THE CRAFTSMANSHIP",
            title: "คัดสรรด้วย",
            titleItalic: "ความพิถีพิถัน",
            desc: "เราคัดเลือกดอกไม้ที่สดใหม่ที่สุด เพื่อมอบประสบการณ์ที่สมบูรณ์แบบให้กับผู้รับในทุกโอกาส ใส่ใจในทุกรายละเอียดจากมือเราถึงมือคุณ"
        },
        {
            overline: "THE INNOVATION",
            title: "บอกความในใจ",
            titleItalic: "ผ่าน QR Code",
            desc: "จุดเด่นที่ไม่เหมือนใคร... ส่งมอบภาพความทรงจำ คลิปวิดีโอ หรือเสียงของคุณได้ทันที ให้ดอกไม้เล่าเรื่องราวที่มากกว่าคำพูดด้วย Feeling Card"
        }
    ];

    return (
        <Box component="section" sx={{ py: { xs: 6, md: 8 }, bgcolor: '#FFF9F8', overflow: 'hidden' }}>
            <Container maxWidth="xl">
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 5, md: 8 },
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
                                aspectRatio: '4 / 5', // กำหนด ratio เพื่อป้องกัน layout shift
                                width: '100%',
                                maxWidth: { xs: '360px', md: '480px' },
                                mx: 'auto',
                                '&:hover': {
                                    transform: 'translateY(-15px)',
                                    boxShadow: '0 60px 100px rgba(183, 110, 121, 0.15)',
                                    '& img': { transform: 'scale(1.05)' }
                                }
                            }}>
                                <Image
                                    src="/images/about-valentine.webp"
                                    alt="Our Story"
                                    fill
                                    sizes="(max-width: 768px) 320px, 400px"
                                    priority
                                    style={{
                                        objectFit: 'cover',
                                        filter: 'brightness(1.02) contrast(0.98)',
                                        transition: 'transform 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
                                    }}
                                />
                            </Box>

                            {/* Floating Stats/Mini-info */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 30,
                                    right: -30,
                                    bgcolor: '#5D4037',
                                    color: '#FFFFFF',
                                    p: 2.5,
                                    display: { xs: 'none', lg: 'block' },
                                    zIndex: 2,
                                    boxShadow: '0 15px 30px rgba(0,0,0,0.18)'
                                }}
                            >
                                <Typography variant="h4" sx={{ color: '#E0BFB8', mb: 0.5, fontSize: '0.9rem', letterSpacing: '0.15em' }}>
                                    ESTD
                                </Typography>
                                <Typography variant="caption" sx={{ letterSpacing: '0.2em', opacity: 0.8, fontWeight: 700, fontSize: '0.65rem' }}>
                                    SINCE 2022
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ width: { xs: '100%', md: '50%' }, textAlign: { xs: 'center', md: 'left' } }}>
                        <Box sx={{ width: '100%', minHeight: { xs: '300px', md: '350px' } }}>
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
                                                display: 'block',
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
                                                color: '#1A1A1A',
                                            }}
                                        >
                                            {slide.title} <br />
                                            <span style={{ fontStyle: 'italic', color: '#B76E79' }}>{slide.titleItalic}</span>
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
