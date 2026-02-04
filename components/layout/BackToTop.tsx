'use client';

import React, { useState, useEffect } from 'react';
import { Fab, Zoom, useScrollTrigger } from '@mui/material';
import { ArrowUp } from 'iconsax-react';

export default function BackToTop() {
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 100,
    });

    const handleClick = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <Zoom in={trigger}>
            <Fab
                onClick={handleClick}
                size="medium"
                aria-label="back to top"
                sx={{
                    position: 'fixed',
                    bottom: { xs: 110, md: 30 }, // Above MobileNav on mobile
                    right: { xs: 20, md: 30 },
                    bgcolor: 'rgba(255, 255, 255, 0.4)', // Very transparent
                    backdropFilter: 'blur(12px)', // Glass effect
                    WebkitBackdropFilter: 'blur(12px)',
                    color: '#B76E79', // Icon color
                    zIndex: 900,
                    border: '1px solid rgba(183, 110, 121, 0.2)', // Subtle rose border
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        bgcolor: '#FFFFFF', // Change to solid pink on hover
                        color: '#B76E79',
                        transform: 'translateY(-4px) scale(1.05)',
                        boxShadow: '0 12px 24px rgba(183, 110, 121, 0.2)',
                    },
                }}
            >
                <ArrowUp size={24} variant="Linear" color="#B76E79" />
            </Fab>
        </Zoom>
    );
}
