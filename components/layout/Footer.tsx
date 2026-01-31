'use client';

import { Container, Typography, Box, IconButton } from "@mui/material";
import { Instagram, Facebook, DirectNotification } from "iconsax-react";
import Link from "next/link";

export default function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                bgcolor: '#FDFBF7',
                color: '#5D4037',
                pt: 15,
                pb: 8,
                borderTop: '1px solid rgba(93, 64, 55, 0.05)'
            }}
        >
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 10 }}>
                    <Typography
                        variant="h3"
                        sx={{
                            fontFamily: '"Playfair Display", serif',
                            fontWeight: 700,
                            letterSpacing: '0.15em',
                            mb: 3,
                            textTransform: 'uppercase',
                            fontSize: { xs: '2rem', md: '3rem' }
                        }}
                    >
                        HanFlower
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            maxWidth: '600px',
                            mx: 'auto',
                            opacity: 0.8,
                            lineHeight: 2,
                            letterSpacing: '0.05em',
                            fontWeight: 300
                        }}
                    >
                        ร้านดอกไม้และไม้อวบน้ำที่เชื่อว่าทุกของขวัญมีความหมาย <br />
                        รังสรรค์ด้วยดีไซน์ที่สะท้อนตัวตนอันเหนือระดับของคุณ
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: { xs: 4, md: 8 },
                        flexWrap: 'wrap',
                        mb: 10,
                        borderTop: '1px solid rgba(93, 64, 55, 0.1)',
                        borderBottom: '1px solid rgba(93, 64, 55, 0.1)',
                        py: 4
                    }}
                >
                    {[
                        { label: 'Collections', href: '/collections' },
                        { label: 'Our Story', href: '/about' },
                        { label: 'Digital Card', href: '/ar-scan' },
                        { label: 'Contact', href: '/contact' },
                        { label: 'FAQ', href: '/faq' },
                    ].map((item) => {
                        const isExternal = item.href === '/ar-scan';
                        const Component = isExternal ? 'a' : Link;

                        return (
                            <Component
                                key={item.label}
                                href={item.href}
                                style={{
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    transition: 'color 0.3s ease'
                                }}
                            >
                                <Box sx={{ '&:hover': { color: '#D4AF37' } }}>
                                    {item.label}
                                </Box>
                            </Component>
                        );
                    })}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                        <IconButton aria-label="follow us on instagram" sx={{ color: '#5D4037', '&:hover': { color: '#D4AF37' } }}>
                            <Instagram size="20" variant="Outline" />
                        </IconButton>
                        <IconButton aria-label="follow us on facebook" sx={{ color: '#5D4037', '&:hover': { color: '#D4AF37' } }}>
                            <Facebook size="20" variant="Outline" />
                        </IconButton>
                        <IconButton aria-label="contact us via email" sx={{ color: '#5D4037', '&:hover': { color: '#D4AF37' } }}>
                            <DirectNotification size="20" variant="Outline" />
                        </IconButton>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: { xs: 2, md: 4 },
                            alignItems: 'center',
                            opacity: 0.5
                        }}
                    >
                        <Typography sx={{ fontSize: '10px', letterSpacing: '0.1em' }}>
                            © 2026 HANFLOWER. ALL RIGHTS RESERVED.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3 }}>
                            <Link href="#" style={{ color: 'inherit', textDecoration: 'none', fontSize: '10px' }}>PRIVACY POLICY</Link>
                            <Link href="#" style={{ color: 'inherit', textDecoration: 'none', fontSize: '10px' }}>TERMS OF SERVICE</Link>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
