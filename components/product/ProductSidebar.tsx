'use client';

import React from 'react';
import {
    Heart,
    Minus,
    Add,
    ArrowDown2,
    Star1,
    Box as BoxIcon,
    DirectRight,
    Truck,
    Gift,
    ShieldTick
} from 'iconsax-react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Chip,
    Tabs,
    Tab,
    Stack,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import Link from 'next/link';
import { Product } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import AddToCart from './AddToCart';

interface ProductSidebarProps {
    product: Product;
    quantity: number;
    increaseQty: () => void;
    decreaseQty: () => void;
    activeTab: number;
    setActiveTab: (val: number) => void;
}

export default function ProductSidebar({
    product,
    quantity,
    increaseQty,
    decreaseQty,
    activeTab,
    setActiveTab
}: ProductSidebarProps) {
    const { addToCart } = useCart();

    return (
        <Box sx={{
            width: { xs: '100%', md: '50%' },
            bgcolor: '#FFFFFF',
            position: { xs: 'relative', md: 'sticky' },
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            px: { xs: 4, md: 8 },
            pt: { xs: 4, md: 6 },
            pb: 4,
            zIndex: 10,
            height: { md: '100vh' },
            overflowY: { md: 'auto' },
            borderLeft: { md: '1px solid #F5EDED' },
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(183, 110, 121, 0.1)' }
        }}>
            {/* Dior-Style Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="overline" sx={{
                    color: '#B76E79',
                    fontWeight: 700,
                    letterSpacing: '0.3em',
                    fontSize: '0.65rem'
                }}>
                    {product.type.toUpperCase()}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: 1 }}>
                    <Typography variant="h1" sx={{
                        fontSize: { xs: '1.8rem', md: '2.4rem' },
                        fontWeight: 300,
                        fontFamily: '"Playfair Display", serif',
                        color: '#1A1A1A',
                        lineHeight: 1.1
                    }}>
                        {product.title}
                    </Typography>
                    <IconButton size="small" sx={{ mt: 1 }}>
                        <Heart size={22} color="#1A1A1A" />
                    </IconButton>
                </Box>
                <Typography variant="caption" sx={{ color: '#999', fontSize: '0.65rem', mt: 1, display: 'block', letterSpacing: '0.05em' }}>
                    REF: {product.sku}
                </Typography>
            </Box>

            {/* Price & Description Section (Core Change) */}
            <Box sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 2 }}>
                    <Typography sx={{
                        fontSize: '1.8rem',
                        fontWeight: 400,
                        color: '#1A1A1A',
                        fontFamily: '"Inter", sans-serif'
                    }}>
                        ฿{product.price}
                    </Typography>
                    {product.originalPrice && product.originalPrice !== product.price && (
                        <Typography sx={{
                            fontSize: '1.1rem',
                            color: '#999',
                            textDecoration: 'line-through',
                            fontWeight: 300
                        }}>
                            ฿{product.originalPrice}
                        </Typography>
                    )}
                </Box>

                {/* Product Description Moved Here */}
                <Typography variant="body1" sx={{
                    color: '#444',
                    lineHeight: 1.8,
                    fontSize: '0.95rem',
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 300,
                    textAlign: 'justify',
                    borderLeft: '2px solid #F5EDED',
                    pl: 3,
                    fontStyle: 'italic'
                }}>
                    {product.description}
                </Typography>
            </Box>

            {/* Quantity and Actions */}
            <Box sx={{ mb: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#1A1A1A', mb: 1.5, display: 'block', letterSpacing: '0.1em' }}>
                    SELECT QUANTITY
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #E0E0E0',
                        borderRadius: '0px',
                        height: 48
                    }}>
                        <IconButton onClick={decreaseQty} disabled={quantity <= 1} size="small" sx={{ px: 2 }}>
                            <Minus size={14} color="#1A1A1A" />
                        </IconButton>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', minWidth: 40, textAlign: 'center' }}>
                            {quantity}
                        </Typography>
                        <IconButton onClick={increaseQty} size="small" sx={{ px: 2 }}>
                            <Add size={14} color="#1A1A1A" />
                        </IconButton>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <AddToCart price={product.price} onAdd={() => addToCart(product, quantity)} />
                    </Box>
                </Box>

                <Button
                    variant="outlined"
                    fullWidth
                    sx={{
                        mt: 2,
                        height: 48,
                        borderColor: '#1A1A1A',
                        color: '#1A1A1A',
                        textTransform: 'uppercase',
                        borderRadius: '0px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            borderColor: '#B76E79',
                            color: '#B76E79',
                            bgcolor: 'transparent'
                        }
                    }}
                >
                    ชำระเงินทันที
                </Button>
            </Box>

            {/* Desktop: Tabs Layout */}
            <Box sx={{ display: { xs: 'none', md: 'block' }, borderTop: '1px solid #F5EDED' }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, val) => setActiveTab(val)}
                    sx={{
                        minHeight: 48,
                        '& .MuiTab-root': {
                            minHeight: 48,
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            letterSpacing: '0.1em',
                            color: '#999',
                            textTransform: 'uppercase',
                            px: 0,
                            mr: 4,
                            '&.Mui-selected': { color: '#1A1A1A' }
                        },
                        '& .MuiTabs-indicator': {
                            bgcolor: '#B76E79',
                            height: 2
                        }
                    }}
                >
                    <Tab label="SIGNATURE" />
                    <Tab label="DETAILS" />
                    <Tab label="DELIVERY" />
                </Tabs>

                {/* Tab Content */}
                <Box sx={{ py: 3 }}>
                    {activeTab === 0 && (
                        <Stack spacing={2}>
                            {product.features?.map((feature, idx) => (
                                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Star1 size={14} variant="Bulk" color="#B76E79" />
                                    <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#666' }}>{feature}</Typography>
                                </Box>
                            ))}
                            {(!product.features || product.features.length === 0) && (
                                <Typography variant="body2" sx={{ color: '#999', fontSize: '0.85rem' }}>ไม่มีข้อมูล</Typography>
                            )}
                        </Stack>
                    )}
                    {activeTab === 1 && (
                        <Stack spacing={1.5}>
                            {product.details?.map((detail, idx) => (
                                <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                    <DirectRight size={14} color="#B76E79" />
                                    <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.6 }}>{detail}</Typography>
                                </Box>
                            ))}
                            {(!product.details || product.details.length === 0) && (
                                <Typography variant="body2" sx={{ color: '#999', fontSize: '0.85rem' }}>ไม่มีข้อมูล</Typography>
                            )}
                        </Stack>
                    )}
                    {activeTab === 2 && (
                        <Box>
                            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem', lineHeight: 1.8, mb: 2 }}>
                                เราจัดส่งด้วยความปราณีตผ่านบริการขนส่งระดับพรีเมียม เพื่อให้มั่นใจว่าดอกไม้ถึงมือท่านในสภาพที่สมบูรณ์ที่สุด
                            </Typography>
                            <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Truck size={16} color="#B76E79" />
                                    <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#444' }}>จัดส่งฟรีในกรุงเทพฯ สำหรับออเดอร์ 1,500 บาทขึ้นไป</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Gift size={16} color="#B76E79" />
                                    <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#444' }}>บรรจุในกล่องของขวัญสุดพิเศษ</Typography>
                                </Box>
                            </Stack>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Mobile: Accordion Toggle Layout */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, borderTop: '1px solid #F5EDED' }}>
                <Accordion elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid #F5EDED', bgcolor: 'transparent' }}>
                    <AccordionSummary expandIcon={<ArrowDown2 size={16} />}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.1em' }}>SIGNATURE QUALITIES</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                        <Stack spacing={2}>
                            {product.features?.map((feature, idx) => (
                                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Star1 size={14} variant="Bulk" color="#B76E79" />
                                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#666' }}>{feature}</Typography>
                                </Box>
                            ))}
                        </Stack>
                    </AccordionDetails>
                </Accordion>

                <Accordion elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid #F5EDED', bgcolor: 'transparent' }}>
                    <AccordionSummary expandIcon={<ArrowDown2 size={16} />}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.1em' }}>DETAILS & CARE</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                        <Stack spacing={1.5}>
                            {product.details?.map((detail, idx) => (
                                <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                    <DirectRight size={14} color="#B76E79" />
                                    <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.6 }}>{detail}</Typography>
                                </Box>
                            ))}
                        </Stack>
                    </AccordionDetails>
                </Accordion>

                <Accordion elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid #F5EDED', bgcolor: 'transparent' }}>
                    <AccordionSummary expandIcon={<ArrowDown2 size={16} />}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.1em' }}>DELIVERY & RETURNS</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                        <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem', lineHeight: 1.8 }}>
                            เราจัดส่งด้วยความปราณีตผ่านบริการขนส่งระดับพรีเมียม เพื่อให้มั่นใจว่าดอกไม้ถึงมือท่านในสภาพที่สมบูรณ์ที่สุด
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            </Box>

            {/* Premium Badges */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mt: 4,
                px: 2,
                py: 3,
                bgcolor: '#FAFAFA'
            }}>
                <Stack direction="row" spacing={3} sx={{ width: '100%', justifyContent: 'space-around' }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Truck size={20} color="#1A1A1A" variant="Bulk" />
                        <Typography sx={{ fontSize: '8px', fontWeight: 800, mt: 1, letterSpacing: '0.1em' }}>EXPRESS</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <Gift size={20} color="#1A1A1A" variant="Bulk" />
                        <Typography sx={{ fontSize: '8px', fontWeight: 800, mt: 1, letterSpacing: '0.1em' }}>GIFT BOX</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <ShieldTick size={20} color="#1A1A1A" variant="Bulk" />
                        <Typography sx={{ fontSize: '8px', fontWeight: 800, mt: 1, letterSpacing: '0.1em' }}>SECURED</Typography>
                    </Box>
                </Stack>
            </Box>
        </Box>
    );
}
