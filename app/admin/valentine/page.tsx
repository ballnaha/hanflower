"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Typography,
    Paper,
    IconButton,
    InputAdornment,
    Chip,
    CircularProgress,
    TextField,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import {
    AddCircle,
    SearchNormal,
    Edit,
    Trash,
    Copy,
    Export,
    Maximize,
    DeviceMessage,
    Printer,
    ScanBarcode,
    CloseCircle
} from "iconsax-react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import QRCode from "qrcode";

export default function AdminValentinePage() {
    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null);
    const [qrTitle, setQrTitle] = useState("Happy Valentine's Day");
    const [cardPreviewUrl, setCardPreviewUrl] = useState<string | null>(null);

    const fetchCards = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/valentine");
            if (res.ok) {
                const data = await res.json();
                setCards(data || []);
            }
        } catch (error) {
            console.error("Failed to fetch cards", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCards();
    }, []);

    const handleDeleteClick = (id: string) => {
        setSelectedCardId(id);
        setDeleteConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedCardId) return;
        try {
            const res = await fetch(`/api/admin/valentine/${selectedCardId}`, { method: "DELETE" });
            if (res.ok) {
                setCards(cards.filter(c => c.id !== selectedCardId));
                setDeleteConfirmOpen(false);
            }
        } catch (error) { console.error(error); }
    };

    const handleShowQR = async (card: any) => {
        const url = `${window.location.origin}/valentine/${card.slug}`;
        const qr = await QRCode.toDataURL(url, { width: 400, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
        setQrPreviewUrl(qr);
        setQrTitle(card.title);
        setQrDialogOpen(true);
    };

    const filteredCards = cards.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.signer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout title="Valentine Cards 💘">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                        จัดการการ์ดวาเลนไทน์และกิจกรรมพิเศษของคุณ ({cards.length} รายการ)
                    </Typography>
                </Box>
                <Button
                    component={Link}
                    href="/admin/valentine/new"
                    variant="contained"
                    startIcon={<AddCircle size={20} color="#FFFFFF" variant="Linear" />}
                    sx={{
                        bgcolor: '#B76E79',
                        borderRadius: '12px',
                        textTransform: 'none',
                        px: 3,
                        boxShadow: '0 10px 20px rgba(183, 110, 121, 0.2)',
                        '&:hover': { bgcolor: '#A45D68', boxShadow: '0 12px 24px rgba(183, 110, 121, 0.3)' }
                    }}
                >
                    สร้างการ์ดใหม่
                </Button>
            </Box>

            <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                    placeholder="ค้นหาจากการพาดหัว, Slug หรือผู้ส่ง..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { bgcolor: '#F9F9F9', borderRadius: '10px', '& fieldset': { border: 'none' } } }}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchNormal size={18} color="#999" /></InputAdornment> }}
                />
            </Paper>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3 }}>
                {loading ? (
                    <Box sx={{ gridColumn: '1 / -1', py: 10, textAlign: 'center' }}>
                        <CircularProgress sx={{ color: '#B76E79' }} />
                        <Typography sx={{ mt: 2, color: '#666' }}>กำลังโหลดข้อมูลการ์ด...</Typography>
                    </Box>
                ) : filteredCards.length === 0 ? (
                    <Box sx={{ gridColumn: '1 / -1', py: 10, textAlign: 'center', opacity: 0.5 }}>
                        <Typography variant="h6">ไม่พบข้อมูลการ์ด</Typography>
                        <Typography variant="body2">ลองสร้างการ์ดใหม่เพื่อเริ่มใช้งาน</Typography>
                    </Box>
                ) : (
                    filteredCards.map((card) => (
                        <Paper key={card.id} className="p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Typography variant="h6" className="font-bold text-gray-800 line-clamp-1">{card.title}</Typography>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Chip label={`@${card.slug}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 20 }} />
                                        <Typography variant="caption" color="textSecondary">By {card.signer}</Typography>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Tooltip title="View Link">
                                        <IconButton size="small" component="a" href={`/valentine/${card.slug}`} target="_blank"><Export size="18" color="#B76E79" /></IconButton>
                                    </Tooltip>
                                    <Tooltip title="QR Code">
                                        <IconButton size="small" onClick={() => handleShowQR(card)}><ScanBarcode size="18" color="#B76E79" /></IconButton>
                                    </Tooltip>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 py-2 border-y border-gray-50 text-gray-500">
                                <div className="text-center flex-1">
                                    <Typography variant="h6" className="font-bold text-gray-800">{card.memories?.length || 0}</Typography>
                                    <Typography variant="caption" className="uppercase font-bold text-[0.6rem] tracking-wider">Memories</Typography>
                                </div>
                                <div className="text-center flex-1 border-x border-gray-100">
                                    <Typography variant="h6" className="font-bold text-gray-800">{card.productIds?.length || 0}</Typography>
                                    <Typography variant="caption" className="uppercase font-bold text-[0.6rem] tracking-wider">Products</Typography>
                                </div>
                                <div className="text-center flex-1">
                                    <Typography variant="h6" className="font-bold text-gray-800">{card.isActive ? 'ON' : 'OFF'}</Typography>
                                    <Typography variant="caption" className={`uppercase font-bold text-[0.6rem] tracking-wider ${card.isActive ? 'text-green-500' : 'text-red-500'}`}>Status</Typography>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button component={Link} href={`/admin/valentine/${card.id}`} fullWidth variant="outlined" startIcon={<Edit size="16" />} sx={{ borderRadius: '10px', textTransform: 'none', color: '#B76E79', borderColor: '#B76E79', '&:hover': { borderColor: '#A45D68', bgcolor: 'rgba(183, 110, 121, 0.05)' } }}>
                                    Edit Settings
                                </Button>
                                <IconButton onClick={() => handleDeleteClick(card.id)} sx={{ bgcolor: '#FFF1F0', color: '#FF4D4F', borderRadius: '10px', '&:hover': { bgcolor: '#FFCCC7' } }}>
                                    <Trash size="18" variant="Bold" />
                                </IconButton>
                            </div>
                        </Paper>
                    ))
                )}
            </Box>

            <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">QR Code</Typography>
                    <IconButton onClick={() => setQrDialogOpen(false)}><CloseCircle size="24" /></IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        {qrPreviewUrl && <img src={qrPreviewUrl} className="w-full h-auto rounded-xl shadow-inner border" alt="QR Code" />}
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>{qrTitle}</Typography>
                        <Button variant="contained" fullWidth startIcon={<Printer color="#fff" />} sx={{ mt: 3, bgcolor: '#D4AF37', py: 1.5, borderRadius: '50px' }}>Download QR</Button>
                    </Box>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Delete this card?</DialogTitle>
                <DialogContent>This action cannot be undone.</DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                    <Button color="error" onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    );
}
