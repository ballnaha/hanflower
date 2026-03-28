'use client';

import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    Divider,
    IconButton,
    Tabs,
    Tab,
    Stack,
    Fade,
    TextField,
    Radio,
    RadioGroup,
    FormControlLabel,
    InputAdornment,
    Alert,
    CircularProgress,
    alpha,
    Snackbar
} from '@mui/material';
import {
    Copy,
    TickCircle,
    Cards,
    ScanBarcode,
    ArrowRight,
    TruckFast,
    TicketDiscount,
    Location,
    Note,
    Add,
    Minus,
    Trash,
    Card
} from 'iconsax-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useNotification } from '@/context/NotificationContext';
import { getImageUrl } from '@/lib/utils';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`payment-tabpanel-${index}`}
            aria-labelledby={`payment-tab-${index}`}
            {...other}
            style={{ width: '100%' }}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    <Fade in={value === index} timeout={500}>
                        <Box>{children}</Box>
                    </Fade>
                </Box>
            )}
        </div>
    );
}

const customInputSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        bgcolor: '#FAFAFA',
        '& fieldset': {
            borderColor: 'rgba(0,0,0,0.08)',
        },
        '&:hover fieldset': {
            borderColor: 'rgba(0,0,0,0.2)',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#B76E79',
        }
    },
    '& .MuiInputLabel-root.Mui-focused': {
        color: '#B76E79'
    }
};

export default function CheckoutPage() {
    const [tabValue, setTabValue] = useState(0);
    const router = useRouter();
    const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
    const { showSuccess, showError, showWarning } = useNotification();
    const [shippingInfo, setShippingInfo] = useState({
        name: '',
        tel: '',
        email: '',
        address: '',
        note: ''
    });

    // Checkout State
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [promoCode, setPromoCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<{ code: string, amount: number } | null>(null);
    const [isCheckingCode, setIsCheckingCode] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [copied, setCopied] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);



    // Shipping Methods from API
    interface ShippingMethodType {
        code: string;
        name: string;
        description: string;
        price: number;
        enabled: boolean;
        estimatedDays: string;
    }
    const [shippingMethods, setShippingMethods] = useState<ShippingMethodType[]>([]);
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);
    const [enableFreeShipping, setEnableFreeShipping] = useState(false);

    // Payment Settings State
    const [paymentSettings, setPaymentSettings] = useState({
        bank: {
            enabled: true,
            bankName: 'ธนาคารกสิกรไทย (KBANK)',
            accountNo: '012 345 6789',
            accountName: 'HAN FLOWER CO., LTD.',
            branch: '',
            bankLogo: ''
        },
        qr: {
            enabled: true,
            image: ''
        }
    });

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch Shipping
                const shipRes = await fetch('/api/shipping');
                const shipData = await shipRes.json();
                if (shipData.methods) {
                    const enabledMethods = shipData.methods.filter((m: any) => m.enabled).map((m: any) => ({
                        ...m,
                        price: parseFloat(m.price)
                    }));
                    setShippingMethods(enabledMethods);
                    if (enabledMethods.length > 0 && !enabledMethods.find((m: any) => m.code === shippingMethod)) {
                        setShippingMethod(enabledMethods[0].code);
                    }
                }
                setFreeShippingThreshold(shipData.freeShippingThreshold || 0);
                setEnableFreeShipping(shipData.enableFreeShipping || false);

                // Fetch Payment Settings
                const payRes = await fetch('/api/payment-settings');
                if (payRes.ok) {
                    const payData = await payRes.json();
                    setPaymentSettings(payData);
                }
            } catch (error) {
                console.error('Failed to fetch initial data:', error);
            }
        };
        fetchInitialData();
    }, []);

    // Costs - dynamic from API
    const selectedMethod = shippingMethods.find(m => m.code === shippingMethod);
    const baseShippingCost = selectedMethod?.price || 0;
    // Check if standard shipping is enabled
    const isStandardEnabled = shippingMethods.some(m => m.code === 'standard');
    // Apply free shipping if enabled and cart total meets threshold (except for express/cod)
    const qualifiesForFreeShipping = enableFreeShipping && isStandardEnabled && cartTotal >= freeShippingThreshold && shippingMethod === 'standard';
    const shippingCost = qualifiesForFreeShipping ? 0 : baseShippingCost;
    const finalTotal = cartItems.length > 0 ? (cartTotal + shippingCost - (appliedDiscount?.amount || 0)) : 0;

    const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShippingInfo({
            ...shippingInfo,
            [e.target.name]: e.target.value
        });
    };

    const handleApplyCoupon = async () => {
        if (!promoCode.trim()) return;

        setIsCheckingCode(true);
        setCouponError('');

        try {
            const res = await fetch('/api/coupons/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: promoCode,
                    cartTotal: cartTotal
                })
            });

            const data = await res.json();

            if (res.ok && data.valid) {
                setAppliedDiscount({
                    code: data.code,
                    amount: data.discountAmount
                });
                setPromoCode('');
                // Optional: Store couponId if needed for order creation
            } else {
                setCouponError(data.error || 'คูปองใช้ไม่ได้');
            }
        } catch (error) {
            console.error('Error verifying coupon:', error);
            setCouponError('เกิดข้อผิดพลาดในการตรวจสอบคูปอง');
        } finally {
            setIsCheckingCode(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedDiscount(null);
    };

    const getOrderMessage = () => {
        const shippingText = (shippingCost === 0 && (shippingMethod === 'express' || shippingMethod === 'cod') && !qualifiesForFreeShipping) ? 'เก็บค่าส่งปลายทาง' : `${shippingCost} บ.`;
        return `ยืนยันคำสั่งซื้อ\n------------------\n\n👤 ลูกค้า:\nชื่อ: ${shippingInfo.name}\nโทร: ${shippingInfo.tel}\nที่อยู่: ${shippingInfo.address}\nหมายเหตุ: ${shippingInfo.note || '-'}\n\n🚚 การจัดส่ง: ${shippingMethod === 'express' ? 'ส่งด่วน (Lalamove/Grab)' : 'ขนส่งมาตรฐาน (1-2 วัน)'}\n\n🛒 รายการสินค้า:\n${cartItems.map(item => `- ${item.title} x ${item.quantity} (${item.price})`).join('\n')}\n\n------------------\nยอดสินค้า: ${cartTotal.toLocaleString()} บ.\nค่าส่ง: ${shippingText}\nส่วนลด: -${appliedDiscount?.amount || 0} บ.\n\n💰 ยอดสุทธิ: ${finalTotal.toLocaleString()} บาท`;
    };

    const handlePlaceOrder = async () => {
        // Validation
        if (cartItems.length === 0) {
            showWarning('ตะกร้าสินค้าว่างเปล่า กรุณาเลือกสินค้าก่อน');
            return;
        }
        if (!shippingInfo.name) {
            showError('กรุณากรอกชื่อ-นามสกุล');
            return;
        }
        if (!shippingInfo.tel) {
            showError('กรุณากรอกเบอร์โทรศัพท์');
            return;
        }
        if (!shippingInfo.address) {
            showError('กรุณากรอกที่อยู่จัดส่ง');
            return;
        }

        let paymentMethodCode = '';
        if (paymentSettings.bank.enabled && tabValue === 0) {
            paymentMethodCode = 'bank_transfer';
        } else if (paymentSettings.qr.enabled && tabValue === (paymentSettings.bank.enabled ? 1 : 0)) {
            paymentMethodCode = 'qr_code';
        } else {
            // Fallback or error if no payment method is selected/enabled
            showError('กรุณาเลือกช่องทางการชำระเงิน');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: shippingInfo.name,
                    tel: shippingInfo.tel,
                    email: shippingInfo.email,
                    address: shippingInfo.address,
                    note: shippingInfo.note,
                    cartItems: cartItems,
                    subtotal: cartTotal,
                    shippingCost: shippingCost,
                    shippingMethod: shippingMethod,
                    discount: appliedDiscount?.amount || 0,
                    grandTotal: parseFloat(finalTotal.toString()),
                    paymentMethod: paymentMethodCode
                })
            });

            const data = await res.json();

            if (data.success) {
                clearCart();
                router.push(`/order/${data.orderId}`);
            } else {
                if (data.error.includes('no longer exist')) {
                    showWarning('สินค้าในตะกร้าเป็นข้อมูลเก่า ระบบจะล้างตะกร้าเพื่อให้เลือกสินค้าใหม่');
                    setTimeout(() => {
                        clearCart();
                        router.push('/products');
                    }, 2000);
                } else {
                    showError('เกิดข้อผิดพลาด: ' + data.error);
                }
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error(error);
            showError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
            setIsSubmitting(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showSuccess('คัดลอกเลขบัญชีแล้ว');
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Determine actual tab indices based on enabled settings
    const bankTabIndex = paymentSettings.bank.enabled ? 0 : -1;
    const qrTabIndex = paymentSettings.qr.enabled ? (paymentSettings.bank.enabled ? 1 : 0) : -1;


    return (
        <Box sx={{ bgcolor: '#FFF', minHeight: '100vh', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(183, 110, 121, 0.05) 0%, rgba(255,255,255,0) 70%)' }}>

            <Container maxWidth="xl" sx={{ py: { xs: 12, md: 16 } }}>
                <Typography variant="h1" sx={{ fontFamily: 'Prompt', fontWeight: 700, mb: 6, textAlign: 'center', color: '#1A1A1A', fontSize: { xs: '2rem', md: '3rem' } }}>
                    สั่งซื้อสินค้า
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>

                    {/* Left Column: Forms */}
                    <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 55%' }, maxWidth: { lg: 800 } }}>
                        <Stack spacing={5}>

                            {/* 1. Customer Information */}
                            <Box>
                                <Typography variant="h6" sx={{ fontFamily: 'Prompt', fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Location size={22} variant="Bold" color="#B76E79" /> ข้อมูลการจัดส่ง
                                </Typography>
                                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: '24px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                    <Stack spacing={3}>
                                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                                            <TextField
                                                fullWidth label="ชื่อ-นามสกุล" name="name"
                                                value={shippingInfo.name} onChange={handleShippingChange}
                                                variant="outlined" sx={customInputSx}
                                            />
                                            <TextField
                                                fullWidth label="เบอร์โทรศัพท์" name="tel"
                                                value={shippingInfo.tel} onChange={handleShippingChange}
                                                variant="outlined" sx={customInputSx}
                                            />
                                        </Stack>
                                        <TextField
                                            fullWidth label="อีเมล (ถ้ามี)" name="email"
                                            value={shippingInfo.email} onChange={handleShippingChange}
                                            variant="outlined" sx={customInputSx}
                                            placeholder="example@email.com"
                                            helperText="สำหรับส่งใบเสร็จและเลขพัสดุ"
                                        />
                                        <TextField
                                            fullWidth label="ที่อยู่จัดส่ง" name="address"
                                            multiline rows={3}
                                            value={shippingInfo.address} onChange={handleShippingChange}
                                            variant="outlined" sx={customInputSx}
                                            placeholder="บ้านเลขที่, ถนน, ซอย, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์"
                                        />
                                        <TextField
                                            fullWidth label="ข้อความอื่น ๆ" name="note"
                                            value={shippingInfo.note} onChange={handleShippingChange}
                                            variant="outlined"
                                            placeholder="ระบุวันที่ต้องการรับสินค้า, ข้อความบนการ์ดอวยพร, หรือรายละเอียดเพิ่มเติม"
                                            multiline
                                            rows={2}
                                            sx={customInputSx}
                                        />
                                    </Stack>
                                </Paper>
                            </Box>

                            {/* 2. Shipping Method */}
                            <Box>
                                <Typography variant="h6" sx={{ fontFamily: 'Prompt', fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <TruckFast size={22} variant="Bold" color="#B76E79" /> รูปแบบการจัดส่ง
                                </Typography>
                                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: '24px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                    {/* Free Shipping Applied Alert */}
                                    {enableFreeShipping && isStandardEnabled && cartTotal >= freeShippingThreshold && freeShippingThreshold > 0 && (
                                        <Alert
                                            severity="success"
                                            icon={<TickCircle size={20} variant="Bold" />}
                                            sx={{ mb: 2, borderRadius: '12px', bgcolor: alpha('#2E7D32', 0.08), border: '1px solid', borderColor: alpha('#2E7D32', 0.2) }}
                                        >
                                            🎉 ยินดีด้วย! คุณได้รับสิทธิ์ <strong>ส่งฟรี</strong> สำหรับการจัดส่งแบบ Standard
                                        </Alert>
                                    )}

                                    <RadioGroup value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)}>
                                        <Stack spacing={2}>
                                            {shippingMethods.map((method) => (
                                                <Paper
                                                    key={method.code}
                                                    elevation={0}
                                                    sx={{
                                                        p: 2.5,
                                                        border: `1px solid ${shippingMethod === method.code ? '#B76E79' : 'rgba(0,0,0,0.08)'}`,
                                                        bgcolor: shippingMethod === method.code ? alpha('#B76E79', 0.03) : 'transparent',
                                                        borderRadius: '16px',
                                                        transition: 'all 0.3s ease',
                                                        cursor: 'pointer',
                                                        position: 'relative',
                                                        '&:hover': { borderColor: '#B76E79' }
                                                    }}
                                                    onClick={() => setShippingMethod(method.code)}
                                                >
                                                    <FormControlLabel
                                                        value={method.code}
                                                        control={<Radio sx={{ color: '#B76E79', '&.Mui-checked': { color: '#B76E79' } }} />}
                                                        label={
                                                            <Box sx={{ ml: 1 }}>
                                                                <Typography variant="subtitle1" fontWeight={600}>{method.name}</Typography>
                                                                <Typography variant="body2" color="text.secondary">{method.description}</Typography>
                                                            </Box>
                                                        }
                                                        sx={{ width: '100%', m: 0 }}
                                                    />
                                                    <Typography sx={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', fontWeight: 600, textAlign: 'right' }}>
                                                        {method.code === 'pickup' ? (
                                                            <span style={{ color: '#2E7D32' }}>รับเอง</span>
                                                        ) : method.code === 'cod' && method.price > 0 ? (
                                                            <span style={{ color: '#9C27B0' }}>+฿{method.price} <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>(ค่า COD)</span></span>
                                                        ) : (method.code === 'express' || method.code === 'cod') && method.price === 0 ? (
                                                            <span style={{ color: '#B76E79', fontSize: '0.9rem' }}>เก็บค่าส่งปลายทาง</span>
                                                        ) : method.price === 0 ? (
                                                            <span style={{ color: '#2E7D32' }}>ฟรี</span>
                                                        ) : (
                                                            enableFreeShipping && cartTotal >= freeShippingThreshold && method.code === 'standard'
                                                                ? <><s style={{ color: '#999' }}>฿{method.price}</s> <span style={{ color: '#2E7D32' }}>ฟรี!</span></>
                                                                : `+฿${method.price}`
                                                        )}
                                                    </Typography>
                                                </Paper>
                                            ))}
                                        </Stack>
                                    </RadioGroup>
                                    {enableFreeShipping && isStandardEnabled && cartTotal < freeShippingThreshold && freeShippingThreshold > 0 && (
                                        <Alert severity="info" sx={{ mt: 2, borderRadius: '12px' }}>
                                            ซื้อเพิ่มอีก ฿{(freeShippingThreshold - cartTotal).toLocaleString()} รับสิทธิ์ส่งฟรี!
                                        </Alert>
                                    )}
                                </Paper>
                            </Box>

                            {/* 3. Payment Method */}
                            <Box>
                                <Typography variant="h6" sx={{ fontFamily: 'Prompt', fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Cards size={22} variant="Bold" color="#B76E79" /> ช่องทางชำระเงิน
                                </Typography>
                                <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: '24px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                                        <Tabs
                                            value={tabValue}
                                            onChange={handleTabChange}
                                            textColor="inherit"
                                            sx={{
                                                '& .Mui-selected': { color: '#B76E79' },
                                                '& .MuiTabs-indicator': { bgcolor: '#B76E79' }
                                            }}
                                        >
                                            {paymentSettings.bank.enabled && <Tab label="โอนเงินธนาคาร" sx={{ textTransform: 'none', fontSize: '1rem', fontWeight: 600, fontFamily: 'Prompt' }} />}
                                            {paymentSettings.qr.enabled && <Tab label="สแกน QR Code" sx={{ textTransform: 'none', fontSize: '1rem', fontWeight: 600, fontFamily: 'Prompt' }} />}
                                        </Tabs>
                                    </Box>

                                    {/* Bank Panel */}
                                    {paymentSettings.bank.enabled && tabValue === bankTabIndex && (
                                        <Box sx={{ py: 3 }}>
                                            <Fade in={true} timeout={500}>
                                                <Box sx={{
                                                    p: { xs: 3, md: 4 },
                                                    border: '1px solid #EAEAEA',
                                                    borderRadius: '20px',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    bgcolor: '#FAFAFA'
                                                }}>

                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                                                                {paymentSettings.bank.bankLogo ? (
                                                                    <Image src={getImageUrl(paymentSettings.bank.bankLogo)} alt="Bank" width={48} height={48} style={{ objectFit: 'contain', padding: '4px' }} />
                                                                ) : (
                                                                    <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#999' }}>BK</Typography>
                                                                )}
                                                            </Box>
                                                            <Box>
                                                                <Typography sx={{ fontWeight: 600, color: '#1A1A1A', fontSize: '1.1rem' }}>{paymentSettings.bank.bankName}</Typography>
                                                                <Typography variant="body2" color="text.secondary">ออมทรัพย์ {paymentSettings.bank.branch ? `(${paymentSettings.bank.branch})` : ''}</Typography>
                                                            </Box>
                                                        </Box>
                                                    </Box>

                                                    <Box sx={{ mb: 4, p: 3, bgcolor: '#FFF', borderRadius: '16px', border: '1px dashed #E0E0E0', textAlign: 'center' }}>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.75rem' }}>เลขที่บัญชี</Typography>
                                                        <Typography sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.1em', color: '#1A1A1A' }}>
                                                            {paymentSettings.bank.accountNo}
                                                        </Typography>
                                                        <Button
                                                            onClick={() => {
                                                                handleCopy(paymentSettings.bank.accountNo.replace(/-/g, '').replace(/ /g, ''));
                                                            }}
                                                            size="small"
                                                            startIcon={copied ? <TickCircle size={18} variant="Outline" color="#4CAF50" /> : <Copy size={18} variant="Outline" color="#B76E79" />}
                                                            sx={{
                                                                color: copied ? '#4CAF50' : '#B76E79',
                                                                borderColor: copied ? '#4CAF50' : alpha('#B76E79', 0.5),
                                                                textTransform: 'none',
                                                                mt: 2,
                                                                borderRadius: '20px',
                                                                px: 3,
                                                                py: 0.5,
                                                                border: '1px solid',
                                                                bgcolor: copied ? alpha('#4CAF50', 0.1) : 'transparent',
                                                                '&:hover': { bgcolor: alpha('#B76E79', 0.05), borderColor: '#B76E79' }
                                                            }}
                                                        >
                                                            {copied ? 'คัดลอกแล้ว' : 'คัดลอกเลขบัญชี'}
                                                        </Button>
                                                    </Box>

                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1 }}>
                                                        <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>ชื่อบัญชี</Typography>
                                                        <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#1A1A1A' }}>{paymentSettings.bank.accountName}</Typography>
                                                    </Box>
                                                </Box>
                                            </Fade>
                                        </Box>
                                    )}

                                    {/* QR Panel */}
                                    {paymentSettings.qr.enabled && tabValue === qrTabIndex && (
                                        <Box sx={{ py: 3 }}>
                                            <Fade in={true} timeout={500}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                                                    <Box sx={{ p: 3, bgcolor: '#FFF', borderRadius: '24px', border: '1px solid #EEE', mb: 3, boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
                                                        {paymentSettings.qr.image ? (
                                                            <Image
                                                                src={getImageUrl(paymentSettings.qr.image)}
                                                                alt="QR Code"
                                                                width={200}
                                                                height={200}
                                                                style={{ objectFit: 'contain' }}
                                                            />
                                                        ) : (
                                                            <ScanBarcode size={140} color="#1A1A1A" />
                                                        )}
                                                    </Box>
                                                    <Typography variant="body2" align="center" color="text.secondary">
                                                        สแกนเพื่อจ่ายเงินผ่านแอปธนาคาร
                                                    </Typography>
                                                </Box>
                                            </Fade>
                                        </Box>
                                    )}
                                </Paper>
                            </Box>
                        </Stack>
                    </Box>


                    {/* Right Column: Order Summary (Sticky) */}
                    <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 40%' }, maxWidth: { lg: 500 } }}>
                        <Box sx={{ position: 'sticky', top: 120 }}>
                            <Paper elevation={0} sx={{
                                p: { xs: 3, md: 4 },
                                borderRadius: '24px',
                                border: '1px solid rgba(0,0,0,0.05)',
                                bgcolor: '#FAFAFA', // Slightly distinct background
                                boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                            }}>
                                <Typography variant="h6" sx={{ fontFamily: 'Prompt', fontWeight: 600, mb: 4, letterSpacing: '-0.02em' }}>
                                    สรุปรายการสั่งซื้อ
                                </Typography>

                                <Box sx={{ maxHeight: 350, overflowY: 'auto', pr: 1, mb: 4 }}>
                                    {cartItems.length === 0 ? (
                                        <Typography align="center" color="text.secondary" sx={{ py: 4 }}>ตะกร้าสินค้าว่างเปล่า</Typography>
                                    ) : (
                                        cartItems.map((item) => (
                                            <Box key={item.id} sx={{ mb: 3, pb: 3, borderBottom: '1px dashed #E0E0E0', '&:last-child': { borderBottom: 'none' } }}>
                                                <Box sx={{ display: 'flex', gap: 2.5 }}>
                                                    <Box sx={{ width: 80, height: 80, position: 'relative', borderRadius: '12px', overflow: 'hidden', bgcolor: '#FFF', border: '1px solid #F0F0F0', flexShrink: 0 }}>
                                                        <Image
                                                            src={getImageUrl(item.image || (item.images && item.images[0]) || '')}
                                                            alt={item.title}
                                                            fill
                                                            style={{ objectFit: 'contain', padding: '6px' }}
                                                        />
                                                    </Box>
                                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.4, fontSize: '0.95rem' }}>{item.title}</Typography>
                                                            <Typography variant="subtitle2" fontWeight={700} color="#1A1A1A">
                                                                ฿{(typeof item.price === 'string' ? parseFloat(item.price.replace(/,/g, '')) * item.quantity : item.price * item.quantity).toLocaleString()}
                                                            </Typography>
                                                        </Box>

                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #EAEAEA', borderRadius: '50px', bgcolor: '#FAFAFA', height: 32 }}>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                    disabled={item.quantity <= 1}
                                                                    sx={{
                                                                        width: 32, height: 32,
                                                                        color: item.quantity <= 1 ? '#DDD' : '#1A1A1A',
                                                                        '&:hover': { bgcolor: '#FFF0F3', color: '#FF4d4F' },
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                >
                                                                    <Minus size={16} variant="Outline" color="#1A1A1A" />
                                                                </IconButton>
                                                                <Typography variant="caption" sx={{ minWidth: 24, textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>{item.quantity}</Typography>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                    sx={{
                                                                        width: 32, height: 32,
                                                                        color: '#1A1A1A',
                                                                        '&:hover': { bgcolor: '#E8F5E9', color: '#06C755' },
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                >
                                                                    <Add size={16} variant="Outline" color="#1A1A1A" />
                                                                </IconButton>
                                                            </Box>

                                                            <IconButton
                                                                size="small"
                                                                onClick={() => removeFromCart(item.id)}
                                                                sx={{
                                                                    color: '#FF4d4F',
                                                                    bgcolor: 'rgba(255, 77, 79, 0.05)',
                                                                    transition: 'all 0.2s',
                                                                    '&:hover': { color: '#FFF', transform: 'scale(1.1)' }
                                                                }}
                                                            >
                                                                <Trash size={18} variant="Outline" color="#FF4d4F" />
                                                            </IconButton>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        ))
                                    )}
                                </Box>

                                {/* Promo Code */}
                                {!appliedDiscount ? (
                                    <TextField
                                        fullWidth
                                        placeholder="กรอกโค้ดส่วนลด"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        error={!!couponError}
                                        helperText={couponError}
                                        sx={{
                                            mb: 4,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '20px', // Extra rounded
                                                bgcolor: '#FAFAFA',
                                                pr: '6px', // Space for button
                                                '& fieldset': { borderColor: '#EEE' },
                                                '&:hover fieldset': { borderColor: '#B76E79' },
                                                '&.Mui-focused fieldset': { borderColor: '#B76E79', borderWidth: '1px' }
                                            },
                                            '& .MuiFormHelperText-root': { mx: 2 }
                                        }}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><TicketDiscount size={18} variant="Bold" color="#B76E79" /></InputAdornment>,
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Button
                                                        variant="contained"
                                                        onClick={handleApplyCoupon}
                                                        disabled={!promoCode || isCheckingCode}
                                                        disableElevation
                                                        sx={{
                                                            bgcolor: '#1A1A1A',
                                                            color: '#FFF',
                                                            textTransform: 'none',
                                                            borderRadius: '16px',
                                                            px: 3,
                                                            py: 1,
                                                            fontWeight: 600,
                                                            '&:hover': { bgcolor: '#000' },
                                                            '&:disabled': { bgcolor: '#F5F5F5' }
                                                        }}
                                                    >
                                                        {isCheckingCode ? <CircularProgress size={20} color="inherit" /> : 'ใช้โค้ด'}
                                                    </Button>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                ) : (
                                    <Fade in={!!appliedDiscount}>
                                        <Box sx={{
                                            mb: 4, p: 2,
                                            bgcolor: alpha('#B76E79', 0.04),
                                            borderRadius: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            border: '1px solid',
                                            borderColor: alpha('#B76E79', 0.15)
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <TickCircle size={22} color="#B76E79" variant="Bold" />
                                                <Box>
                                                    <Typography variant="body2" fontWeight={700} color="#1A1A1A">ใช้โค้ด '{appliedDiscount.code}' แล้ว</Typography>
                                                    <Typography variant="caption" color="text.secondary">รับส่วนลดส่วนตัวของคุณ ฿{appliedDiscount.amount.toLocaleString()}</Typography>
                                                </Box>
                                            </Box>
                                            <IconButton size="small" onClick={handleRemoveCoupon} sx={{ color: '#1A1A1A', bgcolor: '#FFF', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', '&:hover': { color: '#FF4d4F' } }}>
                                                <Trash size={16} variant="Bold" color="#FF4d4F" />
                                            </IconButton>
                                        </Box>
                                    </Fade>
                                )}
                                {/* Calculations */}
                                <Stack spacing={2} sx={{ mb: 4, p: 2.5, bgcolor: '#FFF', borderRadius: '16px', border: '1px solid #F0F0F0' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary" variant="body2">รวมค่าสินค้า</Typography>
                                        <Typography fontWeight={600}>฿{cartTotal.toLocaleString()}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary" variant="body2">ค่าจัดส่ง</Typography>
                                        <Typography fontWeight={600}>
                                            {shippingCost === 0 && (shippingMethod === 'express' || shippingMethod === 'cod') && !qualifiesForFreeShipping
                                                ? <span style={{ color: '#B76E79' }}>เก็บปลายทาง</span>
                                                : `฿${shippingCost.toLocaleString()}`}
                                        </Typography>
                                    </Box>
                                    {appliedDiscount && (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#06C755' }}>
                                            <Typography variant="body2">ส่วนลด</Typography>
                                            <Typography fontWeight={600}>-฿{appliedDiscount.amount.toLocaleString()}</Typography>
                                        </Box>
                                    )}
                                    <Divider sx={{ borderStyle: 'dashed' }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="subtitle1" fontWeight={700}>ยอดชำระทั้งสิ้น</Typography>
                                        <Typography variant="h5" fontWeight={700} color="#B76E79">
                                            ฿{finalTotal.toLocaleString()}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    loading={isSubmitting}
                                    onClick={handlePlaceOrder}
                                    endIcon={<ArrowRight />}
                                    sx={{
                                        bgcolor: '#B76E79',
                                        color: '#FFF',
                                        py: 2,
                                        borderRadius: '16px',
                                        fontSize: '1rem',
                                        fontWeight: 700,
                                        boxShadow: '0 10px 25px rgba(183, 110, 121, 0.3)',
                                        textTransform: 'none',
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            bgcolor: '#9D5D66',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 15px 30px rgba(183, 110, 121, 0.4)'
                                        }
                                    }}
                                >
                                    ยืนยันการสั่งซื้อ
                                </Button>
                                <Typography variant="caption" display="block" textAlign="center" sx={{ mt: 2, color: 'text.secondary', opacity: 0.7 }}>
                                    ปลอดภัย 100% สามารถแนบสลิปได้ในหน้าถัดไป
                                </Typography>
                            </Paper>
                        </Box>
                    </Box>
                </Box>
            </Container>

        </Box >
    );
}
