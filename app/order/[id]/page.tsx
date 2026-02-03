'use client';

import { Box, Container, Typography, Paper, Button, Divider, Stack, Alert, CircularProgress } from '@mui/material';
import { ArrowRight, Copy, TickCircle, Import, Gallery, TruckFast, Timer, DocumentDownload } from 'iconsax-react';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';
import OrderReceipt from '@/components/order/OrderReceipt';

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
        const summary = `รายการสั่งซื้อ #${order.id}\nลูกค้า: ${order.customerName}\nโทร: ${order.tel}\nยอดรวม: ${parseFloat(order.grandTotal).toLocaleString()} บาท\n------------------\n${(order.items || []).map((i: any) => `- ${i.title} x${i.quantity}`).join('\n')}`;
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

            <Container maxWidth="sm" sx={{ py: { xs: 12, md: 14 } }}>
                {/* Success Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box sx={{
                        width: 64, height: 64, borderRadius: '50%', bgcolor: '#E8F5E9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2
                    }}>
                        <TickCircle size={32} variant="Bold" color="#4CAF50" />
                    </Box>
                    <Typography variant="h5" sx={{ fontFamily: 'Prompt', fontWeight: 700, color: '#1A1A1A' }}>
                        สั่งซื้อสำเร็จ!
                    </Typography>
                </Box>

                {/* =============== MOBILE RECEIPT INVOICE =============== */}
                <OrderReceipt ref={invoiceRef} order={order} />
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
