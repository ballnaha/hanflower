'use client';

import { useState, useEffect, use } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    TextField,
    IconButton,
    Stack,
    CircularProgress,
    Divider,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Tooltip,
    Chip,
    InputAdornment,
    Autocomplete
} from '@mui/material';
import { ArrowLeft, Trash, Add, Save2, Image as ImageIcon, Magicpen } from 'iconsax-react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
import { useNotification } from '@/context/NotificationContext';
import { NumberStepper } from '@/components/ui';
import { getImageUrl } from '@/lib/utils';

// Wrapper component that provides the AdminLayout with SnackbarProvider
export default function ProductEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const isNew = id === 'new';

    return (
        <AdminLayout title={isNew ? 'เพิ่มสินค้าใหม่' : 'แก้ไขสินค้า'}>
            <ProductEditorContent id={id} isNew={isNew} />
        </AdminLayout>
    );
}

// Inner component that can safely use useSnackbar (now inside SnackbarProvider)
function ProductEditorContent({ id, isNew }: { id: string; isNew: boolean }) {
    const router = useRouter();
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const { showSuccess, showError } = useNotification();

    const [form, setForm] = useState({
        id: '',
        sku: '',
        title: '',
        slug: '',
        type: '',
        price: '',
        originalPrice: '',
        discount: '',
        priceVelvet: '',
        originalPriceVelvet: '',
        discountVelvet: '',
        description: '',
        image: '',
        stock: '0',
        stockVelvet: '0',
        priority: '0',
        images: [''],
        details: [''],
        features: [''],
        shipping: [''],
        categoryId: '',
        hasQrCode: false,
        qrCodePrice: '150',
        isNew: false,
        isActive: true,
        isBestSeller: false
    });

    const [pendingImage, setPendingImage] = useState<{ file: File; preview: string } | null>(null);
    const [pendingImages, setPendingImages] = useState<{ file: File; preview: string }[]>([]);
    const [categories, setCategories] = useState<{ id: string; title: string; subtitle: string }[]>([]);

    useEffect(() => {
        if (!isNew) {
            const fetchProduct = async () => {
                try {
                    const res = await fetch(`/api/products/${id}`);
                    if (res.ok) {
                        const data = await res.json();
                        setForm({
                            ...data,
                            price: data.price.toString().replace(/,/g, ''),
                            originalPrice: data.originalPrice?.toString().replace(/,/g, '') || '',
                            discount: data.discount?.toString() || '',
                            priceVelvet: data.priceVelvet?.toString().replace(/,/g, '') || '',
                            originalPriceVelvet: data.originalPriceVelvet?.toString().replace(/,/g, '') || '',
                            discountVelvet: data.discountVelvet?.toString() || '',
                            stock: data.stock?.toString() || '0',
                            stockVelvet: data.stockVelvet?.toString() || '0',
                            priority: data.priority?.toString() || '0',
                            image: data.image || '',
                            images: data.images.length > 0 ? data.images : [''],
                            details: data.details.length > 0 ? data.details : [''],
                            features: data.features.length > 0 ? data.features : [''],
                            shipping: data.shipping.length > 0 ? data.shipping : [''],
                            categoryId: data.categoryId || '',
                            hasQrCode: data.hasQrCode !== undefined ? data.hasQrCode : true,
                            isNew: !!data.isNew,
                            isActive: data.isActive !== undefined ? !!data.isActive : true,
                            isBestSeller: !!data.isBestSeller,
                            qrCodePrice: data.qrCodePrice?.toString() || '150'
                        });
                    }
                } catch (err) {
                    showError('ไม่สามารถโหลดข้อมูลสินค้าได้');
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [id, isNew]);

    // Fetch categories for the dropdown
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };
        fetchCategories();
    }, []);

    // Auto-generate SKU for new products on mount
    useEffect(() => {
        if (isNew && form.sku === '') {
            generateSKU();
        }
    }, [isNew, form.sku === '']); // Run if isNew or if sku becomes empty

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'hasQrCode' || name === 'isNew' || name === 'isBestSeller' || name === 'isActive') {
            setForm(prev => ({ ...prev, [name]: !prev[name as 'hasQrCode' | 'isNew' | 'isBestSeller' | 'isActive'] }));
            return;
        }

        setForm(prev => {
            const updated = { ...prev, [name]: value };

            // Auto-calculate discount when price and originalPrice change
            if (name === 'price' || name === 'originalPrice') {
                const price = parseFloat(name === 'price' ? value : prev.price) || 0;
                const originalPrice = parseFloat(name === 'originalPrice' ? value : prev.originalPrice) || 0;

                if (originalPrice > 0 && price > 0 && originalPrice > price) {
                    const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
                    updated.discount = discount.toString();
                } else if (originalPrice <= 0 || price <= 0) {
                    updated.discount = '';
                }
            }

            // Auto-calculate price when discount changes (if originalPrice exists)
            if (name === 'discount') {
                const discount = parseFloat(value) || 0;
                const originalPrice = parseFloat(prev.originalPrice) || 0;

                if (originalPrice > 0 && discount > 0 && discount < 100) {
                    const calculatedPrice = Math.round(originalPrice * (1 - discount / 100));
                    updated.price = calculatedPrice.toString();
                }
            }

            // Auto-calculate discount for Velvet when priceVelvet and originalPriceVelvet change
            if (name === 'priceVelvet' || name === 'originalPriceVelvet') {
                const price = parseFloat(name === 'priceVelvet' ? value : prev.priceVelvet) || 0;
                const originalPrice = parseFloat(name === 'originalPriceVelvet' ? value : prev.originalPriceVelvet) || 0;

                if (originalPrice > 0 && price > 0 && originalPrice > price) {
                    const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
                    updated.discountVelvet = discount.toString();
                } else if (originalPrice <= 0 || price <= 0 || price >= originalPrice) {
                    updated.discountVelvet = '';
                }
            }

            // Auto-calculate priceVelvet when discountVelvet changes (if originalPriceVelvet exists)
            if (name === 'discountVelvet') {
                const discount = parseFloat(value) || 0;
                const originalPrice = parseFloat(prev.originalPriceVelvet) || 0;

                if (originalPrice > 0 && discount > 0 && discount < 100) {
                    const calculatedPrice = Math.round(originalPrice * (1 - discount / 100));
                    updated.priceVelvet = calculatedPrice.toString();
                }
            }

            return updated;
        });

        if (name === 'title' && isNew) {
            const generatedSlug = value
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^\u0E00-\u0E7F\w\s-]/g, '')
                .replace(/-+/g, '-');
            setForm(prev => ({ ...prev, slug: generatedSlug }));
        }
    };

    const generateSKU = async () => {
        setGenerating(true);
        try {
            const res = await fetch('/api/products?all=true');
            if (res.ok) {
                const products = await res.json();
                const productList = Array.isArray(products) ? products : [];

                const skus = productList
                    .map((p: any) => p.sku)
                    .filter((s: string) => s && typeof s === 'string' && s.toUpperCase().startsWith('HAN-'));

                let nextNumber = 1;
                if (skus.length > 0) {
                    const numbers = skus.map((s: string) => {
                        const match = s.match(/HAN-(\d+)/i);
                        return match ? parseInt(match[1], 10) : 0;
                    }).filter((n: number) => !isNaN(n));

                    if (numbers.length > 0) {
                        nextNumber = Math.max(...numbers) + 1;
                    }
                }

                const newSku = `HAN-${nextNumber.toString().padStart(3, '0')}`;
                setForm(prev => {
                    const updated = { ...prev, sku: newSku };
                    // If slug is currently empty or still matches the old title-only pattern, 
                    // we could optionally append or refresh it, but let's at least ensure 
                    // Thai characters work now.
                    return updated;
                });
            } else {
                const timestamp = new Date().getTime().toString().slice(-4);
                setForm(prev => ({ ...prev, sku: `HAN-${timestamp}` }));
            }
        } catch (err) {
            console.error('Failed to generate SKU:', err);
            const random = Math.floor(100 + Math.random() * 899);
            setForm(prev => ({ ...prev, sku: `HAN-${random}` }));
        } finally {
            setGenerating(false);
        }
    };

    const getTypeSuggestions = (categoryId: string) => {
        if (categoryId === 'bouquet') {
            return ['Signature Bouquet', 'Rose Bouquet', 'Lilly Bouquet', 'Daisy Bouquet', 'Tulip Bouquet', 'Hydrangea Bouquet'];
        }
        if (categoryId === 'succulent') {
            return ['Premium Succulent', 'Cactus', 'Haworthia', 'Houseplant'];
        }
        if (categoryId === 'fruit-basket') {
            return ['Fruit Basket', 'Healthy Hamper', 'Gift Basket'];
        }
        if (categoryId === 'souvenir') {
            return ['Wedding Souvenir', 'Company Gift', 'Event Souvenir'];
        }
        return [];
    };

    const handleArrayChange = (index: number, value: string, field: 'images' | 'details' | 'features' | 'shipping') => {
        const newArray = [...form[field]];
        newArray[index] = value;
        setForm(prev => ({ ...prev, [field]: newArray }));
    };

    const addArrayItem = (field: 'images' | 'details' | 'features' | 'shipping') => {
        setForm(prev => ({ ...prev, [field]: [...prev[field], ''] }));
    };

    const removeArrayItem = async (index: number, field: 'images' | 'details' | 'features' | 'shipping') => {
        if (field === 'images') {
            const imageUrl = form.images[index];
            if (imageUrl && imageUrl.startsWith('/uploads/')) {
                // Delete from folder if it's a server file
                try {
                    await fetch('/api/admin/upload/delete', {
                        method: 'POST',
                        body: JSON.stringify({ path: imageUrl })
                    });
                } catch (err) {
                    console.error('Failed to delete file from folder:', err);
                }
            }
        }
        const newArray = form[field].filter((_, i) => i !== index);
        setForm(prev => ({ ...prev, [field]: newArray.length > 0 ? newArray : [''] }));
    };

    const removePendingImage = (index: number) => {
        const newPending = pendingImages.filter((_, i) => i !== index);
        setPendingImages(newPending);
    };

    const removeMainImage = async () => {
        if (form.image && form.image.startsWith('/uploads/')) {
            try {
                await fetch('/api/admin/upload/delete', {
                    method: 'POST',
                    body: JSON.stringify({ path: form.image })
                });
            } catch (err) {
                console.error('Failed to delete file from folder:', err);
            }
        }
        setForm(prev => ({ ...prev, image: '' }));
        setPendingImage(null);
    };

    const [uploading, setUploading] = useState(false);

    const resizeImage = (file: File, maxWidth: number = 1200, maxHeight: number = 1200): Promise<File> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = document.createElement('img');
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');

                    if (file.type !== 'image/png') {
                        ctx!.fillStyle = '#FFFFFF';
                        ctx!.fillRect(0, 0, width, height);
                    }

                    ctx?.drawImage(img, 0, 0, width, height);

                    const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            resolve(file); // Fallback to original if blob creation fails
                            return;
                        }
                        const resizedFile = new File([blob], file.name, {
                            type: mimeType,
                            lastModified: Date.now(),
                        });
                        resolve(resizedFile);
                    }, mimeType, mimeType === 'image/jpeg' ? 0.85 : undefined);
                };
                img.onerror = () => {
                    resolve(file); // Fallback to original on error
                };
            };
            reader.onerror = () => {
                resolve(file); // Fallback to original on error
            };
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'images') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const fileList = Array.from(files);
            const processedFiles: { file: File; preview: string }[] = [];

            for (const file of fileList) {
                const resized = await resizeImage(file);
                processedFiles.push({
                    file: resized,
                    preview: URL.createObjectURL(resized)
                });
            }

            if (field === 'image') {
                setPendingImage(processedFiles[0]);
            } else {
                setPendingImages(prev => [...prev, ...processedFiles]);
            }
        } catch (err) {
            showError('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ');
        } finally {
            setUploading(false);
        }
    };

    const validateForm = () => {
        if (!form.sku.trim()) return 'กรุณาระบุ SKU (รหัสสินค้า)';
        if (!form.title.trim()) return 'กรุณาระบุชื่อสินค้า';
        if (!form.price || parseFloat(form.price) <= 0) return 'ราคาต้องมากกว่า 0 บาท';
        if (!form.description.trim()) return 'กรุณาระบุคำอธิบายสินค้า';
        if (!form.type.trim()) return 'กรุณาระบุหมวดหมู่สินค้า';
        if (!form.categoryId) return 'กรุณาเลือกหมวดหมู่หลัก';
        if (!form.image && !pendingImage && form.images.filter(img => img.trim() !== '').length === 0 && pendingImages.length === 0) {
            return 'กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป';
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            showError(validationError);
            return;
        }

        setSaving(true);

        try {
            let finalMainImage = form.image;
            let finalAdditionalImages = [...form.images.filter(url => url.trim() !== '')];

            // 1. Upload Main Image if pending
            if (pendingImage) {
                const formData = new FormData();
                formData.append('files', pendingImage.file);
                const res = await fetch('/api/admin/upload', {
                    method: 'POST',
                    body: formData
                });
                if (!res.ok) throw new Error('อัปโหลดรูปภาพหลักไม่สำเร็จ');
                const data = await res.json();
                finalMainImage = data.paths[0];
            }

            // 2. Upload Additional Images if pending
            if (pendingImages.length > 0) {
                const formData = new FormData();
                pendingImages.forEach(p => formData.append('files', p.file));
                const res = await fetch('/api/admin/upload', {
                    method: 'POST',
                    body: formData
                });
                if (!res.ok) throw new Error('อัปโหลดรูปภาพเพิ่มเติมไม่สำเร็จ');
                const data = await res.json();
                finalAdditionalImages = [...finalAdditionalImages, ...data.paths];
            }

            // 3. Keep images as submitted by user

            const url = isNew ? '/api/products' : `/api/products/${id}`;
            const method = isNew ? 'POST' : 'PUT';

            // Ensure we have a main image if only additional images were uploaded
            if (!finalMainImage && finalAdditionalImages.length > 0) {
                finalMainImage = finalAdditionalImages[0];
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    image: finalMainImage,
                    images: finalAdditionalImages,
                    details: form.details.filter(text => text.trim() !== ''),
                    features: form.features.filter(text => text.trim() !== ''),
                    shipping: form.shipping.filter(text => text.trim() !== '')
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
            }

            // Update form state with the uploaded images so they display immediately
            setForm(prev => ({
                ...prev,
                image: finalMainImage,
                images: finalAdditionalImages.length > 0 ? finalAdditionalImages : ['']
            }));

            setPendingImage(null);
            setPendingImages([]);
            showSuccess(isNew ? 'บันทึกสินค้าใหม่สำเร็จแล้ว' : 'อัปเดตข้อมูลสินค้าสำเร็จแล้ว');

            if (isNew) {
                setTimeout(() => router.push('/admin/products'), 1500);
            }
        } catch (err: any) {
            showError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress color="inherit" />
            </Box>
        );
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {/* Main Info */}
                    <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(66.666% - 16px)' }, minWidth: 0 }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid rgba(0,0,0,0.03)' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>ข้อมูลทั่วไป</Typography>
                            <Stack spacing={3}>
                                <TextField
                                    fullWidth
                                    label="ชื่อสินค้า"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                />
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                                        <TextField
                                            fullWidth
                                            label="SKU (รหัสสินค้า)"
                                            name="sku"
                                            value={form.sku}
                                            onChange={handleChange}
                                            required
                                            placeholder="เช่น HAN-001"
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Tooltip title="สร้างรหัสสินค้าอัตโนมัติ">
                                                            <span>
                                                                <IconButton
                                                                    onClick={generateSKU}
                                                                    disabled={generating}
                                                                    size="small"
                                                                    sx={{
                                                                        color: '#B76E79',
                                                                        bgcolor: 'rgba(183, 110, 121, 0.05)',
                                                                        '&:hover': { bgcolor: 'rgba(183, 110, 121, 0.1)' },
                                                                        borderRadius: '8px',
                                                                        p: 1
                                                                    }}
                                                                >
                                                                    {generating ? (
                                                                        <CircularProgress size={16} color="inherit" />
                                                                    ) : (
                                                                        <Magicpen size={20} variant="TwoTone" color="#B76E79" />
                                                                    )}
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                                        <TextField
                                            fullWidth
                                            label="Slug (URL)"
                                            name="slug"
                                            value={form.slug}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Box>
                                </Box>
                                <TextField
                                    fullWidth
                                    label="คำอธิบายสินค้า"
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    multiline
                                    rows={4}
                                    required
                                />
                                <FormControl fullWidth required>
                                    <InputLabel id="category-label">หมวดหมู่</InputLabel>
                                    <Select
                                        labelId="category-label"
                                        name="categoryId"
                                        value={form.categoryId}
                                        label="หมวดหมู่"
                                        onChange={(e) => {
                                            const catId = e.target.value;
                                            const selectedCat = categories.find(c => c.id === catId);
                                            if (selectedCat) {
                                                setForm(prev => ({
                                                    ...prev,
                                                    categoryId: catId,
                                                    // Only auto-update type if it's currently empty or belongs to default subtitles
                                                    type: (!prev.type || categories.some(c => c.subtitle === prev.type))
                                                        ? selectedCat.subtitle
                                                        : prev.type
                                                }));
                                            }
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>ระบุหมวดหมู่</em>
                                        </MenuItem>
                                        {categories.map((cat) => (
                                            <MenuItem key={cat.id} value={cat.id}>
                                                {cat.title} ({cat.subtitle})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Autocomplete
                                    freeSolo
                                    options={getTypeSuggestions(form.categoryId)}
                                    value={form.type}
                                    onInputChange={(event, newValue) => {
                                        setForm(prev => ({ ...prev, type: newValue }));
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="ชนิดสินค้า (หมวดหมู่ย่อย)"
                                            name="type"
                                            required
                                            helperText="เช่น Rose Bouquet, Lilly Bouquet หรือเว้นเป็นค่าปกติไว้"
                                        />
                                    )}
                                />
                            </Stack>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 4, mt: 4, borderRadius: '24px', border: '1px solid rgba(0,0,0,0.03)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>รูปภาพเพิ่มเติม</Typography>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    disabled={uploading}
                                    startIcon={uploading ? <CircularProgress size={16} /> : <Add size={18} />}
                                    sx={{ borderRadius: '10px', textTransform: 'none', color: '#B76E79', borderColor: '#B76E79' }}
                                >
                                    อัปโหลดรูปภาพ
                                    <input
                                        type="file"
                                        multiple
                                        hidden
                                        accept="image/*"
                                        onClick={(e: any) => { e.target.value = null; }}
                                        onChange={(e) => handleFileUpload(e, 'images')}
                                    />
                                </Button>
                            </Box>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                {form.images.filter(url => url.trim() !== '').map((url, idx) => (
                                    <Box key={`existing-${idx}`} sx={{ flex: { xs: '0 0 calc(50% - 8px)', sm: '0 0 calc(33.33% - 10.66px)', md: '0 0 calc(25% - 12px)' } }}>
                                        <Box sx={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #EEE', paddingTop: '100%' }}>
                                            <NextImage
                                                src={getImageUrl(url)}
                                                alt={`Extra ${idx}`}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => removeArrayItem(idx, 'images')}
                                                sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: '#FFF' } }}
                                            >
                                                <Trash size={16} color="#FF4D4F" variant="Bulk" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                ))}
                                {pendingImages.map((item, idx) => (
                                    <Box key={`pending-${idx}`} sx={{ flex: { xs: '0 0 calc(50% - 8px)', sm: '0 0 calc(33.33% - 10.66px)', md: '0 0 calc(25% - 12px)' } }}>
                                        <Box sx={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #EEE', paddingTop: '100%', opacity: 0.7 }}>
                                            <NextImage
                                                src={item.preview}
                                                alt={`Pending ${idx}`}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                            <Box sx={{ position: 'absolute', top: 5, left: 5, bgcolor: 'rgba(0,0,0,0.5)', color: '#FFF', fontSize: '10px', px: 1, borderRadius: '4px' }}>รออัปโหลด</Box>
                                            <IconButton
                                                size="small"
                                                onClick={() => removePendingImage(idx)}
                                                sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: '#FFF' } }}
                                            >
                                                <Trash size={16} color="#FF4D4F" variant="Bulk" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 4, mt: 4, borderRadius: '24px', border: '1px solid rgba(0,0,0,0.03)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>รายละเอียด & คุณสมบัติ</Typography>
                            </Box>

                            <Typography variant="subtitle2" sx={{ mb: 2, color: '#666' }}>รายละเอียด (Product Details)</Typography>
                            <Stack spacing={2} sx={{ mb: 4 }}>
                                {form.details.map((text, idx) => (
                                    <Box key={`detail-${idx}`} sx={{ display: 'flex', gap: 1 }}>
                                        <TextField
                                            fullWidth
                                            value={text}
                                            onChange={(e) => handleArrayChange(idx, e.target.value, 'details')}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addArrayItem('details');
                                                }
                                            }}
                                            placeholder="ระบุรายละเอียด..."
                                        />
                                        <IconButton color="error" onClick={() => removeArrayItem(idx, 'details')} disabled={form.details.length === 1}>
                                            <Trash size={20} color="#FF4D4F" variant="Bulk" />
                                        </IconButton>
                                    </Box>
                                ))}
                                <Button startIcon={<Add size={18} color="#B76E79" variant="Bold" />} onClick={() => addArrayItem('details')} sx={{ alignSelf: 'flex-start', color: '#B76E79' }}>เพิ่มรายละเอียด</Button>
                            </Stack>

                            <Divider sx={{ my: 4 }} />

                            <Typography variant="subtitle2" sx={{ mb: 2, color: '#666' }}>คุณสมบัติ (Product Features)</Typography>
                            <Stack spacing={2}>
                                {form.features.map((text, idx) => (
                                    <Box key={`feature-${idx}`} sx={{ display: 'flex', gap: 1 }}>
                                        <TextField
                                            fullWidth
                                            value={text}
                                            onChange={(e) => handleArrayChange(idx, e.target.value, 'features')}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addArrayItem('features');
                                                }
                                            }}
                                            placeholder="ระบุคุณสมบัติ..."
                                        />
                                        <IconButton color="error" onClick={() => removeArrayItem(idx, 'features')} disabled={form.features.length === 1}>
                                            <Trash size={20} color="#FF4D4F" variant="Bulk" />
                                        </IconButton>
                                    </Box>
                                ))}
                                <Button startIcon={<Add size={18} color="#B76E79" variant="Bold" />} onClick={() => addArrayItem('features')} sx={{ alignSelf: 'flex-start', color: '#B76E79' }}>เพิ่มคุณสมบัติ</Button>
                            </Stack>

                            <Divider sx={{ my: 4 }} />

                            <Typography variant="subtitle2" sx={{ mb: 2, color: '#666' }}>การจัดส่ง (Shipping/Delivery)</Typography>
                            <Stack spacing={2}>
                                {form.shipping.map((text, idx) => (
                                    <Box key={`shipping-${idx}`} sx={{ display: 'flex', gap: 1 }}>
                                        <TextField
                                            fullWidth
                                            value={text}
                                            onChange={(e) => handleArrayChange(idx, e.target.value, 'shipping')}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addArrayItem('shipping');
                                                }
                                            }}
                                            placeholder="ระบุการจัดส่ง..."
                                        />
                                        <IconButton color="error" onClick={() => removeArrayItem(idx, 'shipping')} disabled={form.shipping.length === 1}>
                                            <Trash size={20} color="#FF4D4F" variant="Bulk" />
                                        </IconButton>
                                    </Box>
                                ))}
                                <Button startIcon={<Add size={18} color="#B76E79" variant="Bold" />} onClick={() => addArrayItem('shipping')} sx={{ alignSelf: 'flex-start', color: '#B76E79' }}>เพิ่มข้อมูลการจัดส่ง</Button>
                            </Stack>
                        </Paper>
                    </Box>

                    {/* Sidebar: Pricing & Media */}
                    <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' }, minWidth: 0 }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid rgba(0,0,0,0.03)', position: 'sticky', top: 100 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>ราคา & สต็อก</Typography>
                            <Stack spacing={3}>
                                <Divider sx={{ my: 0 }}>
                                    <Chip label="🌸 ดอกไม้สด" size="small" sx={{ fontWeight: 600 }} />
                                </Divider>

                                <TextField
                                    fullWidth
                                    label="ราคาขาย (บาท)"
                                    name="price"
                                    type="number"
                                    value={form.price}
                                    onChange={handleChange}
                                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                    required
                                    InputProps={{ startAdornment: <Typography sx={{ color: '#999', mr: 0.5 }}>฿</Typography> }}
                                />
                                <TextField
                                    fullWidth
                                    label="ราคาปกติ (กรณีมีส่วนลด)"
                                    name="originalPrice"
                                    type="number"
                                    value={form.originalPrice}
                                    onChange={handleChange}
                                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                    InputProps={{ startAdornment: <Typography sx={{ color: '#999', mr: 0.5 }}>฿</Typography> }}
                                />
                                <NumberStepper
                                    value={parseFloat(form.discount) || 0}
                                    onChange={(val) => {
                                        const discount = val;
                                        const originalPrice = parseFloat(form.originalPrice) || 0;
                                        let price = form.price;
                                        if (originalPrice > 0 && discount > 0 && discount < 100) {
                                            price = Math.round(originalPrice * (1 - discount / 100)).toString();
                                        }
                                        setForm(prev => ({ ...prev, discount: val.toString(), price }));
                                    }}
                                    min={0}
                                    max={99}
                                    step={1}
                                    label="ส่วนลด"
                                    suffix="%"
                                    size="md"
                                />

                                <Divider sx={{ my: 2 }}>
                                    <Chip label="💎 ดอกไม้กำมะหยี่" size="small" sx={{ fontWeight: 600 }} />
                                </Divider>

                                <TextField
                                    fullWidth
                                    label="ราคาดอกไม้กำมะหยี่ (บาท)"
                                    name="priceVelvet"
                                    type="number"
                                    value={form.priceVelvet}
                                    onChange={handleChange}
                                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                    helperText="ถ้าไม่ระบุจะไม่แสดงตัวเลือกดอกกำมะหยี่"
                                    InputProps={{ startAdornment: <Typography sx={{ color: '#999', mr: 0.5 }}>฿</Typography> }}
                                />
                                <TextField
                                    fullWidth
                                    label="ราคาปกติดอกกำมะหยี่ (กรณีมีส่วนลด)"
                                    name="originalPriceVelvet"
                                    type="number"
                                    value={form.originalPriceVelvet}
                                    onChange={handleChange}
                                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                    InputProps={{ startAdornment: <Typography sx={{ color: '#999', mr: 0.5 }}>฿</Typography> }}
                                />
                                <NumberStepper
                                    value={parseFloat(form.discountVelvet) || 0}
                                    onChange={(val) => {
                                        const discount = val;
                                        const originalPrice = parseFloat(form.originalPriceVelvet) || 0;
                                        let price = form.priceVelvet;
                                        if (originalPrice > 0 && discount > 0 && discount < 100) {
                                            price = Math.round(originalPrice * (1 - discount / 100)).toString();
                                        }
                                        setForm(prev => ({ ...prev, discountVelvet: val.toString(), priceVelvet: price }));
                                    }}
                                    min={0}
                                    max={99}
                                    step={1}
                                    label="ส่วนลดดอกไม้กำมะหยี่"
                                    suffix="%"
                                    size="md"
                                />

                                <Divider sx={{ my: 2 }} />

                                <NumberStepper
                                    value={parseInt(form.stock) || 0}
                                    onChange={(val) => setForm(prev => ({ ...prev, stock: val.toString() }))}
                                    min={0}
                                    max={9999}
                                    label="จำนวนสินค้าในสต็อก"
                                    suffix=" ชิ้น"
                                    size="md"
                                />
                                <NumberStepper
                                    value={parseInt(form.stockVelvet) || 0}
                                    onChange={(val) => setForm(prev => ({ ...prev, stockVelvet: val.toString() }))}
                                    min={0}
                                    max={9999}
                                    label="จำนวนสต็อกดอกกำมะหยี่"
                                    suffix=" ชิ้น"
                                    size="md"
                                />
                                <NumberStepper
                                    value={parseInt(form.priority) || 0}
                                    onChange={(val) => setForm(prev => ({ ...prev, priority: val.toString() }))}
                                    min={0}
                                    max={999}
                                    label="ลำดับการแสดงผล (Priority)"
                                    size="md"
                                />

                                <Divider sx={{ my: 2 }}>
                                    <Chip label="🎴 QR Feeling Card" size="small" sx={{ fontWeight: 600 }} />
                                </Divider>

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: '#666' }}>เปิดใช้งาน Feeling Card</Typography>
                                    <Button
                                        onClick={() => handleChange({ target: { name: 'hasQrCode' } } as any)}
                                        sx={{
                                            color: form.hasQrCode ? '#FFF' : '#666',
                                            bgcolor: form.hasQrCode ? '#B76E79' : '#EEE',
                                            borderRadius: '20px',
                                            px: 2,
                                            height: 32,
                                            '&:hover': { bgcolor: form.hasQrCode ? '#A45D68' : '#DDD' }
                                        }}
                                    >
                                        {form.hasQrCode ? 'เปิด' : 'ปิด'}
                                    </Button>
                                </Box>

                                {form.hasQrCode && (
                                    <NumberStepper
                                        value={parseFloat(form.qrCodePrice) || 150}
                                        onChange={(val) => setForm(prev => ({ ...prev, qrCodePrice: val.toString() }))}
                                        min={0}
                                        max={9999}
                                        step={10}
                                        label="ราคาการ์ดปรับแต่งพิเศษ"
                                        prefix="฿"
                                        size="md"
                                    />
                                )}

                                <Divider sx={{ my: 2 }}>
                                    <Chip label="🏷️ ป้ายสัญลักษณ์ & สถานะ (Badges & Status)" size="small" sx={{ fontWeight: 600 }} />
                                </Divider>

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>สถานะการแสดงผล</Typography>
                                        <Typography variant="caption" sx={{ color: '#999' }}>เปิดเพื่อให้แสดงที่หน้าเว็บ</Typography>
                                    </Box>
                                    <Button
                                        onClick={() => handleChange({ target: { name: 'isActive' } } as any)}
                                        sx={{
                                            color: form.isActive ? '#FFF' : '#666',
                                            bgcolor: form.isActive ? '#2E7D32' : '#EEE',
                                            borderRadius: '20px',
                                            px: 2,
                                            height: 32,
                                            '&:hover': { bgcolor: form.isActive ? '#1B5E20' : '#DDD' }
                                        }}
                                    >
                                        {form.isActive ? 'เปิดอยู่' : 'ซ่อนไว้'}
                                    </Button>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: '#666' }}>สินค้าใหม่ (New)</Typography>
                                    <Button
                                        onClick={() => handleChange({ target: { name: 'isNew' } } as any)}
                                        sx={{
                                            color: form.isNew ? '#FFF' : '#666',
                                            bgcolor: form.isNew ? '#B76E79' : '#EEE',
                                            borderRadius: '20px',
                                            px: 2,
                                            height: 32,
                                            '&:hover': { bgcolor: form.isNew ? '#A45D68' : '#DDD' }
                                        }}
                                    >
                                        {form.isNew ? 'เปิด' : 'ปิด'}
                                    </Button>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: '#666' }}>สินค้าขายดี (Best Seller)</Typography>
                                    <Button
                                        onClick={() => handleChange({ target: { name: 'isBestSeller' } } as any)}
                                        sx={{
                                            color: form.isBestSeller ? '#FFF' : '#666',
                                            bgcolor: form.isBestSeller ? '#B76E79' : '#EEE',
                                            borderRadius: '20px',
                                            px: 2,
                                            height: 32,
                                            '&:hover': { bgcolor: form.isBestSeller ? '#A45D68' : '#DDD' }
                                        }}
                                    >
                                        {form.isBestSeller ? 'เปิด' : 'ปิด'}
                                    </Button>
                                </Box>
                            </Stack>

                            <Divider sx={{ my: 4 }} />

                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>รูปหลัก (Cover)</Typography>
                            <Button
                                fullWidth
                                variant="outlined"
                                component="label"
                                disabled={uploading}
                                startIcon={uploading ? <CircularProgress size={20} /> : <ImageIcon size={22} variant="Bulk" />}
                                sx={{
                                    py: 1.5,
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    color: '#B76E79',
                                    borderColor: '#B76E79',
                                    mb: 2
                                }}
                            >
                                เลือกรูปภาพหลัก
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onClick={(e: any) => { e.target.value = null; }}
                                    onChange={(e) => handleFileUpload(e, 'image')}
                                />
                            </Button>

                            {/* Display actual cover image */}
                            {(form.image || pendingImage) && (
                                <Box sx={{ position: 'relative', mt: 2, borderRadius: '12px', overflow: 'hidden', border: '1px solid #EEE' }}>
                                    <Box sx={{ paddingTop: '100%', position: 'relative' }}>
                                        <NextImage
                                            src={
                                                pendingImage ? pendingImage.preview :
                                                    getImageUrl(form.image)
                                            }
                                            alt="Cover Preview"
                                            fill
                                            style={{ objectFit: 'contain', padding: '10%', backgroundColor: '#F9F9F9' }}
                                        />

                                        {/* Status Badge */}
                                        <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 1 }}>
                                            {pendingImage && (
                                                <Box sx={{ bgcolor: 'rgba(183, 110, 121, 0.9)', color: '#FFF', fontSize: '11px', px: 1.5, py: 0.5, borderRadius: '6px' }}>รูปหน้าปกใหม่</Box>
                                            )}
                                        </Box>

                                        {(form.image || pendingImage) && (
                                            <IconButton
                                                size="small"
                                                onClick={removeMainImage}
                                                sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: '#FFF' } }}
                                            >
                                                <Trash size={18} color="#FF4D4F" variant="Bulk" />
                                            </IconButton>
                                        )}
                                    </Box>
                                    {!form.image && !pendingImage && (
                                        <Box sx={{ p: 2, bgcolor: '#F9F9F9', borderTop: '1px solid #EEE' }}>
                                            <Typography variant="caption" sx={{ color: '#666', fontStyle: 'italic' }}>
                                                * จะถูกใช้เป็นรูปหน้าปกเนื่องจากยังไม่ได้เลือกรูปหลักแยกไว้
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                disabled={saving || uploading}
                                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save2 size={22} variant="Bold" />}
                                sx={{
                                    mt: 4,
                                    py: 1.8,
                                    bgcolor: '#B76E79',
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    boxShadow: '0 10px 25px rgba(183, 110, 121, 0.2)',
                                    '&:hover': { bgcolor: '#A45D68' },
                                    '&.Mui-disabled': {
                                        bgcolor: '#D4A5AB',
                                        color: '#FFF',
                                        cursor: 'not-allowed',
                                        pointerEvents: 'auto'
                                    }
                                }}
                            >
                                {saving ? 'กำลังบันทึก...' : uploading ? 'กำลังอัปโหลดรูป...' : isNew ? 'บันทึกสินค้าใหม่' : 'อัปเดตข้อมูล'}
                            </Button>
                        </Paper>
                    </Box>
                </Box>
            </form>
        </>
    );
}
