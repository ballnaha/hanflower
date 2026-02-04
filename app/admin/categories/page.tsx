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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Tooltip,
    Switch,
    FormControlLabel,
    Stack,
    Divider
} from '@mui/material';
import {
    Add,
    Edit2,
    Trash,
    Category as CategoryIcon,
    Image as ImageIcon,
    Save2
} from 'iconsax-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useNotification } from '@/context/NotificationContext';
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog';

interface Category {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    priority: number;
    isActive: boolean;
    createdAt: string;
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        slug: '',
        description: '',
        image: '',
        priority: 0,
        isActive: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Upload state (deferred pattern like product)
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const { showSuccess, showError, showWarning } = useNotification();

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            showError('ไม่สามารถโหลดข้อมูลหมวดหมู่ได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenDialog = (category?: Category) => {
        if (category) {
            setSelectedCategory(category);
            setFormData({
                title: category.title,
                subtitle: category.subtitle || '',
                slug: category.slug,
                description: category.description || '',
                image: category.image || '',
                priority: category.priority,
                isActive: category.isActive
            });
            setPreviewImage(category.image ? (category.image.startsWith('http') || category.image.startsWith('/') ? category.image : `/${category.image}`) : null);
        } else {
            setSelectedCategory(null);
            setFormData({
                title: '',
                subtitle: '',
                slug: '',
                description: '',
                image: '',
                priority: 0,
                isActive: true
            });
            setPreviewImage(null);
        }
        setPendingFile(null);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedCategory(null);
        setPendingFile(null);
        setPreviewImage(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const updated = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            // Auto-generate slug from title for new categories
            if (name === 'title' && !selectedCategory) {
                const generatedSlug = value
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-');
                updated.slug = generatedSlug;
            }

            return updated;
        });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPendingFile(file);
        setPreviewImage(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.slug) {
            showWarning('กรุณากรอกข้อมูลที่จำเป็น (ชื่อหมวดหมู่ และ Slug)');
            return;
        }

        setIsSubmitting(true);
        try {
            let finalImagePath = formData.image;

            // 1. Upload Image if there is a pending file
            if (pendingFile) {
                setUploading(true);
                const uploadData = new FormData();
                uploadData.append('files', pendingFile);

                const uploadRes = await fetch('/api/admin/upload', {
                    method: 'POST',
                    body: uploadData,
                });

                if (!uploadRes.ok) throw new Error('อัปโหลดรูปภาพไม่สำเร็จ');

                const uploadResult = await uploadRes.json();
                finalImagePath = uploadResult.paths[0];
                setUploading(false);
            }

            // 2. Save Category Data
            const url = selectedCategory
                ? `/api/admin/categories/${selectedCategory.id}`
                : '/api/admin/categories';

            const method = selectedCategory ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    image: finalImagePath
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess(selectedCategory ? 'แก้ไขหมวดหมู่สำเร็จ' : 'สร้างหมวดหมู่สำเร็จ');
                handleCloseDialog();
                fetchCategories();
            } else {
                showError(data.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            }
        } catch (error: any) {
            showError(error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
        } finally {
            setIsSubmitting(false);
            setUploading(false);
        }
    };

    const handleDeleteClick = (category: Category) => {
        setCategoryToDelete(category);
        setOpenDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                showSuccess('ลบหมวดหมู่สำเร็จ');
                fetchCategories();
                setOpenDeleteConfirm(false);
            } else {
                const data = await response.json();
                showError(data.error || 'เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        } catch (error) {
            showError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        } finally {
            setIsDeleting(false);
            setCategoryToDelete(null);
        }
    };

    return (
        <AdminLayout title="จัดการหมวดหมู่สินค้า">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ color: '#666' }}>
                    จัดการหมวดหมู่สินค้าที่แสดงบนหน้าเว็บ สำหรับการแยกประเภทสินค้า
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add size={20} color="#FFFFFF" variant="Linear" />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                        bgcolor: '#B76E79',
                        borderRadius: '12px',
                        px: 3,
                        '&:hover': { bgcolor: '#A45D68' },
                        textTransform: 'none',
                        boxShadow: '0 4px 12px rgba(183, 110, 121, 0.2)'
                    }}
                >
                    เพิ่มหมวดหมู่
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '24px', border: '1px solid rgba(0,0,0,0.03)', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#FAFAFA' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: '#1A1A1A' }}>หมวดหมู่</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1A1A1A' }}>Slug</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1A1A1A' }}>ลำดับ</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1A1A1A' }}>สถานะ</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#1A1A1A' }}>จัดการ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                                    <CircularProgress size={40} sx={{ color: '#B76E79' }} />
                                </TableCell>
                            </TableRow>
                        ) : categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 12 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <CategoryIcon size={80} variant="Bulk" color="#E0E0E0" />
                                        <Typography sx={{ mt: 2, color: '#888', fontWeight: 500 }}>
                                            ยังไม่มีข้อมูลหมวดหมู่สินค้า
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((cat) => (
                                <TableRow key={cat.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar
                                                src={cat.image ? (cat.image.startsWith('http') ? cat.image : (cat.image.startsWith('/') ? cat.image : `/${cat.image}`)) : ''}
                                                variant="rounded"
                                                sx={{ width: 48, height: 48, bgcolor: '#F5F5F5', borderRadius: '12px' }}
                                            >
                                                <ImageIcon size={24} color="#CCC" />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1A1A1A' }}>
                                                    {cat.title}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#B76E79', fontWeight: 600 }}>
                                                    {cat.subtitle}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ color: '#666', fontFamily: 'monospace' }}>
                                            /{cat.slug}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{cat.priority}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={cat.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                            size="small"
                                            sx={{
                                                bgcolor: cat.isActive ? '#E6FFFB' : '#FFF1F0',
                                                color: cat.isActive ? '#13C2C2' : '#FF4D4F',
                                                fontWeight: 600,
                                                borderRadius: '8px'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="แก้ไข">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenDialog(cat)}
                                                    sx={{ color: '#D4AF37', '&:hover': { bgcolor: '#D4AF3710' } }}
                                                >
                                                    <Edit2 size={18} variant="Bulk" color="#D4AF37" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="ลบ">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteClick(cat)}
                                                    sx={{ color: '#FF4D4F', '&:hover': { bgcolor: '#FFF1F0' } }}
                                                >
                                                    <Trash size={18} variant="Bulk" color="#FF4D4F" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create/Edit Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                PaperProps={{
                    sx: { borderRadius: '24px', p: 1, width: '100%', maxWidth: '600px' }
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, px: 3, pt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CategoryIcon size={24} variant="Bulk" color="#B76E79" />
                    {selectedCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
                </DialogTitle>
                <DialogContent sx={{ px: 3 }}>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        {/* Image Selection - Like Product Editor */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#1A1A1A', fontWeight: 600 }}>
                                รูปภาพประจำหมวดหมู่
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                <Box
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: '20px',
                                        bgcolor: '#F9F9F9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        border: '2px dashed #E0E0E0',
                                        position: 'relative'
                                    }}
                                >
                                    {previewImage ? (
                                        <img src={previewImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <ImageIcon size={40} color="#CCC" variant="Bulk" />
                                    )}
                                    {uploading && (
                                        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <CircularProgress size={24} sx={{ color: '#B76E79' }} />
                                        </Box>
                                    )}
                                </Box>
                                <Stack spacing={1}>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        startIcon={<ImageIcon size={20} variant="Bulk" color="#B76E79" />}
                                        sx={{
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            color: '#B76E79',
                                            borderColor: '#B76E79',
                                            '&:hover': { borderColor: '#A45D68', bgcolor: '#B76E7908', color: "#B76E79" }
                                        }}
                                    >
                                        เลือกรูปภาพใหม่
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onClick={(e: any) => { e.target.value = null; }}
                                            onChange={handleFileSelect}
                                        />
                                    </Button>
                                    <Typography variant="caption" sx={{ color: '#888' }}>
                                        แนะนำขนาด 800x800px (WebP, JPG, PNG)
                                    </Typography>
                                </Stack>
                            </Box>
                        </Box>

                        <Divider />

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="ชื่อหมวดหมู่ (ไทย)"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                variant="outlined"
                                required
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                            <TextField
                                fullWidth
                                label="ชื่อหมวดหมู่ (อังกฤษ)"
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={handleInputChange}
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                        </Box>

                        <TextField
                            fullWidth
                            label="URL Slug"
                            name="slug"
                            value={formData.slug}
                            onChange={handleInputChange}
                            variant="outlined"
                            required
                            placeholder="เช่น flower-bouquets"
                            helperText="ใช้สำหรับการเข้าถึงผ่าน URL เช่น /products/หมวดหมู่"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />

                        <TextField
                            fullWidth
                            label="คำอธิบายสั้นๆ"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            variant="outlined"
                            multiline
                            rows={3}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F9F9F9', p: 2.5, borderRadius: '16px' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>ลำดับความสำคัญ:</Typography>
                                <TextField
                                    name="priority"
                                    type="number"
                                    size="small"
                                    value={formData.priority}
                                    onChange={handleInputChange}
                                    sx={{ width: '80px', '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: '#FFF' } }}
                                />
                            </Stack>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#B76E79' },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#B76E79' }
                                        }}
                                    />
                                }
                                label={<Typography variant="body2" sx={{ fontWeight: 600 }}>เปิดใช้งาน</Typography>}
                                sx={{ mr: 0 }}
                            />
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, width: '100%' }}>
                        <Button
                            onClick={handleCloseDialog}
                            variant="outlined"
                            sx={{
                                color: '#666',
                                borderColor: '#E0E0E0',
                                borderRadius: '12px',
                                py: 1.2,
                                fontWeight: 600,
                                textTransform: 'none',
                                '&:hover': { bgcolor: '#F5F5F5', borderColor: '#CCC', color: '#666' }
                            }}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            variant="contained"
                            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <Save2 size={18} variant="Bold" />}
                            sx={{
                                bgcolor: '#B76E79',
                                borderRadius: '12px',
                                py: 1.2,
                                fontWeight: 600,
                                textTransform: 'none',
                                '&:hover': { bgcolor: '#A45D68' },
                                boxShadow: '0 8px 20px rgba(183, 110, 121, 0.1)',
                                '&.Mui-disabled': { bgcolor: '#D4A5AB', color: '#FFF' }
                            }}
                        >
                            {isSubmitting ? (uploading ? 'กำลังอัปโหลด...' : 'กำลังบันทึก...') : 'บันทึกข้อมูล'}
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>

            <AdminConfirmDialog
                open={openDeleteConfirm}
                onClose={() => setOpenDeleteConfirm(false)}
                onConfirm={handleConfirmDelete}
                title="ยืนยันการลบหมวดหมู่"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ "${categoryToDelete?.title}"? ข้อมูลสินค้าในหมวดหมู่นี้จะไม่ถูกลบแต่จะไม่มีหมวดหมู่กำกับ`}
                isLoading={isDeleting}
            />
        </AdminLayout>
    );
}
