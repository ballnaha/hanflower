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

const TiktokIcon = ({ size = 32, color = 'currentColor' }: { size?: number | string, color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.5809 6.69083C18.2909 6.61083 17.1409 6.05083 16.2809 5.14083C16.1109 4.96083 15.9609 4.76083 15.8209 4.56083C15.8109 4.55083 15.8109 4.55083 15.8009 4.54083C15.4209 3.96083 15.1709 3.30083 15.1209 2.60083C15.1209 2.53083 15.1209 2.46083 15.1209 2.39083H12.6309V15.3108C12.6309 16.0108 12.3509 16.6508 11.8909 17.1308C11.4409 17.6008 10.8209 17.8908 10.1309 17.8908C8.80093 17.8908 7.72093 16.8108 7.72093 15.4808C7.72093 14.1508 8.80093 13.0708 10.1309 13.0708C10.3609 13.0708 10.5909 13.1008 10.8109 13.1608V10.6408C10.5909 10.6108 10.3609 10.5908 10.1309 10.5908C7.43093 10.5908 5.23093 12.7808 5.23093 15.4808C5.23093 18.1808 7.43093 20.3808 10.1309 20.3808C12.8309 20.3808 15.0309 18.1808 15.0309 15.4808V7.55083C16.2009 8.40083 17.6309 8.90083 19.1809 8.90083C19.3309 8.90083 19.4709 8.89083 19.6109 8.88083V6.69083H19.5809Z" fill={color} />
    </svg>
);

const CONTACT_INFO = [
    {
        icon: Call,
        title: 'Phone',
        value: '093-726-5055',
        description: 'คุยกับทีมงานได้โดยตรง',
        link: 'tel:0937265055',
        color: '#B76E79'
    },
    {
        image: '/images/line-icon.png',
        title: 'LINE Official',
        value: 'fonms2',
        description: 'สอบถามข้อมูลและสั่งซื้อ',
        link: 'https://line.me/ti/p/~fonms2',
        color: '#06C755'
    },
    {
        icon: Instagram,
        title: 'Instagram',
        value: 'han.flower22',
        description: 'ชมผลงานและอัปเดตใหม่ๆ',
        link: 'https://instagram.com/han.flower22',
        color: '#E1306C'
    },
    {
        icon: TiktokIcon,
        title: 'Tiktok',
        value: 'hanflower.fon',
        description: 'ติดตามข่าวสารและรีวิว',
        link: 'https://tiktok.com/@hanflower.fon',
        color: '#000000'
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
                        xs: 'repeat(2, 1fr)',
                        md: 'repeat(4, 1fr)'
                    },
                    gap: { xs: 2, md: 3 },
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
                                p: { xs: 2.5, md: 4 },
                                height: '100%',
                                borderRadius: { xs: '24px', md: '32px' },
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
                                    width: { xs: 56, md: 72 },
                                    height: { xs: 56, md: 72 },
                                    borderRadius: { xs: '16px', md: '24px' },
                                    bgcolor: alpha(item.color, 0.08),
                                    color: item.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: { xs: 2, md: 3 },
                                    transition: 'all 0.4s ease',
                                    '& svg, & path, & img': {
                                        transition: 'all 0.4s ease'
                                    }
                                }}
                            >
                                {item.image ? (
                                    <Box sx={{ position: 'relative', width: { xs: 24, md: 32 }, height: { xs: 24, md: 32 } }}>
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
                                        return Icon ? <Icon size={24} color={item.color} /> : null;
                                    })()
                                )}
                            </Box>
                            <Typography variant="caption" sx={{ color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5, fontSize: { xs: '0.65rem', md: '0.75rem' } }}>
                                {item.title}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ color: '#1A1A1A', fontWeight: 700, mb: 0.5, fontSize: { xs: '0.85rem', md: '1.1rem' } }}>
                                {item.value}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666', mb: { xs: 2, md: 3 }, fontSize: { xs: '0.7rem', md: '0.85rem' }, display: { xs: 'none', md: 'block' } }}>
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
