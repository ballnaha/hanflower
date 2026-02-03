'use client';

import { Box, Typography, Stack } from '@mui/material';
import { TruckFast } from 'iconsax-react';
import Image from 'next/image';
import { forwardRef } from 'react';

interface OrderItem {
    id: string;
    title: string;
    price: number;
    quantity: number;
    image: string | null;
}

interface Order {
    id: string;
    customerName: string;
    tel: string;
    createdAt: string;
    shippingMethod: string;
    subtotal: number;
    shippingCost: number;
    discount: number;
    grandTotal: number;
    items?: OrderItem[];
    orderitem?: OrderItem[];
}

interface OrderReceiptProps {
    order: Order;
}

const OrderReceipt = forwardRef<HTMLDivElement, OrderReceiptProps>(({ order }, ref) => {
    const items = order.items || order.orderitem || [];

    return (
        <Box ref={ref} sx={{
            maxWidth: 380,
            mx: 'auto',
            bgcolor: '#FFFFFF',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid #EEE'
        }}>
            {/* Receipt Header */}
            <Box sx={{
                bgcolor: '#FFFFFF',
                p: 2,
                textAlign: 'center',
                borderBottom: '1px solid #F0F0F0'
            }}>
                <Box sx={{ position: 'relative', width: 120, height: 40, mx: 'auto' }}>
                    <Image src="/images/logo5.png" alt="HAN FLOWER" fill style={{ objectFit: 'contain' }} />
                </Box>
            </Box>

            {/* Receipt Body */}
            <Box sx={{ p: 2.5 }}>
                {/* Order Info Row */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1.5,
                    borderBottom: '1px dashed #E8E8E8'
                }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            เลขที่ออเดอร์
                        </Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            #{order.id.slice(-9).toUpperCase()}
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            วันที่
                        </Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                            {new Date(order.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </Typography>
                    </Box>
                </Box>

                {/* Customer Info */}
                <Box sx={{ py: 1.5, borderBottom: '1px dashed #E8E8E8' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', mb: 0.5 }}>
                        ลูกค้า
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.9rem' }}>{order.customerName}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{order.tel}</Typography>
                </Box>

                {/* Shipping Method */}
                <Box sx={{ py: 1.5, borderBottom: '1px dashed #E8E8E8' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', mb: 0.5 }}>
                        รูปแบบการจัดส่ง
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TruckFast size={16} color={order.shippingMethod === 'express' || order.shippingMethod === 'cod' ? '#B76E79' : '#666'} variant="Bold" />
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem', color: order.shippingMethod === 'express' || order.shippingMethod === 'cod' ? '#B76E79' : '#1A1A1A' }}>
                            {order.shippingMethod === 'express' ? 'ส่งด่วน (Lalamove/Grab)' :
                                order.shippingMethod === 'cod' ? 'เก็บเงินปลายทาง (COD)' :
                                    'ขนส่งพัสดุ (1-2 วัน)'}
                        </Typography>
                    </Box>
                </Box>

                {/* Products */}
                <Box sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', mb: 1 }}>
                        รายการสินค้า
                    </Typography>
                    {items.map((item) => (
                        <Box key={item.id} sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            py: 1
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1 }}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    bgcolor: '#F5F5F5',
                                    flexShrink: 0,
                                    position: 'relative'
                                }}>
                                    {item.image && <Image src={item.image} alt={item.title} fill style={{ objectFit: 'cover' }} />}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" sx={{
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                        lineHeight: 1.4
                                    }}>
                                        {item.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                        x{item.quantity}
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem', flexShrink: 0, ml: 1 }}>
                                ฿{parseFloat(item.price.toString()).toLocaleString()}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* Dotted Receipt Divider */}
                <Box sx={{
                    borderTop: '2px dotted #E0E0E0',
                    my: 1.5,
                    position: 'relative',
                    '&::before, &::after': {
                        content: '""',
                        position: 'absolute',
                        width: 14,
                        height: 14,
                        bgcolor: '#FFFFFF', // This might need to change if used in modal
                        borderRadius: '50%',
                        top: -8,
                        border: '1px solid #EEE'
                    },
                    '&::before': { left: -32 },
                    '&::after': { right: -32 }
                }} />

                {/* Price Summary */}
                <Stack spacing={0.75}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>ยอดรวมสินค้า</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>฿{parseFloat(order.subtotal.toString()).toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                            ค่าจัดส่ง {order.shippingMethod === 'express' && '(ด่วน)'}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                            {parseFloat(order.shippingCost.toString()) === 0 && (order.shippingMethod === 'express' || order.shippingMethod === 'cod')
                                ? 'เก็บปลายทาง'
                                : `฿${parseFloat(order.shippingCost.toString()).toLocaleString()}`}
                        </Typography>
                    </Box>
                    {parseFloat(order.discount.toString()) > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#06C755' }}>
                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>ส่วนลด</Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>-฿{parseFloat(order.discount.toString()).toLocaleString()}</Typography>
                        </Box>
                    )}
                </Stack>

                {/* Grand Total */}
                <Box sx={{
                    mt: 2,
                    p: 2,
                    background: 'linear-gradient(135deg, #FFF5F6 0%, #FFF 100%)',
                    borderRadius: '12px',
                    border: '1px solid #FFE4E6',
                    textAlign: 'center'
                }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        ยอดชำระทั้งสิ้น
                    </Typography>
                    <Typography sx={{
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        color: '#B76E79',
                        fontFamily: 'Inter, sans-serif',
                        lineHeight: 1.2
                    }}>
                        ฿{parseFloat(order.grandTotal.toString()).toLocaleString()}
                    </Typography>
                </Box>
            </Box>

            {/* Receipt Footer */}
            <Box sx={{
                p: 1.5,
                bgcolor: '#FAFAFA',
                textAlign: 'center',
                borderTop: '1px solid #F0F0F0'
            }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block' }}>
                    ขอบคุณที่ใช้บริการค่ะ 🌸
                </Typography>
            </Box>
        </Box>
    );
});

OrderReceipt.displayName = 'OrderReceipt';

export default OrderReceipt;
