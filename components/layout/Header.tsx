'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, HambergerMenu, SearchNormal1, Heart, Profile, ArrowDown2 } from "iconsax-react";
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
    ListItemText,
    Menu,
    MenuItem,
    Collapse
} from "@mui/material";
import Image from "next/image";

import { useCart } from "@/context/CartContext";
import PromotionBar from "./PromotionBar";

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [categories, setCategories] = useState<{ id: string; title: string; subtitle: string; slug: string }[]>([]);
    const [productsAnchorEl, setProductsAnchorEl] = useState<null | HTMLElement>(null);
    const [mobileProductsOpen, setMobileProductsOpen] = useState(false);

    const { cartCount, toggleCart } = useCart();
    const pathname = usePathname();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };
        fetchCategories();
    }, []);

    const isProductPage = pathname?.includes('/products/');
    const isAdminPage = pathname?.startsWith('/admin');

    if (isAdminPage) return null;

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleProductsClick = (event: React.MouseEvent<HTMLElement>) => {
        setProductsAnchorEl(event.currentTarget);
    };

    const handleProductsClose = () => {
        setProductsAnchorEl(null);
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
                transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
        >
            {pathname === '/' && <PromotionBar />}
            {/* Header logic adjustment to treat /events like home page */}
            <Box sx={{
                width: '100%',
                bgcolor: (isProductPage || isScrolled) ? 'rgba(255, 255, 255, 0.98)' : 'transparent',
                backdropFilter: (isProductPage || isScrolled) ? 'blur(20px)' : 'none',
                borderBottom: (isProductPage || isScrolled) ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
                transition: 'all 0.5s ease',
            }}>
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

                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: { xs: 1, md: 2 } }}>

                            <IconButton sx={{ color: '#1A1A1A', display: { xs: 'none', md: 'flex' } }}>
                                <Profile size={20} variant="Outline" color="#1A1A1A" />
                            </IconButton>

                            <IconButton
                                onClick={() => toggleCart(true)}
                                sx={{
                                    color: '#1A1A1A',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'scale(1.1)' }
                                }}
                            >
                                <Badge
                                    badgeContent={cartCount}
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            fontSize: '10px',
                                            bgcolor: '#B76E79',
                                            color: '#FFF'
                                        }
                                    }}
                                >
                                    <ShoppingBag size="22" variant="Outline" color="#1A1A1A" />
                                </Badge>
                            </IconButton>

                            <Button
                                variant="contained"
                                disableElevation
                                component="a"
                                href="https://line.me/ti/p/~fonms2"
                                target="_blank"
                                sx={{
                                    bgcolor: '#06C755',
                                    borderRadius: '100px',
                                    px: { xs: 1.5, md: 3 },
                                    py: { xs: 0.8, md: 1.2 },
                                    minWidth: { xs: 'auto', md: '64px' },
                                    color: '#FFFFFF',
                                    textTransform: 'none',
                                    fontSize: { xs: '0.75rem', md: '0.85rem' },
                                    fontWeight: 600,
                                    letterSpacing: '0.02em',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        bgcolor: '#05B54C',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 12px rgba(6,199,85,0.2)'
                                    },
                                }}
                                startIcon={<Image src="/images/line.png" alt="LINE" width={18} height={18} />}
                            >
                                <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
                                    สั่งซื้อทางไลน์
                                </Box>
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Container maxWidth="xl">
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: isScrolled ? '70px' : '100px', transition: 'height 0.5s ease' }}>
                            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                <IconButton
                                    onClick={handleDrawerToggle}
                                    sx={{
                                        display: { xs: 'flex', md: 'none' }, // Show only on mobile
                                        color: (pathname === '/' && !isScrolled) ? '#FFF' : '#5D4037'
                                    }}
                                >
                                    <HambergerMenu size={24} variant="Outline" color={(pathname === '/' && !isScrolled) ? '#FFF' : '#5D4037'} />
                                </IconButton>

                                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                                    <Link href="/" style={{ textDecoration: 'none' }}>
                                        <Box sx={{ position: 'relative', width: { xs: '120px', md: '220px' }, height: isScrolled ? '50px' : '80px', transition: 'all 0.5s ease' }}>
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
                            </Box>

                            <Box sx={{ flex: { xs: 2, md: 'auto' }, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {/* Mobile Logo */}
                                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                                    <Link href="/" style={{ textDecoration: 'none' }}>
                                        <Box sx={{ position: 'relative', width: '120px', height: isScrolled ? '40px' : '50px', transition: 'all 0.5s ease' }}>
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

                                {/* Desktop Menu */}
                                <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: { md: 4, lg: 6 }, alignItems: 'center' }}>
                                    <Box
                                        sx={{ position: 'relative' }}
                                        onMouseEnter={(e) => setProductsAnchorEl(e.currentTarget)}
                                        onMouseLeave={() => setProductsAnchorEl(null)}
                                    >
                                        <Box
                                            component="span"
                                            sx={{
                                                fontSize: '0.85rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.25em',
                                                color: isScrolled ? '#5D4037' : (pathname === '/' && !isScrolled ? '#FFFFFF' : '#5D4037'),
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                padding: '10px 0',
                                                cursor: 'pointer',
                                                transition: 'all 0.4s ease',
                                                opacity: pathname?.includes('/products') ? 1 : (isScrolled ? 1 : 0.9),
                                                '&:hover': { opacity: 1 }
                                            }}
                                            className="nav-link"
                                        >
                                            PRODUCTS
                                            <ArrowDown2 size={12} variant="Outline" />
                                        </Box>
                                        <Box component="span" sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: '50%',
                                            width: pathname?.includes('/products') ? '100%' : '0%',
                                            height: '1px',
                                            bgcolor: '#D4AF37',
                                            transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                            transform: 'translateX(-50%)',
                                            '.nav-link:hover ~ &': {
                                                width: '100%',
                                            }
                                        }} />
                                        <Menu
                                            anchorEl={productsAnchorEl}
                                            open={Boolean(productsAnchorEl)}
                                            onClose={() => setProductsAnchorEl(null)}
                                            disableScrollLock
                                            disablePortal
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                            MenuListProps={{
                                                onMouseEnter: () => { }, // Keep open
                                                onMouseLeave: () => setProductsAnchorEl(null),
                                                sx: { py: 0.5 }
                                            }}
                                            PaperProps={{
                                                elevation: 0,
                                                sx: {
                                                    mt: '5px',
                                                    borderRadius: '0px', // Premium sharp look
                                                    bgcolor: 'rgba(255, 255, 255, 0.98)',
                                                    backdropFilter: 'blur(20px)',
                                                    boxShadow: '0 25px 60px rgba(0,0,0,0.12)',
                                                    border: '1px solid rgba(0,0,0,0.06)',
                                                    minWidth: '220px',
                                                    '& .MuiMenuItem-root': {
                                                        fontSize: '0.75rem',
                                                        letterSpacing: '0.15em',
                                                        textTransform: 'uppercase',
                                                        fontWeight: 500,
                                                        py: 1.8,
                                                        px: 3,
                                                        color: '#5D4037',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(183, 110, 121, 0.05)',
                                                            color: '#B76E79',
                                                            pl: 3.5 // Subtle slide effect
                                                        }
                                                    }
                                                }
                                            }}
                                        >
                                            <MenuItem
                                                component={Link}
                                                href="/products"
                                                onClick={() => setProductsAnchorEl(null)}
                                            >
                                                สินค้าทั้งหมด
                                            </MenuItem>
                                            {categories.map((cat) => (
                                                <MenuItem
                                                    key={cat.id}
                                                    component={Link}
                                                    href={`/products?category=${cat.subtitle}`}
                                                    onClick={() => setProductsAnchorEl(null)}
                                                >
                                                    {cat.title}
                                                </MenuItem>
                                            ))}
                                        </Menu>
                                    </Box>

                                    {[
                                        { label: 'EVENTS', href: '/events' },
                                        { label: 'ABOUT US', href: '/about' },
                                        { label: 'OUR CUSTOMERS', href: '/our-customer' },
                                        { label: 'CONTACT', href: '/contact' },
                                    ].map((link) => {
                                        return (
                                            <Box key={link.label} sx={{ position: 'relative' }}>
                                                <Link
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
                                                        opacity: (pathname === link.href) ? 1 : (isScrolled ? 1 : 0.9)
                                                    }}
                                                    className="nav-link"
                                                >
                                                    {link.label}
                                                </Link>
                                                <Box component="span" sx={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: '50%',
                                                    width: (pathname === link.href) ? '100%' : '0%',
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
                            </Box>

                            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
                                <IconButton
                                    aria-label="shopping cart"
                                    onClick={() => toggleCart(true)}
                                    sx={{
                                        color: isScrolled ? '#5D4037' : (pathname === '/' && !isScrolled ? '#FFFFFF' : '#5D4037'),
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'scale(1.1)' }
                                    }}
                                >
                                    <Badge
                                        badgeContent={cartCount}
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                fontSize: '10px',
                                                bgcolor: '#B76E79',
                                                color: '#FFF'
                                            }
                                        }}
                                    >
                                        <ShoppingBag size="22" variant="Outline" color={isScrolled ? '#5D4037' : (pathname === '/' && !isScrolled ? '#FFFFFF' : '#B76E79')} />
                                    </Badge>
                                </IconButton>

                                <Button
                                    variant="contained"
                                    disableElevation
                                    component="a"
                                    href="https://line.me/ti/p/~fonms2"
                                    target="_blank"
                                    sx={{
                                        bgcolor: isScrolled || (pathname !== '/' && pathname !== '/our-customer') ? '#06C755' : 'rgba(255, 255, 255, 0.15)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '100px', // Tablet style pill
                                        px: { xs: 1.5, md: 3 },
                                        py: { xs: 0.8, md: 1.2 },
                                        minWidth: { xs: 'auto', md: '64px' },
                                        color: '#FFFFFF',
                                        textTransform: 'none',
                                        fontSize: { xs: '0.75rem', md: '0.85rem' },
                                        fontWeight: 600,
                                        letterSpacing: '0.02em',
                                        border: '1px solid',
                                        borderColor: isScrolled || (pathname !== '/' && pathname !== '/our-customer') ? '#06C755' : 'rgba(255, 255, 255, 0.4)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            bgcolor: '#05B54C',
                                            borderColor: '#05B54C',
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 4px 12px rgba(6,199,85,0.2)'
                                        },
                                    }}
                                    startIcon={<Image src="/images/line.png" alt="LINE" width={18} height={18} />}
                                >
                                    <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
                                        สั่งซื้อทางไลน์
                                    </Box>
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
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Box sx={{ position: 'relative', width: '120px', height: '40px', mx: 'auto', mb: 4 }}>
                            <Link href="/" onClick={handleDrawerToggle}>
                                <Image
                                    src="/images/logo5.png"
                                    alt="HanFlower Logo"
                                    fill
                                    style={{ objectFit: 'contain' }}
                                />
                            </Link>
                        </Box>
                        <List sx={{ px: 2 }}>
                            <ListItem disablePadding>
                                <ListItemButton sx={{ py: 2 }} component={Link} href="/" onClick={handleDrawerToggle}>
                                    <ListItemText primary="HOME" primaryTypographyProps={{ sx: { textTransform: 'uppercase', letterSpacing: '0.1em', color: '#5D4037', fontWeight: 600 } }} />
                                </ListItemButton>
                            </ListItem>

                            <ListItem disablePadding sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
                                <ListItemButton sx={{ py: 2 }} onClick={() => setMobileProductsOpen(!mobileProductsOpen)}>
                                    <ListItemText primary="PRODUCTS" primaryTypographyProps={{ sx: { textTransform: 'uppercase', letterSpacing: '0.1em', color: '#5D4037', fontWeight: 600 } }} />
                                    <ArrowDown2 size={16} variant="Outline" style={{ transform: mobileProductsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                                </ListItemButton>
                                <Collapse in={mobileProductsOpen} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding sx={{ bgcolor: 'rgba(183, 110, 121, 0.05)', borderRadius: '12px', mb: 1 }}>
                                        <ListItemButton sx={{ pl: 4, py: 1.5 }} component={Link} href="/products" onClick={handleDrawerToggle}>
                                            <ListItemText primary="สินค้าทั้งหมด" primaryTypographyProps={{ sx: { fontSize: '0.9rem', color: '#B76E79' } }} />
                                        </ListItemButton>
                                        {categories.map((cat) => (
                                            <ListItemButton key={cat.id} sx={{ pl: 4, py: 1.5 }} component={Link} href={`/products?category=${cat.subtitle}`} onClick={handleDrawerToggle}>
                                                <ListItemText primary={cat.title} primaryTypographyProps={{ sx: { fontSize: '0.9rem', color: '#5D4037' } }} />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </Collapse>
                            </ListItem>

                            {[
                                { label: 'EVENTS', href: '/events' },
                                { label: 'ABOUT US', href: '/about' },
                                { label: 'OUR CUSTOMERS', href: '/our-customer' },
                                { label: 'CONTACT', href: '/contact' },
                            ].map((item) => (
                                <ListItem key={item.label} disablePadding>
                                    <ListItemButton sx={{ py: 2 }} component={Link} href={item.href} onClick={handleDrawerToggle}>
                                        <ListItemText
                                            primary={item.label}
                                            primaryTypographyProps={{
                                                sx: {
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.1em',
                                                    color: '#5D4037',
                                                    fontWeight: 600
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
        </Box>
    );
}
