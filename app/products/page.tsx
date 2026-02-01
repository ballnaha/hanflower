'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Container, Typography, Box, Skeleton, Select, MenuItem, FormControl, InputLabel, Chip } from "@mui/material";
import { ArrowRight2 } from 'iconsax-react';

// Fallback image for production
const FALLBACK_IMAGE = "/images/placeholder-product.png";

interface Product {
    id: string;
    slug: string;
    title: string;
    image: string;
    type: string;
    price: string;
    originalPrice: string;
    discount: string;
    priority: number;
}

interface Collection {
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

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [filterOptions, setFilterOptions] = useState<FilterOption[]>([{ value: 'all', label: 'ทั้งหมด' }]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState('all');
    const [sortBy, setSortBy] = useState('priority');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch products and collections in parallel
                const [productsRes, collectionsRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/collections')
                ]);

                if (!productsRes.ok) {
                    throw new Error('Failed to fetch products');
                }

                const productsData = await productsRes.json();
                setProducts(productsData);
                setFilteredProducts(productsData);

                // Build filter options from unique product types
                const uniqueTypes = [...new Set(productsData.map((p: Product) => p.type))] as string[];

                if (collectionsRes.ok) {
                    const collectionsData = await collectionsRes.json();

                    // Create filter options: combine "all" + collection subtitles + any types not in collections
                    const collectionSubtitles = collectionsData.map((c: Collection) => c.subtitle);
                    const options: FilterOption[] = [{ value: 'all', label: 'ทั้งหมด' }];

                    // Add collections as filter options (using subtitle as value, title as label)
                    collectionsData.forEach((c: Collection) => {
                        // Check if any product has this type
                        const hasProducts = productsData.some((p: Product) =>
                            p.type.toLowerCase().includes(c.subtitle.toLowerCase().split(' ')[0].toLowerCase()) ||
                            c.subtitle.toLowerCase().includes(p.type.toLowerCase().split(' ')[0].toLowerCase())
                        );
                        options.push({ value: c.subtitle, label: c.title });
                    });

                    // Add any product types that aren't matched to collections
                    uniqueTypes.forEach((type: string) => {
                        const exists = options.some(opt => opt.value === type);
                        if (!exists) {
                            options.push({ value: type, label: type });
                        }
                    });

                    setFilterOptions(options);
                } else {
                    // Fallback: use product types directly
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
                // Exact match first
                if (p.type === selectedType) return true;
                // Partial match (e.g., "SIGNATURE" matches "Signature Bouquet")
                const selectedLower = selectedType.toLowerCase();
                const typeLower = p.type.toLowerCase();
                return typeLower.includes(selectedLower.split(' ')[0]) ||
                    selectedLower.includes(typeLower.split(' ')[0]);
            });
        }

        // Sort
        if (sortBy === 'priority') {
            result.sort((a, b) => a.priority - b.priority); // Ascending: น้อยไปมาก
        } else if (sortBy === 'price-low') {
            result.sort((a, b) => parseFloat(a.price.replace(',', '')) - parseFloat(b.price.replace(',', '')));
        } else if (sortBy === 'price-high') {
            result.sort((a, b) => parseFloat(b.price.replace(',', '')) - parseFloat(a.price.replace(',', '')));
        }
        // Default is priority (already sorted from API)

        setFilteredProducts(result);
    }, [selectedType, sortBy, products]);

    return (
        <Box sx={{ pt: { xs: '100px', md: '120px' }, pb: { xs: 8, md: 14 }, minHeight: '100vh', bgcolor: '#FAFAFA' }}>
            <Container maxWidth="xl">
                {/* Breadcrumb */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4, color: '#888' }}>
                    <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>
                        หน้าแรก
                    </Link>
                    <ArrowRight2 size={14} />
                    <Typography sx={{ color: '#1A1A1A', fontSize: '0.9rem' }}>
                        สินค้าทั้งหมด
                    </Typography>
                </Box>

                {/* Header */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h1" sx={{
                        fontSize: { xs: '2rem', md: '3rem' },
                        color: '#1A1A1A',
                        letterSpacing: '0.05em',
                        mb: 2
                    }}>
                        สินค้า<span style={{ fontStyle: 'italic', fontFamily: '"Playfair Display", serif', color: '#B76E79' }}>ทั้งหมด</span>
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666', maxWidth: '600px' }}>
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

function ProductCard({ product }: { product: Product }) {
    const [imgSrc, setImgSrc] = useState(product.image || FALLBACK_IMAGE);
    const [imgError, setImgError] = useState(false);

    const handleImageError = () => {
        if (!imgError) {
            setImgError(true);
            setImgSrc(FALLBACK_IMAGE);
        }
    };

    const getImageSrc = (src: string) => {
        if (!src) return FALLBACK_IMAGE;
        if (src.startsWith('http') || src.startsWith('/')) {
            return src;
        }
        return `/${src}`;
    };

    return (
        <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'translateY(-4px)' }
            }}>
                <Box sx={{
                    position: 'relative',
                    aspectRatio: '3/4',
                    overflow: 'hidden',
                    mb: 3,
                    bgcolor: '#EAE0DE',
                    border: '1px solid #E5E5E5',
                    transition: 'all 0.5s ease',
                    '&:hover': {
                        borderColor: '#B76E79',
                        boxShadow: '0 10px 40px rgba(183, 110, 121, 0.15)',
                        '& img': { transform: 'scale(1.05)' },
                        '& .view-overlay': { transform: 'translateY(0)' }
                    }
                }}>
                    <Image
                        src={getImageSrc(imgSrc)}
                        alt={product.title}
                        fill
                        style={{
                            objectFit: 'cover',
                            transition: 'transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
                        }}
                        onError={handleImageError}
                    />

                    {/* Discount Badge */}
                    {product.discount && parseInt(product.discount) > 0 && (
                        <Box sx={{
                            position: 'absolute',
                            top: 15,
                            right: 15,
                            bgcolor: '#B76E79',
                            color: '#FFFFFF',
                            px: 1.5,
                            py: 0.5,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            zIndex: 2
                        }}>
                            -{product.discount}%
                        </Box>
                    )}

                    {/* Hover Overlay */}
                    <Box
                        className="view-overlay"
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            py: 2,
                            textAlign: 'center',
                            transform: 'translateY(100%)',
                            transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        }}
                    >
                        <Typography variant="button" sx={{ fontSize: '0.75rem', color: '#1A1A1A', letterSpacing: '0.15em', fontWeight: 700 }}>
                            ดูรายละเอียด
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5, display: 'block' }}>
                        {product.type}
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500, color: '#1A1A1A', mb: 1, letterSpacing: '0.05em' }}>
                        {product.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ color: '#B76E79', fontWeight: 700, fontSize: '1.1rem' }}>
                            ฿{product.price}
                        </Typography>
                        {product.originalPrice && (
                            <Typography variant="body2" sx={{ color: '#BBB', textDecoration: 'line-through', fontSize: '0.85rem' }}>
                                ฿{product.originalPrice}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>
        </Link>
    );
}
