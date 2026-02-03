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
    'SLIP_UPLOADED': { bg: '#E3F2FD', color: '#1565C0', label: 'รอตรวจสอบยอด' },
    'CONFIRMED': { bg: '#EDE7F6', color: '#5E35B1', label: 'กำลังเตรียมสินค้า' },
    'SHIPPING': { bg: '#F3E5F5', color: '#7B1FA2', label: 'กำลังจัดส่ง' },
    'DELIVERED': { bg: '#E8F5E9', color: '#2E7D32', label: 'จัดส่งสำเร็จ' },
    'CANCELLED': { bg: '#FFEBEE', color: '#C62828', label: 'ยกเลิก' }
};

const shippingMethodLabels: Record<string, { label: string; color: string }> = {
    'standard': { label: 'ขนส่งมาตรฐาน', color: '#666' },
    'express': { label: 'ส่งด่วน (Lalamove/Grab)', color: '#B76E79' },
    'cod': { label: 'เก็บเงินปลายทาง (COD)', color: '#9C27B0' }
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
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                        มีรายการสั่งซื้อทั้งหมด {orders.length} รายการในระบบ
                    </Typography>
                </Box>
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
                    รีเฟรชข้อมูล
                </Button>
            </Box>

            {/* Filters and Search (Modern Card Style) */}
            <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <TextField
                    placeholder="ค้นหาชื่อ, เบอร์โทร, เลขออเดอร์..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                        flex: 1,
                        minWidth: { xs: '100%', sm: 280 },
                        '& .MuiOutlinedInput-root': {
                            bgcolor: '#F9F9F9',
                            borderRadius: '10px',
                            '& fieldset': { border: 'none' }
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchNormal1 size={18} color="#999" />
                            </InputAdornment>
                        ),
                    }}
                />

                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{
                            bgcolor: '#F9F9F9',
                            borderRadius: '10px',
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            fontSize: '0.85rem'
                        }}
                    >
                        <MenuItem value="all">ทุกสถานะ</MenuItem>
                        {Object.entries(statusColors).map(([key, val]) => (
                            <MenuItem key={key} value={key}>{val.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <Select
                        value={shippingFilter}
                        onChange={(e) => setShippingFilter(e.target.value)}
                        sx={{
                            bgcolor: '#F9F9F9',
                            borderRadius: '10px',
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            fontSize: '0.85rem'
                        }}
                    >
                        <MenuItem value="all">ทุกการจัดส่ง</MenuItem>
                        <MenuItem value="standard">ขนส่งมาตรฐาน</MenuItem>
                        <MenuItem value="express">ส่งด่วน (Grab/Lala)</MenuItem>
                        <MenuItem value="cod">ปลายทาง (COD)</MenuItem>
                    </Select>
                </FormControl>
            </Paper>

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
                <Paper elevation={0} sx={{ px: 3, py: 2, borderRadius: '16px', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#FFF' }}>
                    <TruckFast size={20} color="#9C27B0" variant="Bold" />
                    <Typography variant="body2" color="text.secondary">COD</Typography>
                    <Typography variant="h6" fontWeight={700} color="#9C27B0">
                        {orders.filter(o => o.shippingMethod === 'cod').length}
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
                                    <TableCell sx={{ fontWeight: 600 }}>ชำระเงิน</TableCell>
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
                                                    #{order.id.slice(-9).toUpperCase()}
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
                                                        variant={order.shippingMethod === 'express' || order.shippingMethod === 'cod' ? 'Bold' : 'Outline'}
                                                    />
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={order.shippingMethod === 'express' || order.shippingMethod === 'cod' ? 600 : 400}
                                                        sx={{ color: shippingMethodLabels[order.shippingMethod]?.color || '#666' }}
                                                    >
                                                        {shippingMethodLabels[order.shippingMethod]?.label || order.shippingMethod}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 700, color: order.paymentMethod === 'cod' ? '#9C27B0' : '#1A1A1A' }}>
                                                    {order.paymentMethod === 'bank_transfer' ? 'โอนเงิน' :
                                                        order.paymentMethod === 'qr_code' ? 'QR Code' :
                                                            order.paymentMethod === 'cod' ? 'ปลายทาง' : order.paymentMethod}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={700}>
                                                    ฿{parseFloat(order.grandTotal.toString()).toLocaleString()}
                                                </Typography>
                                                {parseFloat(order.shippingCost.toString()) === 0 && (order.shippingMethod === 'express' || order.shippingMethod === 'cod') && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '10px' }}>
                                                        + ค่าส่งปลายทาง
                                                    </Typography>
                                                )}
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
                                                <Link href={`/admin/orders/${order.id}`}>
                                                    <IconButton size="small" sx={{ color: '#B76E79', bgcolor: '#FFF4F5', '&:hover': { bgcolor: '#FDECEC' } }}>
                                                        <Eye size={18} variant="Bulk" color="#B76E79" />
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
