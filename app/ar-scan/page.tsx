'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, IconButton, CircularProgress } from '@mui/material';
import { CloseCircle, InfoCircle, Magicpen } from 'iconsax-react';
import Link from 'next/link';
import Script from 'next/script';

export default function ARScanPage() {
    const [mindARLoaded, setMindARLoaded] = useState(false);
    const [arStatus, setArStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    const [arStarted, setArStarted] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const [loadTimeout, setLoadTimeout] = useState(false);
    const [videoReady, setVideoReady] = useState(false);
    const [isPageReady, setIsPageReady] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsPageReady(true), 1500); // Elegant pre-loader time
        return () => clearTimeout(timer);
    }, []);

    // Early video preloading
    useEffect(() => {
        const videoEl = document.getElementById('ar-video') as HTMLVideoElement;
        if (videoEl) {
            videoEl.load();
        }
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (arStarted && arStatus === 'loading') {
            timer = setTimeout(() => {
                setLoadTimeout(true);
            }, 20000); // 20 seconds timeout for slower devices
        }
        return () => clearTimeout(timer);
    }, [arStarted, arStatus]);

    useEffect(() => {
        if (mindARLoaded && arStarted) {
            const sceneEl = document.querySelector('a-scene');

            if (sceneEl) {
                const handleArReady = () => {
                    console.log("AR Ready");
                    setArStatus('ready');
                    setLoadTimeout(false);
                };
                const handleArError = (event: any) => {
                    console.error("AR Error", event);
                    setArStatus('error');
                };

                const handleTargetFound = () => {
                    console.log("Target Found");
                    setIsTracking(true);
                    const videoEl = document.getElementById('ar-video') as HTMLVideoElement;
                    if (videoEl && videoEl.isConnected) {
                        videoEl.play().catch(e => {
                            if (e.name !== 'AbortError') {
                                console.error("Video play failed on target found:", e);
                            }
                        });
                    }
                };

                const handleTargetLost = () => {
                    console.log("Target Lost");
                    setIsTracking(false);
                };

                sceneEl.addEventListener('arReady', handleArReady);
                sceneEl.addEventListener('arError', handleArError);
                sceneEl.addEventListener('targetFound', handleTargetFound);
                sceneEl.addEventListener('targetLost', handleTargetLost);

                return () => {
                    sceneEl.removeEventListener('arReady', handleArReady);
                    sceneEl.removeEventListener('arError', handleArError);
                    sceneEl.removeEventListener('targetFound', handleTargetFound);
                    sceneEl.removeEventListener('targetLost', handleTargetLost);

                    // Cleanup MindAR when leaving the page
                    // @ts-ignore
                    if (sceneEl.systems && sceneEl.systems['mindar-image-system']) {
                        // @ts-ignore
                        sceneEl.systems['mindar-image-system'].stop();
                    }

                    // Stop any active camera streams
                    const video = document.querySelector('video:not(#ar-video)') as HTMLVideoElement;
                    if (video && video.srcObject) {
                        const stream = video.srcObject as MediaStream;
                        stream.getTracks().forEach(track => track.stop());
                    }
                };
            }
        }
    }, [mindARLoaded, arStarted]);

    // Cleanup on tab hide/switch to prevent camera stuck
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                const sceneEl = document.querySelector('a-scene');
                // @ts-ignore
                if (sceneEl && sceneEl.systems && sceneEl.systems['mindar-image-system']) {
                    // @ts-ignore
                    sceneEl.systems['mindar-image-system'].stop();
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    const startAR = () => {
        setArStarted(true);
        // We need a user gesture to "unlock" video playback on mobile browsers
        // We'll look for the video element and prime it after a short delay to let it mount
        setTimeout(() => {
            const videoEl = document.getElementById('ar-video') as HTMLVideoElement;
            if (videoEl && videoEl.isConnected) {
                videoEl.play()
                    .then(() => {
                        console.log("Video primed successfully");
                        if (videoEl.isConnected) {
                            videoEl.pause();
                            videoEl.currentTime = 0;
                        }
                    })
                    .catch(e => {
                        if (e.name !== 'AbortError') {
                            console.error("Video priming failed:", e);
                        }
                    });
            }
        }, 500); // Increased delay slightly for better mounting stability
    };

    return (
        <Box sx={{ position: 'relative', width: '100%', height: { xs: '100dvh', md: '100vh' }, bgcolor: '#FDFBF7', overflow: 'hidden' }}>
            {/* Load AR Scripts */}
            <Script
                src="https://aframe.io/releases/1.5.0/aframe.min.js"
                strategy="beforeInteractive"
            />
            <Script
                src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js"
                strategy="afterInteractive"
                onLoad={() => setMindARLoaded(true)}
            />

            {/* Global CSS to fix black screen and positioning */}
            <style dangerouslySetInnerHTML={{
                __html: `
                html, body {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    height: 100%;
                    height: 100svh;
                    height: 100dvh;
                    overflow: hidden !important;
                    touch-action: none; /* Prevent pinch-zoom/scroll during AR */
                }
                /* Hide global Header, Footer and MobileNav for AR experience */
                header, footer, [class*="MuiBox-root"] > nav, .mobile-nav {
                    display: none !important;
                }
                /* Reset possible layout paddings */
                main {
                    padding-bottom: 0 !important;
                }
                .a-canvas {
                    position: absolute !important;
                    top: 0;
                    left: 0;
                    width: 100% !important;
                    height: 100% !important;
                    z-index: 1;
                }
                /* Target the MindAR camera video feed specifically and force cover */
                video:not(#ar-video) {
                    position: absolute !important;
                    top: 50% !important;
                    left: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    min-width: 100% !important;
                    min-height: 100% !important;
                    width: auto !important;
                    height: auto !important;
                    object-fit: cover !important;
                    z-index: 0;
                    /* Hide by default until AR starts */
                    display: ${arStarted ? 'block' : 'none'} !important;
                }
                .mindar-ui-overlay {
                    display: none !important;
                }
                /* Force hide A-Frame VR/AR buttons */
                .a-enter-vr, .a-enter-ar {
                    display: none !important;
                }
            `}} />

            {/* UI Overlay */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 10,
                p: 3,
                display: arStarted ? 'flex' : 'none',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)'
            }}>
                <Link href="/">
                    <IconButton sx={{ color: 'white' }}>
                        <CloseCircle size="32" variant="Outline" color="#FFF" />
                    </IconButton>
                </Link>
                <Typography sx={{ color: 'white', fontWeight: 600, letterSpacing: '0.1em' }}>
                    ระบบสแกน AR
                </Typography>

            </Box>

            {/* Scanner Frame - only show when started and not tracking */}
            {arStarted && !isTracking && (
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '280px',
                    height: '280px',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    borderRadius: '0px', // Sharp luxury corner
                    zIndex: 5,
                    boxShadow: '0 0 40px rgba(0,0,0,0.2)',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-15px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '60px',
                        height: '2px',
                        bgcolor: '#D4AF37',
                        borderRadius: '0px',
                        boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)'
                    }
                }} />
            )}

            {!arStarted && (
                <Box sx={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 2000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 4,
                    textAlign: 'center',
                    bgcolor: '#FDFBF7', // Pearl White from Hero
                }}>
                    <Box sx={{
                        mb: 6,
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        border: '1px solid #D4AF37', // Gold
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'transparent',
                        color: '#D4AF37',
                        transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        cursor: 'pointer',

                    }}>
                        <Magicpen size="32" variant="Outline" color="#D4AF37" />
                    </Box>

                    <Typography variant="h4" sx={{ color: '#5D4037', mb: 3, fontWeight: 600, letterSpacing: '0.05em', fontFamily: 'Prompt' }}>
                        THE VIRTUAL <br />
                        <span style={{ fontStyle: 'italic', fontWeight: 400, color: '#D4AF37' }}>EXPERIENCE</span>
                    </Typography>

                    <Typography sx={{ color: '#8D6E63', mb: 8, lineHeight: 1.8, maxWidth: '350px', fontSize: '1.1rem', fontWeight: 300 }}>
                        สัมผัสเรื่องราวที่ซ่อนอยู่หลังกลีบดอกไม้ <br />
                        ผ่านเทคโนโลยี AR ที่สะท้อนนิยามความหรูหรา
                    </Typography>

                    <Box
                        onClick={() => mindARLoaded && startAR()}
                        sx={{
                            px: 10,
                            py: 2.2,
                            bgcolor: mindARLoaded ? '#5D4037' : '#E5E5E5',
                            color: '#FFF',
                            cursor: mindARLoaded ? 'pointer' : 'wait',
                            fontWeight: 700,
                            letterSpacing: '0.2em',
                            fontSize: '0.85rem',
                            borderRadius: '0px',
                            transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                            border: '1px solid',
                            borderColor: mindARLoaded ? '#5D4037' : '#E5E5E5',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            '&:hover': mindARLoaded ? {
                                bgcolor: 'transparent',
                                color: '#5D4037',
                                transform: 'translateY(-5px)',
                                boxShadow: '0 20px 40px rgba(93, 64, 55, 0.15)'
                            } : {},
                        }}
                    >
                        {!mindARLoaded && <CircularProgress size={16} sx={{ color: '#FFF' }} />}
                        {mindARLoaded ? 'เปิดระบบสแกน' : 'กำลังเริ่มระบบ...'}
                    </Box>

                    <Typography sx={{ mt: 10, color: 'rgba(93, 64, 55, 0.4)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                        HanFlower — Digital Experience
                    </Typography>
                </Box>
            )}

            {/* Initial Page Pre-loader */}
            {!isPageReady && (
                <Box sx={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 3000,
                    bgcolor: '#FDFBF7',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'opacity 0.8s ease'
                }}>
                    <CircularProgress size={40} sx={{ color: '#D4AF37', mb: 3 }} />
                    <Typography sx={{
                        color: '#5D4037',
                        fontFamily: 'Prompt',
                        letterSpacing: '0.2em',
                        fontSize: '0.75rem',
                        fontWeight: 600
                    }}>
                        H A N F L O W E R
                    </Typography>
                </Box>
            )}

            {/* Loading Screen */}
            {(arStatus === 'loading' || !mindARLoaded) && arStarted && (
                <Box sx={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 2100,
                    bgcolor: '#FCF9F7',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    textAlign: 'center'
                }}>
                    {!loadTimeout ? (
                        <>
                            <CircularProgress sx={{ color: '#D4AF37', mb: 2 }} />
                            <Typography sx={{ color: '#5D4037', fontWeight: 500 }}>
                                {arStatus === 'error' ? 'ไม่สามารถเข้าถึงกล้องได้' : 'กำลังเปิดระบบกล้อง AR...'}
                            </Typography>
                            {typeof window !== 'undefined' && !window.isSecureContext && (
                                <Typography sx={{ color: '#ef4444', fontSize: '12px', mt: 2 }}>
                                    ⚠️ จำเป็นต้องใช้ HTTPS เพื่อใช้งานกล้อง
                                </Typography>
                            )}
                        </>
                    ) : (
                        <Box sx={{ maxWidth: '300px' }}>
                            <Typography sx={{ color: '#ef4444', fontWeight: 600, mb: 1 }}>
                                ดูเหมือนว่าจะใช้เวลานานผิดปกติ
                            </Typography>
                            <Typography sx={{ color: '#78716c', fontSize: '14px', mb: 3 }}>
                                ระบบอาจติดขัดจากการสลับหน้าเว็บ <br /> กรุณาลองรีเฟรชหน้าใหม่อีกครั้ง
                            </Typography>
                            <Box
                                onClick={() => window.location.reload()}
                                sx={{
                                    px: 4, py: 1.5, bgcolor: '#5D4037', color: 'white',
                                    borderRadius: '50px', fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                รีเฟรชหน้าสแกน
                            </Box>
                        </Box>
                    )}
                </Box>
            )}

            {/* AR Scene (A-Frame) */}
            {arStarted && mindARLoaded && (
                <Box
                    component="div"
                    sx={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 1
                    }}
                >
                    <a-scene
                        mindar-image="imageTargetSrc: /assets/targets.mind; autoStart: true; uiLoading: no; uiError: no; uiScanning: no; filterMinCF:0.0001; filterBeta: 0.001;"
                        embedded
                        color-space="sRGB"
                        renderer="colorManagement: true, physicallyCorrectLights: true, antialias: true, precision: mediump, logarithmicDepthBuffer: true"
                        vr-mode-ui="enabled: false"
                        device-orientation-permission-ui="enabled: false"
                    >
                        <a-assets>
                            <video
                                id="ar-video"
                                src="/images/song2.mp4"
                                loop
                                crossOrigin="anonymous"
                                playsInline
                                autoPlay
                                onCanPlayThrough={() => setVideoReady(true)}
                            ></video>
                        </a-assets>

                        <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

                        <a-entity mindar-image-target="targetIndex: 0">
                            <a-video
                                src="#ar-video"
                                width="1"
                                height="1.777"
                                position="0 -0.1 0.02"
                                rotation="0 0 0"
                            ></a-video>
                        </a-entity>
                    </a-scene>
                </Box>
            )}

            {/* Bottom Controls / Instructions */}
            {arStarted && (
                <Box sx={{
                    position: 'absolute',
                    bottom: '40px',
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    textAlign: 'center',
                    px: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                }}>
                    {!isTracking && (
                        <Typography sx={{ color: 'white', fontSize: '14px', opacity: 0.8, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                            ส่องกล้องไปที่รูปภาพบนการ์ดของคุณ <br /> เพื่อรับชมข้อความพิเศษ
                        </Typography>
                    )}

                    <Link href="/">
                        <Box sx={{
                            px: 4,
                            py: 1,
                            bgcolor: 'rgba(0,0,0,0.4)',
                            color: 'white',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.3)',
                            backdropFilter: 'blur(10px)',
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            transition: 'all 0.2s',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.1)',
                                borderColor: 'rgba(255,255,255,0.5)'
                            }
                        }}>
                            ออกจากหน้าสแกน
                        </Box>
                    </Link>
                </Box>
            )}
        </Box>
    );
}
