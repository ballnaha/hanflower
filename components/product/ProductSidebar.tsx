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
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
    const router = useRouter();
    const [flowerType, setFlowerType] = React.useState<'fresh' | 'velvet'>('fresh');
    const [cardType, setCardType] = React.useState<'standard' | 'custom'>('standard');

    const basePrice = parseFloat(flowerType === 'fresh' ? product.price.replace(/,/g, '') : (product.priceVelvet?.replace(/,/g, '') || product.price.replace(/,/g, '')));
    const customCardFee = product.qrCodePrice ? parseFloat(product.qrCodePrice.replace(/,/g, '')) : 150;

    const cardPrice = cardType === 'custom' ? customCardFee : 0;
    const currentPriceNum = basePrice + cardPrice;
    const displayPrice = currentPriceNum.toString();

    const displayOriginalPrice = flowerType === 'fresh' ? product.originalPrice : (product.originalPriceVelvet || product.originalPrice);
    const displayDiscount = flowerType === 'fresh' ? product.discount : (product.discountVelvet || product.discount);

    const hasVelvet = !!product.priceVelvet;
    const currentStock = flowerType === 'fresh' ? product.stock : (product.stockVelvet ?? 0);
    const isOutOfStock = currentStock <= 0;

    const getFinalTitle = () => {
        let title = product.title;
        const variants = [];
        if (hasVelvet) variants.push(flowerType === 'fresh' ? 'ดอกไม้สด' : 'ดอกไม้กำมะหยี่');
        if (cardType === 'custom') variants.push('Custom QR Card');

        if (variants.length > 0) {
            title += ` (${variants.join(', ')})`;
        }
        return title;
    };

    const handleBuyNow = () => {
        addToCart({
            ...product,
            id: `${product.id}-${flowerType}-${cardType}`,
            sku: `${product.sku}-${flowerType.toUpperCase()}-${cardType.toUpperCase()}`,
            price: displayPrice,
            originalPrice: displayOriginalPrice,
            discount: displayDiscount || "",
            title: getFinalTitle()
        }, quantity);
        router.push('/payment');
    };

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
                        fontFamily: 'var(--font-prompt), serif',
                        color: '#1A1A1A',
                        lineHeight: 1.1
                    }}>
                        {product.title}
                    </Typography>

                </Box>
                <Typography variant="caption" sx={{ color: '#999', fontSize: '0.65rem', mt: 1, display: 'block', letterSpacing: '0.05em' }}>
                    REF: {product.sku}
                </Typography>
            </Box>

            {/* Price & Description Section (Core Change) */}
            <Box sx={{ mb: 6 }}>
                {/* Hide price when out of stock */}
                {isOutOfStock ? (
                    <Box sx={{ mb: 2 }}>
                        <Chip
                            label="สินค้าหมด"
                            sx={{
                                bgcolor: '#D32F2F',
                                color: '#FFF',
                                fontWeight: 700,
                                borderRadius: '4px',
                                height: '32px',
                                fontSize: '1rem',
                                '& .MuiChip-label': { px: 2 }
                            }}
                        />
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                        <Typography sx={{
                            fontSize: '1.8rem',
                            fontWeight: 400,
                            color: '#1A1A1A',
                            fontFamily: 'var(--font-prompt), sans-serif'
                        }}>
                            ฿{displayPrice}
                        </Typography>
                        {displayOriginalPrice && displayOriginalPrice !== displayPrice && (
                            <Typography sx={{
                                fontSize: '1.1rem',
                                color: '#999',
                                textDecoration: 'line-through',
                                fontWeight: 300
                            }}>
                                ฿{displayOriginalPrice}
                            </Typography>
                        )}
                        {displayDiscount && parseInt(displayDiscount) > 0 && (
                            <Chip
                                label={`-${displayDiscount}%`}
                                size="small"
                                sx={{
                                    bgcolor: '#B76E79',
                                    color: '#FFF',
                                    fontWeight: 700,
                                    borderRadius: '4px',
                                    height: '24px',
                                    '& .MuiChip-label': { px: 1 }
                                }}
                            />
                        )}
                    </Box>
                )}

                {/* Flower Type Selection */}
                {hasVelvet && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#1A1A1A', mb: 1.5, display: 'block', letterSpacing: '0.1em' }}>
                            SELECT MATERIAL
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <Button
                                onClick={() => setFlowerType('fresh')}
                                sx={{
                                    flex: 1,
                                    height: 52,
                                    borderRadius: 0,
                                    border: '1px solid',
                                    borderColor: flowerType === 'fresh' ? '#B76E79' : '#E0E0E0',
                                    bgcolor: flowerType === 'fresh' ? '#B76E79' : 'transparent',
                                    color: flowerType === 'fresh' ? '#FFF' : '#666',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: flowerType === 'fresh' ? '0 4px 12px rgba(183, 110, 121, 0.2)' : 'none',
                                    '&:hover': {
                                        borderColor: '#B76E79',
                                        bgcolor: flowerType === 'fresh' ? '#A05C66' : 'rgba(183, 110, 121, 0.05)',
                                        color: flowerType === 'fresh' ? '#FFF' : '#B76E79',
                                    }
                                }}
                            >
                                ดอกไม้สด
                            </Button>
                            <Button
                                onClick={() => setFlowerType('velvet')}
                                sx={{
                                    flex: 1,
                                    height: 52,
                                    borderRadius: 0,
                                    border: '1px solid',
                                    borderColor: flowerType === 'velvet' ? '#B76E79' : '#E0E0E0',
                                    bgcolor: flowerType === 'velvet' ? '#B76E79' : 'transparent',
                                    color: flowerType === 'velvet' ? '#FFF' : '#666',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: flowerType === 'velvet' ? '0 4px 12px rgba(183, 110, 121, 0.2)' : 'none',
                                    '&:hover': {
                                        borderColor: '#B76E79',
                                        bgcolor: flowerType === 'velvet' ? '#A05C66' : 'rgba(183, 110, 121, 0.05)',
                                        color: flowerType === 'velvet' ? '#FFF' : '#B76E79',
                                    }
                                }}
                            >
                                ดอกไม้กำมะหยี่
                            </Button>
                        </Stack>
                    </Box>
                )}

                {/* QR Card Selection */}
                {product.hasQrCode !== false && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#1A1A1A', mb: 1.5, display: 'block', letterSpacing: '0.1em' }}>
                            QR FEELING CARD
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <Button
                                onClick={() => setCardType('standard')}
                                sx={{
                                    flex: 1,
                                    height: 52,
                                    borderRadius: 0,
                                    border: '1px solid',
                                    borderColor: cardType === 'standard' ? '#B76E79' : '#E0E0E0',
                                    bgcolor: cardType === 'standard' ? '#B76E79' : 'transparent',
                                    color: cardType === 'standard' ? '#FFF' : '#666',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    lineHeight: 1.2,
                                    '&:hover': {
                                        borderColor: '#B76E79',
                                        bgcolor: cardType === 'standard' ? '#A05C66' : 'rgba(183, 110, 121, 0.05)',
                                    }
                                }}
                            >
                                <span>การ์ดมาตรฐาน</span>
                                <span style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 400 }}>(แถมฟรี)</span>
                            </Button>
                            <Button
                                onClick={() => setCardType('custom')}
                                sx={{
                                    flex: 2,
                                    height: 52,
                                    borderRadius: 0,
                                    border: '1px solid',
                                    borderColor: cardType === 'custom' ? '#B76E79' : '#E0E0E0',
                                    bgcolor: cardType === 'custom' ? '#B76E79' : 'transparent',
                                    color: cardType === 'custom' ? '#FFF' : '#666',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    lineHeight: 1.2,
                                    '&:hover': {
                                        borderColor: '#B76E79',
                                        bgcolor: cardType === 'custom' ? '#A05C66' : 'rgba(183, 110, 121, 0.05)',
                                    }
                                }}
                            >
                                <span>ปรับแต่งพิเศษ</span>
                                <span style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 400 }}>(รูปภาพ/วิดีโอ +฿{customCardFee})</span>
                            </Button>
                        </Stack>
                    </Box>
                )}

                {/* Product Description Moved Here */}
                <Typography variant="body1" sx={{
                    color: '#444',
                    lineHeight: 1.8,
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-prompt), sans-serif',
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

                {/* Show disabled state when out of stock */}
                {isOutOfStock ? (
                    <Box>
                        <Box sx={{
                            p: 3,
                            bgcolor: '#FFF5F5',
                            border: '1px solid #FFCDD2',
                            borderRadius: '8px',
                            textAlign: 'center',
                            mb: 2
                        }}>
                            <Typography sx={{ color: '#D32F2F', fontWeight: 600, fontSize: '0.95rem' }}>
                                สินค้าหมดชั่วคราว
                            </Typography>
                            <Typography sx={{ color: '#888', fontSize: '0.8rem', mt: 0.5 }}>
                                กรุณาติดต่อร้านค้าเพื่อสอบถามสินค้า
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            fullWidth
                            disabled
                            sx={{
                                height: 48,
                                borderRadius: '0px',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase'
                            }}
                        >
                            สินค้าหมด
                        </Button>
                    </Box>
                ) : (
                    <>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                border: '1px solid #E0E0E0',
                                borderRadius: '0px',
                                height: 48
                            }}>
                                <IconButton onClick={decreaseQty} disabled={quantity <= 1} size="small" sx={{ width: 48, height: 48 }}>
                                    <Minus size={14} color="#1A1A1A" />
                                </IconButton>
                                <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', minWidth: 40, textAlign: 'center' }}>
                                    {quantity}
                                </Typography>
                                <IconButton onClick={increaseQty} size="small" sx={{ width: 48, height: 48 }}>
                                    <Add size={14} color="#1A1A1A" />
                                </IconButton>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <AddToCart
                                    price={displayPrice}
                                    onAdd={() => addToCart({
                                        ...product,
                                        id: `${product.id}-${flowerType}-${cardType}`,
                                        sku: `${product.sku}-${flowerType.toUpperCase()}-${cardType.toUpperCase()}`,
                                        price: displayPrice,
                                        originalPrice: displayOriginalPrice,
                                        discount: displayDiscount || "",
                                        title: getFinalTitle()
                                    }, quantity)}
                                />
                            </Box>
                        </Box>

                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={handleBuyNow}
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
                    </>
                )}

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
                            {product.shipping && product.shipping.length > 0 ? (
                                <Stack spacing={1.5}>
                                    {product.shipping.map((text, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                            {idx === 0 ? <Truck size={16} color="#B76E79" /> : <Gift size={16} color="#B76E79" />}
                                            <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.6 }}>{text}</Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            ) : (
                                <>
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
                                </>
                            )}
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
                        {product.shipping && product.shipping.length > 0 ? (
                            <Stack spacing={1.5}>
                                {product.shipping.map((text, idx) => (
                                    <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                        {idx === 0 ? <Truck size={14} color="#B76E79" /> : <Gift size={14} color="#B76E79" />}
                                        <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#444', lineHeight: 1.6 }}>{text}</Typography>
                                    </Box>
                                ))}
                            </Stack>
                        ) : (
                            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem', lineHeight: 1.8 }}>
                                เราจัดส่งด้วยความปราณีตผ่านบริการขนส่งระดับพรีเมียม เพื่อให้มั่นใจว่าดอกไม้ถึงมือท่านในสภาพที่สมบูรณ์ที่สุด
                            </Typography>
                        )}
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
