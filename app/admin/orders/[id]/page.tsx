'use client';

import { useState, useEffect, use } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    Button,
    Divider,
    Stack,
    CircularProgress,
    IconButton,
    Menu,
    MenuItem,
    Breadcrumbs,
    Avatar,
    Dialog,
    DialogContent,
    DialogActions,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    ArrowLeft,
    Call,
    Location,
    NoteText,
    TruckFast,
    WalletMoney,
    Printer,
    Edit2,
    ClipboardText,
    ProfileCircle,
    DocumentDownload
} from 'iconsax-react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import OrderReceipt from '@/components/order/OrderReceipt';
import { toPng } from "html-to-image";
import { useRef } from 'react';
import { useNotification } from '@/context/NotificationContext';

interface OrderItem {
    id: string;
    title: string;
    price: number;
    quantity: number;
    image: string | null;
    productId: string;
}

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
    adminNote?: string;
    trackingNumber?: string;
    createdAt: string;
    orderitem: OrderItem[];
}

const statusColors: Record<string, { bg: string; color: string; label: string }> = {
    'PENDING': { bg: '#FFF3E0', color: '#E65100', label: 'รอชำระเงิน' },
    'SLIP_UPLOADED': { bg: '#E3F2FD', color: '#1565C0', label: 'รอตรวจสอบยอด' },
    'CONFIRMED': { bg: '#EDE7F6', color: '#5E35B1', label: 'กำลังเตรียมสินค้า' },
    'SHIPPING': { bg: '#F3E5F5', color: '#7B1FA2', label: 'กำลังจัดส่ง' },
    'DELIVERED': { bg: '#E8F5E9', color: '#2E7D32', label: 'จัดส่งสำเร็จ' },
    'CANCELLED': { bg: '#FFEBEE', color: '#C62828', label: 'ยกเลิก' }
};

const shippingLabels: Record<string, string> = {
    'standard': 'ขนส่งมาตรฐาน',
    'express': 'ส่งด่วน (Lalamove/Grab)',
    'cod': 'เก็บเงินปลายทาง (COD)'
};

const paymentLabels: Record<string, string> = {
    'bank_transfer': 'โอนผ่านธนาคาร',
    'qr_code': 'QR Code (PromptPay)',
    'cod': 'เก็บเงินปลายทาง'
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [receiptOpen, setReceiptOpen] = useState(false);
    const { showNotification } = useNotification();
    const receiptRef = useRef<HTMLDivElement>(null);

    const [adminNote, setAdminNote] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${id}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data);
                setAdminNote(data.adminNote || '');
                setTrackingNumber(data.trackingNumber || '');
            }
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveReceipt = async () => {
        if (!receiptRef.current) return;
        try {
            const dataUrl = await toPng(receiptRef.current, {
                backgroundColor: '#FFFFFF',
                pixelRatio: 3,
                cacheBust: true,
                style: {
                    margin: '0',
                    transform: 'none',
                    width: '380px',
                }
            });
            const link = document.createElement('a');
            link.download = `receipt-${order?.id.slice(-8)}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        setUpdating(true);
        setAnchorEl(null);
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                showNotification('อัปเดตสถานะออเดอร์เรียบร้อยแล้ว', 'success');
                fetchOrder();
            } else {
                throw new Error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showNotification('เกิดข้อผิดพลาดในการอัปเดตสถานะ', 'error');
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateAdminInfo = async () => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminNote, trackingNumber })
            });

            if (res.ok) {
                showNotification('บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
                fetchOrder();
            } else {
                throw new Error('Failed to update admin info');
            }
        } catch (error) {
            console.error('Error updating admin info:', error);
            showNotification('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout title="รายละเอียดออเดอร์">
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}>
                    <CircularProgress sx={{ color: '#B76E79' }} />
                </Box>
            </AdminLayout>
        );
    }

    if (!order) {
        return (
            <AdminLayout title="รายละเอียดออเดอร์">
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="error">ไม่พบข้อมูลออเดอร์</Typography>
                    <Button component={Link} href="/admin/orders" startIcon={<ArrowLeft />} sx={{ mt: 2 }}>
                        กลับไปหน้ารายการ
                    </Button>
                </Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={`ออเดอร์ #${order.id.slice(-9).toUpperCase()}`}>
            {/* Header / Breadcrumbs */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Breadcrumbs sx={{ mb: 1 }}>
                        <Link href="/admin/orders" style={{ textDecoration: 'none', color: '#888', fontSize: '0.85rem' }}>รายการคำสั่งซื้อ</Link>
                        <Typography color="text.primary" sx={{ fontSize: '0.85rem' }}>#{order.id.slice(-9).toUpperCase()}</Typography>
                    </Breadcrumbs>
                    <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Prompt', color: '#1A1A1A' }}>
                        รายละเอียดออเดอร์
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<Printer size={20} color="#666" />}
                        onClick={() => setReceiptOpen(true)}
                        sx={{ borderRadius: '12px', textTransform: 'none', borderColor: '#DDD', color: '#666', '&:hover': { borderColor: '#B76E79', color: '#B76E79' } }}
                    >
                        พิมพ์ใบเสร็จ
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Edit2 size={20} color="#FFFFFF" />}
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        disabled={updating}
                        sx={{
                            bgcolor: '#B76E79',
                            borderRadius: '12px',
                            textTransform: 'none',
                            px: 3,
                            boxShadow: '0 8px 20px rgba(183, 110, 121, 0.2)',
                            '&:hover': { bgcolor: '#A45D68', boxShadow: '0 10px 24px rgba(183, 110, 121, 0.3)' }
                        }}
                    >
                        {updating ? 'กำลังปรับปรุง...' : 'เปลี่ยนสถานะ'}
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                        elevation={0}
                        sx={{
                            '& .MuiPaper-root': {
                                borderRadius: '12px',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                border: '1px solid rgba(0,0,0,0.05)',
                                mt: 1,
                                minWidth: 180
                            }
                        }}
                    >
                        {Object.entries(statusColors).map(([key, val]) => (
                            <MenuItem
                                key={key}
                                onClick={() => handleUpdateStatus(key)}
                                sx={{ py: 1.2, gap: 1.5, fontSize: '0.9rem' }}
                                selected={order.status === key}
                            >
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: val.color }} />
                                {val.label}
                            </MenuItem>
                        ))}
                    </Menu>
                </Stack>
            </Box>

            {/* Main Content using Box (Flex) instead of Grid */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, width: '100%' }}>
                {/* Left Column (Items and Totals) - Flex: 2 */}
                <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Order Status Card */}
                    <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#FFF' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                                p: 1.5,
                                borderRadius: '16px',
                                bgcolor: statusColors[order.status]?.bg || '#F5F5F5',
                                color: statusColors[order.status]?.color || '#666'
                            }}>
                                <ClipboardText size={28} variant="Bulk" color={statusColors[order.status]?.color || "#8E6D3F"} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>สถานะปัจจุบัน</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{statusColors[order.status]?.label || order.status}</Typography>
                                    <Chip
                                        label={new Date(order.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        size="small"
                                        variant="outlined"
                                        sx={{ height: 24, fontSize: '0.75rem', borderColor: 'rgba(0,0,0,0.1)' }}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </Paper>

                    {/* Items Card */}
                    <Paper elevation={0} sx={{ p: 0, borderRadius: '24px', border: '1px solid rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid #F5F5F5' }}>
                            <Typography variant="subtitle1" fontWeight={700}>รายการสินค้า ({order.orderitem.length})</Typography>
                        </Box>
                        <Box sx={{ p: 0 }}>
                            {order.orderitem.map((item, idx) => (
                                <Box key={item.id} sx={{
                                    p: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    borderBottom: idx === order.orderitem.length - 1 ? 'none' : '1px solid #F9F9F9',
                                    '&:hover': { bgcolor: '#FCFCFC' }
                                }}>
                                    <Avatar
                                        src={item.image || '/images/placeholder.webp'}
                                        variant="rounded"
                                        sx={{ width: 64, height: 64, bgcolor: '#F5F5F5', border: '1px solid #F0F0F0' }}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '1rem' }}>{item.title}</Typography>
                                        <Typography variant="caption" color="text.secondary">ID: {item.productId.slice(0, 8).toUpperCase()}</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography sx={{ fontWeight: 500, fontSize: '0.9rem', color: '#666' }}>฿{parseFloat(item.price.toString()).toLocaleString()} x {item.quantity}</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1A1A1A' }}>฿{(item.price * item.quantity).toLocaleString()}</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                        <Box sx={{ p: 4, bgcolor: '#FAFAFA' }}>
                            <Stack spacing={1.5} sx={{ maxWidth: 350, ml: 'auto' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="text.secondary">ยอดรวมสินค้า</Typography>
                                    <Typography fontWeight={600}>฿{parseFloat(order.subtotal.toString()).toLocaleString()}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography color="text.secondary">ค่าจัดส่ง</Typography>
                                        <Chip label={shippingLabels[order.shippingMethod]} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#EEE' }} />
                                    </Box>
                                    <Typography fontWeight={600}>
                                        {parseFloat(order.shippingCost.toString()) === 0
                                            ? (order.shippingMethod === 'cod' || order.shippingMethod === 'express' ? 'เก็บปลายทาง' : 'ฟรี')
                                            : `฿${parseFloat(order.shippingCost.toString()).toLocaleString()}`}
                                    </Typography>
                                </Box>
                                {parseFloat(order.discount.toString()) > 0 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#2E7D32' }}>
                                        <Typography>ส่วนลด</Typography>
                                        <Typography fontWeight={700}>-฿{parseFloat(order.discount.toString()).toLocaleString()}</Typography>
                                    </Box>
                                )}
                                <Divider sx={{ my: 1 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6" fontWeight={700}>ยอดสุทธิ</Typography>
                                    <Typography variant="h5" fontWeight={900} sx={{ color: '#B76E79' }}>
                                        ฿{parseFloat(order.grandTotal.toString()).toLocaleString()}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    </Paper>
                </Box>

                {/* Right Column (Customer and Logistics) - Flex: 1 */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Customer Info Card */}
                    <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid rgba(0,0,0,0.04)' }}>
                        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 3 }}>ข้อมูลลูกค้า</Typography>
                        <Stack spacing={3}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Avatar sx={{ bgcolor: '#FDF7F8', color: '#B76E79', width: 48, height: 48 }}>
                                    <ProfileCircle size={32} variant="Bulk" color="#B76E79" />
                                </Avatar>
                                <Box>
                                    <Typography fontWeight={700}>{order.customerName}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>ลูกค้ารายย่อย</Typography>
                                </Box>
                            </Box>
                            <Divider />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Call size={24} color="#B76E79" variant="Bulk" />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>{order.tel}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                <Location size={24} color="#B76E79" variant="Bulk" />
                                <Typography variant="body2" sx={{ lineHeight: 1.6, color: '#444' }}>{order.address}</Typography>
                            </Box>
                            {order.note && (
                                <Box sx={{ p: 2, bgcolor: '#FFF9F0', borderRadius: '12px', border: '1px solid #FFE0B2', display: 'flex', gap: 1.5 }}>
                                    <NoteText size={18} color="#FF9800" variant="Bulk" />
                                    <Typography variant="caption" sx={{ color: '#E65100', fontWeight: 500 }}>{order.note}</Typography>
                                </Box>
                            )}
                        </Stack>
                    </Paper>

                    {/* Payment & Shipping Card */}
                    <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid rgba(0,0,0,0.04)' }}>
                        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 3 }}>การชำระเงิน & ขนส่ง</Typography>
                        <Stack spacing={3}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <WalletMoney size={24} color="#666" variant="Bulk" />
                                    <Typography variant="body2" color="text.secondary">ช่องทาง</Typography>
                                </Stack>
                                <Typography variant="body2" fontWeight={700}>{paymentLabels[order.paymentMethod]}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <TruckFast size={24} color="#666" variant="Bulk" />
                                    <Typography variant="body2" color="text.secondary">รูปแบบการส่ง</Typography>
                                </Stack>
                                <Typography variant="body2" fontWeight={700}>{shippingLabels[order.shippingMethod]}</Typography>
                            </Box>

                            <Divider />

                            {/* Tracking Number Input */}
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>เลขพัสดุ (Tracking Number)</Typography>
                                <TextField
                                    fullWidth
                                    placeholder="เช่น TH123456789"
                                    size="small"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                                    }}
                                />
                            </Box>

                            {/* Admin Note Input */}
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>บันทึกจากแอดมิน (Note to Customer)</Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    placeholder="พิมพ์ข้อความที่ต้องการแจ้งให้ลูกค้าทราบ..."
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                                    }}
                                />
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleUpdateAdminInfo}
                                disabled={updating}
                                sx={{
                                    bgcolor: '#1A1A1A',
                                    borderRadius: '12px',
                                    py: 1.5,
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    color: '#fff',
                                    '&:hover': { bgcolor: '#333' }
                                }}
                            >
                                {updating ? 'กำลังบันทึก...' : 'บันทึกข้อมูลการจัดส่ง & Note'}
                            </Button>

                            {order.slipUrl ? (
                                <Box sx={{ mt: 2 }}>
                                    <Divider sx={{ mb: 2 }} />
                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>หลักฐานการชำระเงิน</Typography>
                                    <Box sx={{
                                        position: 'relative',
                                        width: '100%',
                                        aspectRatio: '3/4',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        border: '1px solid #EEE',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                        '&:hover .overlay': { opacity: 1 }
                                    }} onClick={() => window.open(order.slipUrl, '_blank')}>
                                        <Image src={order.slipUrl} alt="Slip" fill style={{ objectFit: 'cover' }} />
                                        <Box className="overlay" sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            bgcolor: 'rgba(0,0,0,0.4)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: 0,
                                            transition: '0.3s'
                                        }}>
                                            <Typography color="#FFF" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>คลิกเพื่อดูรูปใหญ่</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            ) : (
                                <Box sx={{ mt: 2, p: 4, borderRadius: '16px', bgcolor: '#F9F9F9', textAlign: 'center', border: '1px dashed #DDD' }}>
                                    <Typography variant="caption" color="text.secondary">ยังไม่มีการแนบสลิป</Typography>
                                </Box>
                            )}
                        </Stack>
                    </Paper>
                </Box>
            </Box>
            {/* Receipt Preview Dialog */}
            <Dialog open={receiptOpen} onClose={() => setReceiptOpen(false)} maxWidth="xs" fullWidth scroll="body">
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={700}>ตัวอย่างใบเสร็จ</Typography>
                    <IconButton onClick={() => setReceiptOpen(false)} size="small">
                        <ArrowLeft size={20} variant="Bold" color="#B76E79" />
                    </IconButton>
                </Box>
                <DialogContent sx={{ p: 1, bgcolor: '#F5F5F5' }}>
                    <Box sx={{ py: 2 }}>
                        <OrderReceipt ref={receiptRef} order={order} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button
                        variant="outlined"
                        onClick={() => window.print()}
                        startIcon={<Printer size={20} variant="Bold" color="#B76E79" />}
                        sx={{ borderRadius: '10px', textTransform: 'none', flex: 1 }}
                    >
                        พิมพ์
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveReceipt}
                        startIcon={<DocumentDownload size={20} variant="Bold" color="#F5F5F5" />}
                        sx={{ borderRadius: '10px', textTransform: 'none', bgcolor: '#B76E79', flex: 1, '&:hover': { bgcolor: '#A45D68' } }}
                    >
                        บันทึกรูป
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    );
}
