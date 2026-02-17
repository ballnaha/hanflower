'use client';

import { useState, useEffect, use, useCallback } from 'react';
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
import { useDropzone } from 'react-dropzone';
import { getImageUrl } from '@/lib/utils';

interface PhotoItem {
    id?: string; // Prisma ID if existing
    uniqueId: string; // Stable ID for DnD
    url?: string; // Server URL if existing
    file?: File; // New file if pending
    preview: string; // Blob URL or Server URL
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
            <Box sx={{ position: 'relative', pt: '75%', bgcolor: '#f0f0f0' }}>
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
                        COVER PHOTO
                    </Box>
                )}
                {photo.file && (
                    <Box sx={{ position: 'absolute', bottom: 8, left: 8, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', px: 1, py: 0.2, borderRadius: '4px', fontSize: '9px', zIndex: 5 }}>
                        NEW
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

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const { showSuccess, showError } = useNotification();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const filter = createFilterOptions<string>();

    useEffect(() => {
        fetch('/api/admin/events/categories')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCategories(data);
            })
            .catch(err => console.error('Error fetching categories:', err));
    }, []);

    const [formData, setFormData] = useState({
        title: '',
        category: '',
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

    useEffect(() => {
        const fetchAlbum = async () => {
            try {
                const res = await fetch(`/api/admin/events/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        title: data.title || '',
                        category: data.category || '',
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
                        preview: getImageUrl(p.url),
                        caption: p.caption || ''
                    }));
                    setPhotos(existingPhotos);
                } else {
                    showError('ไม่พบข้อมูลอัลบั้ม');
                    router.push('/admin/events');
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
        setSaving(true);

        try {
            // 1. Check for new files to upload
            const newFiles = photos.filter(p => p.file);
            let uploadedPaths: string[] = [];

            if (newFiles.length > 0) {
                const formDataUpload = new FormData();
                formDataUpload.append('folder', 'events');
                newFiles.forEach(p => {
                    if (p.file) formDataUpload.append('files', p.file);
                });

                const uploadRes = await fetch('/api/admin/upload', {
                    method: 'POST',
                    body: formDataUpload
                });

                if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    uploadedPaths = data.paths;
                } else {
                    throw new Error('Upload failed');
                }
            }

            // 2. Reconstruct final photo list
            let uploadIdx = 0;
            const finalPhotos = photos.map((p, index) => {
                if (p.url) {
                    return { url: p.url, caption: p.caption, order: index };
                } else {
                    const url = uploadedPaths[uploadIdx++];
                    return { url, caption: p.caption, order: index };
                }
            });

            const coverImage = finalPhotos.length > 0 ? finalPhotos[0].url : '';

            // 3. Save to database
            const res = await fetch(`/api/admin/events/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    coverImage,
                    photos: finalPhotos
                }),
            });

            if (res.ok) {
                showSuccess('อัปเดตอัลบั้มเรียบร้อยแล้ว');
                router.push('/admin/events');
            } else {
                const err = await res.json();
                showError(err.error || 'เกิดข้อผิดพลาด');
            }
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
            const res = await fetch(`/api/admin/events/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                showSuccess('ลบอัลบั้มเรียบร้อยแล้ว');
                router.push('/admin/events');
            } else {
                showError('เกิดข้อผิดพลาดในการลบอัลบั้ม');
            }
        } catch (error) {
            console.error('Error deleting album:', error);
            showError('ไม่สามารถลบอัลบั้มได้');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout title="แก้ไขอัลบั้ม">
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 20 }}>
                    <CircularProgress color="warning" />
                </Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={`แก้ไขอัลบั้ม: ${formData.title}`}>


            <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(12, 1fr)' }, gap: 4, alignItems: 'start' }}>
                    {/* Left Column: Basic Info */}
                    <Box sx={{ gridColumn: { xs: 'span 12', lg: 'span 8' } }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: '1px solid rgba(0,0,0,0.03)' }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>ข้อมูลอัลบั้ม</Typography>

                            <Stack spacing={3}>
                                <TextField
                                    label="ชื่ออัลบั้ม (Title)"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    placeholder="เช่น The Grand Heritage Wedding"
                                />

                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                    <Autocomplete
                                        value={formData.category}
                                        onChange={(event, newValue) => {
                                            if (typeof newValue === 'string') {
                                                setFormData({ ...formData, category: newValue });
                                            } else if (newValue && (newValue as any).inputValue) {
                                                // Create a new value from the user input
                                                setFormData({ ...formData, category: (newValue as any).inputValue });
                                            } else {
                                                setFormData({ ...formData, category: newValue || '' });
                                            }
                                        }}
                                        filterOptions={(options, params) => {
                                            const filtered = filter(options, params);

                                            const { inputValue } = params;
                                            // Suggest the creation of a new value
                                            const isExisting = options.some((option) => inputValue === option);
                                            if (inputValue !== '' && !isExisting) {
                                                (filtered as any).push({
                                                    inputValue,
                                                    title: `เพิ่มหมวดหมู่ใหม่: "${inputValue}"`,
                                                });
                                            }

                                            return filtered;
                                        }}
                                        selectOnFocus
                                        clearOnBlur
                                        handleHomeEndKeys
                                        id="category-autocomplete"
                                        options={categories}
                                        getOptionLabel={(option) => {
                                            // Value selected with enter, right from the input
                                            if (typeof option === 'string') {
                                                return option;
                                            }
                                            // Add "xxx" option created dynamically
                                            if ((option as any).inputValue) {
                                                return (option as any).inputValue;
                                            }
                                            // Regular option
                                            return (option as any).title || option;
                                        }}
                                        renderOption={(props, option) => {
                                            const { key, ...optionProps } = props as any;
                                            return (
                                                <li key={key} {...optionProps}>
                                                    {typeof option === 'string' ? option : (option as any).title}
                                                </li>
                                            );
                                        }}
                                        freeSolo
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="หมวดหมู่ (Category)"
                                                placeholder="เลือกหรือพิมพ์เพื่อสร้างใหม่"
                                            />
                                        )}
                                        fullWidth
                                    />
                                    <TextField
                                        label="สถานที่ (Location)"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        fullWidth
                                        placeholder="เช่น Capella Bangkok"
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
                                        * รูปภาพแรกในรายการด้านล่างจะถูกใช้เป็นภาพหน้าปกโดยอัตโนมัติ
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
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>รูปภาพในอัลบั้ม ({photos.length})</Typography>
                                    <Typography variant="caption" color="text.secondary">รูปแรกจะถูกใช้เป็นหน้าปก</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        component="label"
                                        disabled={uploading}
                                        startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : <Add size={18} />}
                                        sx={{ borderRadius: '10px', textTransform: 'none', bgcolor: '#B76E79', '&:hover': { bgcolor: '#A45D68' } }}
                                    >
                                        เพิ่มรูปภาพ (Multiple)
                                        <input type="file" hidden multiple accept="image/*" onChange={handleFileSelect} />
                                    </Button>
                                </Box>
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
                                                <Typography variant="body1" fontWeight={500}>คลิกเพื่อเลือกรูปภาพ</Typography>
                                                <Typography variant="caption">แนะนำสัดส่วน 4:3 หรือ 16:9</Typography>
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
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>สถานะการแสดงผล</Typography>

                            <FormControlLabel
                                control={
                                    <Switch
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                        color="warning"
                                    />
                                }
                                label={formData.isActive ? "แสดงในหน้าเว็บ" : "ซ่อนจากหน้าเว็บ"}
                                sx={{ mb: 3, display: 'block' }}
                            />

                            <Divider sx={{ my: 3 }} />

                            <Box sx={{ p: 2, bgcolor: '#FFF9F8', borderRadius: '12px', mb: 3, textAlign: 'center' }}>
                                <Typography variant="caption" sx={{ color: '#B76E79', fontWeight: 600, display: 'block', mb: 1, textAlign: 'left' }}>
                                    PREVIEW COVER
                                </Typography>
                                {photos.length > 0 ? (
                                    <Avatar
                                        src={photos.length > 0 ? getImageUrl(photos[0].url || photos[0].preview) : ''}
                                        variant="rounded"
                                        sx={{ width: '100%', height: 200, bgcolor: '#F5F5F5' }}
                                    />
                                ) : (
                                    <Box sx={{ width: '100%', height: 200, bgcolor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                                        <Gallery size={40} color="#B76E79" style={{ opacity: 0.4 }} variant='Outline' />
                                    </Box>
                                )}
                            </Box>

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={saving}
                                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <TickCircle size={20} variant='Outline' color='#FFF' />}
                                sx={{
                                    bgcolor: '#B76E79',
                                    borderRadius: '12px',
                                    py: 1.5,
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    boxShadow: '0 10px 20px rgba(183, 110, 121, 0.2)',
                                    mb: 2,
                                    '&:hover': { bgcolor: '#A45D68' }
                                }}
                            >
                                {saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                            </Button>

                            <Button
                                variant="outlined"
                                color="error"
                                fullWidth
                                disabled={saving}
                                onClick={handleDelete}
                                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Trash size={20} variant='Bold' color='#d32f2f' />}
                                sx={{
                                    borderRadius: '12px',
                                    py: 1.5,
                                    fontWeight: 700,
                                    '&:hover': { bgcolor: '#FFF1F0' }
                                }}
                            >
                                {saving ? 'กำลังประมวลผล...' : 'ลบอัลบั้มนี้'}
                            </Button>
                        </Paper>
                    </Box>
                </Box>
            </form>
        </AdminLayout>
    );
}
