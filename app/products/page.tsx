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
    priceVelvet?: string;
    originalPriceVelvet?: string;
    discountVelvet?: string;
    hasQrCode?: boolean;
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
                        // Use subtitle as value (e.g. 'SIGNATURE BOUQUETS') and title as label (e.g. 'Signature Bouquets')
                        // Ensure consistent casing for keys if needed, but keeping original for display
                        if (!seenValues.has(c.subtitle)) {
                            options.push({ value: c.subtitle, label: c.title });
                            seenValues.add(c.subtitle);
                        }
                    });

                    // 2. Add product types that don't match any category
                    uniqueTypes.forEach((type: string) => {
                        // Check if this type matches any existing category value (case-insensitive check advisable if data is messy)
                        const isAlreadyAdded = Array.from(seenValues).some(
                            existingVal => existingVal.toLowerCase() === type.toLowerCase()
                        );

                        // Also check if it matches existing labels to avoid confusion
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

                // Allow matches if product type contains the category keyword or vice-versa
                // Use a comprehensive includes check rather than just split space
                return typeLower.includes(selectedLower) || selectedLower.includes(typeLower);
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
    const [selectedVariant, setSelectedVariant] = useState<'fresh' | 'velvet'>('fresh');

    const hasVelvet = product.priceVelvet && product.priceVelvet !== '';
    const currentPrice = selectedVariant === 'velvet' && hasVelvet ? product.priceVelvet : product.price;
    const currentOriginalPrice = selectedVariant === 'velvet' && hasVelvet ? product.originalPriceVelvet : product.originalPrice;
    const currentDiscount = selectedVariant === 'velvet' && hasVelvet ? product.discountVelvet : product.discount;

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

    const handleVariantClick = (e: React.MouseEvent, variant: 'fresh' | 'velvet') => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedVariant(variant);
    };

    return (
        <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{ cursor: 'pointer', group: 'true', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{
                    position: 'relative',
                    aspectRatio: '3/4',
                    overflow: 'hidden',
                    mb: 3,
                    bgcolor: '#F2F2F2',
                    border: '1px solid rgba(0,0,0,0.03)',
                    transition: 'all 0.5s ease',
                    '&:hover': {
                        borderColor: '#B76E79',
                        boxShadow: '0 10px 40px rgba(183, 110, 121, 0.15)',
                        '& img': { transform: 'scale(1.05)' }
                    }
                }}>
                    <Image
                        src={getImageSrc(imgSrc)}
                        alt={product.title}
                        fill
                        style={{
                            objectFit: 'cover',
                            padding: '10%',
                            transition: 'transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
                        }}
                        onError={handleImageError}
                    />

                    {/* QR Code Card Overlay */}
                    {product.hasQrCode !== false && (
                        <Box sx={{
                            position: 'absolute',
                            bottom: 25,
                            right: 15,
                            width: '24%',
                            aspectRatio: '1/1.3',
                            zIndex: 5,
                            filter: 'drop-shadow(0 8px 15px rgba(0,0,0,0.12))',
                            animation: 'floatShort 3s ease-in-out infinite',
                            '@keyframes floatShort': {
                                '0%, 100%': { transform: 'translateY(0) rotate(5deg)' },
                                '50%': { transform: 'translateY(-10px) rotate(8deg)' }
                            }
                        }}>
                            <Image
                                src="/images/qr_code.png"
                                alt="QR Code Feeling Card"
                                fill
                                style={{ objectFit: 'contain' }}
                            />
                        </Box>
                    )}

                    {/* Discount Badge Overlay */}
                    {currentDiscount && parseInt(currentDiscount) > 0 && (
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
                            -{currentDiscount}%
                        </Box>
                    )}

                    {/* Variant Selector Overlay - Always Visible */}
                    {hasVelvet && (
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 15,
                                left: 0,
                                right: 0,
                                display: 'flex',
                                justifyContent: 'center',
                                zIndex: 2
                            }}
                        >
                            <Box sx={{
                                display: 'inline-flex',
                                bgcolor: 'rgba(255, 255, 255, 0.85)',
                                backdropFilter: 'blur(8px)',
                                borderRadius: '30px',
                                p: 0.5,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                            }}>
                                <Box
                                    onClick={(e) => handleVariantClick(e, 'fresh')}
                                    sx={{
                                        px: 2,
                                        py: 0.6,
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        bgcolor: selectedVariant === 'fresh' ? '#FFFFFF' : 'transparent',
                                        boxShadow: selectedVariant === 'fresh' ? '0 2px 8px rgba(183, 110, 121, 0.2)' : 'none',
                                        color: selectedVariant === 'fresh' ? '#B76E79' : '#666',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                    }}
                                >
                                    <Typography sx={{ fontSize: '0.85rem', fontWeight: selectedVariant === 'fresh' ? 700 : 500 }}>
                                        ดอกไม้สด
                                    </Typography>
                                </Box>
                                <Box
                                    onClick={(e) => handleVariantClick(e, 'velvet')}
                                    sx={{
                                        px: 2,
                                        py: 0.6,
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        bgcolor: selectedVariant === 'velvet' ? '#FFFFFF' : 'transparent',
                                        boxShadow: selectedVariant === 'velvet' ? '0 2px 8px rgba(183, 110, 121, 0.2)' : 'none',
                                        color: selectedVariant === 'velvet' ? '#B76E79' : '#666',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                    }}
                                >
                                    <Typography sx={{ fontSize: '0.85rem', fontWeight: selectedVariant === 'velvet' ? 700 : 500 }}>
                                        กำมะหยี่
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Box>

                <Box sx={{ textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="caption" sx={{ color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5, display: 'block' }}>
                        {product.type}
                    </Typography>
                    <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500, color: '#1A1A1A', mb: 1, letterSpacing: '0.05em' }}>
                        {product.title}
                    </Typography>
                    <Box sx={{ mt: 'auto' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                            <Typography variant="subtitle1" sx={{ color: '#B76E79', fontWeight: 700, fontSize: '1.2rem' }}>
                                ฿{currentPrice}
                            </Typography>
                            {currentOriginalPrice && (
                                <Typography variant="body2" sx={{ color: '#BBB', textDecoration: 'line-through', fontSize: '0.9rem' }}>
                                    ฿{currentOriginalPrice}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Link>
    );
}
