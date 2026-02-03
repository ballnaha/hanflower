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
