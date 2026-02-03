'use client';

import { Box, Container, Typography, Stack, Divider } from '@mui/material';
import Image from 'next/image';
import { Heart, MagicStar, MessageText } from 'iconsax-react';

export default function AboutContent() {
    return (
        <Box sx={{ pb: 10, bgcolor: '#FFF9F8', minHeight: '100vh' }}>
            {/* Hero Section - Magazine Style Split */}
            <Box sx={{
                pt: { xs: 15, md: 20 },
                pb: { xs: 8, md: 10 },
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative Background Elements */}
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '60%',
                    height: '100%',
                    bgcolor: '#FFF0F5', // Very light pink
                    zIndex: 0,
                    borderBottomLeftRadius: '200px',
                    display: { xs: 'none', md: 'block' }
                }} />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 8 }}>
                        {/* Text Content */}
                        <Box sx={{ width: { xs: '100%', md: '50%' }, textAlign: { xs: 'center', md: 'left' } }}>
                            <Box sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 2,
                                mb: 3,
                                px: { xs: 2, md: 0 },
                                py: 0.5,
                                border: '1px solid #B76E79',
                                borderRadius: '100px',
                                color: '#B76E79'
                            }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#B76E79', ml: 1.5 }} />
                                <Typography variant="caption" fontWeight={700} letterSpacing="0.2em" sx={{ pr: 2 }}>
                                    THE STORY OF
                                </Typography>
                            </Box>

                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '3.5rem', md: '5rem' },
                                    fontWeight: 700,
                                    color: '#2C1A1D',
                                    lineHeight: 1,
                                    mb: 2
                                }}
                            >
                                Han <br /> Flower
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                                <Box sx={{ width: 80, height: 1, bgcolor: '#B76E79' }} />
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontFamily: 'var(--font-prompt)',
                                        fontStyle: 'italic',
                                        color: '#B76E79',
                                        fontWeight: 400
                                    }}
                                >
                                    "ความละมุนของดอกไม้ VS เทคโนโลยี"
                                </Typography>
                            </Box>

                            <Typography variant="body1" sx={{ color: '#666', maxWidth: 480, lineHeight: 1.8, mx: { xs: 'auto', md: 0 } }}>
                                ยินดีต้อนรับสู่โลกที่ธรรมชาติและนวัตกรรมมาบรรจบกัน... เราคือร้านดอกไม้ที่คุณจะได้สัมผัสประสบการณ์การส่งมอบความรู้สึกรูปแบบใหม่
                            </Typography>
                        </Box>

                        {/* Hero Image */}
                        <Box sx={{ width: { xs: '100%', md: '50%' }, position: 'relative' }}>
                            <Box sx={{
                                position: 'relative',
                                width: '100%',
                                aspectRatio: '4/5',
                                borderRadius: '200px 200px 20px 20px', // Arch shape
                                overflow: 'hidden',
                                boxShadow: '0 20px 40px rgba(183, 110, 121, 0.2)'
                            }}>
                                <Image
                                    src="/images/about.webp" // Using a nice cover image (e.g about)
                                    alt="Han Flower Workshop"
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    priority
                                />
                            </Box>
                            {/* Floating decorative card */}
                            <Box sx={{
                                position: 'absolute',
                                bottom: 40,
                                left: -40,
                                bgcolor: '#fff',
                                p: 3,
                                borderRadius: '12px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                display: { xs: 'none', md: 'block' },
                                maxWidth: 200
                            }}>
                                <Typography variant="overline" color="#B76E79" fontWeight={700}>SINCE 2022</Typography>
                                <Typography variant="body2" color="#444" lineHeight={1.6}>
                                    จุดเริ่มต้นเล็กๆ สู่ความตั้งใจที่ยิ่งใหญ่
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: -6, position: 'relative', zIndex: 2, pb: 10 }}>
                {/* Our Origins - Clean Layout */}
                <Box sx={{ mb: 12 }}>
                    <Box sx={{ maxWidth: '800px', mx: 'auto', textAlign: 'center' }}>
                        <Typography variant="overline" color="#B76E79" fontWeight={700} letterSpacing="0.2em" sx={{ display: 'block', mb: 2 }}>
                            OUR ORIGINS
                        </Typography>
                        <Typography variant="h2" sx={{ mb: 3, fontSize: { xs: '2rem', md: '3rem' }, color: '#2C1A1D', fontWeight: 600 }}>
                            จุดเริ่มต้นจากความรัก
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.8, mb: 3, fontSize: '1.1rem' }}>
                            "เกิดจากความรักในดอกไม้ ความชอบส่วนตัวในการจัดดอกไมอย่างจริงจัง"
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.8, mb: 2 }}>
                            เส้นทางของเราเริ่มขึ้นในปี 2022 จากจุดเล็กๆ ที่ศูนย์ฝึกอาชีพ กทม. เราใช้เวลา 3-4 เดือนทุ่มเทเรียนรู้และฝึกฝนพื้นฐาน... เรากลับมาฝึกฝนต่อด้วยตัวเองอย่างไม่หยุดยั้ง ลองผิดลองถูก สังเกต และเรียนรู้จากทุกงานที่ได้รับมอบหมาย
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.8 }}>
                            จากการช่วยเพื่อนจัดดอกไม้ สู่งานรับจ้างเล็กๆ จนเกิดเป็นความมั่นใจในฝีมือ เราจึงตัดสินใจก่อตั้ง <b>Han Flower</b> ขึ้นมา ด้วยปณิธานแน่วแน่ว่าจะมอบสิ่งที่ดีที่สุดให้กับลูกค้า
                        </Typography>
                    </Box>
                </Box>

                {/* Mission Section - Minimal & Centered */}
                <Box sx={{
                    textAlign: 'center',
                    maxWidth: '800px',
                    mx: 'auto',
                    mb: 12,
                    py: 8,
                    px: 4,
                    bgcolor: '#fff',
                    borderRadius: '24px',
                    boxShadow: '0 10px 40px rgba(183, 110, 121, 0.05)'
                }}>
                    <Heart size="48" color="#B76E79" variant="Bold" style={{ margin: '0 auto', marginBottom: '24px' }} />
                    <Typography variant="h3" sx={{ mb: 3, color: '#2C1A1D', fontWeight: 600 }}>
                        ส่งมอบความสุข
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#555', lineHeight: 1.6, fontWeight: 400, fontStyle: 'italic' }}>
                        "เราอยากเป็นตัวกลางส่งมอบความสุข ระหว่างผู้ให้และผู้รับ"
                    </Typography>
                    <Divider sx={{ width: '60px', mx: 'auto', my: 4, borderColor: '#B76E79' }} />
                    <Typography variant="body1" sx={{ color: '#666' }}>
                        ผู้รับต้องยิ้มได้เมื่อรับช่อดอกไม้จากเรา นั่นคือความสำเร็จของเรา
                    </Typography>
                </Box>

                {/* Features Grid - Modern Cards */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 12, justifyContent: 'center' }}>
                    {[
                        { icon: MagicStar, title: 'Craftsmanship', desc: 'ใส่ใจในทุกรายละเอียด คัดสรรดอกไม้ที่สดใหม่และสวยงามที่สุด' },
                        { icon: Heart, title: 'Passion', desc: 'ทำด้วยใจรัก เพื่อให้ทุกช่อดอกไม้มีความหมายลึกซึ้ง' },
                        { icon: MessageText, title: 'Storytelling', desc: 'บอกเล่าเรื่องราวความรู้สึกของคุณ ผ่านภาษาดอกไม้' }
                    ].map((feature, index) => (
                        <Box key={index} sx={{ flex: 1, minWidth: '300px' }}>
                            <Box sx={{
                                textAlign: 'center',
                                p: 5,
                                bgcolor: '#fff',
                                borderRadius: '24px',
                                height: '100%',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                border: '1px solid rgba(183,110,121,0.1)',
                                '&:hover': {
                                    transform: 'translateY(-10px)',
                                    boxShadow: '0 20px 40px rgba(183,110,121,0.1)'
                                }
                            }}>
                                <Stack alignItems="center" spacing={3}>
                                    <Box sx={{
                                        width: 70,
                                        height: 70,
                                        bgcolor: '#B76E79', // Changed bg to brand color
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#FFFFFF' // Changed icon color to white
                                    }}>
                                        <feature.icon size="32" variant="Bold" color="#FFFFFF" />
                                    </Box>
                                    <Typography variant="h5" color="#2C1A1D" fontWeight={600}>{feature.title}</Typography>
                                    <Typography variant="body1" color="#666" lineHeight={1.6}>
                                        {feature.desc}
                                    </Typography>
                                </Stack>
                            </Box>
                        </Box>
                    ))}
                </Box>

                {/* USP / Tech Section */}
                <Box sx={{
                    background: 'linear-gradient(135deg, #FFF0F3 0%, #FFFFFF 100%)', // Soft Pink Gradient
                    color: '#4A2C2A',
                    p: { xs: 4, md: 8 },
                    borderRadius: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(183, 110, 121, 0.15)',
                    boxShadow: '0 20px 80px rgba(183, 110, 121, 0.08)'
                }}>
                    {/* Background Decoration */}
                    <Box sx={{
                        position: 'absolute',
                        top: -100,
                        right: -100,
                        width: '500px',
                        height: '500px',
                        background: 'radial-gradient(circle, rgba(183,110,121,0.1) 0%, transparent 70%)',
                        filter: 'blur(80px)',
                        zIndex: 0
                    }} />
                    <Box sx={{
                        position: 'absolute',
                        bottom: -50,
                        left: -50,
                        width: '300px',
                        height: '300px',
                        background: 'radial-gradient(circle, rgba(183,110,121,0.05) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                        zIndex: 0
                    }} />

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, position: 'relative', zIndex: 1 }}>
                        <Box sx={{ flex: 1, minWidth: { xs: '100%', md: '300px' } }}>
                            <Typography variant="overline" sx={{ color: '#B76E79', fontWeight: 700, letterSpacing: '0.2em' }}>
                                THE INNOVATION
                            </Typography>
                            <Typography variant="h3" sx={{ mb: 3, mt: 1, color: '#3E2723', fontWeight: 600 }}>
                                Feeling Card <span style={{ color: '#B76E79', fontStyle: 'italic' }}>QR Code</span>
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#5D4037', lineHeight: 1.8, mb: 3, fontSize: '1.1rem', fontWeight: 500 }}>
                                "จุดเด่นของเราที่ไม่เหมือนใคร คือ เราได้นำเทคโนโลยี QR CODE มาถ่ายทอดความรู้สึก"
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#795548', lineHeight: 1.8, mb: 4 }}>
                                จะบอกรัก, ขอโทษ, ขอบคุณ หรือฉลองวันครบรอบ... ลูกค้าเพียงส่งภาพ หรือถ่ายคลิป VDO มาให้เรา เพียงเท่านี้! สแกนปุ๊บ ความรู้สึกก็ส่งถึงใจปั๊บ
                            </Typography>
                            <Box sx={{
                                p: 3,
                                bgcolor: '#fff',
                                borderRadius: '16px',
                                borderLeft: '4px solid #B76E79',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                            }}>
                                <Typography variant="body1" fontStyle="italic" color="#B76E79" fontWeight={500}>
                                    "คุณจะได้ภาพความทรงจำที่ไม่รู้ลืม..."
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ width: { xs: '100%', md: '45%' } }}>
                            <Box sx={{
                                position: 'relative',
                                height: '400px',
                                transform: 'rotate(2deg)',
                                // Removed border and shadow for a cleaner floating look
                            }}>
                                <Image
                                    src="/images/qr_code_mockup.webp"
                                    alt="QR Code Feature"
                                    fill
                                    style={{ objectFit: 'contain' }} // Changed to contain to show full QR
                                />
                            </Box>
                        </Box>
                    </Box>
                </Box>


            </Container >
        </Box >
    );
}
