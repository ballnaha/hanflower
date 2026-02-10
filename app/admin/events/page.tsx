'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Avatar,
    TextField,
    InputAdornment,
    Menu,
    MenuItem,
    CircularProgress,
    Stack
} from '@mui/material';
import {
    Add,
    SearchNormal1,
    Edit2,
    Trash,
    More,
    Gallery,
    Location,
    Calendar,
    Eye,
    EyeSlash
} from 'iconsax-react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { useNotification } from '@/context/NotificationContext';
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog';

interface EventAlbum {
    id: string;
    title: string;
    category: string;
    location: string;
    date: string;
    coverImage: string;
    isActive: boolean;
    priority: number;
    _count?: {
        photos: number;
    };
}

export default function AdminEventsPage() {
    const [albums, setAlbums] = useState<EventAlbum[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedAlbum, setSelectedAlbum] = useState<EventAlbum | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const { showSuccess, showError } = useNotification();

    const fetchAlbums = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/events');
            if (res.ok) {
                const data = await res.json();
                setAlbums(data);
            }
        } catch (error) {
            console.error('Error fetching albums:', error);
            showError('ไม่สามารถโหลดข้อมูลอัลบั้มได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlbums();
    }, []);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, album: EventAlbum) => {
        setAnchorEl(event.currentTarget);
        setSelectedAlbum(album);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        // Do not clear selectedAlbum here, as it's needed for the Delete dialog
    };

    const handleDeleteClick = () => {
        handleMenuClose();
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedAlbum) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/events/${selectedAlbum.id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setAlbums(prev => prev.filter(a => a.id !== selectedAlbum.id));
                showSuccess('ลบอัลบั้มเรียบร้อยแล้ว');
                setOpenDeleteDialog(false);
            } else {
                showError('เกิดข้อผิดพลาดในการลบอัลบั้ม');
            }
        } catch (error) {
            console.error('Error deleting album:', error);
            showError('ไม่สามารถลบอัลบั้มได้');
        } finally {
            setDeleting(false);
            setSelectedAlbum(null);
        }
    };

    const toggleActive = async (album: EventAlbum) => {
        setTogglingId(album.id);
        try {
            const res = await fetch(`/api/admin/events/${album.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !album.isActive }),
            });

            if (res.ok) {
                setAlbums(prev => prev.map(a => a.id === album.id ? { ...a, isActive: !a.isActive } : a));
                showSuccess(`${album.isActive ? 'ปิด' : 'เปิด'}การใช้งานเรียบร้อยแล้ว`);
            }
        } catch (error) {
            console.error('Error toggling active status:', error);
            showError('เกิดข้อผิดพลาด');
        } finally {
            setTogglingId(null);
        }
    };

    const filteredAlbums = albums.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout title="จัดการอัลบั้มผลงาน (Events)">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                        มีอัลบั้มทั้งหมด {albums.length} รายการในระบบ
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        component={Link}
                        href="/admin/events/new"
                        startIcon={<Add size={20} color="#FFFFFF" variant="Linear" />}
                        sx={{
                            bgcolor: '#B76E79',
                            borderRadius: '12px',
                            textTransform: 'none',
                            px: 3,
                            boxShadow: '0 10px 20px rgba(183, 110, 121, 0.2)',
                            '&:hover': { bgcolor: '#A45D68', boxShadow: '0 12px 24px rgba(183, 110, 121, 0.3)' }
                        }}
                    >
                        เพิ่มอัลบั้มใหม่
                    </Button>
                </Box>
            </Box>

            {/* Filters and Search */}
            <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                    placeholder="ค้นหาจากชื่อ, หมวดหมู่, สถานที่..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                            bgcolor: '#F9F9F9',
                            borderRadius: '10px',
                            '& fieldset': { border: 'none' }
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchNormal1 size={18} color="#999" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Paper>

            {/* Table */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '20px', border: '1px solid rgba(0,0,0,0.03)', bgcolor: '#FFFFFF' }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                            <TableCell sx={{ fontWeight: 700, color: '#1A1A1A', py: 2.5 }}>อัลบั้ม</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1A1A1A' }}>ข้อมูลทั่วไป</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1A1A1A' }}>รูปภาพ</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1A1A1A' }}>ลำดับ</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1A1A1A' }}>สถานะ</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#1A1A1A' }}>จัดการ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                    <CircularProgress size={30} sx={{ color: '#B76E79' }} />
                                    <Typography sx={{ mt: 2, color: '#888' }}>กำลังโหลดข้อมูล...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : filteredAlbums.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 12 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <Gallery size={80} variant="Bulk" color="#E0E0E0" />
                                        <Typography sx={{ mt: 2, color: '#888', fontWeight: 500 }}>
                                            ไม่พบข้อมูลอัลบั้ม
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAlbums.map((album) => (
                                <TableRow key={album.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar
                                                src={album.coverImage}
                                                variant="rounded"
                                                sx={{ width: 60, height: 60, bgcolor: '#F5F5F5', border: '1px solid rgba(0,0,0,0.05)' }}
                                            />
                                            <Box>
                                                <Typography sx={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.95rem' }}>
                                                    {album.title}
                                                </Typography>
                                                <Chip
                                                    label={album.category || 'Uncategorized'}
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: '0.65rem',
                                                        bgcolor: '#FFF9F8',
                                                        color: '#B76E79',
                                                        fontWeight: 600,
                                                        mt: 0.5
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Stack spacing={0.5}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Location size={14} color="#666" />
                                                <Typography variant="caption" sx={{ color: '#666' }}>{album.location || '-'}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Calendar size={14} color="#666" />
                                                <Typography variant="caption" sx={{ color: '#666' }}>{album.date || '-'}</Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Gallery size={18} color="#B76E79" />
                                            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                                {album._count?.photos || 0}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography sx={{ fontSize: '0.85rem' }}>{album.priority}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={album.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                            size="small"
                                            onClick={() => !togglingId && toggleActive(album)}
                                            icon={togglingId === album.id ? <CircularProgress size={14} color="inherit" /> : (album.isActive ? <Eye size={14} /> : <EyeSlash size={14} />)}
                                            disabled={!!togglingId}
                                            sx={{
                                                bgcolor: album.isActive ? '#E6F7ED' : '#F5F5F5',
                                                color: album.isActive ? '#1A7F37' : '#666',
                                                fontWeight: 600,
                                                cursor: togglingId ? 'default' : 'pointer',
                                                '&:hover': { bgcolor: album.isActive ? '#D1F0DB' : '#EEEEEE' }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, album)}>
                                            <More size={20} color="#B76E79" variant="Outline" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                elevation={0}
                sx={{
                    '& .MuiPaper-root': {
                        borderRadius: '12px',
                        minWidth: 150,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                        border: '1px solid rgba(0,0,0,0.03)',
                        mt: 1
                    }
                }}
            >
                <MenuItem
                    onClick={handleMenuClose}
                    component={Link}
                    href={`/admin/events/${selectedAlbum?.id}`}
                    sx={{ gap: 1.5, py: 1.2, color: '#5D4037', fontSize: '0.85rem' }}
                >
                    <Edit2 size={18} color="#B76E79" variant="Bulk" /> แก้ไขข้อมูล
                </MenuItem>
                <MenuItem
                    onClick={handleDeleteClick}
                    disabled={deleting}
                    sx={{ gap: 1.5, py: 1.2, color: '#FF4D4F', fontSize: '0.85rem' }}
                >
                    <Trash size={18} color="#FF4D4F" variant="Bulk" /> ลบอัลบั้ม
                </MenuItem>
            </Menu>

            <AdminConfirmDialog
                open={openDeleteDialog}
                onClose={() => {
                    setOpenDeleteDialog(false);
                    setSelectedAlbum(null);
                }}
                onConfirm={handleConfirmDelete}
                title="ยืนยันการลบอัลบั้ม"
                message="คุณแน่ใจหรือไม่ว่าต้องการลบอัลบั้มนี้? ข้อมูลรูปภาพทั้งหมดภายในอัลบั้มจะถูกลบไปด้วย และไม่สามารถย้อนกลับได้"
                isLoading={deleting}
            />
        </AdminLayout>
    );
}
