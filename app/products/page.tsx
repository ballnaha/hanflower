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
                // Fetch products and categories in parallel
                const [productsRes, categoriesRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/categories')
                ]);

                if (!productsRes.ok) {
                    throw new Error('Failed to fetch products');
                }

                const productsData = await productsRes.json();
                setProducts(productsData);
                setFilteredProducts(productsData);

                // Build filter options from unique product types
                const uniqueTypes = [...new Set(productsData.map((p: Product) => p.type))] as string[];

                if (categoriesRes.ok) {
                    const categoriesData = await categoriesRes.json();
                    const options: FilterOption[] = [{ value: 'all', label: 'ทั้งหมด' }];
                    const seenValues = new Set<string>(['all']);

                    // 1. Add defined categories first
                    categoriesData.forEach((c: Category) => {
                        if (!seenValues.has(c.subtitle)) {
                            options.push({ value: c.subtitle, label: c.title });
                            seenValues.add(c.subtitle);
                        }
                    });

                    // 2. Add product types that don't match any category
                    uniqueTypes.forEach((type: string) => {
                        const isAlreadyAdded = Array.from(seenValues).some(
                            existingVal => existingVal.toLowerCase() === type.toLowerCase()
                        );
                        const isMatchLabel = options.some(opt => opt.label.toLowerCase() === type.toLowerCase());

                        if (!isAlreadyAdded && !isMatchLabel) {
                            options.push({ value: type, label: type });
                            seenValues.add(type);
                        }
                    });

                    setFilterOptions(options);
                } else {
                    // Fallback
                    const options: FilterOption[] = [
                        { value: 'all', label: 'ทั้งหมด' },
                        ...uniqueTypes.map((type: string) => ({ value: type, label: type }))
                    ];
                    setFilterOptions(options);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('ไม่สามารถโหลดสินค้าได้');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter and sort products
    useEffect(() => {
        let result = [...products];

        // Filter by type (match substring for flexibility)
        if (selectedType !== 'all') {
            result = result.filter(p => {
                const selectedLower = selectedType.toLowerCase();
                const typeLower = p.type.toLowerCase();
                return typeLower.includes(selectedLower) || selectedLower.includes(typeLower);
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
    }, [selectedType, sortBy, products]);

    return (
        <Box sx={{ pt: { xs: '100px', md: '120px' }, pb: { xs: 8, md: 14 }, minHeight: '100vh', bgcolor: '#FAFAFA' }}>
            <Container maxWidth="xl">
                {/* Breadcrumb */}
                <Breadcrumbs sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                    <Link href="/" style={{ textDecoration: 'none', color: '#888', fontSize: '0.9rem' }}>หน้าแรก</Link>
                    <Typography color="text.primary" sx={{ fontSize: '0.9rem' }}>สินค้าทั้งหมด</Typography>
                </Breadcrumbs>

                {/* Header */}
                <Box sx={{ mb: 6, textAlign: 'center' }}>
                    <Typography variant="h1" sx={{
                        fontSize: { xs: '2rem', md: '3rem' },
                        color: '#1A1A1A',
                        letterSpacing: '0.05em',
                        mb: 2
                    }}>
                        <span style={{ fontStyle: 'normal', fontFamily: 'var(--font-prompt)' }}>สินค้า</span><span style={{ fontStyle: 'italic', fontFamily: 'var(--font-prompt)', color: '#B76E79' }}>ทั้งหมด</span>
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
