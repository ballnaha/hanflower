'use client';

import { useState, useEffect, useCallback } from 'react';
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
    Autocomplete,
    createFilterOptions
} from '@mui/material';
import {
    Add,
    ArrowLeft,
    Gallery,
    Trash,
    TickCircle,
    Image as ImageIcon,
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
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useNotification } from '@/context/NotificationContext';
import { NumberStepper } from '@/components/ui';
import { useDropzone } from 'react-dropzone';

interface PhotoItem {
    uniqueId: string;
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

                {/* Drag Handle Overlay */}
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
                    placeholder="คำบรรยายภาพ..."
                    variant="standard"
                    value={photo.caption}
                    onChange={(e) => onCaptionChange(photo.uniqueId, e.target.value)}
                    InputProps={{ disableUnderline: true, sx: { fontSize: '0.85rem' } }}
                />
            </Box>
        </Paper>
    );
}

export default function NewCustomerPage() {
    const router = useRouter();
    const { showSuccess, showError } = useNotification();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const filter = createFilterOptions<string>();

    useEffect(() => {
        fetch('/api/admin/events/categories?category=Customer')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Filter or highlight customer-related categories if needed
                    setCategories(data);
                }
            })
            .catch(err => console.error('Error fetching categories:', err));
    }, []);

    const [formData, setFormData] = useState({
        title: '',
        category: 'Our Customer',
        subCategory: '', // For the suffix
        location: '',
        date: '',
        coverImage: '',
        priority: 0,
        isActive: true
    });

    const [photos, setPhotos] = useState<PhotoItem[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
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

                    if (width > height) {
                        if (width > max) {
                            height *= max / width;
                            width = max;
                        }
                    } else {
                        if (height > max) {
                            width *= max / height;
                            height = max;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(new File([blob], file.name, { type: 'image/webp' }));
                        } else {
                            resolve(file);
                        }
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

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        setUploading(true);
        try {
            const newPhotoItems: PhotoItem[] = [];
            for (let i = 0; i < acceptedFiles.length; i++) {
                const resized = await resizeImage(acceptedFiles[i]);
                newPhotoItems.push({
                    uniqueId: `new-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
                    file: resized,
                    preview: URL.createObjectURL(resized),
                    caption: ''
                });
            }
            setPhotos(prev => [...prev, ...newPhotoItems]);
        } catch (error) {
            console.error('Drop error:', error);
            showError('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ');
        } finally {
            setUploading(false);
        }
    }, [showError]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        noClick: true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Upload images first
            let uploadedPhotos: { url: string; caption: string; order: number }[] = [];

            if (photos.length > 0) {
                const formDataUpload = new FormData();
                formDataUpload.append('folder', 'our-customer');
                photos.forEach(p => {
                    if (p.file) formDataUpload.append('files', p.file);
                });

                const uploadRes = await fetch('/api/admin/upload', {
                    method: 'POST',
                    body: formDataUpload
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    uploadedPhotos = uploadData.paths.map((path: string, index: number) => ({
                        url: path,
                        caption: photos[index].caption,
                        order: index
                    }));
                } else {
                    throw new Error('Upload failed');
                }
            }

            // 2. Prepare final form data
            const firstImageUrl = uploadedPhotos.length > 0 ? uploadedPhotos[0].url : '';
            const finalCategory = formData.subCategory
                ? `Our Customer: ${formData.subCategory}`
                : 'Our Customer';

            const res = await fetch('/api/admin/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    category: finalCategory,
                    coverImage: firstImageUrl,
                    photos: uploadedPhotos
                }),
            });

            if (res.ok) {
                showSuccess('บันทึกรูปภาพลูกค้าเรียบร้อยแล้ว');
                router.push('/admin/our-customer');
            } else {
                const err = await res.json();
                showError(err.error || 'เกิดข้อผิดพลาด');
            }
        } catch (error) {
            console.error('Error creating customer entry:', error);
            showError('ไม่สามารถบันทึกข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout title="เพิ่มอัลบั้มลูกค้าใหม่">


            <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(12, 1fr)' }, gap: 4, alignItems: 'start' }}>
                    {/* Left Column: Info & Photos */}
                    <Box sx={{ gridColumn: { xs: 'span 12', lg: 'span 8' } }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: '1px solid rgba(0,0,0,0.03)' }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>รายละเอียดอัลบั้ม</Typography>

                            <Stack spacing={3}>
                                <TextField
                                    label="ชื่ออัลบั้มลูกค้า (Title)"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    placeholder="เช่น คุณแพรว - Wedding Day"
                                />

                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                    <TextField
                                        label="หมวดหมู่ย่อย (Sub-category)"
                                        name="subCategory"
                                        value={formData.subCategory}
                                        onChange={handleChange}
                                        fullWidth
                                        placeholder="เช่น Wedding, Reviews"
                                        InputProps={{
                                            startAdornment: <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1, whiteSpace: 'nowrap' }}>Our Customer: </Typography>,
                                        }}
                                        helperText="ระบบจะเติม Our Customer: ให้ข้างหน้าอัตโนมัติ"
                                    />
                                    <TextField
                                        label="สถานที่ (Location)"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        fullWidth
                                        placeholder="เช่น โรงแรมแมนดาริน โอเรียนเต็ล"
                                    />
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

                                <Box sx={{ p: 2, bgcolor: 'rgba(183, 110, 121, 0.03)', borderRadius: '12px', border: '1px dashed #B76E79' }}>
                                    <Typography variant="body2" sx={{ color: '#B76E79', mb: 0, fontWeight: 600 }}>
                                        * แนะนำให้ใช้หมวดหมู่ที่ขึ้นต้นด้วย "Our Customer" หรือ "Customer:" เพื่อการจัดกลุ่มที่ถูกต้อง
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>

                        {/* Photo Gallery Section */}
                        <Paper
                            elevation={0}
                            {...getRootProps()}
                            sx={{
                                p: 4,
                                mt: 4,
                                borderRadius: '20px',
                                border: '1px solid rgba(0,0,0,0.03)',
                                position: 'relative',
                                transition: 'all 0.2s',
                                ...(isDragActive && {
                                    borderColor: '#B76E79',
                                    bgcolor: 'rgba(183, 110, 121, 0.02)',
                                    transform: 'scale(1.01)'
                                })
                            }}
                        >
                            <input {...getInputProps()} />
                            {isDragActive && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        inset: 0,
                                        zIndex: 10,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: 'rgba(183, 110, 121, 0.1)',
                                        borderRadius: '20px',
                                        backdropFilter: 'blur(2px)'
                                    }}
                                >
                                    <Box sx={{ p: 3, bgcolor: '#fff', borderRadius: '50%', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                                        <Add size={48} variant='Bold' color='#B76E79' />
                                    </Box>
                                </Box>
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>รูปภาพลูกค้า ({photos.length})</Typography>
                                    <Typography variant="caption" color="text.secondary">รูปแรกจะถูกใช้เป็นหน้าปก</Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    component="label"
                                    disabled={uploading}
                                    startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : <Add size={18} />}
                                    sx={{ borderRadius: '10px', textTransform: 'none', bgcolor: '#B76E79', '&:hover': { bgcolor: '#A45D68' } }}
                                >
                                    เลือกรูปภาพ
                                    <input type="file" hidden multiple accept="image/*" onChange={handleFileSelect} />
                                </Button>
                            </Box>

                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={photos.map(p => p.uniqueId)}
                                    strategy={rectSortingStrategy}
                                >
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
                                        {photos.map((photo, index) => (
                                            <SortablePhoto
                                                key={photo.uniqueId}
                                                photo={photo}
                                                index={index}
                                                onRemove={handleRemovePhoto}
                                                onCaptionChange={handleCaptionChange}
                                            />
                                        ))}

                                        {photos.length === 0 && (
                                            <Box sx={{
                                                gridColumn: '1 / -1',
                                                py: 8,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '2px dashed #ddd',
                                                borderRadius: '20px',
                                                color: '#aaa',
                                                cursor: 'pointer',
                                                '&:hover': { bgcolor: 'rgba(0,0,0,0.01)', borderColor: '#B76E79' }
                                            }} component="label">
                                                <input type="file" hidden multiple accept="image/*" onChange={handleFileSelect} />
                                                <ImageIcon size={48} variant="Outline" color="#B76E79" style={{ opacity: 0.5, marginBottom: 16 }} />
                                                <Typography variant="body1" fontWeight={500}>คลิกเพื่อเลือกรูปภาพลูกค้า</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </SortableContext>
                            </DndContext>
                        </Paper>
                    </Box>

                    {/* Right Column: Status & Publish */}
                    <Box sx={{ gridColumn: { xs: 'span 12', lg: 'span 4' }, position: 'sticky', top: 100 }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: '1px solid rgba(0,0,0,0.03)' }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>การแสดงผล</Typography>

                            <FormControlLabel
                                control={
                                    <Switch
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                        color="warning"
                                    />
                                }
                                label={formData.isActive ? "แสดงในหน้าเว็บทันที" : "ยังไม่แสดงผล"}
                                sx={{ mb: 3, display: 'block' }}
                            />

                            <Divider sx={{ my: 3 }} />

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={loading || photos.length === 0}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <TickCircle size={20} />}
                                sx={{
                                    bgcolor: '#B76E79',
                                    borderRadius: '12px',
                                    py: 1.5,
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    boxShadow: '0 10px 20px rgba(183, 110, 121, 0.2)',
                                    '&:hover': { bgcolor: '#A45D68' }
                                }}
                            >
                                {loading ? 'กำลังบันทึก...' : 'บันทึกอัลบั้ม'}
                            </Button>
                        </Paper>
                    </Box>
                </Box>
            </form>
        </AdminLayout>
    );
}
