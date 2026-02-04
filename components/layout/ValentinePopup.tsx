'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Fade, Modal, Backdrop } from '@mui/material';
import { Add, CloseCircle, Heart } from 'iconsax-react';
import Image from 'next/image';

export default function ValentinePopup() {
    const [open, setOpen] = useState(false);
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                setSettings(data);
                setLoading(false);

                if (data.valentine_popup_enabled !== 'false') {
                    const isDismissed = sessionStorage.getItem('valentine_promo_dismissed');
                    if (!isDismissed) {
                        const timer = setTimeout(() => {
                            setOpen(true);
                        }, 2000);
                        return () => clearTimeout(timer);
                    }
                }
            })
            .catch(() => setLoading(false));
    }, []);

    const handleClose = () => {
        setOpen(false);
        sessionStorage.setItem('valentine_promo_dismissed', 'true');
    };

    if (loading || settings.valentine_popup_enabled === 'false') return null;

    const popupTitle = settings.valentine_popup_title || "10% OFF";
    const popupText = settings.valentine_popup_text || "เติมเต็มความหวานในเทศกาลแห่งความรัก\nรับส่วนลดพิเศษทันที เมื่อสั่งซื้อวันนี้ - 10 ก.พ. 69";
    const popupImage = settings.valentine_popup_image || "/images/about-valentine.webp";

    return (
        <Modal
            open={open}
            onClose={handleClose}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    timeout: 500,
                    sx: { backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }
                },
            }}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
        >
            <Fade in={open}>
                <Box sx={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 450,
                    bgcolor: '#FFF',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(183, 110, 121, 0.25)',
                    outline: 'none'
                }}>
                    {/* Close Button */}
                    <IconButton
                        onClick={handleClose}
                        sx={{ position: 'absolute', top: 12, right: 12, zIndex: 10, color: '#FFF', bgcolor: 'rgba(0,0,0,0.1)', '&:hover': { bgcolor: 'rgba(0,0,0,0.2)' } }}
                    >
                        <Add style={{ transform: 'rotate(45deg)' }} size={24} color="#FFF" />
                    </IconButton>

                    {/* Content Image */}
                    <Box sx={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
                        <Image
                            src={popupImage}
                            alt="Valentine Promotion"
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                        {/* Overlay Gradient */}
                        <Box sx={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(to top, rgba(183, 110, 121, 0.9), transparent 60%)'
                        }} />

                        <Box sx={{ position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center', px: 3, color: '#FFF' }}>
                            <Typography variant="overline" sx={{ letterSpacing: '0.3em', fontWeight: 700 }}>
                                VALENTINE'S SPECIAL
                            </Typography>
                            <Typography variant="h3" sx={{
                                fontFamily: 'var(--font-playfair), serif',
                                fontSize: '2.5rem',
                                fontWeight: 700,
                                mb: 1
                            }}>
                                {popupTitle}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Bottom Info */}
                    <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#FFF' }}>
                        <Typography sx={{ color: '#666', mb: 3, fontSize: '0.95rem', fontFamily: 'var(--font-prompt)', whiteSpace: 'pre-line' }}>
                            {popupText}
                        </Typography>

                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleClose}
                            sx={{
                                bgcolor: '#B76E79',
                                height: 56,
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: 600,
                                letterSpacing: '0.1em',
                                boxShadow: '0 8px 20px rgba(183, 110, 121, 0.3)',
                                '&:hover': { bgcolor: '#A35D67' }
                            }}
                        >
                            รับสิทธิ์ส่วนลดเลย
                        </Button>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    );
}
