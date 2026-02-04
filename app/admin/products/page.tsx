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
    FormControl,
    Select,
    InputLabel
} from '@mui/material';
import {
    Add,
    SearchNormal1,
    Edit2,
    Trash,
    More,
    Filter,
    Box as BoxIcon
} from 'iconsax-react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { useNotification } from '@/context/NotificationContext';
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog';

interface Product {
    id: string;
    sku: string;
    slug: string;
    title: string;
    type: string;
    price: string;
    originalPrice?: string;
    discount?: number;
    image: string;
    stock: number;
    priority: number;
    categoryId?: string;
    isNew?: boolean;
    isBestSeller?: boolean;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const { showSuccess, showError, showWarning } = useNotification();

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/products');
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = () => {
        handleMenuClose();
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedProduct) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/products/${selectedProduct}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setProducts(prev => prev.filter(p => p.id !== selectedProduct));
                showSuccess('ลบสินค้าเรียบร้อยแล้ว');
                setOpenDeleteDialog(false);
            } else {
                showError('เกิดข้อผิดพลาดในการลบสินค้า');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            showError('ไม่สามารถลบสินค้าได้');
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, productId: string) => {
        setAnchorEl(event.currentTarget);
        setSelectedProduct(productId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedProduct(null);
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.type.toLowerCase().includes(searchTerm.toLowerCase());
        // Match by ID if possible, otherwise rely on fallback behavior (or just ID)
        const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <AdminLayout title="จัดการสินค้า">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                        มีสินค้าทั้งหมด {products.length} รายการในระบบ
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        component={Link}
                        href="/admin/products/new"
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
                        เพิ่มสินค้าใหม่
                    </Button>
                </Box>
            </Box>

            {/* Filters and Search */}
            <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                    placeholder="ค้นหาสินค้าจากชื่อ..."
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

                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="category-filter-label" sx={{ fontSize: '0.85rem' }}>Category</InputLabel>
                    <Select
                        labelId="category-filter-label"
                        value={selectedCategory}
                        label="Category"
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        sx={{
                            bgcolor: '#F9F9F9',
                            borderRadius: '10px',
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            fontSize: '0.85rem'
                        }}
                    >
                        <MenuItem value="all">ทั้งหมด</MenuItem>
                        {categories.map((cat: any) => (
                            <MenuItem key={cat.id} value={cat.id}>{cat.title}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <IconButton sx={{ bgcolor: '#F9F9F9', borderRadius: '10px' }}>
                    <Filter size={20} color="#B76E79" variant="Bulk" />
                </IconButton>
            </Paper>

            {/* Table */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '20px', border: '1px solid rgba(0,0,0,0.03)', bgcolor: '#FFFFFF' }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                            <TableCell sx={{ fontWeight: 700, color: '#1A1A1A', py: 2.5 }}>สินค้า</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1A1A1A' }}>หมวดหมู่</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1A1A1A' }}>ราคา</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1A1A1A' }}>สต็อก</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1A1A1A' }}>ลำดับ</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#1A1A1A' }}>จัดการ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                    <CircularProgress size={30} sx={{ color: '#B76E79' }} />
                                    <Typography sx={{ mt: 2, color: '#888' }}>กำลังโหลดข้อมูลสินค้า...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 12 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <BoxIcon size={80} variant="Bulk" color="#E0E0E0" />
                                        <Typography sx={{ mt: 2, color: '#888', fontWeight: 500 }}>
                                            ไม่พบข้อมูลสินค้า
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#AAA' }}>
                                            ลองเปลี่ยนคำค้นหาหรือตัวกรองดูอีกครั้ง
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product) => (
                                <TableRow key={product.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component="th" scope="row">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar
                                                src={product.image.startsWith('http') || product.image.startsWith('/') ? product.image : `/${product.image}`}
                                                variant="rounded"
                                                sx={{ width: 48, height: 48, bgcolor: '#F5F5F5' }}
                                            />
                                            <Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                    <Typography sx={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9rem' }}>
                                                        {product.title}
                                                    </Typography>
                                                    {product.isNew && (
                                                        <Chip
                                                            label="สินค้าใหม่"
                                                            size="small"
                                                            sx={{
                                                                bgcolor: '#B76E79',
                                                                color: '#FFFFFF',
                                                                fontWeight: 700,
                                                                fontSize: '0.6rem',
                                                                height: 20,
                                                                '& .MuiChip-label': { px: 1 }
                                                            }}
                                                        />
                                                    )}
                                                    {product.isBestSeller && (
                                                        <Chip
                                                            label="สินค้าขายดี"
                                                            size="small"
                                                            sx={{
                                                                bgcolor: '#D4AF37',
                                                                color: '#FFFFFF',
                                                                fontWeight: 700,
                                                                fontSize: '0.6rem',
                                                                height: 20,
                                                                '& .MuiChip-label': { px: 1 }
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                                <Typography sx={{ fontSize: '0.75rem', color: '#888' }}>
                                                    SKU: {product.sku}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={product.type}
                                            size="small"
                                            sx={{
                                                bgcolor: '#FFF9F8',
                                                color: '#B76E79',
                                                fontWeight: 600,
                                                fontSize: '0.7rem'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: '#1A1A1A' }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                            {product.originalPrice && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography sx={{
                                                        fontSize: '0.75rem',
                                                        color: '#AAA',
                                                        textDecoration: 'line-through',
                                                        fontWeight: 400
                                                    }}>
                                                        ฿{(() => {
                                                            const val = String(product.originalPrice).replace(/,/g, '');
                                                            return isNaN(Number(val)) ? product.originalPrice : Number(val).toLocaleString();
                                                        })()}
                                                    </Typography>
                                                    {product.discount && (
                                                        <Box component="span" sx={{
                                                            fontSize: '0.65rem',
                                                            bgcolor: '#FF4D4F15',
                                                            color: '#FF4D4F',
                                                            px: 0.5,
                                                            borderRadius: '4px',
                                                            fontWeight: 700
                                                        }}>
                                                            -{product.discount}%
                                                        </Box>
                                                    )}
                                                </Box>
                                            )}
                                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                                                ฿{(() => {
                                                    const val = String(product.price).replace(/,/g, '');
                                                    return isNaN(Number(val)) ? product.price : Number(val).toLocaleString();
                                                })()}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                bgcolor: product.stock > 0 ? '#52C41A' : '#F5222D'
                                            }} />
                                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                                                {product.stock} ในสต็อก
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>{product.priority}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, product.id)}>
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
                    href={`/admin/products/${selectedProduct}`}
                    sx={{ gap: 1.5, py: 1.2, color: '#5D4037', fontSize: '0.85rem' }}
                >
                    <Edit2 size={18} color="#B76E79" variant="Bulk" /> แก้ไขข้อมูล
                </MenuItem>
                <MenuItem
                    onClick={handleDeleteClick}
                    disabled={deleting}
                    sx={{ gap: 1.5, py: 1.2, color: '#FF4D4F', fontSize: '0.85rem' }}
                >
                    <Trash size={18} color="#FF4D4F" variant="Bulk" /> ลบสินค้า
                </MenuItem>
            </Menu>

            <AdminConfirmDialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                onConfirm={handleConfirmDelete}
                title="ยืนยันการลบสินค้า"
                message="คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
                isLoading={deleting}
            />
        </AdminLayout>
    );
}
