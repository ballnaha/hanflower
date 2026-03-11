'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from "next/link";
import { Container, Typography, Box, Skeleton, Select, MenuItem, FormControl, InputLabel, Chip, Breadcrumbs } from "@mui/material";
import { useSearchParams } from 'next/navigation';
import ProductCard, { ProductCardData } from '@/components/product/ProductCard';

interface Product extends ProductCardData {
    priority: number;
}

interface Category {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
}

interface FilterOption {
    value: string;
    label: string;
}

function ProductsContent() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category');

    const [categories, setCategories] = useState<Category[]>([]);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [filterOptions, setFilterOptions] = useState<FilterOption[]>([{ value: 'all', label: 'ทั้งหมด' }]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState(initialCategory || 'all');
    const [sortBy, setSortBy] = useState('priority');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/categories')
                ]);

                if (!productsRes.ok) throw new Error('Failed to fetch products');

                const productsData = await productsRes.json();
                const categoriesData = categoriesRes.ok ? await categoriesRes.json() : [];

                setProducts(productsData);
                setCategories(categoriesData);

                // Find if the initial category exists
                const activeCat = categoriesData.find((c: Category) =>
                    c.subtitle.toLowerCase() === initialCategory?.toLowerCase()
                );
                setCurrentCategory(activeCat);

                // Build filter options
                let options: FilterOption[] = [{ value: 'all', label: 'ทั้งหมด' }];
                const seenValues = new Set<string>(['all']);

                if (activeCat) {
                    // We are in a specific category (e.g. BOUQUET)
                    // Show "All [Category Name]" and then sub-types that belong to this category
                    options = [{ value: activeCat.subtitle, label: `ทั้งหมดใน${activeCat.title}` }];

                    const subTypes = [...new Set(productsData
                        .filter((p: any) => p.categoryId === activeCat.id)
                        .map((p: any) => p.type))] as string[];

                    subTypes.forEach(type => {
                        if (type && type.toLowerCase() !== activeCat.subtitle.toLowerCase()) {
                            options.push({ value: type, label: type });
                        }
                    });
                } else {
                    // Global view - show regular categories as chips
                    categoriesData.forEach((c: Category) => {
                        if (!seenValues.has(c.subtitle)) {
                            options.push({ value: c.subtitle, label: c.title });
                            seenValues.add(c.subtitle);
                        }
                    });

                    // Add other unique types that aren't categories
                    const uniqueTypes = [...new Set(productsData.map((p: any) => p.type))] as string[];
                    uniqueTypes.forEach((type: string) => {
                        if (type && !Array.from(seenValues).some(v => v.toLowerCase() === type.toLowerCase())) {
                            options.push({ value: type, label: type });
                        }
                    });
                }

                setFilterOptions(options);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('ไม่สามารถโหลดสินค้าได้');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [initialCategory]);

    // Filter and sort products
    useEffect(() => {
        let result = [...products];

        // 1. Initial Category Filter (Base)
        if (initialCategory) {
            result = result.filter(p => {
                const catSubtitle = categories.find(c => c.id === (p as any).categoryId)?.subtitle || '';
                return catSubtitle.toLowerCase() === initialCategory.toLowerCase() ||
                    p.type.toLowerCase().includes(initialCategory.toLowerCase());
            });
        }

        // 2. Sub-type Filter (Drill down)
        if (selectedType !== 'all' && selectedType.toLowerCase() !== initialCategory?.toLowerCase()) {
            result = result.filter(p => {
                const selectedLower = selectedType.toLowerCase();
                const typeLower = p.type.toLowerCase();
                return typeLower === selectedLower || typeLower.includes(selectedLower);
            });
        }

        // Sort
        if (sortBy === 'priority') {
            result.sort((a, b) => a.priority - b.priority);
        } else if (sortBy === 'price-low') {
            result.sort((a, b) => parseFloat(a.price.replace(',', '')) - parseFloat(b.price.replace(',', '')));
        } else if (sortBy === 'price-high') {
            result.sort((a, b) => parseFloat(b.price.replace(',', '')) - parseFloat(a.price.replace(',', '')));
        }

        setFilteredProducts(result);
    }, [selectedType, sortBy, products, initialCategory, categories]);

    return (
        <Box sx={{ pt: { xs: '100px', md: '120px' }, pb: { xs: 8, md: 14 }, minHeight: '100vh', bgcolor: '#FAFAFA' }}>
            <Container maxWidth="xl">
                {/* Breadcrumb */}
                <Breadcrumbs sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                    <Link href="/" style={{ textDecoration: 'none', color: '#888', fontSize: '0.9rem' }}>หน้าแรก</Link>
                    {currentCategory ? (
                        <Link href="/products" style={{ textDecoration: 'none', color: '#888', fontSize: '0.9rem' }}>สินค้าทั้งหมด</Link>
                    ) : (
                        <Typography color="text.primary" sx={{ fontSize: '0.9rem' }}>สินค้าทั้งหมด</Typography>
                    )}
                    {currentCategory && (
                        <Typography color="text.primary" sx={{ fontSize: '0.9rem' }}>{currentCategory.title}</Typography>
                    )}
                </Breadcrumbs>

                {/* Header */}
                <Box sx={{ mb: 6, textAlign: 'center' }}>
                    <Typography variant="h1" sx={{
                        fontSize: { xs: '2rem', md: '3rem' },
                        color: '#1A1A1A',
                        letterSpacing: '0.05em',
                        mb: 2
                    }}>
                        <span style={{ fontStyle: 'normal', fontFamily: 'var(--font-prompt)' }}>
                            {currentCategory ? currentCategory.title : 'สินค้า'}
                        </span>
                        {!currentCategory && <span style={{ fontStyle: 'italic', fontFamily: 'var(--font-prompt)', color: '#B76E79' }}>ทั้งหมด</span>}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666', maxWidth: '600px', mx: 'auto' }}>
                        เลือกชมคอลเลกชันดอกไม้และของขวัญสุดพิเศษจากเรา ทุกชิ้นจัดทำด้วยความใส่ใจ
                    </Typography>
                </Box>

                {/* Filters */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    mb: 6,
                    p: 3,
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E5E5E5'
                }}>
                    {/* Type Filter - Chips on desktop */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, flexWrap: 'wrap', gap: 1, flex: 1 }}>
                        {filterOptions.map((option) => (
                            <Chip
                                key={option.value}
                                label={option.label}
                                onClick={() => setSelectedType(option.value)}
                                sx={{
                                    bgcolor: selectedType === option.value ? '#B76E79' : 'transparent',
                                    color: selectedType === option.value ? '#FFFFFF' : '#666',
                                    border: '1px solid',
                                    borderColor: selectedType === option.value ? '#B76E79' : '#E5E5E5',
                                    borderRadius: '0px',
                                    '&:hover': {
                                        bgcolor: selectedType === option.value ? '#B76E79' : '#FFF9F8'
                                    }
                                }}
                            />
                        ))}
                    </Box>

                    {/* Type Filter - Dropdown on mobile */}
                    <FormControl sx={{ display: { xs: 'flex', md: 'none' }, minWidth: 150 }} size="small">
                        <InputLabel>หมวดหมู่</InputLabel>
                        <Select
                            value={selectedType}
                            label="หมวดหมู่"
                            onChange={(e) => setSelectedType(e.target.value)}
                            sx={{ borderRadius: 0 }}
                        >
                            {filterOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Sort */}
                    <FormControl sx={{ minWidth: 150 }} size="small">
                        <InputLabel>เรียงตาม</InputLabel>
                        <Select
                            value={sortBy}
                            label="เรียงตาม"
                            onChange={(e) => setSortBy(e.target.value)}
                            sx={{ borderRadius: 0 }}
                        >
                            <MenuItem value="priority">แนะนำ</MenuItem>
                            <MenuItem value="price-low">ราคา: ต่ำ → สูง</MenuItem>
                            <MenuItem value="price-high">ราคา: สูง → ต่ำ</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {/* Product Count */}
                <Typography sx={{ mb: 4, color: '#888', fontSize: '0.9rem' }}>
                    แสดง {filteredProducts.length} รายการ
                </Typography>

                {/* Loading State */}
                {loading && (
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
                        gap: { xs: 2, md: 4 }
                    }}>
                        {[...Array(8)].map((_, idx) => (
                            <Box key={idx}>
                                <Skeleton variant="rectangular" sx={{ aspectRatio: '3/4', mb: 3, bgcolor: '#EAE0DE' }} />
                                <Skeleton variant="text" sx={{ width: '60%', mx: 'auto' }} />
                                <Skeleton variant="text" sx={{ width: '80%', mx: 'auto' }} />
                                <Skeleton variant="text" sx={{ width: '50%', mx: 'auto' }} />
                            </Box>
                        ))}
                    </Box>
                )}

                {/* Error State */}
                {error && !loading && (
                    <Box sx={{ textAlign: 'center', py: 12 }}>
                        <Typography variant="body1" sx={{ color: '#888' }}>
                            {error}
                        </Typography>
                    </Box>
                )}

                {/* Products Grid */}
                {!loading && !error && filteredProducts.length > 0 && (
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
                        gap: { xs: 2, md: 4 }
                    }}>
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </Box>
                )}

                {/* Empty State */}
                {!loading && !error && filteredProducts.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 12 }}>
                        <Typography variant="h6" sx={{ color: '#888', mb: 2 }}>
                            ไม่พบสินค้าในหมวดหมู่นี้
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#AAA' }}>
                            ลองเลือกหมวดหมู่อื่น หรือดูสินค้าทั้งหมด
                        </Typography>
                    </Box>
                )}
            </Container>
        </Box>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <Box sx={{ pt: { xs: '100px', md: '120px' }, pb: { xs: 8, md: 14 }, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Skeleton variant="rectangular" width="100%" height="100vh" />
            </Box>
        }>
            <ProductsContent />
        </Suspense>
    );
}
