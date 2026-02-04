'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    TextField,
    Switch,
    FormControlLabel,
    Divider,
    Grid,
    CircularProgress,
    InputAdornment,
    IconButton
} from '@mui/material';
import { Save2, Bank, ScanBarcode, Image as ImageIcon, Trash } from 'iconsax-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useNotification } from '@/context/NotificationContext';
import Image from 'next/image';

export default function PaymentSettingsPage() {
    const { showSuccess, showError } = useNotification();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
    const [bankLogoFile, setBankLogoFile] = useState<File | null>(null);
    const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);

    const [settings, setSettings] = useState({
        bank: {
            enabled: true,
            bankName: '',
            accountNo: '',
            accountName: '',
            branch: '',
            bankLogo: ''
        },
        qr: {
            enabled: true,
            image: ''
        }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/payment');
            if (res.ok) {
                const data = await res.json();
                setSettings(data);

                // Clear any pending actions when reloading
                setBankLogoFile(null);
                setQrCodeFile(null);
                setFilesToDelete([]);
            }
        } catch (error) {
            console.error('Error:', error);
            showError('ไม่สามารถโหลดข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked, type } = e.target;
        setSettings(prev => ({
            ...prev,
            bank: {
                ...prev.bank,
                [name]: type === 'checkbox' ? checked : value
            }
        }));
    };

    const handleQrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target; // only for switch
        setSettings(prev => ({
            ...prev,
            qr: {
                ...prev.qr,
                enabled: checked
            }
        }));
    };

    const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;

        const file = e.target.files[0];

        // If replacing an existing server image, mark it for deletion
        if (settings.qr.image && !settings.qr.image.startsWith('blob:')) {
            setFilesToDelete(prev => [...prev, settings.qr.image]);
        }

        setQrCodeFile(file);

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setSettings(prev => ({
            ...prev,
            qr: { ...prev.qr, image: previewUrl }
        }));
    };

    const handleDeleteQrCode = () => {
        if (!settings.qr.image) return;

        // If it was a pending upload (blob), just clear it
        if (settings.qr.image.startsWith('blob:')) {
            setQrCodeFile(null);
        } else {
            // If it was a server file, mark for deletion
            setFilesToDelete(prev => [...prev, settings.qr.image]);
        }

        setSettings(prev => ({ ...prev, qr: { ...prev.qr, image: '' } }));
    };

    const handleBankLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;

        const file = e.target.files[0];

        // If replacing an existing server image, mark it for deletion
        if (settings.bank.bankLogo && !settings.bank.bankLogo.startsWith('blob:')) {
            setFilesToDelete(prev => [...prev, settings.bank.bankLogo]);
        }

        setBankLogoFile(file);

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setSettings(prev => ({
            ...prev,
            bank: { ...prev.bank, bankLogo: previewUrl }
        }));
    };

    const handleDeleteBankLogo = () => {
        if (!settings.bank.bankLogo) return;

        // If it was a pending upload (blob), just clear it
        if (settings.bank.bankLogo.startsWith('blob:')) {
            setBankLogoFile(null);
        } else {
            // If it was a server file, mark for deletion
            setFilesToDelete(prev => [...prev, settings.bank.bankLogo]);
        }

        setSettings(prev => ({ ...prev, bank: { ...prev.bank, bankLogo: '' } }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        // Create a copy of settings to modify
        let finalSettings = { ...settings };

        try {
            // 1. Delete old files if marked
            if (filesToDelete.length > 0) {
                await Promise.all(filesToDelete.map(async (filePath) => {
                    try {
                        await fetch('/api/delete-file', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ filePath })
                        });
                    } catch (err) {
                        console.error('Error deleting file:', err);
                    }
                }));
            }

            // 2. Upload Bank Logo if new file exists
            if (bankLogoFile) {
                const formData = new FormData();
                formData.append('file', bankLogoFile);

                const upRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (upRes.ok) {
                    const upData = await upRes.json();
                    finalSettings.bank.bankLogo = upData.url;
                } else {
                    throw new Error('Failed to upload bank logo');
                }
            }

            // 3. Upload QR Code if new file exists
            if (qrCodeFile) {
                const formData = new FormData();
                formData.append('file', qrCodeFile);

                const upRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (upRes.ok) {
                    const upData = await upRes.json();
                    finalSettings.qr.image = upData.url;
                } else {
                    throw new Error('Failed to upload QR code');
                }
            }

            // 4. Save Settings
            const res = await fetch('/api/admin/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalSettings)
            });

            if (res.ok) {
                showSuccess('บันทึกการตั้งค่าเรียบร้อยแล้ว');
                // Clean up state
                setFilesToDelete([]);
                setBankLogoFile(null);
                setQrCodeFile(null);
                // Update state with final URLs
                setSettings(finalSettings);
            } else {
                showError('บันทึกข้อมูลไม่สำเร็จ');
            }
        } catch (error) {
            console.error(error);
            showError('เกิดข้อผิดพลาดในการบันทึก');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout title="ตั้งค่าการชำระเงิน">
            {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10 }}>
                    <CircularProgress size={40} sx={{ color: '#B76E79', mb: 2 }} />
                    <Typography sx={{ color: '#888' }}>กำลังโหลดข้อมูลการตั้งค่า...</Typography>
                </Box>
            ) : (
                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>

                        {/* Bank Transfer Section */}
                        <Paper sx={{ p: 4, borderRadius: '24px' }} elevation={0}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ p: 1.5, bgcolor: '#FFF5F5', borderRadius: '12px', color: '#B76E79' }}>
                                        <Bank size={24} variant="Bold" color="#B76E79" />
                                    </Box>
                                    <Typography variant="h6" fontWeight={700}>โอนเงินผ่านบัญชีธนาคาร</Typography>
                                </Box>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.bank.enabled}
                                            onChange={handleBankChange}
                                            name="enabled"
                                            color="success"
                                        />
                                    }
                                    label="เปิดใช้งาน"
                                />
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    {settings.bank.bankLogo ? (
                                        <Box sx={{ position: 'relative', width: 64, height: 64, borderRadius: '12px', overflow: 'hidden', border: '1px solid #EEE' }}>
                                            <Image
                                                src={settings.bank.bankLogo}
                                                alt="Bank Logo"
                                                fill
                                                style={{ objectFit: 'contain', padding: '4px' }}
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={handleDeleteBankLogo}
                                                sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255,255,255,0.8)', padding: '2px', borderRadius: '0 0 0 8px' }}
                                            >
                                                <Trash size={12} color="#FF4d4F" />
                                            </IconButton>
                                        </Box>
                                    ) : (
                                        <Box sx={{ width: 64, height: 64, borderRadius: '12px', bgcolor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #DDD' }}>
                                            <Bank size={24} color="#BBB" variant="Bold" />
                                        </Box>
                                    )}
                                    <Box>
                                        <Button
                                            component="label"
                                            size="small"
                                            variant="outlined"
                                            disabled={!settings.bank.enabled || uploading}
                                            startIcon={<ImageIcon size={16} variant="Bold" color="#B76E79" />}
                                            sx={{ borderRadius: '8px', textTransform: 'none' }}
                                        >
                                            {uploading ? '...' : (settings.bank.bankLogo ? 'เปลี่ยนโลโก้' : 'อัปโหลดโลโก้')}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={handleBankLogoUpload}
                                                onClick={(e) => (e.target as HTMLInputElement).value = ''}
                                            />
                                        </Button>
                                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                            ขนาดแนะนำ 100x100px
                                        </Typography>
                                    </Box>
                                </Box>

                                <TextField
                                    fullWidth
                                    label="ชื่อธนาคาร"
                                    name="bankName"
                                    value={settings.bank.bankName}
                                    onChange={handleBankChange}
                                    placeholder="เช่น ธนาคารกสิกรไทย (KBANK)"
                                    disabled={!settings.bank.enabled}
                                />
                                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                                    <TextField
                                        fullWidth
                                        label="เลขที่บัญชี"
                                        name="accountNo"
                                        value={settings.bank.accountNo}
                                        onChange={handleBankChange}
                                        placeholder="เช่น 012-3-45678-9"
                                        disabled={!settings.bank.enabled}
                                    />
                                    <TextField
                                        fullWidth
                                        label="สาขา"
                                        name="branch"
                                        value={settings.bank.branch}
                                        onChange={handleBankChange}
                                        placeholder="เช่น สยามพารากอน"
                                        disabled={!settings.bank.enabled}
                                    />
                                </Box>
                                <TextField
                                    fullWidth
                                    label="ชื่อบัญชี"
                                    name="accountName"
                                    value={settings.bank.accountName}
                                    onChange={handleBankChange}
                                    placeholder="เช่น บริษัท ฮานฟลาวเวอร์ จำกัด"
                                    disabled={!settings.bank.enabled}
                                />
                            </Box>
                        </Paper>

                        {/* QR Code Section */}
                        <Paper sx={{ p: 4, borderRadius: '24px' }} elevation={0}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ p: 1.5, bgcolor: '#FFF5F5', borderRadius: '12px', color: '#B76E79' }}>
                                        <ScanBarcode size={24} variant="Bold" color="#B76E79" />
                                    </Box>
                                    <Typography variant="h6" fontWeight={700}>ชำระผ่าน QR Code</Typography>
                                </Box>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            name="enabled"
                                            checked={settings.qr.enabled}
                                            onChange={handleQrChange}
                                            color="success"
                                        />
                                    }
                                    label="เปิดใช้งาน"
                                />
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, p: 3, border: '1px dashed #E0E0E0', borderRadius: '16px', bgcolor: '#FAFAFA' }}>
                                {settings.qr.image ? (
                                    <Box sx={{ position: 'relative', width: 200, height: 200, borderRadius: '12px', overflow: 'hidden', border: '1px solid #EEE' }}>
                                        <Image
                                            src={settings.qr.image}
                                            alt="QR Code"
                                            fill
                                            style={{ objectFit: 'contain', padding: '4px' }}
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={handleDeleteQrCode}
                                            sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255,255,255,0.8)', padding: '2px', borderRadius: '0 0 0 8px' }}
                                        >
                                            <Trash size={16} color="#FF4d4F" />
                                        </IconButton>
                                    </Box>
                                ) : (
                                    <Box sx={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#EEE', borderRadius: '12px' }}>
                                        <ImageIcon size={40} color="#999" variant="Bold" />
                                    </Box>
                                )}

                                <Button
                                    component="label"
                                    variant="outlined"
                                    disabled={!settings.qr.enabled || uploading}
                                    startIcon={uploading ? <CircularProgress size={20} /> : <ImageIcon />}
                                >
                                    {uploading ? 'กำลังอัปโหลด...' : (settings.qr.image ? 'เปลี่ยนรูป QR Code' : 'อัปโหลดรูป QR Code')}
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleQrUpload}
                                        onClick={(e) => (e.target as HTMLInputElement).value = ''}
                                    />
                                </Button>
                                <Typography variant="caption" color="text.secondary">
                                    รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB
                                </Typography>
                            </Box>
                        </Paper>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button
                                variant="outlined"
                                sx={{ borderRadius: '12px', color: '#666', borderColor: '#DDD' }}
                                onClick={() => fetchSettings()} // Reset
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={saving}
                                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save2 size={20} variant="Bold" color="#FFF" />}
                                sx={{
                                    bgcolor: '#B76E79',
                                    borderRadius: '12px',
                                    px: 4,
                                    '&:hover': { bgcolor: '#A45D68' }
                                }}
                            >
                                {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                            </Button>
                        </Box>
                    </Box>
                </form>
            )}
        </AdminLayout>
    );
}
