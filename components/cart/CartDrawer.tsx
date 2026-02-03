'use client';

import React from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Button,
    Divider,
    Stack,
    Avatar
} from '@mui/material';
import { CloseCircle, Trash, Add, Minus, ShoppingBag } from 'iconsax-react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/utils';

export default function CartDrawer() {
    const {
        isCartOpen,
        toggleCart,
        cartItems,
        removeFromCart,
        updateQuantity,
        cartTotal
    } = useCart();

    return (
        <Drawer
            anchor="right"
            open={isCartOpen}
            onClose={() => toggleCart(false)}
            PaperProps={{
                sx: { width: { xs: '100%', sm: 400 }, p: 3, display: 'flex', flexDirection: 'column' }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, fontFamily: 'var(--font-playfair), serif' }}>
                    ตะกร้าสินค้า ({cartItems.length})
                </Typography>
                <IconButton onClick={() => toggleCart(false)}>
                    <CloseCircle size={24} color="#1A1A1A" />
                </IconButton>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 3 }}>
                {cartItems.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8, color: '#999' }}>
                        <ShoppingBag size={48} color="#EEE" variant="Bold" style={{ margin: '0 auto 16px' }} />
                        <Typography>ไม่มีสินค้าในตะกร้า</Typography>
                    </Box>
                ) : (
                    <Stack spacing={3}>
                        {cartItems.map((item) => (
                            <Box key={item.id} sx={{ display: 'flex', gap: 2 }}>
                                <Box sx={{ position: 'relative', width: 80, height: 80, borderRadius: 2, overflow: 'hidden', bgcolor: '#F5F5F5', flexShrink: 0 }}>
                                    <Image
                                        src={getImageUrl(item.image)}
                                        alt={item.title}
                                        fill
                                        style={{ objectFit: 'contain' }}
                                    />
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1A1A1A' }}>
                                            {item.title}
                                        </Typography>
                                        <IconButton size="small" onClick={() => removeFromCart(item.id)} sx={{ p: 0.5 }}>
                                            <Trash size={16} color="#FF6B6B" />
                                        </IconButton>
                                    </Box>
                                    <Typography variant="caption" sx={{ color: '#666', mb: 1, display: 'block' }}>
                                        SKU: {item.sku || item.type}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #E0E0E0', borderRadius: 1 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={12} color="#1A1A1A" />
                                            </IconButton>
                                            <Typography sx={{ px: 1, fontSize: '0.8rem', fontWeight: 600 }}>{item.quantity}</Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <Add size={12} color="#1A1A1A" />
                                            </IconButton>
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            ฿{(
                                                (typeof item.price === 'string'
                                                    ? parseFloat(item.price.replace(/,/g, ''))
                                                    : item.price) * item.quantity
                                            ).toLocaleString()}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Stack>
                )}
            </Box>

            <Box sx={{ mt: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography sx={{ color: '#666' }}>ยอดรวม</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>฿{cartTotal.toLocaleString()}</Typography>
                </Box>
                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={cartItems.length === 0}
                    component={Link}
                    href="/payment"
                    onClick={() => toggleCart(false)}
                    sx={{
                        bgcolor: '#1A1A1A',
                        color: '#FFF',
                        py: 1.5,
                        textTransform: 'none',
                        borderRadius: 0,
                        '&:hover': { bgcolor: '#333' }
                    }}
                >
                    ดำเนินการชำระเงิน
                </Button>
            </Box>
        </Drawer>
    );
}
