'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Stack,
    Switch,
    FormControlLabel,
    Alert,
    Snackbar,
    InputAdornment,
    CircularProgress,
    Skeleton,
    Chip,
    Tooltip,
    alpha,
    Fade
} from '@mui/material';
import { TruckFast, Box1, TickCircle, Timer1, Wallet3, Information, RefreshCircle, Shop, MoneyRecive, Add } from 'iconsax-react';
import AdminLayout from '@/components/admin/AdminLayout';

interface ShippingMethod {
    id?: string;
    code: string;
    name: string;
    description: string;
    price: number;
    enabled: boolean;
    estimatedDays: string;
    priority?: number;
}

const inputStyles = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        bgcolor: '#FAFAFA',
        transition: 'all 0.2s ease',
        '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' },
        '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.15)' },
        '&.Mui-focused fieldset': { borderColor: '#B76E79', borderWidth: '1.5px' },
        '&.Mui-focused': { bgcolor: '#FFF' }
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#B76E79' }
};

export default function ShippingSettingsPage() {
    const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
    const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(0);
    const [enableFreeShipping, setEnableFreeShipping] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        fetchShippingMethods();
    }, []);

    const fetchShippingMethods = async () => {
        try {
            const res = await fetch('/api/shipping');
            const data = await res.json();

            if (data.methods && data.methods.length > 0) {
                setShippingMethods(data.methods.map((m: any) => ({
                    ...m,
                    price: parseFloat(m.price)
                })));
            } else {
                setShippingMethods([
                    {
                        code: 'standard',
                        name: 'ขนส่งพัสดุ (Standard)',
                        description: '1-2 วันทำการ • ทั่วประเทศ',
                        price: 50,
                        enabled: true,
                        estimatedDays: '1-2 วัน',
                        priority: 0
                    },
                    {
                        code: 'express',
                        name: 'ส่งด่วน (Lalamove/Grab)',
                        description: 'กทม. และปริมณฑล',
                        price: 150,
                        enabled: true,
                        estimatedDays: 'ภายในวันเดียว',
                        priority: 1
                    },
                    {
                        code: 'pickup',
                        name: 'รับสินค้าเอง',
                        description: 'รับสินค้าที่ร้าน ซอยวัดลาดปลาดุก นนทบุรี',
                        price: 0,
                        enabled: false,
                        estimatedDays: 'นัดรับสินค้า',
                        priority: 2
                    },
                    {
                        code: 'cod',
                        name: 'เก็บเงินปลายทาง (COD)',
                        description: 'ชำระเงินเมื่อรับสินค้า • ค่าบริการเพิ่ม',
                        price: 30,
                        enabled: false,
                        estimatedDays: '2-3 วัน',
                        priority: 3
                    }
                ]);
            }

            setFreeShippingThreshold(data.freeShippingThreshold || 0);
            setEnableFreeShipping(data.enableFreeShipping || false);

            // If no methods from DB, seed defaults
            if (!data.methods || data.methods.length === 0) {
                await seedDefaultMethods();
            }
        } catch (error) {
            console.error('Failed to fetch shipping methods:', error);
            setSnackbar({ open: true, message: 'ไม่สามารถโหลดข้อมูลได้', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const seedDefaultMethods = async () => {
        const defaults: ShippingMethod[] = [
            { code: 'standard', name: 'ขนส่งพัสดุ (Standard)', description: '1-2 วันทำการ • ทั่วประเทศ', price: 50, enabled: true, estimatedDays: '1-2 วัน', priority: 0 },
            { code: 'express', name: 'ส่งด่วน (Lalamove/Grab)', description: 'กทม. และปริมณฑล', price: 150, enabled: true, estimatedDays: 'ภายในวันเดียว', priority: 1 },
            { code: 'pickup', name: 'รับสินค้าเอง', description: 'รับสินค้าที่ร้าน ซอยวัดลาดปลาดุก นนทบุรี', price: 0, enabled: false, estimatedDays: 'นัดรับสินค้า', priority: 2 },
            { code: 'cod', name: 'เก็บเงินปลายทาง (COD)', description: 'ชำระเงินเมื่อรับสินค้า • ค่าบริการเพิ่ม', price: 30, enabled: false, estimatedDays: '2-3 วัน', priority: 3 }
        ];
        setShippingMethods(defaults);
        setHasChanges(true);
    };

    const addMissingMethods = () => {
        const existingCodes = shippingMethods.map(m => m.code);
        const allDefaults: ShippingMethod[] = [
            { code: 'standard', name: 'ขนส่งพัสดุ (Standard)', description: '1-2 วันทำการ • ทั่วประเทศ', price: 50, enabled: true, estimatedDays: '1-2 วัน', priority: 0 },
            { code: 'express', name: 'ส่งด่วน (Lalamove/Grab)', description: 'กทม. และปริมณฑล', price: 150, enabled: true, estimatedDays: 'ภายในวันเดียว', priority: 1 },
            { code: 'pickup', name: 'รับสินค้าเอง', description: 'รับสินค้าที่ร้าน ซอยวัดลาดปลาดุก นนทบุรี', price: 0, enabled: false, estimatedDays: 'นัดรับสินค้า', priority: 2 },
            { code: 'cod', name: 'เก็บเงินปลายทาง (COD)', description: 'ชำระเงินเมื่อรับสินค้า • ค่าบริการเพิ่ม', price: 30, enabled: false, estimatedDays: '2-3 วัน', priority: 3 }
        ];

        const missingMethods = allDefaults.filter(d => !existingCodes.includes(d.code));
        if (missingMethods.length > 0) {
            setShippingMethods([...shippingMethods, ...missingMethods]);
            setHasChanges(true);
            setSnackbar({ open: true, message: `เพิ่ม ${missingMethods.length} รูปแบบใหม่แล้ว กดบันทึกเพื่อยืนยัน`, severity: 'success' });
        } else {
            setSnackbar({ open: true, message: 'มีรูปแบบครบถ้วนแล้ว', severity: 'success' });
        }
    };

    const handleMethodChange = (code: string, field: keyof ShippingMethod, value: any) => {
        if (code === 'standard' && field === 'enabled' && value === false && enableFreeShipping) {
            setSnackbar({
                open: true,
                message: 'คำเตือน: โปรโมชันส่งฟรีจะถูกปิดการทำงานอัตโนมัติหากไม่มีการส่งแบบ Standard',
                severity: 'error'
            });
        }
        setShippingMethods(prev =>
            prev.map(method =>
                method.code === code ? { ...method, [field]: value } : method
            )
        );
        setHasChanges(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/shipping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    methods: shippingMethods,
                    freeShippingThreshold,
                    enableFreeShipping
                })
            });

            const data = await res.json();

            if (data.success) {
                setSnackbar({ open: true, message: 'บันทึกการตั้งค่าเรียบร้อยแล้ว', severity: 'success' });
                setHasChanges(false);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            setSnackbar({ open: true, message: 'เกิดข้อผิดพลาดในการบันทึก', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const getMethodIcon = (code: string, size: number = 28, color?: string) => {
        switch (code) {
            case 'express': return <TruckFast size={size} color={color || '#B76E79'} variant="Bold" />;
            case 'pickup': return <Shop size={size} color={color || '#FF9800'} variant="Bold" />;
            case 'cod': return <MoneyRecive size={size} color={color || '#9C27B0'} variant="Bold" />;
            default: return <Box1 size={size} color={color || '#1565C0'} variant="Bold" />;
        }
    };

    const getMethodColor = (code: string) => {
        switch (code) {
            case 'express': return '#B76E79';
            case 'pickup': return '#FF9800';
            case 'cod': return '#9C27B0';
            default: return '#1565C0';
        }
    };

    const getMethodBg = (code: string) => {
        switch (code) {
            case 'express': return 'linear-gradient(135deg, #FFE4E6 0%, #FFF0F1 100%)';
            case 'pickup': return 'linear-gradient(135deg, #FFF3E0 0%, #FFF8F0 100%)';
            case 'cod': return 'linear-gradient(135deg, #F3E5F5 0%, #FAF5FC 100%)';
            default: return 'linear-gradient(135deg, #E3F2FD 0%, #F5F9FF 100%)';
        }
    };

    if (loading) {
        return (
            <AdminLayout title="ตั้งค่าการจัดส่ง">
                <Box>
                    <Skeleton variant="rounded" height={400} sx={{ borderRadius: '24px', mb: 4 }} />
                    <Skeleton variant="rounded" height={180} sx={{ borderRadius: '24px' }} />
                </Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="ตั้งค่าการจัดส่ง">
            <Box>

                {/* Header Stats */}
                <Box sx={{ display: 'flex', gap: 3, mb: 5, flexWrap: 'wrap' }}>
                    <Paper elevation={0} sx={{
                        flex: 1,
                        minWidth: 200,
                        p: 3,
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #FFF5F6 0%, #FFF 100%)',
                        border: '1px solid rgba(183, 110, 121, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <Box sx={{
                            width: 52,
                            height: 52,
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #B76E79 0%, #9D5D66 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 15px rgba(183, 110, 121, 0.3)'
                        }}>
                            <TruckFast size={26} color="#FFF" variant="Bold" />
                        </Box>
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                รูปแบบที่เปิดใช้งาน
                            </Typography>
                            <Typography variant="h4" fontWeight={700} color="#B76E79">
                                {shippingMethods.filter(m => m.enabled).length}
                                <Typography component="span" variant="body2" sx={{ ml: 1, color: '#888' }}>
                                    / {shippingMethods.length} รูปแบบ
                                </Typography>
                            </Typography>
                        </Box>
                    </Paper>

                    <Paper elevation={0} sx={{
                        flex: 1,
                        minWidth: 200,
                        p: 3,
                        borderRadius: '20px',
                        background: enableFreeShipping ? 'linear-gradient(135deg, #E8F5E9 0%, #FFF 100%)' : '#FAFAFA',
                        border: enableFreeShipping ? '1px solid rgba(46, 125, 50, 0.1)' : '1px solid rgba(0,0,0,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        transition: 'all 0.3s ease'
                    }}>
                        <Box sx={{
                            width: 52,
                            height: 52,
                            borderRadius: '14px',
                            background: enableFreeShipping ? 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)' : '#E0E0E0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: enableFreeShipping ? '0 4px 15px rgba(46, 125, 50, 0.3)' : 'none',
                            transition: 'all 0.3s ease'
                        }}>
                            <TickCircle size={26} color="#FFF" variant="Bold" />
                        </Box>
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                ส่งฟรีเมื่อซื้อครบ
                            </Typography>
                            <Typography variant="h4" fontWeight={700} color={enableFreeShipping ? '#2E7D32' : '#888'}>
                                {enableFreeShipping ? `฿${freeShippingThreshold.toLocaleString()}` : 'ปิด'}
                            </Typography>
                        </Box>
                    </Paper>
                </Box>

                {/* Shipping Methods */}
                <Paper elevation={0} sx={{
                    p: 0,
                    borderRadius: '24px',
                    border: '1px solid rgba(0,0,0,0.04)',
                    overflow: 'hidden',
                    mb: 4
                }}>
                    {/* Section Header */}
                    <Box sx={{
                        px: 4,
                        py: 3,
                        background: 'linear-gradient(90deg, #FAFAFA 0%, #FFF 100%)',
                        borderBottom: '1px solid rgba(0,0,0,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <TruckFast size={24} color="#B76E79" variant="Bold" />
                            <Box>
                                <Typography variant="h6" fontWeight={700}>รูปแบบการจัดส่ง</Typography>
                                <Typography variant="caption" color="text.secondary">กำหนดตัวเลือกและราคาค่าส่งสำหรับลูกค้า</Typography>
                            </Box>
                        </Box>
                        <Tooltip title="รีเฟรชข้อมูล">
                            <Button
                                size="small"
                                onClick={fetchShippingMethods}
                                sx={{ minWidth: 'auto', p: 1, borderRadius: '10px' }}
                            >
                                <RefreshCircle size={20} color="#888" />
                            </Button>
                        </Tooltip>
                    </Box>

                    {/* Methods Grid */}
                    <Box sx={{ p: 4 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3 }}>
                            {shippingMethods.map((method, idx) => (
                                <Fade in key={method.code} style={{ transitionDelay: `${idx * 80}ms` }}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: '20px',
                                            border: method.enabled ? '2px solid' : '1px solid',
                                            borderColor: method.enabled ? getMethodColor(method.code) : '#E0E0E0',
                                            bgcolor: method.enabled ? alpha(getMethodColor(method.code), 0.02) : '#FAFAFA',
                                            transition: 'all 0.3s ease',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&::before': method.enabled ? {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: '4px',
                                                background: `linear-gradient(90deg, ${getMethodColor(method.code)}, ${alpha(getMethodColor(method.code), 0.5)})`
                                            } : {}
                                        }}
                                    >
                                        {/* Method Header */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box sx={{
                                                    width: 52,
                                                    height: 52,
                                                    borderRadius: '14px',
                                                    background: getMethodBg(method.code),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: method.enabled ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                                                    transition: 'all 0.3s ease'
                                                }}>
                                                    {getMethodIcon(method.code, 26)}
                                                </Box>
                                                <Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                        <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '1rem' }}>{method.name}</Typography>
                                                        {method.code === 'express' && (
                                                            <Chip label="ด่วน" size="small" sx={{ bgcolor: '#B76E79', color: '#FFF', fontWeight: 600, fontSize: '0.65rem', height: 20 }} />
                                                        )}
                                                        {method.code === 'pickup' && (
                                                            <Chip label="ฟรี" size="small" sx={{ bgcolor: '#FF9800', color: '#FFF', fontWeight: 600, fontSize: '0.65rem', height: 20 }} />
                                                        )}
                                                        {method.code === 'cod' && (
                                                            <Chip label="COD" size="small" sx={{ bgcolor: '#9C27B0', color: '#FFF', fontWeight: 600, fontSize: '0.65rem', height: 20 }} />
                                                        )}
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <Timer1 size={13} color="#888" />
                                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>{method.estimatedDays}</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <Wallet3 size={13} color="#888" />
                                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                                                {method.price === 0 ? 'ฟรี' : `฿${method.price}`}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>

                                            <Switch
                                                checked={method.enabled}
                                                onChange={(e) => handleMethodChange(method.code, 'enabled', e.target.checked)}
                                                sx={{
                                                    '& .MuiSwitch-switchBase.Mui-checked': { color: getMethodColor(method.code) },
                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: getMethodColor(method.code) }
                                                }}
                                            />
                                        </Box>

                                        {/* Method Fields */}
                                        <Box sx={{
                                            opacity: method.enabled ? 1 : 0.4,
                                            transition: 'opacity 0.3s ease',
                                            pointerEvents: method.enabled ? 'auto' : 'none'
                                        }}>
                                            <Stack spacing={1.5}>
                                                <Stack direction="row" spacing={1.5}>
                                                    <TextField
                                                        label="ค่าจัดส่ง"
                                                        type="number"
                                                        value={method.price}
                                                        onChange={(e) => handleMethodChange(method.code, 'price', parseFloat(e.target.value) || 0)}
                                                        size="small"
                                                        InputProps={{
                                                            startAdornment: <InputAdornment position="start">฿</InputAdornment>
                                                        }}
                                                        sx={{ ...inputStyles, flex: 1 }}
                                                    />
                                                    <TextField
                                                        label="ระยะเวลา"
                                                        value={method.estimatedDays}
                                                        onChange={(e) => handleMethodChange(method.code, 'estimatedDays', e.target.value)}
                                                        size="small"
                                                        sx={{ ...inputStyles, flex: 1 }}
                                                    />
                                                </Stack>
                                                <TextField
                                                    label="รายละเอียด"
                                                    value={method.description}
                                                    onChange={(e) => handleMethodChange(method.code, 'description', e.target.value)}
                                                    size="small"
                                                    fullWidth
                                                    sx={inputStyles}
                                                />
                                            </Stack>
                                        </Box>
                                    </Paper>
                                </Fade>
                            ))}
                        </Box>
                    </Box>
                </Paper>

                {/* Free Shipping Settings */}
                <Paper elevation={0} sx={{
                    borderRadius: '24px',
                    border: '1px solid rgba(0,0,0,0.04)',
                    overflow: 'hidden',
                    mb: 4
                }}>
                    <Box sx={{
                        px: 4,
                        py: 3,
                        background: enableFreeShipping
                            ? 'linear-gradient(90deg, #E8F5E9 0%, #FFF 100%)'
                            : 'linear-gradient(90deg, #FAFAFA 0%, #FFF 100%)',
                        borderBottom: '1px solid rgba(0,0,0,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.3s ease'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '14px',
                                background: enableFreeShipping
                                    ? 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)'
                                    : '#E0E0E0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: enableFreeShipping ? '0 4px 15px rgba(46, 125, 50, 0.3)' : 'none',
                                transition: 'all 0.3s ease'
                            }}>
                                <TickCircle size={24} color="#FFF" variant="Bold" />
                            </Box>
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="h6" fontWeight={700}>โปรโมชันส่งฟรี</Typography>
                                    {enableFreeShipping && (
                                        <Chip
                                            label="ACTIVE"
                                            size="small"
                                            sx={{
                                                bgcolor: '#2E7D32',
                                                color: '#FFF',
                                                fontWeight: 700,
                                                fontSize: '0.65rem',
                                                height: 20
                                            }}
                                        />
                                    )}
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    กำหนดยอดสั่งซื้อขั้นต่ำเพื่อรับส่งฟรี
                                </Typography>
                            </Box>
                        </Box>
                        <Switch
                            checked={enableFreeShipping}
                            onChange={(e) => {
                                const isStandardEnabled = shippingMethods.find(m => m.code === 'standard')?.enabled;
                                if (e.target.checked && !isStandardEnabled) {
                                    setSnackbar({
                                        open: true,
                                        message: 'กรุณาเปิดใช้งาน "ขนส่งพัสดุ (Standard)" ก่อนเปิดโปรโมชันส่งฟรี',
                                        severity: 'error'
                                    });
                                    return;
                                }
                                setEnableFreeShipping(e.target.checked);
                                setHasChanges(true);
                            }}
                            sx={{
                                transform: 'scale(1.2)',
                                '& .MuiSwitch-switchBase.Mui-checked': { color: '#2E7D32' },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#2E7D32' }
                            }}
                        />
                    </Box>

                    <Fade in={enableFreeShipping}>
                        <Box sx={{ p: 4, display: enableFreeShipping ? 'block' : 'none' }}>
                            <Box sx={{
                                p: 3,
                                borderRadius: '16px',
                                bgcolor: alpha('#2E7D32', 0.04),
                                border: '1px dashed',
                                borderColor: alpha('#2E7D32', 0.2)
                            }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                                    {!shippingMethods.find(m => m.code === 'standard')?.enabled && (
                                        <Alert severity="warning" sx={{ borderRadius: '12px' }}>
                                            โปรโมชันนี้จะไม่ทำงานเนื่องจาก <strong>"ขนส่งพัสดุ (Standard)"</strong> ถูกปิดใช้งานอยู่
                                        </Alert>
                                    )}
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                        <Information size={20} color="#2E7D32" />
                                        <Typography variant="body2" color="text.secondary">
                                            ลูกค้าที่มียอดสั่งซื้อครบตามที่กำหนด จะได้รับส่งฟรีอัตโนมัติ (เฉพาะการจัดส่งแบบ Standard)
                                        </Typography>
                                    </Box>
                                </Box>
                                <TextField
                                    label="ยอดสั่งซื้อขั้นต่ำ"
                                    type="number"
                                    value={freeShippingThreshold}
                                    onChange={(e) => {
                                        setFreeShippingThreshold(parseFloat(e.target.value) || 0);
                                        setHasChanges(true);
                                    }}
                                    size="small"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">฿</InputAdornment>
                                    }}
                                    sx={{ ...inputStyles, minWidth: 220 }}
                                />
                            </Box>
                        </Box>
                    </Fade>
                </Paper>

                {/* Save Button */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 3,
                    borderRadius: '16px',
                    bgcolor: hasChanges ? alpha('#B76E79', 0.04) : 'transparent',
                    border: hasChanges ? '1px dashed' : 'none',
                    borderColor: alpha('#B76E79', 0.2),
                    transition: 'all 0.3s ease'
                }}>
                    {hasChanges && (
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Information size={16} color="#B76E79" />
                            มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
                        </Typography>
                    )}
                    <Box sx={{ ml: 'auto' }}>
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={saving}
                            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <TickCircle size={20} variant="Bold" />}
                            sx={{
                                background: 'linear-gradient(135deg, #B76E79 0%, #9D5D66 100%)',
                                px: 5,
                                py: 1.5,
                                borderRadius: '14px',
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '1rem',
                                boxShadow: '0 8px 25px rgba(183, 110, 121, 0.35)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 12px 30px rgba(183, 110, 121, 0.45)'
                                }
                            }}
                        >
                            {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                        </Button>
                    </Box>
                </Box>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    icon={snackbar.severity === 'success' ? <TickCircle size={20} variant="Bold" /> : undefined}
                    sx={{
                        borderRadius: '14px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                        fontWeight: 600,
                        '& .MuiAlert-icon': { alignItems: 'center' }
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </AdminLayout>
    );
}
