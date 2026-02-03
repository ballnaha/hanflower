'use client';

import {
    Box,
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    Stack,
    Divider,
    CircularProgress,
    Fade,
    Alert,
    IconButton,
    InputAdornment,
    Breadcrumbs,
    Chip,
    Stepper,
    Step,
    StepLabel,
    StepContent
} from '@mui/material';
import {
    SearchNormal1,
    Receipt21,
    GalleryAdd,
    TickCircle,
    CalendarEdit,
    WalletMoney,
    ArrowRight,
    CloseCircle,
    Copy,
    TruckFast,
    InfoCircle,
    Timer,
    NoteText,
    MessageQuestion,
    Hashtag,
    Call
} from 'iconsax-react';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function PaymentNotificationPage() {
    const [orderId, setOrderId] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<any>(null);
    const [error, setError] = useState('');

    // Upload State
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [copied, setCopied] = useState(false);
    const [paymentSettings, setPaymentSettings] = useState<any>(null);
    const [isReuploading, setIsReuploading] = useState(false);

    const resizeImage = (file: File, maxWidth: number = 1200, maxHeight: number = 1200): Promise<File> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = document.createElement('img');
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');

                    if (file.type !== 'image/png') {
                        ctx!.fillStyle = '#FFFFFF';
                        ctx!.fillRect(0, 0, width, height);
                    }

                    ctx?.drawImage(img, 0, 0, width, height);

                    const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            resolve(file);
                            return;
                        }
                        const resizedFile = new File([blob], file.name, {
                            type: mimeType,
                            lastModified: Date.now(),
                        });
                        resolve(resizedFile);
                    }, mimeType, mimeType === 'image/jpeg' ? 0.85 : undefined);
                };
                img.onerror = () => resolve(file);
            };
            reader.onerror = () => resolve(file);
        });
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/payment-settings');
                if (res.ok) {
                    const data = await res.json();
                    setPaymentSettings(data);
                }
            } catch (err) {
                console.error('Failed to fetch payment settings:', err);
            }
        };
        fetchSettings();
    }, []);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const cleanId = orderId.trim().replace(/^#/, '');
        if (!cleanId) return;

        setLoading(true);
        setError('');
        setOrder(null);
        setSuccess(false);

        try {
            const res = await fetch(`/api/orders/${cleanId}?tel=${phoneNumber.trim()}`);
            const data = await res.json();

            if (res.ok) {
                setOrder(data);
            } else {
                setError(data.error || 'ไม่พบเลขออเดอร์นี้ กรุณาตรวจสอบอีกครั้ง');
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการตรวจสอบข้อมูล');
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

    const handleSubmitPayment = async () => {
        if (!file || !order) return;

        setUploading(true);
        try {
            // Resize Image before upload
            const resizedFile = await resizeImage(file);
            const formData = new FormData();
            formData.append('file', resizedFile);

            // 1. Upload File
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const uploadData = await uploadRes.json();

            if (!uploadData.success) throw new Error('Upload failed');

            // 2. Update Order
            const updateRes = await fetch(`/api/orders/${order.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'SLIP_UPLOADED',
                    slipUrl: uploadData.url
                })
            });

            if (updateRes.ok) {
                setSuccess(true);
                setOrder({ ...order, status: 'SLIP_UPLOADED', slipUrl: uploadData.url });
                setFile(null);
                setPreviewUrl(null);
                setIsReuploading(false);
            } else {
                throw new Error('Update failed');
            }
        } catch (err) {
            alert('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
        } finally {
            setUploading(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return { label: 'รอชำระเงิน', color: '#B76E79' };
            case 'SLIP_UPLOADED': return { label: 'รอตรวจสอบยอด', color: '#F2994A' };
            case 'CONFIRMED': return { label: 'กำลังเตรียมสินค้า', color: '#5E35B1' };
            case 'SHIPPING': return { label: 'กำลังจัดส่ง', color: '#7B1FA2' };
            case 'DELIVERED': return { label: 'จัดส่งสำเร็จ', color: '#2E7D32' };
            case 'CANCELLED': return { label: 'ยกเลิก', color: '#828282' };
            default: return { label: status, color: '#000' };
        }
    };

    const getStatusStep = (status: string) => {
        switch (status) {
            case 'PENDING': return 0; // รอชำระเงิน
            case 'SLIP_UPLOADED': return 1; // กําลังตรวจสอบ
            case 'CONFIRMED': return 1; // กําลังเตรียมสินค้า
            case 'SHIPPING': return 2; // กําลังจัดส่ง
            case 'DELIVERED': return 3; // จัดส่งสําเร็จ
            case 'CANCELLED': return -1;
            default: return 0;
        }
    };

    const steps = [
        { label: 'รอชำระเงิน', description: 'รอการชำระเงิน/แนบสลิป' },
        { label: 'กำลังเตรียมสินค้า', description: 'ตรวจสอบยอดและเตรียมสินค้า' },
        { label: 'กำลังจัดส่ง', description: 'สินค้าอยู่ระหว่างการขนส่ง' },
        { label: 'จัดส่งสำเร็จ', description: 'สินค้าถึงมือลูกค้าเรียบร้อย' },
    ];

    return (
        <Box sx={{ bgcolor: '#FFF', minHeight: '100vh', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(183, 110, 121, 0.05) 0%, rgba(255,255,255,0) 70%)' }}>

            <Container maxWidth="xl" sx={{ py: { xs: 12, md: 16 } }}>
                {/* Breadcrumbs */}
                <Breadcrumbs sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                    <Link href="/" style={{ textDecoration: 'none', color: '#888', fontSize: '0.9rem' }}>หน้าแรก</Link>
                    <Typography color="text.primary" sx={{ fontSize: '0.9rem' }}>ติดตามสถานะ & แจ้งโอน</Typography>
                </Breadcrumbs>

                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography variant="h3" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, mb: 2, color: '#1A1A1A' }}>
                        ติดตามสถานะ <span style={{ fontStyle: 'italic', color: '#B76E79' }}>& แจ้งโอน</span>
                    </Typography>
                    <Typography color="text.secondary" variant="body1">
                        ตรวจสอบสถานะคำสั่งซื้อและแนบหลักฐานการโอนเงินได้ในที่เดียว
                    </Typography>
                </Box>

                {!order ? (
                    <Fade in={true}>
                        <Paper elevation={0} sx={{
                            p: { xs: 3, md: 6 },
                            borderRadius: '32px',
                            border: '1px solid rgba(0,0,0,0.06)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.03)',
                            maxWidth: 600,
                            mx: 'auto'
                        }}>
                            <form onSubmit={handleSearch}>
                                <Stack spacing={4}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Box sx={{
                                            width: 64, height: 64, borderRadius: '20px', bgcolor: 'rgba(183, 110, 121, 0.08)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2
                                        }}>
                                            <SearchNormal1 size={32} color="#B76E79" variant="Bulk" />
                                        </Box>
                                        <Typography variant="h6" fontWeight={700}>เช็คสถานะออเดอร์</Typography>
                                        <Typography variant="body2" color="text.secondary">กรอกหมายเลขคำสั่งซื้อที่ส่งทาง SMS/Email เพื่อติดตามหรือแจ้งโอน</Typography>
                                    </Box>

                                    <TextField
                                        fullWidth
                                        placeholder="เช่น 46380-427"
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value)}
                                        variant="outlined"
                                        disabled={loading}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '16px',
                                                bgcolor: '#FAFAFA',
                                                fontSize: '1.2rem',
                                                fontWeight: 600,
                                                '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' },
                                                '&:hover fieldset': { borderColor: '#B76E79' },
                                                '&.Mui-focused fieldset': { borderColor: '#B76E79', borderWidth: '2px' }
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Hashtag size={20} color="#B76E79" />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <SearchNormal1 size={20} color="#B76E79" />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        placeholder="เบอร์โทรศัพท์(08xxxxxxxxx)"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        variant="outlined"
                                        disabled={loading}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '16px',
                                                bgcolor: '#FAFAFA',
                                                fontSize: '1.2rem',
                                                fontWeight: 600,
                                                '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' },
                                                '&:hover fieldset': { borderColor: '#B76E79' },
                                                '&.Mui-focused fieldset': { borderColor: '#B76E79', borderWidth: '2px' }
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Call size={20} color="#B76E79" variant='Outline' />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    {error && (
                                        <Fade in={true}>
                                            <Box sx={{
                                                p: 3,
                                                borderRadius: '20px',
                                                bgcolor: '#FFF5F5',
                                                border: '1px dashed #EF5350',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 1,
                                                textAlign: 'center'
                                            }}>
                                                <Box sx={{
                                                    width: 40, height: 40, borderRadius: '50%',
                                                    bgcolor: '#FFEBEE', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5
                                                }}>
                                                    <CloseCircle size={24} color="#D32F2F" variant="Bulk" />
                                                </Box>
                                                <Typography variant="subtitle2" sx={{ color: '#D32F2F', fontWeight: 700 }}>
                                                    ไม่พบข้อมูลคำสั่งซื้อ
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    กรุณาตรวจสอบเลขคำสั่งซื้อและเบอร์โทรศัพท์อีกครั้ง <br /> หรือติดต่อแอดมินหากไม่มั่นใจ
                                                </Typography>
                                            </Box>
                                        </Fade>
                                    )}

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onClick={() => handleSearch()}
                                        disabled={loading || !orderId.trim()}
                                        sx={{
                                            bgcolor: '#1A1A1A',
                                            color: '#FFF',
                                            py: 2,
                                            borderRadius: '16px',
                                            fontWeight: 700,
                                            textTransform: 'none',
                                            '&:hover': { bgcolor: '#000' }
                                        }}
                                    >
                                        {loading ? <CircularProgress size={24} color="inherit" /> : 'ตรวจสอบข้อมูล'}
                                    </Button>

                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            มีปัญหาในการค้นหา? <Link href="https://line.me/ti/p/~fonms2" style={{ color: '#B76E79', fontWeight: 600 }}>ติดต่อแอดมินทาง LINE</Link>
                                        </Typography>
                                    </Box>
                                </Stack>
                            </form>
                        </Paper>
                    </Fade>
                ) : (
                    <Fade in={true}>
                        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                            <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                                {/* Left Column: Order Tracking & Status */}
                                <Box sx={{ flex: 1 }}>
                                    <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid rgba(0,0,0,0.06)', mb: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                            <Typography variant="subtitle2" color="text.secondary">ความคืบหน้าออเดอร์</Typography>
                                            <Chip
                                                label={getStatusLabel(order.status).label}
                                                size="small"
                                                sx={{
                                                    bgcolor: getStatusLabel(order.status).color + '15',
                                                    color: getStatusLabel(order.status).color,
                                                    fontWeight: 700,
                                                    fontSize: '0.75rem'
                                                }}
                                            />
                                        </Box>

                                        <Stepper activeStep={getStatusStep(order.status)} orientation="vertical" sx={{ mb: 4 }}>
                                            {steps.map((step, index) => (
                                                <Step key={step.label}>
                                                    <StepLabel
                                                        StepIconProps={{
                                                            sx: {
                                                                '&.Mui-active': { color: '#B76E79' },
                                                                '&.Mui-completed': { color: '#27AE60' }
                                                            }
                                                        }}
                                                    >
                                                        <Typography variant="body2" fontWeight={600}>{step.label}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{step.description}</Typography>
                                                    </StepLabel>
                                                </Step>
                                            ))}
                                        </Stepper>

                                        {/* Admin Note Section */}
                                        {order.adminNote && (
                                            <Box sx={{ p: 2, bgcolor: '#FFF9F0', borderRadius: '16px', border: '1px solid #FFE4BC', mb: 3 }}>
                                                <Typography variant="caption" color="#B58105" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                                    <InfoCircle size={14} variant="Bold" /> ข้อความจากแอดมิน:
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#856404', fontStyle: 'italic' }}>
                                                    "{order.adminNote}"
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Tracking Info */}
                                        {(order.status === 'SHIPPING' || order.status === 'DELIVERED') && order.trackingNumber && (
                                            <Box sx={{ p: 2, bgcolor: '#F0F7FF', borderRadius: '16px', border: '1px solid #CEE5FF', mb: 3 }}>
                                                <Typography variant="caption" color="#2F80ED" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                                    <TruckFast size={14} variant="Bold" /> เลขพัสดุสำหรับติดตาม:
                                                </Typography>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem' }}>{order.trackingNumber}</Typography>
                                                    <IconButton size="small" onClick={() => handleCopy(order.trackingNumber)}>
                                                        <Copy size={18} color="#2F80ED" />
                                                    </IconButton>
                                                </Box>
                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>ตรวจสอบผ่านเว็บขนส่งได้ทันที</Typography>
                                            </Box>
                                        )}

                                        <Divider sx={{ my: 3 }} />

                                        <Stack spacing={2}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">เลขออเดอร์</Typography>
                                                <Typography variant="h6" fontWeight={800} color="#B76E79">
                                                    #{order?.id?.slice(-9).toUpperCase() || 'ORDER'}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">สถานะปัจจุบัน</Typography>
                                                <Typography fontWeight={700} color={getStatusLabel(order.status).color}>{getStatusLabel(order.status).label}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">ชื่อผู้สั่งซื้อ</Typography>
                                                <Typography fontWeight={600}>{order.customerName}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">ยอดรวมทั้งสิ้น</Typography>
                                                <Typography variant="h5" fontWeight={800} color="#1A1A1A">฿{parseFloat(order.grandTotal).toLocaleString()}</Typography>
                                            </Box>

                                            {(order.status === 'PENDING' || order.status === 'SLIP_UPLOADED') && paymentSettings && paymentSettings.bank && (
                                                <Box sx={{ p: 2, bgcolor: '#FDF7F8', borderRadius: '12px', border: '1px solid rgba(183, 110, 121, 0.1)', mt: 2 }}>
                                                    <Typography variant="caption" color="#B76E79" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                                        <WalletMoney size={14} variant="Bold" /> บัญชีรับโอนเงิน
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }}>{paymentSettings.bank.bankName}</Typography>
                                                    <Typography sx={{ fontFamily: 'monospace', fontSize: '1.1rem', my: 0.5, fontWeight: 600 }}>{paymentSettings.bank.accountNo}</Typography>
                                                    <Typography variant="caption" color="text.secondary">ชื่อบัญชี: {paymentSettings.bank.accountName}</Typography>
                                                    <Button
                                                        size="small"
                                                        onClick={() => handleCopy(paymentSettings.bank.accountNo.replace(/-/g, '').replace(/ /g, ''))}
                                                        startIcon={copied ? <TickCircle size={16} color="#4CAF50" /> : <Copy size={16} color="#B76E79" />}
                                                        sx={{ mt: 1, textTransform: 'none', color: copied ? '#4CAF50' : '#B76E79', fontWeight: 600, fontSize: '0.75rem' }}
                                                    >
                                                        {copied ? 'คัดลอกแล้ว' : 'คัดลอกเลขบัญชี'}
                                                    </Button>
                                                </Box>
                                            )}

                                            <Button
                                                variant="outlined"
                                                onClick={() => setOrder(null)}
                                                sx={{ mt: 2, borderRadius: '12px', textTransform: 'none', color: '#666', borderColor: '#DDD', fontSize: '0.8rem' }}
                                            >
                                                เช็คเลขออเดอร์อื่น
                                            </Button>
                                        </Stack>
                                    </Paper>
                                </Box>

                                {/* Right Column: Payment Form or Status Detail */}
                                <Box sx={{ flex: 1.2 }}>
                                    <Paper elevation={0} sx={{
                                        p: 4,
                                        borderRadius: '24px',
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.02)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        height: '100%'
                                    }}>
                                        {order.status === 'PENDING' || isReuploading ? (
                                            success ? (
                                                <Fade in={true}>
                                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                                        <Box sx={{
                                                            width: 80, height: 80, borderRadius: '50%', bgcolor: '#E8F5E9',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3
                                                        }}>
                                                            <TickCircle size={40} variant="Bold" color="#4CAF50" />
                                                        </Box>
                                                        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>แจ้งโอนสำเร็จ!</Typography>
                                                        <Typography color="text.secondary" sx={{ mb: 4 }}>แอดมินจะตรวจสอบและดำเนินการให้เร็วที่สุดครับ</Typography>
                                                        <Button
                                                            onClick={handleSearch}
                                                            variant="contained"
                                                            sx={{
                                                                bgcolor: '#B76E79',
                                                                borderRadius: '12px',
                                                                px: 4, py: 1.5,
                                                                fontWeight: 700,
                                                                '&:hover': { bgcolor: '#9D5D66' }
                                                            }}
                                                        >
                                                            รีเฟรชดูสถานะอีกครั้ง
                                                        </Button>
                                                    </Box>
                                                </Fade>
                                            ) : (
                                                <Stack spacing={3}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="h6" fontWeight={700}>
                                                            {isReuploading ? 'ส่งสลิปอันใหม่' : 'แจ้งหลักฐานการโอนเงิน'}
                                                        </Typography>
                                                        {isReuploading && (
                                                            <Button
                                                                size="small"
                                                                onClick={() => { setIsReuploading(false); setFile(null); setPreviewUrl(null); }}
                                                                sx={{ color: '#888', textTransform: 'none' }}
                                                            >
                                                                ยกเลิก
                                                            </Button>
                                                        )}
                                                    </Box>

                                                    <Box
                                                        onClick={() => !uploading && fileInputRef.current?.click()}
                                                        sx={{
                                                            width: '100%',
                                                            aspectRatio: '4/3',
                                                            border: '2px dashed rgba(183, 110, 121, 0.2)',
                                                            borderRadius: '20px',
                                                            bgcolor: '#FAFAFA',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: uploading ? 'default' : 'pointer',
                                                            position: 'relative',
                                                            overflow: 'hidden',
                                                            transition: '0.3s',
                                                            '&:hover': { bgcolor: '#FFF5F6', borderColor: '#B76E79' }
                                                        }}
                                                    >
                                                        {previewUrl ? (
                                                            <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                                                                <Image src={previewUrl} alt="Slip Preview" fill style={{ objectFit: 'contain' }} />
                                                                <IconButton
                                                                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreviewUrl(null); }}
                                                                    sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: '#FFF' } }}
                                                                >
                                                                    <CloseCircle size={20} color="#FF4d4F" />
                                                                </IconButton>
                                                            </Box>
                                                        ) : (
                                                            <>
                                                                <GalleryAdd size={48} color="#B76E79" variant="Bulk" style={{ marginBottom: '16px', opacity: 0.6 }} />
                                                                <Typography sx={{ fontWeight: 600, color: '#B76E79' }}>คลิกเพื่ออัปโหลดรูปสลิป</Typography>
                                                                <Typography variant="caption" color="text.secondary">JPG, PNG ขนาดไม่เกิน 5MB</Typography>
                                                            </>
                                                        )}
                                                    </Box>

                                                    <input
                                                        type="file"
                                                        hidden
                                                        ref={fileInputRef}
                                                        onChange={handleFileChange}
                                                        accept="image/*"
                                                    />

                                                    <Button
                                                        fullWidth
                                                        variant="contained"
                                                        size="large"
                                                        disabled={!file || uploading}
                                                        onClick={handleSubmitPayment}
                                                        endIcon={<ArrowRight />}
                                                        sx={{
                                                            bgcolor: '#B76E79',
                                                            color: '#FFF',
                                                            py: 2,
                                                            borderRadius: '16px',
                                                            fontWeight: 800,
                                                            fontSize: '1.1rem',
                                                            boxShadow: '0 10px 25px rgba(183, 110, 121, 0.2)',
                                                            textTransform: 'none',
                                                            '&:hover': { bgcolor: '#9D5D66', transform: 'translateY(-2px)' },
                                                            '&:disabled': { bgcolor: '#EEE' }
                                                        }}
                                                    >
                                                        {uploading ? <CircularProgress size={24} color="inherit" /> : 'ยืนยันการแจ้งชำระเงิน'}
                                                    </Button>

                                                    <Typography variant="caption" align="center" color="text.secondary">
                                                        * กรุณาเก็บหลักฐานการโอนเงินไว้จนกว่าจะได้รับสินค้า
                                                    </Typography>
                                                </Stack>
                                            )
                                        ) : (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', py: 6 }}>
                                                <Box sx={{
                                                    width: 100, height: 100, borderRadius: '50%',
                                                    bgcolor: (order.status === 'SHIPPING' || order.status === 'DELIVERED') ? '#E8F5E9' : (order.status === 'CANCELLED' ? '#F5F5F5' : '#E8F5E9'),
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4
                                                }}>
                                                    {(order.status === 'SHIPPING' || order.status === 'DELIVERED') ? (
                                                        <TickCircle size={50} variant="Bulk" color="#4CAF50" />
                                                    ) : (order.status === 'CANCELLED' ? (
                                                        <CloseCircle size={50} variant="Bulk" color="#9E9E9E" />
                                                    ) : (
                                                        <TickCircle size={50} variant="Bulk" color="#4CAF50" />
                                                    ))}
                                                </Box>

                                                <Typography variant="h5" fontWeight={800} gutterBottom>
                                                    {(order.status === 'SHIPPING' || order.status === 'DELIVERED') ? 'สินค้าจัดส่งแล้ว!' :
                                                        order.status === 'CONFIRMED' ? 'กำลังเตรียมสินค้า' :
                                                            order.status === 'SLIP_UPLOADED' ? 'ได้รับสลิปแล้ว' :
                                                                order.status === 'CANCELLED' ? 'ออเดอร์ถูกยกเลิก' : 'ได้รับข้อมูลแล้ว'}
                                                </Typography>

                                                <Typography color="text.secondary" sx={{ mb: 4, maxWidth: '300px' }}>
                                                    {(order.status === 'SHIPPING' || order.status === 'DELIVERED') ? 'คุณสามารถตรวจสอบเลขพัสดุและติดตามการจัดส่งได้ที่กล่องข้อมูลด้านซ้าย' :
                                                        order.status === 'CONFIRMED' ? 'ได้รับยอดเงินแล้ว เรากำลังจัดเตรียมสินค้าเพื่อส่งมอบความสุขให้คุณ' :
                                                            order.status === 'SLIP_UPLOADED' ? 'แอดมินกำลังเร่งตรวจสอบยอดเงินของคุณ ขอบคุณที่รอครับ' :
                                                                order.status === 'CANCELLED' ? 'ออเดอร์นี้ถูกยกเลิกแล้ว หากมีข้อสงสัยกรุณาติดต่อแอดมิน' :
                                                                    'เราได้รับข้อมูลของท่านเรียบร้อยแล้ว'}
                                                </Typography>

                                                {/* Show current slip if exists */}
                                                {order.slipUrl && (
                                                    <Box sx={{ mb: 4, width: '100%', maxWidth: '280px' }}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', textAlign: 'left' }}>
                                                            สลิปที่แนบไว้:
                                                        </Typography>
                                                        <Box sx={{
                                                            width: '100%',
                                                            aspectRatio: '3/4',
                                                            position: 'relative',
                                                            borderRadius: '16px',
                                                            overflow: 'hidden',
                                                            border: '1px solid rgba(0,0,0,0.08)',
                                                            bgcolor: '#F9F9F9'
                                                        }}>
                                                            <Image
                                                                src={order.slipUrl.startsWith('http') || order.slipUrl.startsWith('/') ? order.slipUrl : `/${order.slipUrl}`}
                                                                alt="Current Slip"
                                                                fill
                                                                style={{ objectFit: 'contain' }}
                                                            />
                                                        </Box>
                                                    </Box>
                                                )}

                                                <Stack spacing={2} sx={{ width: '100%', maxWidth: '280px' }}>
                                                    {(order.status === 'SLIP_UPLOADED' || order.status === 'CONFIRMED') && (
                                                        <Button
                                                            variant="outlined"
                                                            onClick={() => setIsReuploading(true)}
                                                            sx={{
                                                                borderRadius: '12px', py: 1.5, fontWeight: 700,
                                                                borderColor: '#B76E79', color: '#B76E79',
                                                                textTransform: 'none',
                                                                '&:hover': { bgcolor: '#FDF7F8', borderColor: '#A45D68' }
                                                            }}
                                                        >
                                                            แนบสลิปใหม่ (กรณีแนบผิด)
                                                        </Button>
                                                    )}
                                                    <Button
                                                        component={Link} href="/products"
                                                        variant="contained"
                                                        sx={{
                                                            bgcolor: '#1A1A1A', color: '#FFF',
                                                            borderRadius: '12px', py: 1.5, fontWeight: 700,
                                                            '&:hover': { bgcolor: '#000' }
                                                        }}
                                                    >
                                                        กลับไปช้อปปิ้งต่อ
                                                    </Button>
                                                    <Button
                                                        component={Link} href="https://line.me/ti/p/~fonms2"
                                                        variant="text"
                                                        startIcon={<MessageQuestion size={18} variant="Bold" color="#B76E79" />}
                                                        sx={{ color: '#B76E79', fontWeight: 600, textTransform: 'none' }}
                                                    >
                                                        สอบถามเพิ่มเติมทาง LINE
                                                    </Button>
                                                </Stack>
                                            </Box>
                                        )}
                                    </Paper>
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                )}
            </Container>

        </Box>
    );
}
