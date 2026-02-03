"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCreative, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-creative";
import "swiper/css/pagination";
import { Heart, Music, Play, Star } from "iconsax-react";
import { Button, Typography, Box, Paper, CircularProgress } from "@mui/material";
import JigsawPuzzle from "./JigsawPuzzle";
import HeartCatcher from "./HeartCatcher";

// ==========================================
// 💖 DEFAULT CONFIGURATION (FALLBACK)
// ==========================================
const DEFAULT_CONTENT = {
    title: "For My Love",
    openingText: "Tap to open your surprise",
    greeting: "Happy Valentine's Day",
    subtitle: "Take My Heart",
    message: `Every moment with you is a treasure.
  I Love You Forever ❤️`,
    signer: "Love, Make",
    backgroundColor: "#FFF0F3",
    backgroundMusicYoutubeId: "",
    backgroundMusicUrl: "",
    swipeHintColor: "white" as "white" | "red",
    swipeHintText: "Swipe to see more",
    isGameEnabled: true,
    campaignName: "Valentine's",
};

interface ValentineContent {
    title: string;
    openingText: string;
    greeting: string;
    subtitle: string;
    message: string;
    signer: string;
    backgroundColor: string;
    backgroundMusicYoutubeId: string;
    backgroundMusicUrl: string;
    swipeHintColor: "white" | "red";
    swipeHintText: string;
    isGameEnabled: boolean;
    campaignName: string;
}

export default function ValentineSlugPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [content, setContent] = useState<ValentineContent | null>(null);
    const [memories, setMemories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpired, setIsExpired] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [burstHearts, setBurstHearts] = useState<{ id: number; left: number; size: number; duration: number; delay: number }[]>([]);
    const [activeVideo, setActiveVideo] = useState<{ type: string; url: string; caption: string } | null>(null);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
    const [hasSwiped, setHasSwiped] = useState(false);
    const [seenSlides, setSeenSlides] = useState<Set<number>>(new Set([0]));
    const [revealedSlides, setRevealedSlides] = useState<Set<number>>(new Set([0]));
    const [showMessage, setShowMessage] = useState(false);
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [isPuzzleComplete, setIsPuzzleComplete] = useState(false);
    const [showFinalReveal, setShowFinalReveal] = useState(false);
    const [showHeartGame, setShowHeartGame] = useState(false);
    const [heartGameScore, setHeartGameScore] = useState(0);
    const [heartBurstSource, setHeartBurstSource] = useState<'interaction' | 'completion'>('interaction');
    const [introHearts, setIntroHearts] = useState<{ id: number; left: string; size: number; duration: number; delay: number }[]>([]);

    useEffect(() => {
        if (!isOpen) {
            const hearts = Array.from({ length: 15 }).map((_, i) => ({
                id: i,
                left: `${Math.random() * 100}%`,
                size: 15 + Math.random() * 25,
                duration: 4 + Math.random() * 6,
                delay: Math.random() * 5
            }));
            setIntroHearts(hearts);
        }
    }, [isOpen]);

    // Swiper Config
    const swiperCreativeConfig = useMemo(() => ({
        prev: {
            translate: ['-120%', 0, -300],
            rotate: [0, 0, -5],
            scale: 0.8,
            opacity: 0,
        },
        next: {
            translate: ['25px', '10px', -100],
            rotate: [0, 0, 5],
            scale: 0.94,
            opacity: 0.6,
        },
        perspective: true,
        limitProgress: 4,
        progressMultiplier: 1.2,
        shadowPerProgress: false,
    }), []);

    // Background Music State
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const [isMusicMuted, setIsMusicMuted] = useState(false);
    const musicPlayerRef = React.useRef<HTMLIFrameElement>(null);
    const musicAudioRef = React.useRef<HTMLAudioElement>(null);

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMusicStarted, setIsMusicStarted] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);

    // Refs
    const lastBurstTimeRef = useRef<number>(0);
    const BURST_THROTTLE_MS = 600;
    const MAX_HEARTS = 10;
    const swiperRef = useRef<any>(null);
    const lastSwipeTimeRef = useRef<number>(0);
    const SWIPE_COOLDOWN_MS = 400;

    const triggerHeartBurst = useCallback((source: 'interaction' | 'completion' = 'interaction') => {
        const now = Date.now();
        if (now - lastBurstTimeRef.current < BURST_THROTTLE_MS && source === 'interaction') return;
        lastBurstTimeRef.current = now;

        setHeartBurstSource(source);

        const count = source === 'completion' ? 12 : 8;
        const newHearts = Array.from({ length: count }).map((_, i) => ({
            id: now + i,
            left: Math.random() * 100,
            size: source === 'completion' ? Math.random() * 30 + 30 : Math.random() * 20 + 20,
            duration: Math.random() * 2 + 3,
            delay: Math.random() * 0.5,
        }));

        setBurstHearts(newHearts);
        setTimeout(() => {
            setBurstHearts([]);
        }, 5000);
    }, []);

    useEffect(() => {
        if (typeof document !== 'undefined') {
            const metaTags = [
                { name: 'apple-mobile-web-app-capable', content: 'yes' },
                { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
                { name: 'mobile-web-app-capable', content: 'yes' },
                { name: 'theme-color', content: content?.backgroundColor || '#FFF0F3' }
            ];

            metaTags.forEach(tag => {
                let element = document.querySelector(`meta[name="${tag.name}"]`);
                if (!element) {
                    element = document.createElement('meta');
                    element.setAttribute('name', tag.name);
                    document.head.appendChild(element);
                }
                element.setAttribute('content', tag.content);
            });
        }
    }, [content?.backgroundColor]);

    useEffect(() => {
        const fetchData = async () => {
            if (!slug) return;
            try {
                const response = await fetch(`/api/valentine/${slug}`);
                if (response.ok) {
                    const data = await response.json();
                    setContent({
                        title: data.title || DEFAULT_CONTENT.title,
                        openingText: data.openingText || DEFAULT_CONTENT.openingText,
                        greeting: data.greeting || DEFAULT_CONTENT.greeting,
                        subtitle: data.subtitle || DEFAULT_CONTENT.subtitle,
                        message: data.message || DEFAULT_CONTENT.message,
                        signer: data.signer || DEFAULT_CONTENT.signer,
                        backgroundColor: data.backgroundColor || DEFAULT_CONTENT.backgroundColor,
                        backgroundMusicYoutubeId: data.backgroundMusicYoutubeId || "",
                        backgroundMusicUrl: data.backgroundMusicUrl || "",
                        swipeHintColor: data.swipeHintColor || DEFAULT_CONTENT.swipeHintColor,
                        swipeHintText: data.swipeHintText || DEFAULT_CONTENT.swipeHintText,
                        isGameEnabled: data.showGame !== undefined ? data.showGame : true,
                        campaignName: data.campaignName || "Valentine's",
                    });

                    if (data.showGame === false) {
                        setIsPuzzleComplete(true);
                        setShowFinalReveal(true);
                    }

                    if (data.memories && data.memories.length > 0) {
                        setMemories(data.memories);
                    }
                } else if (response.status === 404) {
                    setIsExpired(true);
                }
            } catch (error) {
                console.error("Failed to fetch valentine data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    useEffect(() => {
        const loadFonts = async () => {
            try {
                if (typeof document !== 'undefined' && document.fonts) {
                    await document.fonts.ready;
                }
                setFontsLoaded(true);
            } catch (error) {
                console.warn('Font loading check failed:', error);
                setFontsLoaded(true);
            }
        };

        loadFonts();
        const fallbackTimer = setTimeout(() => {
            setFontsLoaded(true);
        }, 1000);
        return () => clearTimeout(fallbackTimer);
    }, []);

    const borderHearts = React.useMemo(() => {
        const colors = ["#FF3366", "#FF99AA", "#FF5577", "#D41442"];
        const heartsArr = [];
        for (let i = 0; i < 4; i++) heartsArr.push({ id: `t-${i}`, top: 2, left: 10 + i * 25, size: 22 + Math.random() * 8, rotation: Math.random() * 20 - 10, color: colors[i % 4] });
        for (let i = 0; i < 4; i++) heartsArr.push({ id: `b-${i}`, top: 92, left: 10 + i * 25, size: 22 + Math.random() * 8, rotation: Math.random() * 20 - 10, color: colors[i % 4] });
        for (let i = 0; i < 4; i++) heartsArr.push({ id: `l-${i}`, top: 10 + i * 22, left: 2, size: 18 + Math.random() * 8, rotation: Math.random() * 20 - 10, color: colors[i % 4] });
        for (let i = 0; i < 4; i++) heartsArr.push({ id: `r-${i}`, top: 10 + i * 22, left: 90, size: 18 + Math.random() * 8, rotation: Math.random() * 20 - 10, color: colors[i % 4] });
        return heartsArr;
    }, []);

    const preloadImagesRef = useRef<HTMLImageElement[]>([]);

    const handleImageLoaded = useCallback((index: number) => {
        setLoadedImages(prev => {
            if (prev.has(index)) return prev;
            const updated = new Set(prev);
            updated.add(index);
            return updated;
        });
    }, []);

    useEffect(() => {
        preloadImagesRef.current.forEach(img => {
            img.onload = null;
            img.onerror = null;
        });
        preloadImagesRef.current = [];

        const nonImageIndexes: number[] = [];

        memories.forEach((memory, index) => {
            if (memory.type === 'image') {
                const img = new Image();
                img.onload = () => handleImageLoaded(index);
                img.onerror = () => handleImageLoaded(index);
                img.src = memory.url;
                preloadImagesRef.current.push(img);
            } else if (memory.type === 'youtube') {
                const img = new Image();
                img.onload = () => handleImageLoaded(index);
                img.onerror = () => handleImageLoaded(index);
                img.src = `https://img.youtube.com/vi/${memory.url}/hqdefault.jpg`;
                preloadImagesRef.current.push(img);
            } else {
                nonImageIndexes.push(index);
            }
        });

        if (nonImageIndexes.length > 0) {
            setLoadedImages(prev => {
                const updated = new Set(prev);
                let changed = false;
                nonImageIndexes.forEach(idx => {
                    if (!updated.has(idx)) {
                        updated.add(idx);
                        changed = true;
                    }
                });
                return changed ? updated : prev;
            });
        }

        return () => {
            preloadImagesRef.current.forEach(img => {
                img.onload = null;
                img.onerror = null;
            });
        };
    }, [memories, handleImageLoaded]);

    const displayContent = content || DEFAULT_CONTENT;

    const handleOpen = () => {
        if (displayContent.backgroundMusicUrl || displayContent.backgroundMusicYoutubeId) {
            setIsMusicStarted(true);
            setIsMusicPlaying(true);
            setIsMusicMuted(false);

            if (musicAudioRef.current) {
                musicAudioRef.current.muted = false;
                musicAudioRef.current.play().catch(e => console.log("Direct play blocked:", e));
            }
        }

        setIsTransitioning(true);
        setCountdown(3);

        if (typeof document !== 'undefined') {
            const elem = document.documentElement as any;
            const requestMethod = elem.requestFullscreen ||
                elem.webkitRequestFullscreen ||
                elem.mozRequestFullScreen ||
                elem.msRequestFullscreen;

            if (requestMethod && !document.fullscreenElement) {
                requestMethod.call(elem).catch((err: any) => {
                    console.log(`Fullscreen request failed or was blocked: ${err.message}`);
                });
                setIsFullscreen(true);
            }
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev === null) return null;
                if (prev <= 1) {
                    clearInterval(timer);
                    setTimeout(() => {
                        setIsOpen(true);
                        setCountdown(null);
                        setTimeout(() => {
                            setIsTransitioning(false);
                        }, 300);
                    }, 800);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const toggleMusic = () => {
        const newMuted = !isMusicMuted;
        setIsMusicMuted(newMuted);
        if (musicAudioRef.current) {
            musicAudioRef.current.muted = newMuted;
        }
    };

    useEffect(() => {
        if (isOpen && isMusicPlaying) {
            if (musicAudioRef.current) {
                musicAudioRef.current.play().catch(e => console.log("Autoplay blocked:", e));
            }
        }
    }, [isOpen, isMusicPlaying]);

    useEffect(() => {
        if (musicAudioRef.current) {
            musicAudioRef.current.muted = isMusicMuted;
        }
    }, [isMusicMuted]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                if (musicAudioRef.current) {
                    musicAudioRef.current.pause();
                }
            } else if (document.visibilityState === 'visible') {
                if (isOpen && isMusicPlaying && !isMusicMuted) {
                    if (musicAudioRef.current) {
                        musicAudioRef.current.play().catch(e => console.log("Resume play blocked:", e));
                    }
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isOpen, isMusicPlaying, isMusicMuted]);

    const handleOpenVideoModal = (memory: any) => {
        setActiveVideo(memory);
    };

    const handleCloseVideoModal = () => {
        setActiveVideo(null);
    };

    useEffect(() => {
        if (isOpen && !isTransitioning) {
            const timeout = setTimeout(() => {
                setShowMessage(true);
            }, 800);
            return () => clearTimeout(timeout);
        }
    }, [isOpen, isTransitioning]);

    const handleSlideChange = useCallback((swiper: any) => {
        const activeIndex = swiper.activeIndex;
        const previousIndex = swiper.previousIndex;
        const now = Date.now();
        if (now - lastSwipeTimeRef.current < SWIPE_COOLDOWN_MS) {
            swiper.slideTo(previousIndex, 0);
            return;
        }
        lastSwipeTimeRef.current = now;

        swiper.allowTouchMove = false;
        setTimeout(() => {
            if (swiper && !swiper.destroyed) {
                swiper.allowTouchMove = true;
            }
        }, SWIPE_COOLDOWN_MS);

        setCurrentSlideIndex(activeIndex);

        setSeenSlides(prev => {
            if (prev.has(previousIndex)) return prev;
            const next = new Set(prev);
            next.add(previousIndex);
            return next;
        });

        setRevealedSlides(prev => {
            if (prev.has(activeIndex)) return prev;
            const next = new Set(prev);
            next.add(activeIndex);
            return next;
        });

        if (activeIndex > 0) {
            setHasSwiped(true);
        }

        if (now - lastBurstTimeRef.current < BURST_THROTTLE_MS) {
            return;
        }
        lastBurstTimeRef.current = now;

        setBurstHearts((prev) => {
            if (prev.length >= MAX_HEARTS) return prev;
            const count = Math.min(4, MAX_HEARTS - prev.length);
            if (count <= 0) return prev;

            const newHearts = Array.from({ length: count }).map((_, i) => ({
                id: now + i,
                left: 25 + Math.random() * 50,
                size: 14 + Math.random() * 14,
                duration: 1 + Math.random() * 0.8,
                delay: Math.random() * 0.2,
            }));

            setTimeout(() => {
                setBurstHearts((current) =>
                    current.filter(h => !newHearts.find(nh => nh.id === h.id))
                );
            }, 2000);

            return [...prev, ...newHearts];
        });
    }, [hasSwiped]);

    if (isLoading || !fontsLoaded) {
        return (
            <Box
                sx={{
                    height: "100dvh",
                    width: "100vw",
                    background: "#FFF0F3",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Heart size="80" variant="Bulk" color="#FF3366" className="animate-bounce" />
                    <CircularProgress size={100} thickness={2} sx={{ position: 'absolute', top: -10, color: '#FF3366', opacity: 0.3 }} />
                    <Typography sx={{ mt: 4, color: '#4A151B', fontWeight: 700, fontFamily: "var(--font-dancing), cursive", letterSpacing: '0.05em', fontSize: '1.8rem' }}>
                        Preparing your surprise
                    </Typography>
                    <Typography sx={{ mt: 1, color: '#D41442', fontWeight: 500, fontFamily: "var(--font-mali), cursive", fontSize: '0.9rem', opacity: 0.8 }}>
                        Just a heartbeat away...
                    </Typography>
                </Box>
            </Box>
        );
    }

    if (isExpired) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden p-6 text-center z-[10000]" style={{ backgroundColor: '#FFF0F3' }}>
                <div className="relative z-10 max-w-md w-full animate-fade-in">
                    <div className="mb-8 relative inline-block">
                        <Heart size="100" variant="Bulk" color="#FF3366" className="text-[#FF3366] opacity-20 transform scale-110" />
                        <Heart size="80" variant="Bulk" color="#FF3366" className="text-[#FF3366] absolute inset-0 m-auto drop-shadow-lg" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4 text-[#FF3366]" style={{ fontFamily: 'var(--font-charm)' }}>Love Remains Forever</h1>
                    <Typography className="text-lg leading-relaxed text-[#D41442]" style={{ fontFamily: 'var(--font-mali)', fontWeight: 600 }}>
                        "ความหวานของกล่องจดหมายนี้<br />ได้ถูกบันทึกไว้เป็นความทรงจำที่แสนพิเศษเรียบร้อยแล้ว..."
                    </Typography>
                    <div className="mt-12">
                        <Button onClick={() => window.location.href = "/"} variant="outlined" sx={{ color: '#FF3366', borderColor: '#FF3366', borderRadius: '50px', px: 4, py: 1.5, fontFamily: 'var(--font-mali)', fontWeight: 700 }}>
                            กลับสู่หน้าหลัก
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Box sx={{ height: "100dvh", width: "100vw", background: displayContent.backgroundColor || "#FFF0F3", display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden", position: "relative", fontFamily: "'Comfortaa', sans-serif" }}>
            <style jsx global>{`
                @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                @keyframes float-lid { 0%, 100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-15px) rotate(1deg); } }
                @keyframes float-box { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                @keyframes sparkle-float { 
                    0% { transform: translate(0, 0) scale(0); opacity: 0; }
                    50% { opacity: 1; transform: translate(var(--tx), var(--ty)) scale(1); }
                    100% { transform: translate(calc(var(--tx) * 1.5), calc(var(--ty) * 1.5)) scale(0); opacity: 0; }
                }
                @keyframes ribbon-shine {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .valentine-swiper { overflow: visible !important; }
                .valentine-swiper .swiper-slide { border-radius: 16px !important; background: white; border: 6px solid white; box-shadow: 0 8px 24px rgba(0,0,0,0.15); overflow: hidden; }
                .music-bar { width: 3px; background-color: white; border-radius: 2px; animation: music-bar 0.8s ease-in-out infinite; }
                .music-playing { animation: music-pulse 2s ease-in-out infinite; }
                .music-icon-spin { animation: music-spin 4s linear infinite; }
                .card-shine { position: absolute; top: 0; left: 0; width: 50%; height: 100%; background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0) 100%); z-index: 15; pointer-events: none; }
                .animate-shine { animation: shine-sweep 4s ease-in-out infinite; }
                .sunburst-bg { position: absolute; top: -100%; left: -100%; width: 300%; height: 300%; background: repeating-conic-gradient(from 0deg, rgba(235, 190, 100, 0.1) 0deg 10deg, rgba(255, 255, 255, 0) 10deg 20deg); mask-image: radial-gradient(circle at center, black 10%, transparent 60%); mix-blend-mode: overlay; opacity: 0.5; }
                .shimmer-text { color: #4A151B; }
                .gold-ribbon { background: linear-gradient(90deg, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C); }
                
                @keyframes countdown-pop { 
                    0% { transform: scale(0.3) rotate(-15deg); filter: blur(10px); opacity: 0; } 
                    50% { transform: scale(1.1) rotate(5deg); filter: blur(0px); opacity: 1; } 
                    100% { transform: scale(1) rotate(0deg); opacity: 1; } 
                }
                @keyframes ring-ping {
                    0% { transform: scale(0.5); opacity: 0.8; }
                    100% { transform: scale(2.5); opacity: 0; }
                }
                @keyframes radiant-glow {
                    0%, 100% { transform: scale(1); opacity: 0.2; }
                    50% { transform: scale(1.5); opacity: 0.4; }
                }
                @keyframes heartPulse { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.2); opacity: 1; } }
                @keyframes swipeHint { 0% { transform: translateX(60px); opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { transform: translateX(-60px); opacity: 0; } }
                @keyframes ring-spread { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.5); opacity: 0; } }
                @keyframes float-heart-up {
                    0% { transform: translateY(120vh) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.6; }
                    90% { opacity: 0.4; }
                    100% { transform: translateY(-20vh) rotate(360deg); opacity: 0; }
                }

                .valentine-swiper .swiper-pagination {
                    bottom: 12px !important;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 6px;
                }
                .valentine-swiper .swiper-pagination-bullet {
                    width: 7px;
                    height: 7px;
                    background: #FF3366 !important;
                    opacity: 0.25;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    margin: 0 !important;
                }
                .valentine-swiper .swiper-pagination-bullet-active {
                    width: 22px;
                    border-radius: 10px;
                    opacity: 1;
                    box-shadow: 0 4px 10px rgba(255, 51, 102, 0.3);
                }
            `}</style>

            {/* Transition Mask */}
            <div className={`fullscreen-mask flex flex-col items-center justify-center overflow-hidden ${isTransitioning ? 'active' : ''}`} style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: isTransitioning ? 'auto' : 'none', opacity: isTransitioning ? 1 : 0, background: 'radial-gradient(circle at center, #FFF5F7 0%, #FFD1DC 100%)', transition: 'opacity 0.4s ease-in-out' }}>
                <div className="radiant-aura" style={{ position: 'absolute', width: 400, height: 400, background: '#FF3366', borderRadius: '50%', animation: 'radiant-glow 3s ease-in-out infinite', opacity: 0.2, filter: 'blur(60px)' }} />

                {countdown !== null && (
                    <div className="relative flex flex-col items-center justify-center z-20">
                        {/* Ring Effects */}
                        <div key={`ring-${countdown}`} className="absolute w-40 h-40 border-2 border-[#FF3366] rounded-full animate-[ring-ping_1s_ease-out_forwards]" />
                        <div key={`ring-slow-${countdown}`} className="absolute w-40 h-40 border border-[#FF3366] rounded-full animate-[ring-ping_1.5s_ease-out_forwards] opacity-50" />

                        <Typography
                            sx={{
                                color: '#D41442',
                                mb: 2,
                                fontWeight: 600,
                                fontFamily: 'var(--font-mali)',
                                fontSize: '1rem',
                                letterSpacing: '0.2em',
                                opacity: 0.8,
                                animation: 'fadeIn 0.5s ease-out'
                            }}
                        >
                            PREPARING YOUR HEART
                        </Typography>

                        <Typography
                            key={countdown}
                            sx={{
                                color: '#FF3366',
                                fontWeight: 800,
                                fontSize: '9rem',
                                fontFamily: "var(--font-dancing), cursive",
                                animation: 'countdown-pop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                                textShadow: '0 10px 20px rgba(0,0,0,0.05)'
                            }}
                        >
                            {countdown > 0 ? countdown : "❤️"}
                        </Typography>
                    </div>
                )}
            </div>

            {/* Audio */}
            {displayContent.backgroundMusicUrl && (
                <audio ref={musicAudioRef} src={displayContent.backgroundMusicUrl} loop playsInline preload="auto" style={{ position: 'fixed', opacity: 0, pointerEvents: 'none' }} />
            )}
            {displayContent.backgroundMusicYoutubeId && !displayContent.backgroundMusicUrl && (
                <iframe ref={musicPlayerRef} src={isMusicStarted ? `https://www.youtube.com/embed/${displayContent.backgroundMusicYoutubeId}?autoplay=1&mute=${isMusicMuted ? 1 : 0}&loop=1&playlist=${displayContent.backgroundMusicYoutubeId}&controls=0` : ''} style={{ position: 'fixed', opacity: 0, pointerEvents: 'none' }} allow="autoplay; encrypted-media" title="bg-music" />
            )}

            {/* Music Control */}
            {isOpen && (displayContent.backgroundMusicUrl || displayContent.backgroundMusicYoutubeId) && (
                <div className="fixed right-5 z-[60]" style={{ top: 'calc(1.25rem + env(safe-area-inset-top))' }}>
                    <button onClick={toggleMusic} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${!isMusicMuted ? 'music-playing' : ''}`} style={{ background: isMusicMuted ? '#d1d5db' : '#FF3366', border: '3px solid white', boxShadow: '0 8px 15px rgba(0,0,0,0.1)' }}>
                        <div className={`relative flex items-center justify-center ${!isMusicMuted ? 'music-icon-spin' : ''}`}>
                            <Music size="20" variant={isMusicMuted ? "Linear" : "Bold"} color={isMusicMuted ? "#9ca3af" : "white"} />
                        </div>
                    </button>
                </div>
            )}

            {/* INTRO SCREEN (GIFT BOX) */}
            {!isOpen && !isTransitioning && (
                <div className="w-full h-full flex flex-col justify-between items-center z-10 relative overflow-hidden py-12" onClick={handleOpen}>
                    <div className="sunburst-bg" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none" />

                    {/* Floating Hearts Layer */}
                    <div className="absolute inset-0 pointer-events-none z-0">
                        {introHearts.map((h) => (
                            <Heart
                                key={h.id}
                                variant="Bold"
                                color="#FF3366"
                                style={{
                                    position: 'absolute',
                                    left: h.left,
                                    width: h.size,
                                    height: h.size,
                                    opacity: 0,
                                    animation: `float-heart-up ${h.duration}s linear infinite`,
                                    animationDelay: `${h.delay}s`,
                                    filter: 'blur(1px)'
                                }}
                            />
                        ))}
                    </div>

                    {/* Top Section: Lid */}
                    <div className="flex flex-col items-center animate-[float-lid_3s_ease-in-out_infinite] z-20">
                        <div className="relative w-52 h-14 bg-gradient-to-b from-[#8B1A1A] to-[#C62828] rounded-t-2xl shadow-[0_15px_30px_rgba(0,0,0,0.3)] border-b-2 border-black/10">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-full gold-ribbon shadow-inner" />
                            {/* Bow loops */}
                            <div className="absolute -top-7 left-1/2 -translate-x-[90%] w-14 h-10 gold-ribbon rounded-full rotate-[-15deg] shadow-lg border border-yellow-600/20" />
                            <div className="absolute -top-7 left-1/2 translate-x-[-10%] w-14 h-10 gold-ribbon rounded-full rotate-[15deg] shadow-lg border border-yellow-600/20" />
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-[#FCF6BA] to-[#BF953F] rounded-full z-10 shadow-md border border-yellow-700/30" />
                        </div>
                    </div>

                    {/* Middle Section: Text */}
                    <div className="text-center z-40 relative px-4 flex flex-col gap-2">
                        <Typography
                            variant="overline"
                            sx={{
                                color: '#D41442',
                                letterSpacing: '0.6em',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                opacity: 0.6
                            }}
                        >
                            SPECIAL DELIVERY
                        </Typography>
                        <Typography
                            variant="h1"
                            className="shimmer-text"
                            sx={{
                                fontFamily: 'var(--font-dancing), cursive',
                                fontSize: '3.2rem',
                                fontWeight: 700,
                                textShadow: '2px 2px 4px rgba(0,0,0,0.05)',
                                lineHeight: 1.1,
                                textTransform: 'none'
                            }}
                        >
                            {displayContent.title}
                        </Typography>
                    </div>

                    {/* Bottom Section: Box + Tap Text */}
                    <div className="flex flex-col items-center gap-12 animate-[float-box_4s_ease-in-out_infinite]">
                        <div className="relative w-44 h-36 bg-gradient-to-br from-[#B71C1C] via-[#D32F2F] to-[#8E0000] shadow-[0_25px_50px_rgba(0,0,0,0.4)] rounded-b-xl overflow-hidden border-t border-white/10">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-full gold-ribbon opacity-90 shadow-2xl" />
                            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-12 gold-ribbon opacity-80" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/5 pointer-events-none" />
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            {/* Floating Heart Icon with Ripples */}
                            <div className="relative flex items-center justify-center">
                                <div className="absolute w-12 h-12 bg-[#FF3366] rounded-full opacity-20 animate-[ring-spread_2s_infinite]" />
                                <div className="absolute w-12 h-12 bg-[#FF3366] rounded-full opacity-10 animate-[ring-spread_2s_infinite_0.5s]" />
                                <div className="relative z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                                    <Heart size={20} variant="Bold" color="#FF3366" />
                                </div>
                            </div>

                            <Typography
                                sx={{
                                    color: '#4A151B',
                                    fontWeight: 700,
                                    fontFamily: 'var(--font-dancing), cursive',
                                    fontSize: '1.5rem',
                                    opacity: 0.9,
                                    mt: -2
                                }}
                            >
                                {displayContent.openingText || "Tap to open your surprise"}
                            </Typography>
                        </div>
                    </div>

                    {/* Luxury Footer Card */}
                    <div className="w-[85%] max-w-sm h-32 bg-white/40 backdrop-blur-xl rounded-[40px] flex flex-col items-center justify-center p-4 shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/60 relative mb-4">
                        <div className="w-10 h-1 bg-gray-300/50 rounded-full mb-3 mt-2" />
                        <div className="flex flex-col items-center">
                            <Typography sx={{ color: '#8B1A1A', letterSpacing: '0.4em', fontWeight: 800, fontSize: '0.8rem', opacity: 0.8 }}>PREMIUM</Typography>
                            <div className="flex items-center gap-3 my-1">
                                <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#BF953F]" />
                                <Typography sx={{ fontFamily: 'var(--font-dancing)', fontSize: '1.4rem', color: '#4A151B', fontWeight: 600 }}>{displayContent.campaignName}</Typography>
                                <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#BF953F]" />
                            </div>
                            <Typography sx={{ color: '#8B1A1A', letterSpacing: '0.4em', fontWeight: 800, fontSize: '0.8rem', opacity: 0.8 }}>EXPERIENCE</Typography>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT */}
            {isOpen && (
                <>
                    {/* Decorative Hearts */}
                    <div className="fixed inset-0 pointer-events-none">
                        {borderHearts.map((h) => (
                            <Heart key={h.id} variant="Bold" color={h.color} style={{ position: 'absolute', top: `${h.top}%`, left: `${h.left}%`, width: h.size, height: h.size, transform: `rotate(${h.rotation}deg)`, zIndex: 1, opacity: 0.9 }} />
                        ))}
                    </div>

                    <div className="absolute top-6 left-0 right-0 text-center z-[70] pointer-events-none px-4">
                        <Typography className="text-[#FF3366] font-bold tracking-wider" sx={{ fontFamily: 'var(--font-dancing)', fontSize: '1.5rem' }}>{displayContent.greeting}</Typography>
                    </div>

                    <div className="w-full h-full flex flex-col items-center justify-center relative z-10 animate-[fadeIn_0.8s_ease-out]">
                        <div className="h-16" /> {/* Spacer */}

                        <div className="flex-1 w-full flex items-center justify-center max-h-[750px] relative">


                            <Swiper
                                effect={"creative"}
                                grabCursor={true}
                                modules={[EffectCreative, Pagination, Autoplay]}
                                className="valentine-swiper w-[300px] h-[55dvh] sm:w-[360px] sm:h-[65dvh]"
                                pagination={{ clickable: true }}
                                onSwiper={(swiper) => { swiperRef.current = swiper; }}
                                onSlideChange={handleSlideChange}
                                creativeEffect={swiperCreativeConfig}
                            >
                                {memories.map((memory, index) => (
                                    <SwiperSlide key={index}>
                                        <div className="w-full h-full relative overflow-hidden rounded-2xl">
                                            <div className="card-shine animate-shine opacity-40" />
                                            {memory.type === 'video' || memory.type === 'youtube' || memory.type === 'tiktok' ? (
                                                <div className="w-full h-full bg-[#1A0A0C] relative flex items-center justify-center">
                                                    {memory.type === 'youtube' ? (
                                                        <img src={`https://img.youtube.com/vi/${memory.url}/maxresdefault.jpg`} className="w-full h-full object-cover opacity-90" alt="Video thumbnail" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-[#4A151B] via-[#D41442] to-[#8B1D36] opacity-90" />
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                                                </div>
                                            ) : (
                                                <div className="w-full h-full relative">
                                                    <img src={memory.url} alt={memory.caption} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                                                </div>
                                            )}

                                            {memory.caption && (
                                                <div className="absolute bottom-6 left-0 right-0 px-6 text-center z-20">
                                                    <Typography
                                                        sx={{
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            fontFamily: 'var(--font-mali)',
                                                            fontSize: '1.1rem',
                                                            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                                                            lineHeight: 1.3
                                                        }}
                                                    >
                                                        {memory.caption}
                                                    </Typography>
                                                </div>
                                            )}
                                        </div>
                                    </SwiperSlide>
                                ))}

                                {/* Last Slide: Puzzle/Game */}
                                {memories.length > 0 && (
                                    <SwiperSlide key="game-slide">
                                        <div className="w-full h-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 to-white flex flex-col items-center justify-center p-4">
                                            {!isPuzzleComplete ? (
                                                <div className="text-center">
                                                    <div className="bg-white/50 p-6 rounded-full inline-block mb-6 shadow-xl relative">
                                                        <Heart size={48} variant="Bold" color="#FF3366" className="animate-pulse" />
                                                    </div>
                                                    <Typography className="text-[#8B1D36] font-black mb-2" sx={{ fontFamily: 'var(--font-mali)', fontSize: '2rem' }}>สะสมใจแทนคำรัก</Typography>
                                                    <Typography className="text-pink-500 font-bold mb-8 opacity-80">สะสมหัวใจให้ครบ เพื่อรับรางวัลพิเศษ 🎁</Typography>
                                                </div>
                                            ) : (
                                                <div className="text-center animate-[scaleIn_0.8s_ease-out]">
                                                    <Heart size={80} variant="Bold" color="#FF3366" className="inline-block mb-6 drop-shadow-xl animate-bounce" />
                                                    <Typography className="text-[#FF3366] font-bold mb-4" sx={{ fontFamily: 'var(--font-dancing)', fontSize: '2.5rem' }}>Forever Yours 💕</Typography>
                                                    {heartGameScore >= 1000 ? (
                                                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                                                            <Typography className="text-[#8B1D36] font-bold">Exclusive Reward! 🎁</Typography>
                                                            <Typography className="text-sm text-gray-600">You scored {heartGameScore} points. รับรางวัลพิเศษจากคนรักของคุณได้เลย!</Typography>
                                                        </div>
                                                    ) : (
                                                        <Typography className="text-[#8B1D36] opacity-80 font-mali">Thank you for being my everything.</Typography>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </SwiperSlide>
                                )}
                            </Swiper>

                            {/* Action Button for Video */}
                            {(memories[currentSlideIndex]?.type === 'video' || memories[currentSlideIndex]?.type === 'youtube' || memories[currentSlideIndex]?.type === 'tiktok') && (
                                <div className="absolute bottom-12 z-50">
                                    <button
                                        onClick={() => handleOpenVideoModal(memories[currentSlideIndex])}
                                        className="bg-[#FF3366] text-white px-8 py-3 rounded-full font-bold shadow-[0_8px_20px_rgba(255,51,102,0.4)] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wider"
                                    >
                                        <Play size={20} variant="Bold" />
                                        Watch Video
                                    </button>
                                </div>
                            )}

                            {/* Game Start Button */}
                            {currentSlideIndex === memories.length && !isPuzzleComplete && (
                                <div className="absolute bottom-20 z-50 w-full px-10">
                                    <button onClick={() => setShowHeartGame(true)} className="w-full bg-gradient-to-r from-[#FF3366] to-[#D41442] text-white py-4 rounded-full font-bold shadow-xl flex items-center justify-center gap-3 hover:scale-105 transition-transform">
                                        <Star size={24} variant="Bold" color="#FFD700" />
                                        <span style={{ fontFamily: 'var(--font-mali)', fontSize: '1.2rem' }}>เล่นเกมเก็บหัวใจ</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer Message */}
                        <div className="w-full max-w-sm px-6 pb-8 text-center" style={{ zIndex: 50 }}>
                            <Typography className="text-[#8B1D36] font-bold tracking-widest uppercase mb-2 text-[10px] opacity-70" sx={{ fontFamily: 'var(--font-prompt)' }}>{displayContent.subtitle}</Typography>
                            <Paper
                                elevation={0}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.7)',
                                    p: 3,
                                    borderRadius: '24px',
                                    backdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(255,255,255,0.5)',
                                    minHeight: '160px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    transition: 'all 0.5s ease-in-out'
                                }}
                            >
                                <Typography
                                    className="text-gray-800 italic"
                                    sx={{
                                        fontFamily: 'var(--font-prompt)',
                                        fontSize: '1rem',
                                        lineHeight: 1.6,
                                        opacity: showMessage ? 1 : 0,
                                        transform: showMessage ? 'translateY(0)' : 'translateY(10px)',
                                        transition: 'all 0.8s ease-out'
                                    }}
                                >
                                    {displayContent.message ? `"${displayContent.message}"` : ''}
                                </Typography>
                                <Typography
                                    className="text-[#FF3366] font-bold mt-4 text-xl block"
                                    sx={{
                                        fontFamily: 'var(--font-dancing), cursive',
                                        opacity: showMessage ? 1 : 0,
                                        transition: 'opacity 0.8s ease-out 0.3s'
                                    }}
                                >
                                    - {displayContent.signer} -
                                </Typography>
                            </Paper>
                        </div>
                    </div>
                </>
            )}

            {/* MODALS */}
            {activeVideo && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
                    <button onClick={handleCloseVideoModal} className="absolute top-4 right-4 text-white p-2 bg-white/10 rounded-full"><div className="rotate-45">+</div></button>
                    <div className="w-full max-w-lg aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative">
                        {activeVideo.type === 'youtube' ? (
                            <iframe src={`https://www.youtube.com/embed/${activeVideo.url}?autoplay=1`} className="w-full h-full" allowFullScreen allow="autoplay" title="video-modal" />
                        ) : activeVideo.type === 'tiktok' ? (
                            <iframe src={`https://www.tiktok.com/player/v1/${activeVideo.url}?autoplay=1`} className="w-full h-full" allowFullScreen title="tiktok-modal" />
                        ) : (
                            <video src={activeVideo.url} controls autoPlay className="w-full h-full" />
                        )}
                    </div>
                </div>
            )}

            {showHeartGame && (
                <div className="fixed inset-0 z-[120] bg-black/30 backdrop-blur-md flex items-center justify-center">
                    <HeartCatcher
                        images={memories.filter(m => m.type === 'image').map(m => m.url)}
                        onClose={() => setShowHeartGame(false)}
                        onComplete={(score) => {
                            setHeartGameScore(score);
                            setShowHeartGame(false);
                            if (score >= 1000) {
                                setIsPuzzleComplete(true);
                                setShowFinalReveal(true);
                            }
                        }}
                    />
                </div>
            )}
        </Box>
    );
}
