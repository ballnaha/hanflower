'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Container,
    Typography,
    Button,
    Box,
    IconButton,
    Badge,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText
} from "@mui/material";
import { ShoppingBag, HambergerMenu, SearchNormal1, Heart, Profile } from "iconsax-react";
import Image from "next/image";

import { useCart } from "@/context/CartContext";

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { cartCount, toggleCart } = useCart();
    const pathname = usePathname();
    const isProductPage = pathname?.includes('/product/');
    const isAdminPage = pathname?.startsWith('/admin');

    if (isAdminPage) return null;

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

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
                bgcolor: isScrolled || isProductPage ? (isProductPage && !isScrolled ? 'transparent' : 'rgba(255, 255, 255, 0.98)') : 'rgba(255, 255, 255, 0)',
                backdropFilter: isScrolled ? 'blur(20px)' : 'none',
                borderBottom: isScrolled || (isProductPage && isScrolled) ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
                transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
        >
            {isProductPage ? (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: isScrolled ? '70px' : '90px',
                    px: { xs: 2.5, md: 6 },
                    transition: 'all 0.5s ease'
                }}>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            onClick={handleDrawerToggle}
                            sx={{ color: '#1A1A1A' }}
                        >
                            <HambergerMenu size={22} variant="Outline" color="#1A1A1A" />
                        </IconButton>
                    </Box>

                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <Link href="/" style={{ textDecoration: 'none' }}>
                            <Box sx={{ position: 'relative', width: { xs: '140px', md: '180px' }, height: isScrolled ? '40px' : '50px', transition: 'all 0.5s ease' }}>
                                <Image
                                    src="/images/logo5.png"
                                    alt="HanFlower Logo"
                                    fill
                                    style={{ objectFit: 'contain' }}
                                    priority
                                />
                            </Box>
                        </Link>
                    </Box>

                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: { xs: 1, md: 3 } }}>
                        <IconButton sx={{ color: '#1A1A1A', display: { xs: 'none', md: 'flex' } }}>
                            <SearchNormal1 size={20} variant="Outline" color="#1A1A1A" />
                        </IconButton>
                        <IconButton sx={{ color: '#1A1A1A', display: { xs: 'none', md: 'flex' } }}>
                            <Heart size={20} variant="Outline" color="#1A1A1A" />
                        </IconButton>
                        <IconButton sx={{ color: '#1A1A1A', display: { xs: 'none', md: 'flex' } }}>
                            <Profile size={20} variant="Outline" color="#1A1A1A" />
                        </IconButton>
                        <IconButton onClick={() => toggleCart(true)} sx={{ color: '#1A1A1A' }}>
                            <Badge badgeContent={cartCount} color="warning" sx={{ '& .MuiBadge-badge': { fontSize: '10px' } }}>
                                <ShoppingBag size={20} variant="Outline" color="#1A1A1A" />
                            </Badge>
                        </IconButton>
                    </Box>
                </Box>
            ) : (
                <Container maxWidth="xl">
                    <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'space-between' }, alignItems: 'center', height: isScrolled ? '70px' : '100px', transition: 'height 0.5s ease' }}>
                        <Box sx={{ flex: 1, display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                            <Link href="/" style={{ textDecoration: 'none' }}>
                                <Box sx={{ position: 'relative', width: { xs: '150px', md: '220px' }, height: isScrolled ? '50px' : '80px', transition: 'all 0.5s ease' }}>
                                    <Image
                                        src="/images/logo5.png"
                                        alt="HanFlower Logo"
                                        fill
                                        style={{
                                            objectFit: 'contain',
                                            filter: isScrolled ? 'none' : (pathname === '/' && !isScrolled ? 'brightness(0) invert(1)' : 'none'),
                                            transition: 'filter 0.5s ease'
                                        }}
                                        priority
                                    />
                                </Box>
                            </Link>
                        </Box>

                        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 8 }}>
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
                                                fontSize: '0.85rem',
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
                            <Box sx={{ display: { xs: 'flex', lg: 'none' } }}>
                                <IconButton
                                    aria-label="shopping cart"
                                    onClick={() => toggleCart(true)}
                                    sx={{ color: isScrolled ? '#5D4037' : (pathname === '/' && !isScrolled ? '#FFFFFF' : '#5D4037') }}
                                >
                                    <Badge badgeContent={cartCount} color="warning" sx={{ '& .MuiBadge-badge': { fontSize: '10px', top: '2px', right: '2px' } }}>
                                        <ShoppingBag size="24" variant="Outline" color="#D4AF37" />
                                    </Badge>
                                </IconButton>
                            </Box>

                            <Button
                                variant="contained"
                                disableElevation
                                component={Link}
                                href="/products"
                                sx={{
                                    display: { xs: 'none', lg: 'flex' },
                                    bgcolor: isScrolled ? '#B76E79' : 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: isScrolled ? 'none' : 'blur(10px)',
                                    borderRadius: '0px',
                                    px: 5,
                                    py: 1.8,
                                    color: '#FFFFFF',
                                    textTransform: 'uppercase',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.3em',
                                    border: '1px solid',
                                    borderColor: isScrolled ? '#B76E79' : 'rgba(255, 255, 255, 0.3)',
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
            )}

            {/* Mobile/Sidebar Navigation Drawer */}
            <Drawer
                anchor="left"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    zIndex: 2000, // Ensure it's above everything including header
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: 300,
                        backgroundColor: '#FFF9F8'
                    },
                }}
            >
                <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', py: 4 }}>
                    <Box sx={{ position: 'relative', width: '120px', height: '40px', mx: 'auto', mb: 4 }}>
                        <Image
                            src="/images/logo5.png"
                            alt="HanFlower Logo"
                            fill
                            style={{ objectFit: 'contain' }}
                        />
                    </Box>
                    <List>
                        {[
                            { label: 'Home', href: '/' },
                            { label: 'Collections', href: '/collections' },
                            { label: 'Our Story', href: '/about' },
                            { label: 'Digital Card', href: '/ar-scan' },
                            { label: 'Contact', href: '/contact' },
                        ].map((item) => (
                            <ListItem key={item.label} disablePadding>
                                <ListItemButton sx={{ textAlign: 'center', py: 2 }} component={Link} href={item.href}>
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{
                                            sx: {
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                color: '#5D4037',
                                                fontWeight: 500
                                            }
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
        </Box>
    );
}
