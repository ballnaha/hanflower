"use client";

import React, { useState, useEffect, useRef } from "react";
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
import html2canvas from "html2canvas";

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
    const [qrOrientation, setQrOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
    const cardRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);

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
        const qr = await QRCode.toDataURL(url, { width: 400, margin: 2, color: { dark: '#000000', light: '#00000000' } });
        setQrPreviewUrl(qr);
        setQrTitle(card.title);
        setQrDialogOpen(true);
    };

    const handleDownloadCard = async () => {
        if (!cardRef.current) return;
        setDownloading(true);
        try {
            // Wait a bit for images to be fully ready
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                scale: 3, // Higher resolution
                backgroundColor: null,
                logging: false,
            });

            const image = canvas.toDataURL("image/png", 1.0);
            const link = document.createElement("a");
            link.download = `hanflower-card-${qrTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
            link.href = image;
            link.click();
        } catch (error) {
            console.error("Failed to download card", error);
        } finally {
            setDownloading(false);
        }
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
                                    <Typography variant="h6" className="font-bold text-gray-800 line-clamp-1">
                                        {card.jobName || card.title}
                                    </Typography>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Chip label={`@${card.slug}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 20 }} />
                                        <Typography variant="caption" color="textSecondary">By {card.signer || 'Admin'}</Typography>
                                        {card.title !== card.jobName && card.jobName && (
                                            <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic' }}>({card.title})</Typography>
                                        )}
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
                                    <Typography variant="h6" className="font-bold text-gray-800">{card._count?.memories || 0}</Typography>
                                    <Typography variant="caption" className="uppercase font-bold text-[0.6rem] tracking-wider">Memories</Typography>
                                </div>
                                <div className="text-center flex-1 border-x border-gray-100">
                                    <Typography variant="h6" className="font-bold text-gray-800">{card.orderedProducts?.length || 0}</Typography>
                                    <Typography variant="caption" className="uppercase font-bold text-[0.6rem] tracking-wider">Products</Typography>
                                </div>
                                <div className="text-center flex-1">
                                    <Typography variant="h6" className="font-bold text-gray-800">{card.status === 'active' ? 'ON' : 'OFF'}</Typography>
                                    <Typography variant="caption" className={`uppercase font-bold text-[0.6rem] tracking-wider ${card.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>Status</Typography>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button component={Link} href={`/admin/valentine/${card.id}`} fullWidth variant="outlined" startIcon={<Edit size="16" />} sx={{ borderRadius: '10px', textTransform: 'none', color: '#B76E79', borderColor: '#B76E79', '&:hover': { borderColor: '#A45D68', bgcolor: 'rgba(183, 110, 121, 0.05)' } }}>
                                    Edit Settings
                                </Button>
                                <IconButton onClick={() => handleDeleteClick(card.id)} sx={{ bgcolor: '#FFF1F0', color: '#FF4D4F', borderRadius: '10px', '&:hover': { bgcolor: '#FFCCC7' } }}>
                                    <Trash size="18" variant="Bold" color="#FF4D4F" />
                                </IconButton>
                            </div>
                        </Paper>
                    ))
                )}
            </Box>

            <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">QR Code Card Preview</Typography>
                        <Typography variant="caption" color="textSecondary">เลือกรูปแบบการแสดงผลที่ต้องการ</Typography>
                    </Box>
                    <IconButton onClick={() => setQrDialogOpen(false)}><CloseCircle size="24" /></IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 3, display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button
                            variant={qrOrientation === 'horizontal' ? 'contained' : 'outlined'}
                            onClick={() => setQrOrientation('horizontal')}
                            size="small"
                            sx={{ borderRadius: '20px', textTransform: 'none', bgcolor: qrOrientation === 'horizontal' ? '#B76E79' : 'transparent', color: qrOrientation === 'horizontal' ? '#fff' : '#B76E79', borderColor: '#B76E79' }}
                        >
                            แนวนอน
                        </Button>
                        <Button
                            variant={qrOrientation === 'vertical' ? 'contained' : 'outlined'}
                            onClick={() => setQrOrientation('vertical')}
                            size="small"
                            sx={{ borderRadius: '20px', textTransform: 'none', bgcolor: qrOrientation === 'vertical' ? '#B76E79' : 'transparent', color: qrOrientation === 'vertical' ? '#fff' : '#B76E79', borderColor: '#B76E79' }}
                        >
                            แนวตั้ง
                        </Button>
                    </Box>

                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        {/* Card Mockup */}
                        <Box
                            ref={cardRef}
                            sx={{
                                width: '100%',
                                maxWidth: qrOrientation === 'horizontal' ? '500px' : '350px',
                                mx: 'auto',
                                aspectRatio: qrOrientation === 'horizontal' ? '1.6 / 1' : '1 / 1.6',
                                background: '#fff', // Ensure solid background for capture
                                backgroundImage: `url(/images/card_blank${qrOrientation === 'vertical' ? '_vertical' : ''}.jpg)`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderRadius: '12px',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                display: 'flex',
                                flexDirection: qrOrientation === 'horizontal' ? 'row' : 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: 3,
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                            {/* Crop Marks for cutting */}
                            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '15px', height: '15px', borderTop: '1px solid rgba(0,0,0,0.1)', borderLeft: '1px solid rgba(0,0,0,0.1)' }} />
                            <Box sx={{ position: 'absolute', top: 0, right: 0, width: '15px', height: '15px', borderTop: '1px solid rgba(0,0,0,0.1)', borderRight: '1px solid rgba(0,0,0,0.1)' }} />
                            <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '15px', height: '15px', borderBottom: '1px solid rgba(0,0,0,0.1)', borderLeft: '1px solid rgba(0,0,0,0.1)' }} />
                            <Box sx={{ position: 'absolute', bottom: 0, right: 0, width: '15px', height: '15px', borderBottom: '1px solid rgba(0,0,0,0.1)', borderRight: '1px solid rgba(0,0,0,0.1)' }} />

                            {/* QR Section */}
                            <Box sx={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1
                            }}>
                                <Typography sx={{ fontSize: qrOrientation === 'horizontal' ? '12px' : '14px', fontWeight: 800, mb: 0, color: '#2C1A1D', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    {cards.find(c => c.title === qrTitle)?.jobName || "FOR MY LOVE"}
                                </Typography>
                                {qrPreviewUrl && (
                                    <Box sx={{ p: 0, borderRadius: '4px' }}>
                                        <img src={qrPreviewUrl} style={{ width: qrOrientation === 'horizontal' ? '350px' : '250px', height: 'auto', display: 'block' }} alt="QR" />
                                    </Box>
                                )}
                                <Typography sx={{ fontSize: '10px', mt: 1, color: '#666', fontWeight: 500 }}>
                                    สแกนเพื่อดูข้อความ
                                </Typography>
                            </Box>

                            {/* Heart Section */}
                            <Box sx={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mt: qrOrientation === 'vertical' ? 2 : 0,
                                zIndex: 1
                            }}>
                                <img
                                    src="/images/heart.png"
                                    style={{
                                        width: qrOrientation === 'horizontal' ? '60%' : '50%',
                                        height: 'auto',
                                        opacity: 0.9,
                                        filter: 'drop-shadow(0 5px 15px rgba(183,110,121,0.2))'
                                    }}
                                    alt="Heart"
                                />
                            </Box>
                        </Box>

                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 3, color: '#5D4037' }}>{qrTitle}</Typography>
                        <Typography variant="caption" sx={{ display: 'block', mb: 2, color: '#999' }}>Preview for display only</Typography>

                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={downloading ? <CircularProgress size={18} color="inherit" /> : <Printer color="#fff" />}
                            onClick={handleDownloadCard}
                            disabled={downloading}
                            sx={{ mt: 1, bgcolor: '#D4AF37', py: 1.5, borderRadius: '50px', '&:hover': { bgcolor: '#B8962D' } }}
                        >
                            {downloading ? "กำลังประมวลผล..." : "Download Full Card Image"}
                        </Button>
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
