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
    Box as BoxIcon,
    RowVertical
} from 'iconsax-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { 
    restrictToVerticalAxis,
    restrictToWindowEdges 
} from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { useNotification } from '@/context/NotificationContext';
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog';
import { getImageUrl } from '@/lib/utils';

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
    isActive?: boolean;
    isBestSeller?: boolean;
}

// Separate component for sortable row
function SortableRow({ 
    product, 
    updatingItems, 
    handleToggle, 
    handleMenuOpen 
}: { 
    product: Product, 
    updatingItems: Record<string, boolean>, 
    handleToggle: any, 
    handleMenuOpen: any 
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: product.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : (product.isActive === false ? 0.6 : 1),
        position: 'relative' as const,
        zIndex: isDragging ? 1 : 0,
        backgroundColor: isDragging ? '#FAFAFA' : (product.isActive === false ? '#FDFDFD' : 'transparent'),
    };

    return (
        <TableRow 
            ref={setNodeRef} 
            style={style}
            hover 
            sx={{ 
                '&:last-child td, &:last-child th': { border: 0 },
                boxShadow: isDragging ? '0 5px 15px rgba(0,0,0,0.1)' : 'none'
            }}
        >
            <TableCell sx={{ width: 50, cursor: 'grab' }} {...attributes} {...listeners}>
                <RowVertical size={20} color="#CCC" />
            </TableCell>
            <TableCell component="th" scope="row">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        src={getImageUrl(product.image)}
                        variant="rounded"
                        sx={{ width: 48, height: 48, bgcolor: '#F5F5F5' }}
                    />
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography sx={{ fontWeight: 600, color: '#1A1A1A', fontSize: '0.9rem' }}>
                                {product.title}
                            </Typography>
                            {product.isActive === false && (
                                <Chip
                                    label="ถูกซ่อนอยู่"
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        borderColor: '#CCC',
                                        color: '#888',
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
            <TableCell>
                <Chip
                    label={product.isActive === false ? 'Hidden' : 'Active'}
                    size="small"
                    onClick={() => handleToggle(product.id, 'isActive', !!product.isActive)}
                    sx={{
                        bgcolor: product.isActive === false ? '#EEEEEE' : '#E8F5E9',
                        color: product.isActive === false ? '#888888' : '#2E7D32',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: product.isActive === false ? '#E0E0E0' : '#C8E6C9' }
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
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                        size="small"
                        onClick={() => handleToggle(product.id, 'isBestSeller', !!product.isBestSeller)}
                        disabled={updatingItems[`${product.id}-isBestSeller`]}
                        sx={{
                            color: product.isBestSeller ? '#D4AF37' : '#E0E0E0',
                            transition: 'all 0.2s',
                            '&:hover': { color: '#D4AF37', transform: 'scale(1.1)' },
                            position: 'relative'
                        }}
                    >
                        <Box sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: product.isBestSeller ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                            border: '1px solid',
                            borderColor: product.isBestSeller ? '#D4AF37' : '#E0E0E0',
                            opacity: updatingItems[`${product.id}-isBestSeller`] ? 0.3 : 1
                        }}>
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800 }}>BEST</Typography>
                        </Box>
                        {updatingItems[`${product.id}-isBestSeller`] && (
                            <CircularProgress
                                size={20}
                                sx={{
                                    position: 'absolute',
                                    color: '#D4AF37'
                                }}
                            />
                        )}
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => handleToggle(product.id, 'isNew', !!product.isNew)}
                        disabled={updatingItems[`${product.id}-isNew`]}
                        sx={{
                            color: product.isNew ? '#B76E79' : '#E0E0E0',
                            transition: 'all 0.2s',
                            '&:hover': { color: '#B76E79', transform: 'scale(1.1)' },
                            position: 'relative'
                        }}
                    >
                        <Box sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: product.isNew ? 'rgba(183, 110, 121, 0.1)' : 'transparent',
                            border: '1px solid',
                            borderColor: product.isNew ? '#B76E79' : '#E0E0E0',
                            opacity: updatingItems[`${product.id}-isNew`] ? 0.3 : 1
                        }}>
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800 }}>NEW</Typography>
                        </Box>
                        {updatingItems[`${product.id}-isNew`] && (
                            <CircularProgress
                                size={20}
                                sx={{
                                    position: 'absolute',
                                    color: '#B76E79'
                                }}
                            />
                        )}
                    </IconButton>
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
    );
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
            const res = await fetch('/api/products?all=true');
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
        setAnchorEl(null); // Just close the menu, keep selectedProduct
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedProduct) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/products/${selectedProduct}`, {
                method: 'DELETE',
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                if (data.action === 'deactivated') {
                    // Update the product in the list instead of removing it
                    setProducts(prev => prev.map(p =>
                        p.id === selectedProduct ? { ...p, isActive: false } : p
                    ));
                    showSuccess('เนื่องจากสินค้านี้มีออเดอร์ในระบบ จึงทำการซ่อนสินค้าแทนการลบ');
                } else {
                    setProducts(prev => prev.filter(p => p.id !== selectedProduct));
                    showSuccess('ลบสินค้าเรียบร้อยแล้ว');
                }
                setOpenDeleteDialog(false);
                setSelectedProduct(null);
            } else {
                showError(data.error || 'เกิดข้อผิดพลาดในการลบสินค้า');
                setOpenDeleteDialog(false);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            showError('ไม่สามารถลบสินค้าได้');
            setOpenDeleteDialog(false);
        } finally {
            setDeleting(false);
        }
    };

    const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>({});
    const [isReordering, setIsReordering] = useState(false);

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

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = products.findIndex((p) => p.id === active.id);
            const newIndex = products.findIndex((p) => p.id === over.id);

            const newProducts = arrayMove(products, oldIndex, newIndex);
            
            // Update UI immediately (Optimistic)
            setProducts(newProducts);
            setIsReordering(true);

            try {
                // Determine new priorities
                const updates = newProducts.map((p, index) => ({
                    id: p.id,
                    priority: index + 1
                }));

                const res = await fetch('/api/products/reorder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orders: updates })
                });

                if (res.ok) {
                    showSuccess('จัดเรียงลำดับใหม่เรียบร้อยแล้ว');
                    setProducts(prev => prev.map((p, idx) => ({ ...p, priority: idx + 1 })));
                } else {
                    showError('ไม่สามารถบันทึกลำดับใหม่ได้');
                    fetchProducts();
                }
            } catch (error) {
                console.error('Reorder error:', error);
                showError('เกิดข้อผิดพลาดในการจัดเรียง');
                fetchProducts();
            } finally {
                setIsReordering(false);
            }
        }
    };

    const handleToggle = async (productId: string, field: 'isBestSeller' | 'isNew' | 'isActive', currentValue: boolean) => {
        const previousProducts = [...products];
        setProducts(prev => prev.map(p =>
            p.id === productId ? { ...p, [field]: !currentValue } : p
        ));
        
        const updateKey = `${productId}-${field}`;
        setUpdatingItems(prev => ({ ...prev, [updateKey]: true }));

        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: !currentValue })
            });

            if (!res.ok) {
                setProducts(previousProducts);
                const data = await res.json();
                showError(data.error || 'เกิดข้อผิดพลาดในการอัปเดต');
            } else {
                showSuccess('อัปเดตสถานะเรียบร้อยแล้ว');
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            setProducts(previousProducts);
            showError('ไม่สามารถอัปเดตสถานะได้');
        } finally {
            setUpdatingItems(prev => {
                const newState = { ...prev };
                delete newState[updateKey];
                return newState;
            });
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
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.type.toLowerCase().includes(searchTerm.toLowerCase());
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

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
            >
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '20px', border: '1px solid rgba(0,0,0,0.03)', bgcolor: '#FFFFFF' }}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                                <TableCell sx={{ width: 50 }} />
                                <TableCell sx={{ fontWeight: 700, color: '#1A1A1A', py: 2.5 }}>สินค้า</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#1A1A1A' }}>หมวดหมู่</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#1A1A1A' }}>สถานะ</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#1A1A1A' }}>ราคา</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#1A1A1A' }}>สต็อก</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#1A1A1A' }}>Badges</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#1A1A1A' }}>ลำดับ</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: '#1A1A1A' }}>จัดการ</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={10} align="center" sx={{ py: 10 }}>
                                        <CircularProgress size={30} sx={{ color: '#B76E79' }} />
                                        <Typography sx={{ mt: 2, color: '#888' }}>กำลังโหลดข้อมูลสินค้า...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} align="center" sx={{ py: 12 }}>
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
                                <SortableContext
                                    items={filteredProducts.map(p => p.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {filteredProducts.map((product) => (
                                        <SortableRow
                                            key={product.id}
                                            product={product}
                                            updatingItems={updatingItems}
                                            handleToggle={handleToggle}
                                            handleMenuOpen={handleMenuOpen}
                                        />
                                    ))}
                                </SortableContext>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DndContext>

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
                onClose={() => {
                    setOpenDeleteDialog(false);
                    setSelectedProduct(null);
                }}
                onConfirm={handleConfirmDelete}
                title="ยืนยันการลบสินค้า"
                message="คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
                isLoading={deleting}
            />
        </AdminLayout>
    );
}
