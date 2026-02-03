'use client';

import Image from "next/image";
import { Container, Typography, Box } from "@mui/material";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

interface CategoryData {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
}

interface FeaturesProps {
    categories?: CategoryData[];
}

export default function Features({ categories = [] }: FeaturesProps) {

    const staticFeatures = [
        {
            src: "/images/img2.webp",
            title: "ช่อดอกไม้",
            subtitle: "SIGNATURE",
            desc: "จัดช่อสไตล์ฝรั่งเศส"
        },
        {
            src: "/images/succulent.png",
            title: "ไม้มงคล & ไม้อวบน้ำ",
            subtitle: "LUCKY & SUCCULENTS",
            desc: "สัญลักษณ์แห่งความโชคดี"
        },
        {
            src: "/images/img1.webp",
            title: "กระเช้าผลไม้",
            subtitle: "PREMIUM FRUITS",
            desc: "ผลไม้นำเข้าคัดพิเศษ"
        },
        {
            src: "/images/bouquet.png",
            title: "ของชำร่วย",
            subtitle: "SOUVENIRS",
            desc: "ของที่ระลึกสุดพิเศษ"
        },
    ];

    const displayFeatures = categories.length > 0
        ? categories.map(cat => ({
            src: cat.image,
            title: cat.title,
            subtitle: cat.subtitle,
            desc: cat.description
        }))
        : staticFeatures;

    return (
        <Box component="section" sx={{ py: { xs: 10, md: 14 }, bgcolor: '#FFFFFF' }}>
            <Container maxWidth="xl">
                <Box sx={{ mb: 12, textAlign: 'center', maxWidth: '700px', mx: 'auto' }}>
                    <Typography
                        variant="h2"
                        sx={{
                            mb: 2,
                            fontSize: { xs: '1.7rem', sm: '2.2rem', md: '3rem' },
                            color: '#1A1A1A',
                            letterSpacing: '0.05em',
                            fontFamily: 'var(--font-prompt)',
                        }}
                    >
                        หมวดหมู่สินค้า
                    </Typography>
                    <Box sx={{ width: '40px', height: '1px', bgcolor: '#B76E79', mx: 'auto' }} />
                </Box>

                {/* Desktop Grid Layout (Hidden on mobile) */}
                <Box sx={{
                    display: { xs: 'none', md: 'grid' },
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 4
                }}>
                    {displayFeatures.map((item, idx) => (
                        <FeatureCard key={idx} item={item} />
                    ))}
                </Box>

                {/* Mobile Swiper Layout (Visible on mobile) */}
                <Box sx={{ display: { xs: 'block', md: 'none' }, mx: -2 }}>
                    <Swiper
                        modules={[Pagination, Autoplay]}
                        spaceBetween={20}
                        slidesPerView={1.2}
                        centeredSlides={true}
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 3500, disableOnInteraction: false }}
                        style={{ paddingBottom: '50px' }}
                    >
                        {displayFeatures.map((item, idx) => (
                            <SwiperSlide key={idx}>
                                <FeatureCard item={item} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </Box>
            </Container>

            {/* Custom Style for Swiper Pagination */}
            <style jsx global>{`
                .swiper-pagination {
                    bottom: 0px !important;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
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

function FeatureCard({ item }: { item: any }) {
    return (
        <Box
            sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                width: '100%'
            }}
        >
            {/* Image Square Frame */}
            <Box sx={{
                width: '100%',
                aspectRatio: '1/1',
                position: 'relative',
                border: '1px solid #E5E5E5',
                mb: 3,
                overflow: 'hidden',
                transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                '&:hover': {
                    outline: '1px solid #B76E79',
                    outlineOffset: '4px',
                    borderColor: '#B76E79',
                    '& img': {
                        transform: 'scale(1.05)'
                    }
                }
            }}>
                <Image
                    src={item.src || '/images/img2.webp'}
                    alt={item.title}
                    fill
                    style={{
                        objectFit: 'cover',
                        padding: '20px',
                        transition: 'transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
                    }}
                />
            </Box>

            <Typography variant="overline" sx={{ color: '#B76E79', letterSpacing: '0.2em', fontSize: '0.7rem', mb: 1 }}>
                {item.subtitle}
            </Typography>
            <Typography variant="h4" sx={{ color: '#1A1A1A', fontSize: '1.2rem', letterSpacing: '0.15em', textAlign: 'center' }}>
                {item.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#888', mt: 1, fontSize: '0.9rem', fontStyle: 'italic', textAlign: 'center' }}>
                {item.desc}
            </Typography>
        </Box>
    );
}
