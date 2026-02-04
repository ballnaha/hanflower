import React, { useEffect, useState } from 'react';
import { Box, Typography, Container } from '@mui/material';
import { Heart } from 'iconsax-react';

export default function PromotionBar() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                setSettings(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading || settings.promo_bar_enabled === 'false') return null;

    const promoText = settings.promo_bar_text || "ลด 10% จนถึงวันที่ 10 ก.พ. นี้";
    const promoTitle = settings.promo_bar_title || "Valentine's Special";

    return (
        <Box sx={{
            bgcolor: '#F4E4E4', // Luxury Muted Dusty Rose
            borderBottom: '1px solid #E8D3D3',
            color: '#7A5C5C', // Deep Mocha for organic premium feel
            py: { xs: 1, md: 1.2 },
            textAlign: 'center',
            position: 'relative',
            width: '100%',
        }}>
            <Container maxWidth="xl">
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: { xs: 1.5, md: 3 },
                }}>
                    <Heart size={16} variant="Bold" color="#B76E79" />

                    <Typography sx={{
                        fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        fontFamily: 'var(--font-prompt), sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5
                    }}>
                        <Box component="span" sx={{
                            fontWeight: 700,
                            textTransform: 'uppercase',
                        }}>
                            {promoTitle}
                        </Box>
                        <Box component="span" sx={{ color: 'rgba(122, 92, 92, 0.2)' }}>|</Box>
                        <Box component="span">{promoText}</Box>
                    </Typography>

                    <Heart size={16} variant="Bold" color="#B76E79" />
                </Box>
            </Container>
        </Box>
    );
}
