'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel, CircularProgress, Button } from '@mui/material';
import { SearchNormal1, Eye, TruckFast, Refresh2 } from 'iconsax-react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';

interface Order {
    id: string;
    customerName: string;
    tel: string;
    email?: string;
    address: string;
    note?: string;
    subtotal: number;
    shippingCost: number;
    shippingMethod: string;
    discount: number;
    grandTotal: number;
    status: string;
    paymentMethod: string;
    slipUrl?: string;
    createdAt: string;
    items: any[];
}

const statusColors: Record<string, { bg: string; color: string; label: string }> = {
    'PENDING': { bg: '#FFF3E0', color: '#E65100', label: 'รอชำระเงิน' },
    'SLIP_UPLOADED': { bg: '#E3F2FD', color: '#1565C0', label: 'แนบสลิปแล้ว' },
    'CONFIRMED': { bg: '#E8F5E9', color: '#2E7D32', label: 'ยืนยันแล้ว' },
    'SHIPPING': { bg: '#F3E5F5', color: '#7B1FA2', label: 'กำลังจัดส่ง' },
    'DELIVERED': { bg: '#E0F2F1', color: '#00695C', label: 'ส่งแล้ว' },
    'CANCELLED': { bg: '#FFEBEE', color: '#C62828', label: 'ยกเลิก' }
};

const shippingMethodLabels: Record<string, { label: string; color: string }> = {
    'standard': { label: 'ขนส่งมาตรฐาน', color: '#666' },
    'express': { label: 'ส่งด่วน', color: '#B76E79' }
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [shippingFilter, setShippingFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            if (Array.isArray(data)) {
                setOrders(data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.tel.includes(searchTerm) ||
            order.id.includes(searchTerm);
        const matchStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchShipping = shippingFilter === 'all' || order.shippingMethod === shippingFilter;
        return matchSearch && matchStatus && matchShipping;
    });

    return (
        <AdminLayout title="รายการคำสั่งซื้อ">
            {/* Filters */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                <TextField
                    placeholder="ค้นหาชื่อ, เบอร์โทร, เลขออเดอร์..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{
                        minWidth: 280,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            bgcolor: '#FFF'
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchNormal1 size={18} color="#888" />
                            </InputAdornment>
                        )
                    }}
                />

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>สถานะ</InputLabel>
                    <Select
                        value={statusFilter}
                        label="สถานะ"
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{ borderRadius: '12px', bgcolor: '#FFF' }}
                    >
                        <MenuItem value="all">ทั้งหมด</MenuItem>
                        {Object.entries(statusColors).map(([key, val]) => (
                            <MenuItem key={key} value={key}>{val.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>การจัดส่ง</InputLabel>
                    <Select
                        value={shippingFilter}
                        label="การจัดส่ง"
                        onChange={(e) => setShippingFilter(e.target.value)}
                        sx={{ borderRadius: '12px', bgcolor: '#FFF' }}
                    >
                        <MenuItem value="all">ทั้งหมด</MenuItem>
                        <MenuItem value="standard">ขนส่งมาตรฐาน</MenuItem>
                        <MenuItem value="express">ส่งด่วน</MenuItem>
                    </Select>
                </FormControl>

                <Button
                    variant="outlined"
                    startIcon={<Refresh2 size={18} />}
                    onClick={fetchOrders}
                    sx={{
                        borderRadius: '12px',
                        borderColor: '#DDD',
                        color: '#666',
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#F5F5F5', borderColor: '#CCC' }
                    }}
                >
                    รีเฟรช
                </Button>
            </Box>

            {/* Summary Stats */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                <Paper elevation={0} sx={{ px: 3, py: 2, borderRadius: '16px', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#FFF' }}>
                    <Typography variant="body2" color="text.secondary">ทั้งหมด</Typography>
                    <Typography variant="h6" fontWeight={700}>{orders.length}</Typography>
                </Paper>
                <Paper elevation={0} sx={{ px: 3, py: 2, borderRadius: '16px', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#FFF' }}>
                    <TruckFast size={20} color="#B76E79" variant="Bold" />
                    <Typography variant="body2" color="text.secondary">ส่งด่วน</Typography>
                    <Typography variant="h6" fontWeight={700} color="#B76E79">
                        {orders.filter(o => o.shippingMethod === 'express').length}
                    </Typography>
                </Paper>
            </Box>

            {/* Orders Table */}
            <Paper elevation={0} sx={{ borderRadius: '20px', border: '1px solid rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>เลขออเดอร์</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>ลูกค้า</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>การจัดส่ง</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>ยอดรวม</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>สถานะ</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>วันที่</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600 }}>จัดการ</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#888' }}>
                                            ไม่พบรายการคำสั่งซื้อ
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <TableRow key={order.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                                                    #{order.id.slice(-8).toUpperCase()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600}>{order.customerName}</Typography>
                                                <Typography variant="caption" color="text.secondary">{order.tel}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <TruckFast
                                                        size={16}
                                                        color={shippingMethodLabels[order.shippingMethod]?.color || '#666'}
                                                        variant={order.shippingMethod === 'express' ? 'Bold' : 'Outline'}
                                                    />
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={order.shippingMethod === 'express' ? 600 : 400}
                                                        sx={{ color: shippingMethodLabels[order.shippingMethod]?.color || '#666' }}
                                                    >
                                                        {shippingMethodLabels[order.shippingMethod]?.label || order.shippingMethod}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={700}>
                                                    ฿{parseFloat(order.grandTotal.toString()).toLocaleString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={statusColors[order.status]?.label || order.status}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: statusColors[order.status]?.bg || '#F5F5F5',
                                                        color: statusColors[order.status]?.color || '#666',
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem',
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {new Date(order.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(order.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Link href={`/order/${order.id}`} target="_blank">
                                                    <IconButton size="small" sx={{ color: '#B76E79' }}>
                                                        <Eye size={18} />
                                                    </IconButton>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </AdminLayout>
    );
}
