'use client';

import Image from "next/image";
import { Container, Typography, Box } from "@mui/material";

export default function Features() {

    // Gallery Data
    const galleryItems = [
        { src: "/images/img1.webp", title: "Le Jardin", desc: "Fresh garden roses" },
        { src: "/images/bouquet.png", title: "Signature", desc: "Our timeless classic" },
        { src: "/images/img2.webp", title: "L'Hiver", desc: "Dried winter series" },
    ];

    return (
        <Box component="section" sx={{ py: { xs: 10, md: 14 }, bgcolor: '#FFFFFF' }}>
            <Container maxWidth="xl">
                <Box sx={{ mb: 12, textAlign: 'center', maxWidth: '700px', mx: 'auto' }}>
                    <Typography variant="h2" sx={{ mb: 2, fontSize: { xs: '1.7rem', sm: '2.2rem', md: '3rem' }, color: '#1A1A1A', letterSpacing: '0.05em' }}>
                        คอลเลกชันยอดนิยม
                    </Typography>
                    <Box sx={{ width: '40px', height: '1px', bgcolor: '#D4AF37', mx: 'auto' }} />
                </Box>

                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                    gap: 4
                }}>
                    {[
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
                    ].map((item, idx) => (
                        <Box
                            key={idx}
                            sx={{
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                group: 'true',
                                cursor: 'pointer',
                            }}
                        >
                            {/* Image Square Frame */}
                            <Box sx={{
                                width: '100%',
                                aspectRatio: '1/1', // Square
                                position: 'relative',
                                border: '1px solid #E5E5E5',
                                mb: 3,
                                overflow: 'hidden', // Ensure zoom stays inside
                                transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                '&:hover': {
                                    outline: '1px solid #1A1A1A', // Black Double border
                                    outlineOffset: '4px',
                                    borderColor: '#1A1A1A',
                                    '& img': { // Apply transform to the Image component inside this Box
                                        transform: 'scale(1.05)'
                                    }
                                }
                            }}>
                                <Image
                                    src={item.src}
                                    alt={item.title}
                                    fill
                                    style={{
                                        objectFit: 'cover',
                                        padding: '20px',
                                        transition: 'transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)' // Cinematic Slow Zoom
                                    }}
                                    className="hover-zoom"
                                />
                                {/* Overlay for Zoom Effect Trigger (optional, via parent) */}
                                <Box sx={{
                                    position: 'absolute', inset: 0,
                                    '$parent:hover & + img': { // This requires sophisticated selector or parent control
                                        // MUI parent 'group' styling usually easier via:
                                        // '&:hover img': { transform: 'scale(1.05)' } on parent
                                    }
                                }} />
                            </Box>

                            <Typography variant="overline" sx={{ color: '#D4AF37', letterSpacing: '0.2em', fontSize: '0.7rem', mb: 1 }}>
                                {item.subtitle}
                            </Typography>
                            <Typography variant="h4" sx={{ color: '#1A1A1A', fontSize: '1.2rem', letterSpacing: '0.15em' }}>
                                {item.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#888', mt: 1, fontSize: '0.9rem', fontStyle: 'italic' }}>
                                {item.desc}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}
