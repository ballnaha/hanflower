'use client';

import { Box, Typography, Paper, Button } from '@mui/material';
import { ShoppingBag, Box as BoxIcon, Category, People, Setting2 } from 'iconsax-react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminDashboard() {
    const stats = [
        { label: 'ยอดขายวันนี้', value: '฿12,450', icon: ShoppingBag, color: '#B76E79' },
        { label: 'คำสั่งซื้อใหม่', value: '8', icon: BoxIcon, color: '#D4AF37' },
        { label: 'สินค้าทั้งหมด', value: '24', icon: Category, color: '#5D4037' },
        { label: 'ลูกค้าใหม่', value: '15', icon: People, color: '#A45D68' },
    ];

    return (
        <AdminLayout title="Dashboard">
            <Box sx={{ mb: 6 }}>
                <Typography variant="body1" sx={{ color: '#666' }}>
                    ภาพรวมของร้าน HanFlower ประจำวันที่ {new Date().toLocaleDateString('th-TH')}
                </Typography>
            </Box>

            {/* Stats Grid */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
                gap: 3,
                mb: 6
            }}>
                {stats.map((stat, idx) => (
                    <Paper key={idx} elevation={0} sx={{
                        p: 3,
                        borderRadius: '20px',
                        border: '1px solid rgba(0,0,0,0.03)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2.5,
                        bgcolor: '#FFFFFF'
                    }}>
                        <Box sx={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            bgcolor: `${stat.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <stat.icon size={28} color={stat.color} variant="Bulk" />
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 0.5 }}>
                                {stat.label}
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1A1A1A' }}>
                                {stat.value}
                            </Typography>
                        </Box>
                    </Paper>
                ))}
            </Box>

            {/* Placeholder for real management sections */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
                gap: 4
            }}>
                <Paper elevation={0} sx={{
                    p: 4,
                    borderRadius: '24px',
                    border: '1px solid rgba(0,0,0,0.03)',
                    minHeight: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    bgcolor: '#FFFFFF'
                }}>
                    <Box sx={{ opacity: 0.3, mb: 3 }}>
                        <Setting2 size={80} variant="Bulk" color="#B76E79" />
                    </Box>
                    <Typography variant="h6" sx={{ color: '#5D4037', mb: 1 }}>หน้าจัดการข้อมูลกำลังอยู่ในการพัฒนา</Typography>
                    <Typography variant="body2" sx={{ color: '#888', maxWidth: '300px' }}>
                        คุณสามารถจัดการสินค้า คำสั่งซื้อ และเนื้อหาเว็บไซต์ได้เร็วๆ นี้
                    </Typography>
                </Paper>

                <Paper elevation={0} sx={{
                    p: 4,
                    borderRadius: '24px',
                    border: '1px solid rgba(0,0,0,0.03)',
                    bgcolor: '#FFFFFF'
                }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>เมนูด่วน</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {['จัดการสินค้า', 'จัดการหมวดหมู่', 'ดูรายการคำสั่งซื้อ', 'จัดการ Our Customer', 'ตั้งค่าร้านค้า'].map((item) => (
                            <Button
                                key={item}
                                fullWidth
                                variant="text"
                                component={item === 'จัดการ Our Customer' ? Link : 'button'}
                                href={item === 'จัดการ Our Customer' ? '/admin/our-customer' : undefined}
                                sx={{
                                    justifyContent: 'flex-start',
                                    color: '#5D4037',
                                    py: 1.5,
                                    px: 2,
                                    borderRadius: '12px',
                                    '&:hover': { bgcolor: '#FFF9F8', color: '#B76E79' }
                                }}
                            >
                                {item}
                            </Button>
                        ))}
                    </Box>
                </Paper>
            </Box>
        </AdminLayout>
    );
}
