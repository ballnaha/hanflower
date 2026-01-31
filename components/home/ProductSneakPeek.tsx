'use client';

import Image from "next/image";
import Link from "next/link";
import { Container, Typography, Button, Box } from "@mui/material";

const products = [
    { title: "Sweet Roses", image: "/images/bouquet.png", type: "Signature Bouquet", price: "1,290" },
    { title: "Lucky Jade", image: "/images/succulent.png", type: "Premium Succulent", price: "450" },
    { title: "Golden Pear", image: "/images/img1.webp", type: "Fruit Basket", price: "2,590" },
    { title: "Winterberry Box", image: "/images/img2.webp", type: "Gift Box", price: "1,890" }
];

export default function ProductSneakPeek() {
    return (
        <Box component="section" sx={{ py: { xs: 10, md: 14 }, bgcolor: '#FFFFFF', borderTop: '1px solid #F5F5F5' }}>
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
                        <Typography variant="overline" sx={{ color: '#D4AF37', fontWeight: 600, letterSpacing: '0.2em', mb: 1, display: 'block' }}>
                            RECOMMENDED
                        </Typography>
                        <Typography variant="h2" sx={{ fontSize: { xs: '1.7rem', sm: '2.2rem', md: '2.5rem' }, color: '#1A1A1A', letterSpacing: '0.05em' }}>
                            สินค้า<span style={{ fontStyle: 'italic', fontFamily: '"Playfair Display", serif', color: '#D4AF37' }}>ยอดนิยม</span>
                        </Typography>
                    </Box>
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Link
                            href="/catalog"
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

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
                        gap: 4
                    }}
                >
                    {products.map((product, idx) => (
                        <Box key={idx} sx={{ cursor: 'pointer', group: 'true' }}>
                            <Box sx={{
                                position: 'relative',
                                aspectRatio: '3/4',
                                overflow: 'hidden',
                                mb: 3,
                                border: '1px solid #F0F0F0',
                                transition: 'all 0.5s ease',
                                '&:hover': {
                                    borderColor: '#D4AF37',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)', // Softer shadow
                                    '& img': { transform: 'scale(1.05)' } // Trigger zoom
                                }
                            }}>
                                <Image
                                    src={product.image}
                                    alt={product.title}
                                    fill
                                    style={{
                                        objectFit: 'cover',
                                        transition: 'transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)' // Cinematic Slow Zoom
                                    }}
                                    className="hover-zoom"
                                />
                                {/* Add to Cart Overlay */}
                                <Box sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    bgcolor: '#FFFFFF',
                                    py: 2.5, // Slightly taller
                                    textAlign: 'center',
                                    transform: 'translateY(100%)',
                                    transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)', // Smooth slide
                                    borderTop: '1px solid #F0F0F0',
                                }}
                                    // Adding className to target from parent
                                    className="add-to-cart-overlay"
                                >
                                    <Typography variant="button" sx={{ fontSize: '0.75rem', color: '#1A1A1A', letterSpacing: '0.15em', fontWeight: 600 }}>
                                        ADD TO CART
                                    </Typography>
                                </Box>
                                {/* Re-applying hover logic correctly */}
                                <style jsx global>{`
                                    .add-to-cart-overlay {
                                        transform: translateY(100%);
                                    }
                                    div:hover > .add-to-cart-overlay {
                                        transform: translateY(0);
                                    }
                                `}</style>
                            </Box>

                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" sx={{ color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5, display: 'block' }}>
                                    {product.type}
                                </Typography>
                                <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500, color: '#1A1A1A', mb: 1, letterSpacing: '0.05em' }}>
                                    {product.title}
                                </Typography>
                                <Typography variant="subtitle1" sx={{ color: '#D4AF37', fontWeight: 600, fontSize: '1rem' }}>
                                    ฿{product.price}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>

                <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mt: 8 }}>
                    <Button
                        variant="outlined"
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
