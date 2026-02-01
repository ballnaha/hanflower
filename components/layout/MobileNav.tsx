'use client';

import { Box, Typography } from "@mui/material";
import { Home, Shop, Heart, User, ScanBarcode } from "iconsax-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith('/admin');

    if (isAdminPage) return null;

    const navItems = [
        { label: 'HOME', icon: Home, href: '/' },
        { label: 'SHOP', icon: Shop, href: '/products' },
        { label: 'AR SCAN', icon: ScanBarcode, href: '/ar-scan', isSpecial: true },
        { label: 'FAVORITES', icon: Heart, href: '/favorites' },
        { label: 'ACCOUNT', icon: User, href: '/account' },
    ];

    return (
        <Box
            className="mobile-nav"
            sx={{
                position: 'fixed',
                bottom: 20,
                left: '20px',
                right: '20px',
                height: '65px',
                bgcolor: 'rgba(253, 251, 247, 0.85)',
                backdropFilter: 'blur(15px)',
                borderRadius: '40px',
                display: { xs: 'flex', md: 'none' },
                justifyContent: 'space-around',
                alignItems: 'center',
                zIndex: 1000,
                boxShadow: '0 10px 40px rgba(93, 64, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                padding: '0 10px',
            }}
        >
            {navItems.map((item) => {
                const isActive = pathname === item.href;

                if (item.isSpecial) {
                    return (
                        <a
                            key={item.label}
                            href={item.href}
                            style={{
                                textDecoration: 'none',
                                position: 'relative',
                                top: '-25px',
                            }}
                        >
                            <Box sx={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #D4AF37 0%, #B2952E 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 10px 25px rgba(212, 175, 55, 0.4)',
                                border: '4px solid #FDFBF7',
                                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                '&:active': { transform: 'scale(0.9)' }
                            }}>
                                <item.icon size="28" variant="Outline" color="#FFFFFF" />
                            </Box>
                        </a>
                    );
                }

                return (
                    <Link
                        key={item.label}
                        href={item.href}
                        style={{
                            textDecoration: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            flex: 1
                        }}
                    >
                        <item.icon
                            size="22"
                            variant={isActive ? "Bold" : "Outline"}
                            color={isActive ? "#D4AF37" : "#5D4037"}
                            style={{ transition: 'all 0.3s ease' }}
                        />
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: '8px',
                                fontWeight: isActive ? 700 : 500,
                                color: isActive ? '#D4AF37' : '#5D4037',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {item.label}
                        </Typography>
                    </Link>
                );
            })}
        </Box>
    );
}
