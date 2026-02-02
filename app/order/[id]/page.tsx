'use client';

import { Box, Container, Typography, Paper, Button, Divider, Stack, Alert, CircularProgress } from '@mui/material';
import { ArrowRight, Copy, TickCircle, Import, Gallery, TruckFast, Timer, DocumentDownload } from 'iconsax-react';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import html2canvas from 'html2canvas';

export default function OrderSuccessPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const invoiceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (params.id) {
            fetchOrder();
        }
    }, [params.id]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${params.id}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setOrder(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleUploadSlip = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // 1. Upload File
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const uploadData = await uploadRes.json();

            if (!uploadData.success) throw new Error('Upload failed');

            // 2. Update Order
            await fetch(`/api/orders/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'SLIP_UPLOADED',
                    slipUrl: uploadData.url
                })
            });

            // 3. Refresh
            fetchOrder();
            setFile(null);
        } catch (error) {
            alert('Failed to upload slip. please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText('012-3-45678-9');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopySummary = () => {
        const summary = `รายการสั่งซื้อ #${order.id}\nลูกค้า: ${order.customerName}\nโทร: ${order.tel}\nยอดรวม: ${parseFloat(order.grandTotal).toLocaleString()} บาท\n------------------\n${order.items.map((i: any) => `- ${i.title} x${i.quantity}`).join('\n')}`;
        navigator.clipboard.writeText(summary);
        alert('คัดลอกสรุปรายการสั่งซื้อแล้ว คุณสามารถนำไปวางใน LINE ได้ทันที');
    };

    const handleNotifyLine = () => {
        // Open LINE Add Friend page for fonms2
        window.open('https://line.me/ti/p/~fonms2', '_blank');
    };

    const handleSaveInvoice = async () => {
        if (!invoiceRef.current) return;

        try {
            const canvas = await html2canvas(invoiceRef.current, {
                backgroundColor: '#FFFFFF',
                scale: 2, // Higher quality
                useCORS: true,
                logging: false
            });

            const link = document.createElement('a');
            link.download = `invoice-${order.id}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Error saving invoice:', error);
            alert('ไม่สามารถบันทึก Invoice ได้ กรุณาลองอีกครั้ง');
        }
    };

    if (loading) return <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>;
    if (!order) return <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Typography>Order not found</Typography></Box>;

    return (
        <Box sx={{ bgcolor: '#F5F5F5', minHeight: '100vh' }}>
            <Header />

            <Container maxWidth="sm" sx={{ py: { xs: 12, md: 14 } }}>
                {/* Success Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box sx={{
                        width: 64, height: 64, borderRadius: '50%', bgcolor: '#E8F5E9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2
                    }}>
                        <TickCircle size={32} variant="Bold" color="#4CAF50" />
                    </Box>
                    <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, color: '#1A1A1A' }}>
                        สั่งซื้อสำเร็จ!
                    </Typography>
                </Box>

                {/* =============== MOBILE RECEIPT INVOICE =============== */}
                <Box ref={invoiceRef} sx={{
                    maxWidth: 380,
                    mx: 'auto',
                    bgcolor: '#FFFFFF',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
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
                                    #{order.id.slice(-8).toUpperCase()}
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
                                <TruckFast size={16} color={order.shippingMethod === 'express' ? '#B76E79' : '#666'} variant="Bold" />
                                <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem', color: order.shippingMethod === 'express' ? '#B76E79' : '#1A1A1A' }}>
                                    {order.shippingMethod === 'express' ? 'ส่งด่วน (Lalamove/Grab)' : 'ขนส่งพัสดุ (1-2 วัน)'}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Products */}
                        <Box sx={{ py: 1.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', mb: 1 }}>
                                รายการสินค้า
                            </Typography>
                            {order.items.map((item: any) => (
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
                                        ฿{parseFloat(item.price).toLocaleString()}
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
                                bgcolor: '#F5F5F5',
                                borderRadius: '50%',
                                top: -8
                            },
                            '&::before': { left: -26 },
                            '&::after': { right: -26 }
                        }} />

                        {/* Price Summary */}
                        <Stack spacing={0.75}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>ยอดรวมสินค้า</Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>฿{parseFloat(order.subtotal).toLocaleString()}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                    ค่าจัดส่ง {order.shippingMethod === 'express' && '(ด่วน)'}
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>฿{parseFloat(order.shippingCost).toLocaleString()}</Typography>
                            </Box>
                            {parseFloat(order.discount) > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#06C755' }}>
                                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>ส่วนลด</Typography>
                                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>-฿{parseFloat(order.discount).toLocaleString()}</Typography>
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
                                ฿{parseFloat(order.grandTotal).toLocaleString()}
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
                            LINE: fonms2 | ขอบคุณที่ใช้บริการค่ะ 🌸
                        </Typography>
                    </Box>
                </Box>
                {/* =============== END MOBILE RECEIPT =============== */}

                {/* Action Buttons */}
                <Stack spacing={1.5} sx={{ mt: 3 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleNotifyLine}
                        startIcon={<Image src="/images/line.png" alt="LINE" width={20} height={20} />}
                        sx={{
                            bgcolor: '#06C755',
                            borderRadius: '12px',
                            textTransform: 'none',
                            py: 1.5,
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            '&:hover': { bgcolor: '#05B54C' }
                        }}
                    >
                        แจ้งโอนเงินทาง LINE
                    </Button>
                    <Stack direction="row" spacing={1.5}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleCopySummary}
                            startIcon={<Copy size={18} color="#666" />}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                py: 1.2,
                                borderColor: '#DDD',
                                color: '#666',
                                fontSize: '0.8rem',
                                '&:hover': { bgcolor: '#F5F5F5', borderColor: '#CCC', color: '#444' }
                            }}
                        >
                            คัดลอก
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleSaveInvoice}
                            startIcon={<DocumentDownload size={18} color="#B76E79" />}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                py: 1.2,
                                borderColor: '#B76E79',
                                color: '#B76E79',
                                fontSize: '0.8rem',
                                '&:hover': { bgcolor: '#FFF5F6', borderColor: '#9D5D66', color: '#9D5D66' }
                            }}
                        >
                            บันทึก
                        </Button>
                    </Stack>
                </Stack>

            </Container>

        </Box>
    );
}
