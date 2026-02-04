'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Container, Typography, Button, Box, Skeleton } from "@mui/material";
import ProductCard, { ProductCardData } from '@/components/product/ProductCard';

export default function ProductSneakPeek() {
    const [products, setProducts] = useState<ProductCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products?limit=12');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('ไม่สามารถโหลดสินค้าได้');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <Box component="section" sx={{ pb: { xs: 6, md: 14 }, pt: { xs: 10, md: 14 }, bgcolor: '#FFF9F8', borderTop: '1px solid #F5F5F5' }}>
            <Container maxWidth="xl">
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        mb: 8,
                        borderBottom: '1px solid #E5E5E5',
                        pb: 2
                    }}
                >
                    <Box>
                        <Typography variant="overline" sx={{ color: '#B76E79', fontWeight: 600, letterSpacing: '0.2em', mb: 1, display: 'block' }}>
                            RECOMMENDED
                        </Typography>
                        <Typography variant="h2" sx={{ fontSize: { xs: '1.7rem', sm: '2.2rem', md: '2.5rem' }, color: '#1A1A1A', letterSpacing: '0.05em', fontWeight: 600 }}>
                            <span style={{ fontStyle: 'normal' }}>สินค้า</span><span style={{ fontStyle: 'italic', color: '#B76E79' }}>ยอดนิยม</span>
                        </Typography>
                    </Box>
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Link
                            href="/products"
                            style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#1A1A1A',
                                textTransform: 'uppercase',
                                letterSpacing: '0.2em',
                                textDecoration: 'none',
                                borderBottom: '1px solid #1A1A1A',
                                paddingBottom: '4px',
                                transition: 'all 0.3s'
                            }}
                        >
                            ดูสินค้าทั้งหมด
                        </Link>
                    </Box>
                </Box>

                {/* Loading State */}
                {loading && (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                            gap: { xs: 2, md: 4 }
                        }}
                    >
                        {[...Array(12)].map((_, idx) => (
                            <Box key={idx}>
                                <Skeleton variant="rectangular" sx={{ aspectRatio: '3/4', mb: 3, bgcolor: '#F2F2F2' }} />
                                <Skeleton variant="text" sx={{ width: '60%', mx: 'auto' }} />
                                <Skeleton variant="text" sx={{ width: '80%', mx: 'auto' }} />
                                <Skeleton variant="text" sx={{ width: '50%', mx: 'auto' }} />
                            </Box>
                        ))}
                    </Box>
                )}

                {/* Error State */}
                {error && !loading && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="body1" sx={{ color: '#888' }}>
                            {error}
                        </Typography>
                    </Box>
                )}

                {/* Products Grid */}
                {!loading && !error && products.length > 0 && (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                            gap: { xs: 2, md: 4 }
                        }}
                    >
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </Box>
                )}

                {/* Empty State */}
                {!loading && !error && products.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="body1" sx={{ color: '#888' }}>
                            ยังไม่มีสินค้า
                        </Typography>
                    </Box>
                )}

                <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mt: 6 }}>
                    <Button
                        variant="outlined"
                        component={Link}
                        href="/products"
                        sx={{
                            borderColor: '#1A1A1A',
                            color: '#1A1A1A',
                            borderRadius: '0px',
                            px: 5,
                            py: 1.5,
                        }}
                    >
                        ดูสินค้าทั้งหมด
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}
