'use client';

import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, TextField, Switch,
    FormControlLabel, Button, Divider, Stack, CircularProgress
} from '@mui/material';
import { Notification as NotificationIcon, Save2 } from 'iconsax-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useNotification } from '@/context/NotificationContext';

export default function SettingsPage() {
    const { showSuccess, showError } = useNotification();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        promo_bar_enabled: 'true',
        promo_bar_title: "Valentine's Special",
        promo_bar_text: "ลด 10% จนถึงวันที่ 10 ก.พ. นี้",
        valentine_popup_enabled: 'true',
        valentine_popup_title: "10% OFF",
        valentine_popup_text: "เติมเต็มความหวานในเทศกาลแห่งความรัก\nรับส่วนลดพิเศษทันที เมื่อสั่งซื้อวันนี้ - 10 ก.พ. 69",
        valentine_popup_image: "/images/about-valentine.webp",
    });

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (Object.keys(data).length > 0) {
                    setSettings(prev => ({ ...prev, ...data }));
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings }),
            });

            if (res.ok) {
                showSuccess('บันทึกการตั้งค่าเรียบร้อยแล้ว');
            } else {
                showError('เกิดข้อผิดพลาดในการบันทึก');
            }
        } catch (error) {
            showError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout title="การตั้งค่าการตลาด">
            {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10 }}>
                    <CircularProgress size={40} sx={{ color: '#B76E79', mb: 2 }} />
                    <Typography sx={{ color: '#888' }}>กำลังโหลดข้อมูลการตั้งค่า...</Typography>
                </Box>
            ) : (
                <Box>
                    {/* Promotion Bar Settings */}
                    <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', mb: 4 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <NotificationIcon size={24} variant="Bulk" color="#B76E79" />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>Promotion Bar (แถบด้านบน)</Typography>
                            </Box>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.promo_bar_enabled === 'true'}
                                        onChange={(e) => handleChange('promo_bar_enabled', e.target.checked ? 'true' : 'false')}
                                        color="primary"
                                    />
                                }
                                label={settings.promo_bar_enabled === 'true' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                            />
                        </Stack>

                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="หัวข้อ (Title)"
                                value={settings.promo_bar_title}
                                onChange={(e) => handleChange('promo_bar_title', e.target.value)}
                                placeholder="เช่น Valentine's Special"
                            />
                            <TextField
                                fullWidth
                                label="ข้อความ (Content)"
                                value={settings.promo_bar_text}
                                onChange={(e) => handleChange('promo_bar_text', e.target.value)}
                                placeholder="เช่น ลด 10% จนถึงวันที่ 10 ก.พ. นี้"
                            />
                        </Stack>
                    </Paper>

                    {/* Valentine Popup Settings */}
                    <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', mb: 4 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <NotificationIcon size={24} variant="Bulk" color="#B76E79" />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>Valentine Popup (ป๊อปอัพหน้าแรก)</Typography>
                            </Box>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.valentine_popup_enabled === 'true'}
                                        onChange={(e) => handleChange('valentine_popup_enabled', e.target.checked ? 'true' : 'false')}
                                        color="primary"
                                    />
                                }
                                label={settings.valentine_popup_enabled === 'true' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                            />
                        </Stack>

                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="หัวข้อใหญ่ (Main Title)"
                                value={settings.valentine_popup_title}
                                onChange={(e) => handleChange('valentine_popup_title', e.target.value)}
                            />
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="รายละเอียด (Description)"
                                value={settings.valentine_popup_text}
                                onChange={(e) => handleChange('valentine_popup_text', e.target.value)}
                            />
                            <TextField
                                fullWidth
                                label="URL รูปภาพ (Image URL)"
                                value={settings.valentine_popup_image}
                                onChange={(e) => handleChange('valentine_popup_image', e.target.value)}
                                placeholder="/images/about-valentine.webp"
                            />
                        </Stack>
                    </Paper>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<Save2 variant="Bold" />}
                            onClick={handleSave}
                            disabled={saving}
                            sx={{
                                bgcolor: '#B76E79',
                                px: 4,
                                py: 1.5,
                                borderRadius: '12px',
                                fontWeight: 600,
                                '&:hover': { bgcolor: '#A35D67' }
                            }}
                        >
                            {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าทั้งหมด'}
                        </Button>
                    </Box>
                </Box>
            )}
        </AdminLayout>
    );
}
