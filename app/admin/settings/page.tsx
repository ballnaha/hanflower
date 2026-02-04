'use client';

import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, TextField, Switch,
    FormControlLabel, Button, Divider, Stack, CircularProgress
} from '@mui/material';
import { Notification as NotificationIcon, Save2, Image as ImageIcon, Trash } from 'iconsax-react';
import AdminLayout from '@/components/admin/AdminLayout';
import Image from 'next/image';
import { useNotification } from '@/context/NotificationContext';

export default function SettingsPage() {
    const { showSuccess, showError } = useNotification();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [popupFile, setPopupFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [urlsToDelete, setUrlsToDelete] = useState<string[]>([]);
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
            let updatedSettings = { ...settings };
            let finalUrlsToDelete = [...urlsToDelete];

            // 1. Upload popup image if a new file is selected
            if (popupFile) {
                // If there's an existing image, mark it for deletion
                if (settings.valentine_popup_image) {
                    finalUrlsToDelete.push(settings.valentine_popup_image);
                }

                const formData = new FormData();
                formData.append('file', popupFile);
                const uploadRes = await fetch('/api/admin/upload/settings', {
                    method: 'POST',
                    body: formData
                });
                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    updatedSettings.valentine_popup_image = uploadData.url;
                } else {
                    showError('อัปโหลดรูปภาพล้มเหลว');
                    setSaving(false);
                    return;
                }
            }

            const res = await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: updatedSettings, urlsToDelete: finalUrlsToDelete }),
            });

            if (res.ok) {
                showSuccess('บันทึกการตั้งค่าเรียบร้อยแล้ว');
                setSettings(updatedSettings);
                setPopupFile(null);
                setPreviewUrl(null);
                setUrlsToDelete([]); // Clear deletion list after success
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
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>รูปภาพป๊อปอัพ</Typography>
                                <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                                    {(settings.valentine_popup_image || previewUrl) && (
                                        <Box sx={{
                                            position: 'relative',
                                            width: 120,
                                            height: 120,
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            border: '1px solid #eee',
                                            '&:hover .delete-overlay': { display: 'flex' }
                                        }}>
                                            <Image
                                                src={previewUrl || settings.valentine_popup_image}
                                                alt="Popup Preview"
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                            <Box
                                                className="delete-overlay"
                                                onClick={() => {
                                                    if (previewUrl) {
                                                        // If it's a newly selected file, just clear it locally
                                                        setPreviewUrl(null);
                                                        setPopupFile(null);
                                                    } else if (settings.valentine_popup_image) {
                                                        // If it's an existing image from server, track it for deletion
                                                        setUrlsToDelete(prev => [...prev, settings.valentine_popup_image]);
                                                        handleChange('valentine_popup_image', '');
                                                    }
                                                }}
                                                sx={{
                                                    position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)',
                                                    display: 'none', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer', zIndex: 2
                                                }}
                                            >
                                                <Trash size="24" color="#FFF" />
                                            </Box>
                                        </Box>
                                    )}
                                    <Box sx={{ flex: 1 }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            startIcon={<ImageIcon size="20" />}
                                            sx={{ borderRadius: '12px', textTransform: 'none', mb: 1 }}
                                        >
                                            อัปโหลดรูปภาพใหม่
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    setPopupFile(file);
                                                    setPreviewUrl(URL.createObjectURL(file));
                                                }}
                                            />
                                        </Button>
                                        <Typography variant="caption" display="block" color="textSecondary">
                                            แนะนำรูปทรงจัตุรัส ระบบจะทำการ Resize และแปลงเป็น WebP ให้อัตโนมัติ
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
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
