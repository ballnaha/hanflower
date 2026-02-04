"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import MobileNav from './MobileNav';
import BackToTop from './BackToTop';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Routes that should NOT have the global header/footer
    const hideLayout = pathname?.startsWith('/valentine') || pathname?.startsWith('/admin');

    if (hideLayout) {
        return <>{children}</>;
    }

    return (
        <>
            <Header />
            <Box component="main" sx={{ pb: { xs: '100px', md: 0 } }}>
                {children}
            </Box>
            <Footer />
            <BackToTop />
            <MobileNav />
        </>
    );
}
