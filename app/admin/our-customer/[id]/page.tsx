'use client';

import { useState, useEffect, use } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    TextField,
    IconButton,
    Avatar,
    FormControlLabel,
    Switch,
    Divider,
    Stack,
    CircularProgress,
} from '@mui/material';
import {
    ArrowLeft,
    Gallery,
    Trash,
    TickCircle,
    Image as ImageIcon,
    Add,
    RowVertical
} from 'iconsax-react';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import AdminLayout from '@/components/admin/AdminLayout';
import { NumberStepper } from '@/components/ui';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useNotification } from '@/context/NotificationContext';

interface PhotoItem {
    id?: string;
    uniqueId: string;
    url?: string;
    file?: File;
    preview: string;
    caption: string;
}

function SortablePhoto({
    photo,
    index,
    onRemove,
    onCaptionChange
}: {
    photo: PhotoItem;
    index: number;
    onRemove: (id: string) => void;
    onCaptionChange: (id: string, value: string) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: photo.uniqueId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Paper
            ref={setNodeRef}
            style={style}
            elevation={0}
            sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                border: index === 0 ? '2px solid #B76E79' : '1px solid rgba(0,0,0,0.05)',
                position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                    '& .drag-handle': { opacity: 1 }
                }
            }}
        >
            <Box sx={{ position: 'relative', pt: '100%', bgcolor: '#f0f0f0' }}>
                <img
                    src={photo.preview}
                    alt={`Preview ${index}`}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />

                <Box
                    className="drag-handle"
                    {...attributes}
                    {...listeners}
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(0,0,0,0.2)',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        cursor: 'grab',
                        '&:active': { cursor: 'grabbing' },
                        zIndex: 2
                    }}
                >
                    <RowVertical color="#FFF" size={32} />
                </Box>

                <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1, zIndex: 5 }}>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(photo.uniqueId);
                        }}
                        sx={{ bgcolor: 'rgba(255,255,255,0.9)', color: '#d32f2f', '&:hover': { bgcolor: '#fff' } }}
                    >
                        <Trash size={16} variant='Bold' color='#d32f2f' />
                    </IconButton>
                </Box>

                {index === 0 && (
                    <Box sx={{ position: 'absolute', top: 8, left: 8, bgcolor: '#B76E79', color: 'white', px: 1, py: 0.5, borderRadius: '6px', fontSize: '10px', fontWeight: 700, zIndex: 5 }}>
                        COVER
                    </Box>
                )}
            </Box>
            <Box sx={{ p: 1.5 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="ใส่คำอธิบายภาพ..."
                    variant="standard"
                    value={photo.caption}
                    onChange={(e) => onCaptionChange(photo.uniqueId, e.target.value)}
                    InputProps={{ disableUnderline: true, sx: { fontSize: '0.85rem' } }}
                />
            </Box>
        </Paper>
    );
}

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const { showSuccess, showError } = useNotification();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        category: 'Our Customer',
        subCategory: '',
        location: '',
        date: '',
        coverImage: '',
        priority: 0,
        isActive: true
    });

    const [photos, setPhotos] = useState<PhotoItem[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setPhotos((items) => {
                const oldIndex = items.findIndex((item) => item.uniqueId === active.id);
                const newIndex = items.findIndex((item) => item.uniqueId === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    useEffect(() => {
        const fetchAlbum = async () => {
            try {
                const res = await fetch(`/api/admin/events/${id}`);
                if (res.ok) {
                    const data = await res.json();

                    // Logic to separate "Our Customer: Wedding" into prefix and suffix
                    let subCat = '';
                    if (data.category && data.category.startsWith('Our Customer: ')) {
                        subCat = data.category.replace('Our Customer: ', '');
                    } else if (data.category === 'Our Customer') {
                        subCat = '';
                    }

                    setFormData({
                        title: data.title || '',
                        category: 'Our Customer',
                        subCategory: subCat,
                        location: data.location || '',
                        date: data.date || '',
                        coverImage: data.coverImage || '',
                        priority: data.priority || 0,
                        isActive: data.isActive
                    });

                    const existingPhotos = (data.photos || []).map((p: any) => ({
                        id: p.id,
                        uniqueId: p.id,
                        url: p.url,
                        preview: p.url,
                        caption: p.caption || ''
                    }));
                    setPhotos(existingPhotos);
                } else {
                    showError('ไม่พบข้อมูลอัลบั้ม');
                    router.push('/admin/our-customer');
                }
            } catch (error) {
                console.error('Error fetching album:', error);
                showError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
            } finally {
                setLoading(false);
            }
        };

        fetchAlbum();
    }, [id, router, showError]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRemovePhoto = (uniqueId: string) => {
        setPhotos(prev => prev.filter((p) => p.uniqueId !== uniqueId));
    };

    const handleCaptionChange = (uniqueId: string, value: string) => {
        setPhotos(prev => prev.map((p) => p.uniqueId === uniqueId ? { ...p, caption: value } : p));
    };

    const resizeImage = (file: File): Promise<File> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const max = 1200;
                    if (width > height) { if (width > max) { height *= max / width; width = max; } }
                    else { if (height > max) { width *= max / height; height = max; } }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        if (blob) resolve(new File([blob], file.name, { type: 'image/webp' }));
                        else resolve(file);
                    }, 'image/webp', 0.8);
                };
            };
        });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploading(true);
        try {
            const newPhotoItems: PhotoItem[] = [];
            for (let i = 0; i < files.length; i++) {
                const resized = await resizeImage(files[i]);
                newPhotoItems.push({
                    uniqueId: `new-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
                    file: resized,
                    preview: URL.createObjectURL(resized),
                    caption: ''
                });
            }
            setPhotos(prev => [...prev, ...newPhotoItems]);
        } catch (error) {
            console.error('File selection error:', error);
            showError('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const newFiles = photos.filter(p => p.file);
            let uploadedPaths: string[] = [];
            if (newFiles.length > 0) {
                const formDataUpload = new FormData();
                formDataUpload.append('folder', 'our-customer');
                newFiles.forEach(p => { if (p.file) formDataUpload.append('files', p.file); });
                const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: formDataUpload });
                if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    uploadedPaths = data.paths;
                } else throw new Error('Upload failed');
            }

            let uploadIdx = 0;
            const finalPhotos = photos.map((p, index) => {
                if (p.url) return { url: p.url, caption: p.caption, order: index };
                else return { url: uploadedPaths[uploadIdx++], caption: p.caption, order: index };
            });

            const finalCategory = formData.subCategory ? `Our Customer: ${formData.subCategory}` : 'Our Customer';
            const coverImage = finalPhotos.length > 0 ? finalPhotos[0].url : '';

            const res = await fetch(`/api/admin/events/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    category: finalCategory,
                    coverImage,
                    photos: finalPhotos
                }),
            });

            if (res.ok) {
                showSuccess('อัปเดตอัลบั้มเรียบร้อยแล้ว');
                router.push('/admin/our-customer');
            } else showError('เกิดข้อผิดพลาด');
        } catch (error) {
            console.error('Error updating album:', error);
            showError('ไม่สามารถอัปเดตอัลบั้มได้');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบอัลบั้มนี้?')) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showSuccess('ลบอัลบั้มเรียบร้อยแล้ว');
                router.push('/admin/our-customer');
            } else showError('เกิดข้อผิดพลาดในการลบอัลบั้ม');
        } catch (error) {
            console.error('Error deleting album:', error);
            showError('ไม่สามารถลบอัลบั้มได้');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <AdminLayout title="แก้ไขอัลบั้มลูกค้า">
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}><CircularProgress color="warning" /></Box>
        </AdminLayout>
    );

    return (
        <AdminLayout title={`แก้ไขอัลบั้มลูกค้า: ${formData.title}`}>
            <Box sx={{ mb: 4 }}>
                <Button component={Link} href="/admin/our-customer" startIcon={<ArrowLeft size={18} />} sx={{ color: '#666', mb: 2 }}>
                    กลับไปหน้ารายการ
                </Button>
            </Box>

            <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(12, 1fr)' }, gap: 4, alignItems: 'start' }}>
                    <Box sx={{ gridColumn: { xs: 'span 12', lg: 'span 8' } }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: '1px solid rgba(0,0,0,0.03)' }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>ข้อมูลอัลบั้ม</Typography>
                            <Stack spacing={3}>
                                <TextField label="ชื่ออัลบั้มลูกค้า (Title)" name="title" value={formData.title} onChange={handleChange} fullWidth required />
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                    <TextField
                                        label="หมวดหมู่ย่อย (Sub-category)"
                                        name="subCategory"
                                        value={formData.subCategory}
                                        onChange={handleChange}
                                        fullWidth
                                        InputProps={{
                                            startAdornment: <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1 }}>Our Customer: </Typography>,
                                        }}
                                        helperText="เช่น Wedding, Reviews"
                                    />
                                    <TextField label="สถานที่ (Location)" name="location" value={formData.location} onChange={handleChange} fullWidth />
                                </Box>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                    <TextField
                                        label="วันที่ (Date)"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        fullWidth
                                        placeholder="เช่น 14 Feb 2024"
                                    />
                                    <NumberStepper
                                        label="ลำดับความสำคัญ (Priority)"
                                        value={Number(formData.priority)}
                                        onChange={(val) => setFormData(prev => ({ ...prev, priority: val }))}
                                        min={0}
                                        max={999}
                                        width="100%"
                                    />
                                </Box>
                            </Stack>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 4, mt: 4, borderRadius: '20px', border: '1px solid rgba(0,0,0,0.03)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>รูปภาพในอัลบั้ม ({photos.length})</Typography>
                                <Button variant="contained" component="label" disabled={uploading} startIcon={<Add size={18} />} sx={{ borderRadius: '10px', bgcolor: '#B76E79', '&:hover': { bgcolor: '#A45D68' } }}>
                                    เพิ่มรูปภาพ
                                    <input type="file" hidden multiple accept="image/*" onChange={handleFileSelect} />
                                </Button>
                            </Box>
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={photos.map(p => p.uniqueId)} strategy={rectSortingStrategy}>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
                                        {photos.map((photo, index) => (
                                            <SortablePhoto key={photo.uniqueId} photo={photo} index={index} onRemove={handleRemovePhoto} onCaptionChange={handleCaptionChange} />
                                        ))}
                                    </Box>
                                </SortableContext>
                            </DndContext>
                        </Paper>
                    </Box>

                    <Box sx={{ gridColumn: { xs: 'span 12', lg: 'span 4' }, position: 'sticky', top: 100 }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: '1px solid rgba(0,0,0,0.03)' }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>สถานะ</Typography>
                            <FormControlLabel
                                control={<Switch name="isActive" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} color="warning" />}
                                label={formData.isActive ? "แสดงในหน้าเว็บ" : "ซ่อนจากหน้าเว็บ"}
                                sx={{ mb: 3, display: 'block' }}
                            />
                            <Divider sx={{ my: 3 }} />
                            <Button type="submit" variant="contained" fullWidth disabled={saving} sx={{ bgcolor: '#B76E79', borderRadius: '12px', py: 1.5, fontWeight: 700, mb: 2, '&:hover': { bgcolor: '#A45D68' } }}>
                                {saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                            </Button>
                            <Button variant="outlined" color="error" fullWidth disabled={saving} onClick={handleDelete} sx={{ borderRadius: '12px', py: 1.5, fontWeight: 700 }}>
                                ลบอัลบั้มนี้
                            </Button>
                        </Paper>
                    </Box>
                </Box>
            </form>
        </AdminLayout>
    );
}
