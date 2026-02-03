'use client';

import { useState, useEffect, use } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    TextField,
    Stack,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Switch,
    FormControlLabel,
    InputAdornment
} from '@mui/material';
import { Save2, Ticket, Calendar } from 'iconsax-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useNotification } from '@/context/NotificationContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

export default function CouponEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const isNew = id === 'new';

    return (
        <AdminLayout title={isNew ? 'สร้างคูปองใหม่' : 'แก้ไขคูปอง'}>
            <CouponEditorContent id={id} isNew={isNew} />
        </AdminLayout>
    );
}

function CouponEditorContent({ id, isNew }: { id: string; isNew: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const { showSuccess, showError } = useNotification();

    const [form, setForm] = useState({
        code: '',
        discount: '',
        type: 'percent' as 'percent' | 'fixed',
        minSpend: '0',
        maxDiscount: '',
        limit: '',
        expireAt: '',
        isActive: true
    });

    useEffect(() => {
        if (!isNew) {
            const fetchCoupon = async () => {
                try {
                    const res = await fetch(`/api/admin/coupons/${id}`);
                    if (res.ok) {
                        const data = await res.json();
                        setForm({
                            code: data.code,
                            discount: data.discount,
                            type: data.type,
                            minSpend: data.minSpend || '0',
                            maxDiscount: data.maxDiscount || '',
                            limit: data.limit || '',
                            expireAt: data.expireAt ? new Date(data.expireAt).toISOString().split('T')[0] : '',
                            isActive: data.isActive
                        });
                    } else {
                        showError('ไม่พบคูปอง');
                        router.push('/admin/coupons');
                    }
                } catch (err) {
                    showError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
                } finally {
                    setLoading(false);
                }
            };
            fetchCoupon();
        }
    }, [id, isNew, router, showSuccess, showError]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
        const { name, value, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === 'isActive' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.code.trim()) {
            showError('กรุณาระบุรหัสคูปอง');
            return;
        }
        if (!form.discount || parseFloat(form.discount) <= 0) {
            showError('กรุณาระบุส่วนลดให้ถูกต้อง');
            return;
        }

        setSaving(true);

        try {
            const payload = {
                ...form,
                code: form.code.toUpperCase().replace(/[^A-Z0-9]/g, ''),
                discount: parseFloat(form.discount),
                minSpend: parseFloat(form.minSpend),
                maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : null,
                limit: form.limit ? parseInt(form.limit) : null,
                expireAt: form.expireAt ? new Date(form.expireAt).toISOString() : null
            };

            const url = isNew ? '/api/admin/coupons' : `/api/admin/coupons/${id}`;
            const method = isNew ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'เกิดข้อผิดพลาด');
            }

            showSuccess(isNew ? 'สร้างคูปองสำเร็จ' : 'อัปเดตคูปองสำเร็จ');
            setTimeout(() => router.push('/admin/coupons'), 1500);

        } catch (error: any) {
            showError(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress color="inherit" />
            </Box>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid rgba(0,0,0,0.03)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Box sx={{ p: 1.5, bgcolor: '#FFF5F5', borderRadius: '12px', color: '#B76E79' }}>
                            <Ticket size={24} variant="Bold" color="#B76E79" />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>ข้อมูลคูปอง</Typography>
                    </Box>

                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            label="รหัสคูปอง (Code)"
                            name="code"
                            value={form.code}
                            onChange={(e) => {
                                // Auto-uppercase and remove special chars
                                const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                setForm(prev => ({ ...prev, code: val }));
                            }}
                            required
                            placeholder="เช่น SALE2024"
                            helperText="ใช้ตัวอักษรภาษาอังกฤษพิมพ์ใหญ่และตัวเลขเท่านั้น"
                            InputProps={{
                                startAdornment: <InputAdornment position="start">#</InputAdornment>,
                                sx: { fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1 }
                            }}
                        />

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <FormControl sx={{ minWidth: 150 }}>
                                <InputLabel>ประเภทส่วนลด</InputLabel>
                                <Select
                                    value={form.type}
                                    label="ประเภทส่วนลด"
                                    name="type"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="percent">เปอร์เซ็นต์ (%)</MenuItem>
                                    <MenuItem value="fixed">จำนวนเงิน (บาท)</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                sx={{ flex: 1 }}
                                label="มูลค่าส่วนลด"
                                name="discount"
                                type="number"
                                value={form.discount}
                                onChange={handleChange}
                                required
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">{form.type === 'percent' ? '%' : 'บาท'}</InputAdornment>
                                }}
                            />
                        </Box>

                        <TextField
                            fullWidth
                            label="ยอดสั่งซื้อขั้นต่ำ"
                            name="minSpend"
                            type="number"
                            value={form.minSpend}
                            onChange={handleChange}
                            helperText="ใส่ 0 หากไม่มีขั้นต่ำ"
                            InputProps={{
                                startAdornment: <InputAdornment position="start">฿</InputAdornment>
                            }}
                        />

                        {form.type === 'percent' && (
                            <TextField
                                fullWidth
                                label="ลดสูงสุด (บาท)"
                                name="maxDiscount"
                                type="number"
                                value={form.maxDiscount}
                                onChange={handleChange}
                                helperText="ปล่อยว่างหากไม่จำกัด"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">฿</InputAdornment>
                                }}
                            />
                        )}

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <TextField
                                sx={{ flex: 1 }}
                                label="จำนวนโควต้า (สิทธิ์)"
                                name="limit"
                                type="number"
                                value={form.limit}
                                onChange={handleChange}
                                helperText="ปล่อยว่างหากไม่จำกัดจำนวนสิทธิ์"
                            />
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
                                <DatePicker
                                    label="วันหมดอายุ"
                                    value={form.expireAt ? dayjs(form.expireAt) : null}
                                    onChange={(newValue) => {
                                        setForm(prev => ({
                                            ...prev,
                                            expireAt: newValue ? newValue.format('YYYY-MM-DD') : ''
                                        }));
                                    }}
                                    sx={{ flex: 1 }}
                                    slotProps={{ textField: { helperText: "ปล่อยว่างหากไม่มีวันหมดอายุ" } }}
                                />
                            </LocalizationProvider>
                        </Box>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={form.isActive}
                                    onChange={handleChange}
                                    name="isActive"
                                    color="success"
                                />
                            }
                            label="เปิดใช้งานคูปอง"
                        />
                    </Stack>
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                        variant="outlined"
                        component={Link}
                        href="/admin/coupons"
                        sx={{ borderRadius: '12px', border: '1px solid #DDD', color: '#666' }}
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save2 size={20} variant="Bold" />}
                        sx={{
                            bgcolor: '#B76E79',
                            borderRadius: '12px',
                            px: 4,
                            '&:hover': { bgcolor: '#A45D68' }
                        }}
                    >
                        {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                    </Button>
                </Box>
            </Box>
        </form>
    );
}
