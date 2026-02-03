'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Menu,
    MenuItem,
    CircularProgress,
    Tooltip
} from '@mui/material';
import {
    Add,
    Edit2,
    Trash,
    More,
    Ticket,
    Copy
} from 'iconsax-react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { useNotification } from '@/context/NotificationContext';
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog';

interface Coupon {
    id: string;
    code: string;
    discount: string;
    type: 'percent' | 'fixed';
    minSpend: string;
    maxDiscount: string;
    limit: number | null;
    used: number;
    expireAt: string | null;
    isActive: boolean;
}

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const { showSuccess, showError, showWarning } = useNotification();

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/coupons');
            if (res.ok) {
                const data = await res.json();
                setCoupons(data);
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = () => {
        handleMenuClose();
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedCoupon) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/coupons/${selectedCoupon}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setCoupons(prev => prev.filter(c => c.id !== selectedCoupon));
                showSuccess('ลบคูปองเรียบร้อยแล้ว');
                setOpenDeleteDialog(false);
            } else {
                showError('เกิดข้อผิดพลาดในการลบคูปอง');
            }
        } catch (error) {
            console.error('Error deleting coupon:', error);
            showError('ไม่สามารถลบคูปองได้');
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
        setAnchorEl(event.currentTarget);
        setSelectedCoupon(id);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedCoupon(null);
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'ไม่มีวันหมดอายุ';
        const date = new Date(dateStr);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isExpired = (dateStr: string | null) => {
        if (!dateStr) return false;
        return new Date(dateStr) < new Date();
    };

    return (
        <AdminLayout title="ตั้งค่าคูปองส่วนลด">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                        จัดการคูปองและรหัสส่วนลดทั้งหมด ({coupons.length})
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    component={Link}
                    href="/admin/coupons/new"
                    startIcon={<Add size={20} color="#FFFFFF" variant="Linear" />}
                    sx={{
                        bgcolor: '#B76E79',
                        borderRadius: '12px',
                        textTransform: 'none',
                        px: 3,
                        boxShadow: '0 10px 20px rgba(183, 110, 121, 0.2)',
                        '&:hover': { bgcolor: '#A45D68', boxShadow: '0 12px 24px rgba(183, 110, 121, 0.3)' }
                    }}
                >
                    สร้างคูปองใหม่
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '20px', border: '1px solid rgba(0,0,0,0.03)', bgcolor: '#FFFFFF' }}>
                <Table sx={{ width: '100%' }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                            <TableCell sx={{ fontWeight: 700, color: '#1A1A1A', py: 2.5 }}>รหัสคูปอง</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1A1A1A' }}>ส่วนลด</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1A1A1A' }}>เงื่อนไข</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1A1A1A' }}>การใช้งาน</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1A1A1A' }}>สถานะ</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#1A1A1A' }}>จัดการ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                    <CircularProgress size={30} sx={{ color: '#B76E79' }} />
                                    <Typography sx={{ mt: 2, color: '#888' }}>กำลังโหลดข้อมูล...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : coupons.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 12 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <Ticket size={80} variant="Bulk" color="#E0E0E0" />
                                        <Typography sx={{ mt: 2, color: '#888', fontWeight: 500 }}>
                                            ยังไม่มีคูปอง
                                        </Typography>
                                        <Button
                                            component={Link}
                                            href="/admin/coupons/new"
                                            sx={{ mt: 1, color: '#B76E79' }}
                                        >
                                            สร้างคูปองใบแรก
                                        </Button>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            coupons.map((coupon) => {
                                const expired = isExpired(coupon.expireAt);
                                return (
                                    <TableRow key={coupon.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{
                                                    p: 1,
                                                    borderRadius: '8px',
                                                    bgcolor: '#FFF5F5',
                                                    color: '#B76E79',
                                                    border: '1px dashed #B76E79'
                                                }}>
                                                    <Ticket size={20} variant="Bold" color="#B76E79" />
                                                </Box>
                                                <Box>
                                                    <Typography sx={{ fontWeight: 700, color: '#1A1A1A', fontFamily: 'monospace', letterSpacing: 1 }}>
                                                        {coupon.code}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#888' }}>
                                                        หมดเขต: {formatDate(coupon.expireAt)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontWeight: 600, color: '#B76E79' }}>
                                                {coupon.type === 'percent' ? `${parseFloat(coupon.discount)}%` : `฿${parseFloat(coupon.discount)}`}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {coupon.type === 'percent' && coupon.maxDiscount ? `ลดสูงสุด ฿${coupon.maxDiscount}` : ''}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.primary">
                                                ขั้นต่ำ ฿{parseFloat(coupon.minSpend).toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body2">
                                                    {coupon.used} / {coupon.limit || '∞'}
                                                </Typography>
                                                {coupon.limit && coupon.used >= coupon.limit && (
                                                    <Chip label="ครบแล้ว" size="small" color="error" variant="outlined" sx={{ height: 20, fontSize: '0.6rem' }} />
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={!coupon.isActive ? 'ปิดใช้งาน' : expired ? 'หมดอายุ' : 'ใช้งานได้'}
                                                size="small"
                                                sx={{
                                                    bgcolor: !coupon.isActive ? '#EEE' : expired ? '#FFF2F0' : '#F6FFED',
                                                    color: !coupon.isActive ? '#999' : expired ? '#FF4D4F' : '#52C41A',
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, coupon.id)}>
                                                <More size={20} color="#B76E79" variant="Outline" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                elevation={0}
                sx={{
                    '& .MuiPaper-root': {
                        borderRadius: '12px',
                        minWidth: 150,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                        border: '1px solid rgba(0,0,0,0.03)',
                        mt: 1
                    }
                }}
            >
                <MenuItem
                    onClick={handleMenuClose}
                    component={Link}
                    href={`/admin/coupons/${selectedCoupon}`}
                    sx={{ gap: 1.5, py: 1.2, color: '#5D4037', fontSize: '0.85rem' }}
                >
                    <Edit2 size={18} color="#B76E79" variant="Bulk" /> แก้ไขข้อมูล
                </MenuItem>
                <MenuItem
                    onClick={handleDeleteClick}
                    disabled={deleting}
                    sx={{ gap: 1.5, py: 1.2, color: '#FF4D4F', fontSize: '0.85rem' }}
                >
                    <Trash size={18} color="#FF4D4F" variant="Bulk" /> ลบคูปอง
                </MenuItem>
            </Menu>

            <AdminConfirmDialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                onConfirm={handleConfirmDelete}
                title="ยืนยันการลบคูปอง"
                message="คุณแน่ใจหรือไม่ว่าต้องการลบคูปองนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
                isLoading={deleting}
            />
        </AdminLayout>
    );
}
