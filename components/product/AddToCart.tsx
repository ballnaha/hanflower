'use client';

import React, { useState } from 'react';
import { Button, Typography, CircularProgress, Box } from '@mui/material';
import { ShoppingBag } from 'iconsax-react';

interface AddToCartProps {
    price: string | number;
    onAdd?: () => void;
}

export default function AddToCart({ price, onAdd }: AddToCartProps) {
    const [loading, setLoading] = useState(false);

    const handleClick = () => {
        setLoading(true);
        if (onAdd) {
            onAdd();
        }
        // Simulate network request
        setTimeout(() => {
            setLoading(false);
        }, 1500);
    };

    return (
        <Button
            onClick={handleClick}
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
                height: 48,
                bgcolor: '#B76E79',
                background: 'linear-gradient(45deg, #B76E79 0%, #EEA8B3 50%, #B76E79 100%)',
                backgroundSize: '200% auto',
                color: '#FFF',
                textTransform: 'none',
                px: 3,
                display: 'flex',
                justifyContent: 'center',
                borderRadius: '0px',
                transition: 'all 0.4s ease',
                border: 'none',
                boxShadow: '0 4px 15px rgba(183, 110, 121, 0.2)',
                '&:hover': {
                    backgroundPosition: 'right center',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 20px rgba(183, 110, 121, 0.3)'
                },
                '&.Mui-disabled': {
                    color: '#FFF',
                    opacity: 0.8
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {loading ? (
                    <CircularProgress size={20} color="inherit" />
                ) : (
                    <ShoppingBag size={20} variant="Bold" color="#FFF" />
                )}
                <Typography sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    whiteSpace: 'nowrap'
                }}>
                    {loading ? (
                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>กำลังเพิ่ม...</Box>
                    ) : (
                        <>
                            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>เพิ่มลงตะกร้าสินค้า</Box>
                            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>เพิ่มลงตะกร้า</Box>
                        </>
                    )}
                    {loading && <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>กำลังเพิ่ม...</Box>}
                </Typography>
            </Box>

        </Button>
    );
}
