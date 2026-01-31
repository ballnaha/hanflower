'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container, Typography, Button, Box, IconButton, Badge } from "@mui/material";
import { ShoppingBag, ShoppingCart } from "iconsax-react";

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <Box
            component="header"
            sx={{
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 1000,
                bgcolor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0)',
                backdropFilter: isScrolled ? 'blur(20px)' : 'none',
                borderBottom: isScrolled ? '1px solid rgba(212, 175, 55, 0.1)' : 'none',
                transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
        >
            <Container maxWidth="xl">
                <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'space-between' }, alignItems: 'center', height: isScrolled ? '70px' : '100px', transition: 'height 0.5s ease' }}>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                        <Link href="/" style={{ textDecoration: 'none' }}>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontFamily: '"Playfair Display", serif',
                                    fontWeight: 700,
                                    letterSpacing: '0.15em',
                                    color: isScrolled ? '#5D4037' : (pathname === '/' && !isScrolled ? '#FFFFFF' : '#5D4037'),
                                    transition: 'color 0.5s ease',
                                    textTransform: 'uppercase',
                                    fontSize: '1.5rem',
                                }}
                            >
                                HanFlower
                            </Typography>
                        </Link>
                    </Box>

                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 8 }}>
                        {/* Desktop Navigation Links */}
                        {[
                            { label: 'COLLECTIONS', href: '/collections' },
                            { label: 'OUR STORY', href: '/about' },
                            { label: 'DIGITAL CARD', href: '/ar-scan' },
                            { label: 'CONTACT', href: '/contact' },
                        ].map((link) => {
                            const isExternal = link.href === '/ar-scan';
                            const Component = isExternal ? 'a' : Link;

                            return (
                                <Box key={link.label} sx={{ position: 'relative' }}>
                                    <Component
                                        href={link.href}
                                        style={{
                                            fontSize: '0.75rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.25em',
                                            color: isScrolled ? '#5D4037' : (pathname === '/' && !isScrolled ? '#FFFFFF' : '#5D4037'),
                                            textDecoration: 'none',
                                            fontWeight: 600,
                                            display: 'block',
                                            padding: '10px 0',
                                            transition: 'all 0.4s ease',
                                            opacity: isScrolled ? 1 : 0.9
                                        }}
                                        className="nav-link"
                                    >
                                        {link.label}
                                    </Component>
                                    <Box component="span" sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: '50%',
                                        width: '0%',
                                        height: '1px',
                                        bgcolor: '#D4AF37',
                                        transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                        transform: 'translateX(-50%)',
                                        '.nav-link:hover ~ &': {
                                            width: '100%',
                                        }
                                    }} />
                                </Box>
                            );
                        })}
                    </Box>

                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                        {/* Cart Icon for Tablet/Mobile */}
                        <Box sx={{ display: { xs: 'flex', lg: 'none' } }}>
                            <IconButton
                                aria-label="shopping cart"
                                sx={{ color: isScrolled ? '#5D4037' : (pathname === '/' && !isScrolled ? '#FFFFFF' : '#5D4037') }}
                            >
                                <Badge badgeContent={0} color="warning" sx={{ '& .MuiBadge-badge': { fontSize: '10px', top: '2px', right: '2px' } }}>
                                    <ShoppingBag size="24" variant="Outline" color="#D4AF37" />
                                </Badge>
                            </IconButton>
                        </Box>

                        {/* Full Button for Desktop */}
                        <Button
                            variant="contained"
                            disableElevation
                            sx={{
                                display: { xs: 'none', lg: 'flex' },
                                bgcolor: isScrolled ? '#5D4037' : 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: isScrolled ? 'none' : 'blur(10px)',
                                borderRadius: '0px',
                                px: 5,
                                py: 1.8,
                                color: '#FFFFFF',
                                textTransform: 'uppercase',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                letterSpacing: '0.3em',
                                border: '1px solid',
                                borderColor: isScrolled ? '#5D4037' : 'rgba(255, 255, 255, 0.3)',
                                transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                '&:hover': {
                                    bgcolor: '#D4AF37',
                                    color: '#FFFFFF',
                                    borderColor: '#D4AF37',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                                    '& .icon': { color: '#FFFFFF' }
                                },
                            }}
                            startIcon={<ShoppingBag size="18" variant="Outline" color="#FFFFFF" className="icon" />}
                        >
                            SHOP NOW
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
