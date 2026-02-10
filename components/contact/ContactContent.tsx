'use client';

import {
    Box,
    Container,
    Typography,
    Paper,
    Stack,
    alpha,
    Button
} from '@mui/material';
import {
    Call,
    Instagram,
    Facebook,
    Timer,
    Location as LocationIcon,
    ArrowRight
} from 'iconsax-react';
import Image from 'next/image';

const CONTACT_INFO = [
    {
        icon: Call,
        title: 'Phone',
        value: '081-234-5678',
        description: 'คุยกับทีมงานได้โดยตรง',
        link: 'tel:0812345678',
        color: '#B76E79'
    },
    {
        image: '/images/line-icon.png',
        title: 'LINE Official',
        value: '@fonms2',
        description: 'สอบถามข้อมูลและสั่งซื้อ',
        link: 'https://line.me/ti/p/~fonms2',
        color: '#06C755'
    },
    {
        icon: Instagram,
        title: 'Instagram',
        value: '@hanflower.studio',
        description: 'ชมผลงานและอัปเดตใหม่ๆ',
        link: 'https://instagram.com/',
        color: '#E1306C'
    },
    {
        icon: Facebook,
        title: 'Facebook',
        value: 'Han Flower',
        description: 'ติดตามข่าวสารและรีวิว',
        link: 'https://facebook.com/',
        color: '#1877F2'
    }
];

const WORKING_HOURS = [
    { day: 'Monday - Friday', time: '09:00 - 20:00' },
    { day: 'Saturday - Sunday', time: '10:00 - 18:00' }
];

export default function ContactContent() {
    return (
        <Box sx={{ bgcolor: '#FFF', minHeight: '100vh' }}>
            {/* Hero Section - Matches Event Page Style */}
            <Box component="section" sx={{
                position: 'relative',
                pt: { xs: '120px', md: '160px' },
                pb: { xs: 6, md: 8 },
                background: 'linear-gradient(to bottom, #FFF9F8 0%, #FFFFFF 100%)',
                textAlign: 'center',
                overflow: 'hidden'
            }}>
                <Container maxWidth="md">
                    <Box sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1.5,
                        mb: 3,
                        px: 2,
                        py: 0.5,
                        borderRadius: '100px',
                        bgcolor: alpha('#B76E79', 0.1),
                    }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#B76E79' }} />
                        <Typography variant="overline" sx={{ color: '#B76E79', letterSpacing: '0.2em', fontWeight: 700 }}>
                            Get in Touch & Connect
                        </Typography>
                    </Box>

                    <Typography variant="h1" sx={{
                        fontSize: { xs: '2.5rem', md: '4rem' },
                        color: '#1A1A1A',
                        fontFamily: 'var(--font-playfair)',
                        fontWeight: 400,
                        lineHeight: 1.2,
                        mb: 3
                    }}>
                        Crafting Beauty <span style={{ fontStyle: 'italic', fontWeight: 500, color: '#B76E79' }}>For Every Precious</span> Moment
                    </Typography>

                    <Box sx={{ width: '40px', height: '1px', bgcolor: '#B76E79', mx: 'auto', mb: 3 }} />

                    <Typography variant="body1" sx={{
                        color: '#666',
                        fontSize: { xs: '1rem', md: '1.15rem' },
                        maxWidth: '650px',
                        mx: 'auto',
                        lineHeight: 1.8,
                        fontWeight: 300,
                        letterSpacing: '0.02em',
                        mb: 4
                    }}>
                        Han Flower พร้อมเนรมิตความสวยงามและความสง่างามให้กับทุกวันสำคัญของคุณ <br />
                        ติดต่อสอบถามข้อมูล ปรึกษางานแต่งงาน หรือสั่งจองช่อดอกไม้ดีไซน์พิเศษได้ทันที
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
                {/* Contact Channels Grid using Box */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(4, 1fr)'
                    },
                    gap: 3,
                    mb: 8
                }}>
                    {CONTACT_INFO.map((item, index) => (
                        <Paper
                            key={index}
                            elevation={0}
                            component="a"
                            href={item.link}
                            target="_blank"
                            sx={{
                                p: 4,
                                height: '100%',
                                borderRadius: '32px',
                                border: '1px solid rgba(0,0,0,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                textDecoration: 'none',
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',

                            }}
                        >
                            <Box
                                className="icon-box"
                                sx={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: '24px',
                                    bgcolor: alpha(item.color, 0.08),
                                    color: item.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 3,
                                    transition: 'all 0.4s ease',
                                    '& svg, & path, & img': {
                                        transition: 'all 0.4s ease'
                                    }
                                }}
                            >
                                {item.image ? (
                                    <Box sx={{ position: 'relative', width: 32, height: 32 }}>
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            style={{ objectFit: 'contain' }}
                                        />
                                    </Box>
                                ) : (
                                    (() => {
                                        const Icon = item.icon;
                                        return Icon ? <Icon size={32} color={item.color} /> : null;
                                    })()
                                )}
                            </Box>
                            <Typography variant="caption" sx={{ color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', mb: 1 }}>
                                {item.title}
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#1A1A1A', fontWeight: 700, mb: 1 }}>
                                {item.value}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666', mb: 3, fontSize: '0.85rem' }}>
                                {item.description}
                            </Typography>

                            <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 1, color: item.color }}>
                                <Typography variant="button" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Contact Now</Typography>
                                <ArrowRight size={16} color={item.color} className="arrow-icon" style={{ opacity: 0.5, transition: 'all 0.3s ease' }} />
                            </Box>
                        </Paper>
                    ))}
                </Box>

                {/* Info and Map Section using Box Flex/Grid */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 4
                }}>
                    {/* Working Hours Card */}
                    <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 100%' } }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 4, md: 5 },
                                height: '100%',
                                borderRadius: '40px',
                                bgcolor: '#FAFAFA',
                                border: '1px solid rgba(0,0,0,0.05)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Timer size={28} color="#B76E79" variant="Bulk" />
                                    Working Hours
                                </Typography>

                                <Stack spacing={3}>
                                    {WORKING_HOURS.map((item, index) => (
                                        <Box key={index}>
                                            <Typography variant="body2" sx={{ color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5 }}>
                                                {item.day}
                                            </Typography>
                                            <Typography variant="h6" sx={{ color: '#1A1A1A', fontWeight: 700 }}>
                                                {item.time}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>

                                <Box sx={{ mt: 6, p: 3, borderRadius: '24px', bgcolor: alpha('#B76E79', 0.05), border: '1px dashed', borderColor: alpha('#B76E79', 0.2) }}>
                                    <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic', textAlign: 'center' }}>
                                        * You can message us via LINE 24/7 <br />
                                        Our team will reply as soon as possible during working hours.
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{
                                position: 'absolute',
                                bottom: -50,
                                right: -50,
                                width: 200,
                                height: 200,
                                borderRadius: '50%',
                                bgcolor: alpha('#B76E79', 0.03),
                                zIndex: 0
                            }} />
                        </Paper>
                    </Box>

                </Box>

            </Container>
        </Box>
    );
}
