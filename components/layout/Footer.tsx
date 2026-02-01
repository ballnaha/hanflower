'use client';

import { Container, Typography, Box, IconButton } from "@mui/material";
import { Instagram, Facebook, DirectNotification } from "iconsax-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith('/admin');

    if (isAdminPage) return null;
    return (
        <Box
            component="footer"
            sx={{
                bgcolor: '#FFFFFF',
                color: '#5D4037',
                pt: 10,
                pb: 6,
                borderTop: '1px solid rgba(0, 0, 0, 0.05)'
            }}
        >
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Minimal Logo */}
                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: '"Playfair Display", serif',
                            fontWeight: 700,
                            letterSpacing: '0.3em',
                            mb: 5,
                            textTransform: 'uppercase',
                        }}
                    >
                        HanFlower
                    </Typography>

                    {/* Simple Nav Links */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: { xs: 3, md: 5 },
                            flexWrap: 'wrap',
                            mb: 6,
                        }}
                    >
                        {[
                            { label: 'Shop', href: '/products' },
                            { label: 'Story', href: '/#about' },
                            { label: 'AR Scan', href: '/ar-scan' },
                            { label: 'Contact', href: '/contact' },
                        ].map((item) => {
                            const isAR = item.href === '/ar-scan';
                            const Component = isAR ? 'a' : Link;

                            return (
                                <Component
                                    key={item.label}
                                    href={item.href}
                                    style={{
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        letterSpacing: '0.2em',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    <Box sx={{ opacity: 0.6, transition: '0.3s', '&:hover': { opacity: 1, color: '#D4AF37' } }}>
                                        {item.label}
                                    </Box>
                                </Component>
                            );
                        })}
                    </Box>

                    {/* Social Handles */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 6 }}>
                        <IconButton aria-label="instagram" size="small" sx={{ color: '#5D4037', opacity: 0.5, '&:hover': { opacity: 1, color: '#D4AF37' } }}>
                            <Instagram size="18" variant="Outline" />
                        </IconButton>
                        <IconButton aria-label="facebook" size="small" sx={{ color: '#5D4037', opacity: 0.5, '&:hover': { opacity: 1, color: '#D4AF37' } }}>
                            <Facebook size="18" variant="Outline" />
                        </IconButton>
                        <IconButton aria-label="email" size="small" sx={{ color: '#5D4037', opacity: 0.5, '&:hover': { opacity: 1, color: '#D4AF37' } }}>
                            <DirectNotification size="18" variant="Outline" />
                        </IconButton>
                    </Box>

                    {/* Ultra Minimal Copyright */}
                    <Typography
                        sx={{
                            fontSize: '9px',
                            letterSpacing: '0.15em',
                            opacity: 0.4,
                            fontWeight: 400
                        }}
                    >
                        © 2026 HANFLOWER STUDIO. PRESERVING EMOTIONS.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
