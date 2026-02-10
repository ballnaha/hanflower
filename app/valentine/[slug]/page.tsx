"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCreative, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-creative";
import { Heart, Music, Play, Star } from "iconsax-react";
import { Button, Typography, Box, Paper, CircularProgress } from "@mui/material";
import JigsawPuzzle from "./JigsawPuzzle";
import HeartCatcher from "./HeartCatcher";
import { toPng } from "html-to-image";
import { DocumentDownload } from "iconsax-react";

// ==========================================
// 🚀 EXTREME PERFORMANCE COMPONENTS (MEMOIZED)
// ==========================================
// ⚡ ULTRA-LIGHT SVG HEART (No library overhead)
const FastHeart = React.memo(({ color, size, style, variant = "Bold" }: any) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={variant === "Bold" ? color : "none"}
        stroke={variant === "Bold" ? "none" : color}
        style={{ ...style, flexShrink: 0 }}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M12.62 20.81c-.34.12-.9.12-1.24 0C8.48 19.82 2 15.69 2 8.69 2 5.6 4.5 3.1 7.59 3.1c1.82 0 3.41.88 4.41 2.23 1-1.35 2.59-2.23 4.41-2.23 3.09 0 5.59 2.5 5.59 5.59 0 7-6.48 11.13-9.38 12.12z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
));
FastHeart.displayName = 'FastHeart';

const AmbientHearts = React.memo(({ hearts }: { hearts: any[] }) => (
    <div className="fixed inset-0 pointer-events-none z-0" style={{ contain: 'strict' }}>
        {hearts.map((h) => (
            <FastHeart
                key={h.id}
                color="#FF99AA"
                size={h.size}
                style={{
                    position: 'absolute',
                    left: h.left,
                    opacity: 0.15,
                    animation: `float-heart-up ${h.duration}s linear infinite`,
                    animationDelay: `${h.delay}s`,
                    transform: 'translate3d(0,0,0)',
                    willChange: 'transform'
                }}
            />
        ))}
    </div>
));
AmbientHearts.displayName = 'AmbientHearts';

const BurstHearts = React.memo(({ hearts, source }: { hearts: any[], source: string }) => (
    <div className="fixed inset-0 pointer-events-none z-[60]" style={{ contain: 'layout paint' }}>
        {hearts.map((h) => (
            <FastHeart
                key={h.id}
                color={source === 'completion' ? "#FF3366" : "#FF99AA"}
                size={h.size}
                style={{
                    position: 'absolute',
                    left: `${h.left}%`,
                    bottom: '-5%',
                    opacity: 0,
                    animation: `float-heart-up ${h.duration}s cubic-bezier(0.2, 0, 0.2, 1) forwards`,
                    animationDelay: `${h.delay}s`,
                    transform: 'translate3d(0,0,0)',
                    willChange: 'transform'
                }}
            />
        ))}
    </div>
));
BurstHearts.displayName = 'BurstHearts';

const BorderHearts = React.memo(({ hearts }: { hearts: any[] }) => (
    <div className="fixed inset-0 pointer-events-none z-10" style={{ contain: 'layout paint' }}>
        {hearts.map((h) => (
            <FastHeart
                key={h.id}
                color={h.color || "#FF3366"}
                size={h.size}
                style={{
                    position: 'absolute',
                    top: `${h.top}%`,
                    left: `${h.left}%`,
                    transform: `translate3d(0,0,0) rotate(${h.rotation}deg)`,
                    willChange: 'transform'
                }}
            />
        ))}
    </div>
));
BorderHearts.displayName = 'BorderHearts';

const PolaroidCard = React.memo(({
    memory,
    index,
    isRevealed,
    isDownloading,
    currentSlideIndex,
    totalCount,
    handleDownloadCard,
    handleOpenVideoModal,
    handleImageLoaded
}: any) => {
    const isActive = index === currentSlideIndex;
    const isAdjacent = Math.abs(index - currentSlideIndex) <= 1;
    const isVisible = isRevealed; // Unified visibility with reveal state

    return (
        <div className="polaroid-card group w-full h-full relative bg-white rounded-[4px] shadow-[0_10px_30px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden border-[10px] border-white ring-1 ring-black/5">
            {/* Save Button Overlay */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadCard(index);
                }}
                className="no-capture absolute top-2 right-2 z-[50] p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm cursor-pointer hover:scale-110 active:scale-95 transition-all"
                style={{
                    opacity: (isRevealed && !isDownloading) ? 0.9 : 0,
                    pointerEvents: isRevealed ? 'auto' : 'none',
                    visibility: isDownloading === index ? 'hidden' : 'visible',
                    transform: isRevealed ? 'scale(1)' : 'scale(0.8)'
                }}
            >
                {isDownloading === index ? (
                    <CircularProgress size={16} sx={{ color: '#FF3366' }} />
                ) : (
                    <DocumentDownload size={18} variant="Bold" color="#FF3366" />
                )}
            </div>

            {/* Photo/Video Container - 82% of height */}
            <div className="relative w-full h-[82%] overflow-hidden bg-slate-100 group shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#FF336610] via-transparent to-[#FFD1DC15] z-10 pointer-events-none" />
                <div className="photo-gloss-dynamic" />

                {/* Optimized Sparkles: Only for active/adjacent cards */}
                {isAdjacent && (
                    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                        {[...Array(3)].map((_, i) => {
                            const left = ((i * 19) + (index * 23)) % 85 + 7;
                            const top = ((i * 29) + (index * 17)) % 85 + 7;
                            const delay = (i * 0.9) % 4;
                            const duration = 2.8 + ((i * 0.6) % 2.2);
                            const size = 9 + ((i * 3) % 5);
                            return (
                                <div
                                    key={`ps-${index}-${i}`}
                                    className="sparkle-shape"
                                    style={{
                                        left: `${left}%`,
                                        top: `${top}%`,
                                        width: `${size}px`,
                                        height: `${size}px`,
                                        animation: `photo-sparkle ${duration}s ease-in-out infinite`,
                                        animationDelay: `${delay}s`,
                                    }}
                                >
                                    <div className="sparkle-glow" />
                                </div>
                            );
                        })}
                    </div>
                )}

                {memory.type === 'video' || memory.type === 'youtube' || memory.type === 'tiktok' ? (
                    <div className="w-full h-full relative flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => handleOpenVideoModal(memory)}>
                        {memory.type === 'youtube' ? (
                            <div className="w-full h-full relative">
                                <img src={`https://img.youtube.com/vi/${memory.url}/maxresdefault.jpg`} className="w-full h-full object-cover" alt="Video thumbnail" loading={index === 0 ? "eager" : "lazy"} />
                                <div className="absolute inset-0 bg-black/10" />
                            </div>
                        ) : (
                            <div className="w-full h-full video-pattern relative flex flex-col items-center justify-center p-6 text-center">
                                <Heart size={32} variant="Bold" color="#FF3366" className="opacity-20 mb-4" />
                                <Typography sx={{ fontFamily: 'var(--font-mali)', fontSize: '0.8rem', color: '#FF3366', opacity: 0.6, fontWeight: 700 }}>OUR SPECIAL MOMENT</Typography>
                            </div>
                        )}

                        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 group-hover:scale-110 transition-transform duration-500">
                            <div className="relative w-20 h-20 flex items-center justify-center">
                                <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
                                <div className="absolute inset-2 bg-white/40 rounded-full animate-pulse" />
                                <div className="relative z-10 w-14 h-14 bg-gradient-to-br from-[#FF3366] to-[#FF99AA] rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(255,51,102,0.4)] play-pulse">
                                    <Play size={24} variant="Bold" color="white" style={{ marginLeft: '4px' }} />
                                </div>
                            </div>
                            <Typography sx={{ fontFamily: 'var(--font-mali)', fontSize: '0.75rem', color: 'white', fontWeight: 800, mt: 2, textShadow: '0 2px 4px rgba(0,0,0,0.3)', letterSpacing: '0.1em' }}>TAP TO PLAY ❤️</Typography>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full relative">
                        {memory.url.toLowerCase().includes('.gif') ? (
                            <img
                                key={`gif-${index}`}
                                src={memory.url}
                                alt={memory.caption}
                                className="w-full h-full object-cover"
                                loading="eager"
                            />
                        ) : (
                            <img
                                src={memory.url}
                                alt={memory.caption}
                                className="w-full h-full object-cover"
                                loading={index === 0 ? "eager" : "lazy"}
                                onLoad={() => handleImageLoaded(index)}
                            />
                        )}
                    </div>
                )}

                <div
                    className="absolute inset-0 z-40 pointer-events-none flex flex-col items-center justify-center transition-all duration-1000 ease-in-out"
                    style={{
                        backgroundColor: '#FFFFFF',
                        opacity: isRevealed ? 0 : 1,
                        transform: isRevealed ? 'scale(1.1)' : 'scale(1)',
                        visibility: (index === 0 || isRevealed) ? 'hidden' : 'visible',
                        display: index === 0 ? 'none' : 'flex', // Slide 0 has NO white overlay
                        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
                    }}
                >
                    <FastHeart size={50} color="#FFD1DC" style={{ opacity: 0.6 }} />
                    <div className="mt-4 w-12 h-[2px] bg-pink-50 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-pink-200 origin-left animate-[loading-bar_1.5s_infinite]" />
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white flex flex-col items-center justify-center px-4 py-2 relative">
                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/[0.03] to-transparent pointer-events-none" />
                {memory.caption ? (
                    <Typography sx={{ color: '#4A151B', fontFamily: 'var(--font-mali)', fontSize: '1rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.3, opacity: 0.85 }}>
                        {memory.caption}
                    </Typography>
                ) : (
                    <div className="flex gap-1">
                        <Heart size={12} variant="Bold" color="#FFD1DC" />
                        <Heart size={12} variant="Bold" color="#FFD1DC" />
                        <Heart size={12} variant="Bold" color="#FFD1DC" />
                    </div>
                )}
                <div className="absolute bottom-2 right-3 opacity-20">
                    <Typography sx={{ fontSize: '0.6rem', color: '#4A151B', fontWeight: 800 }}>
                        {String(index + 1).padStart(2, '0')} / {String(totalCount).padStart(2, '0')}
                    </Typography>
                </div>
            </div>
        </div>
    );
});
PolaroidCard.displayName = 'PolaroidCard';

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

const proxyUrl = (url: string) => {
    if (url && url.startsWith('/uploads/')) {
        return url.replace('/uploads/', '/api/images/');
    }
    return url;
};

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
    const [revealedSlides, setRevealedSlides] = useState<Set<number>>(new Set());
    const [showMessage, setShowMessage] = useState(false);
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [isPuzzleComplete, setIsPuzzleComplete] = useState(false);
    const [showFinalReveal, setShowFinalReveal] = useState(false);
    const [showHeartGame, setShowHeartGame] = useState(false);
    const [heartGameScore, setHeartGameScore] = useState(0);
    const [heartBurstSource, setHeartBurstSource] = useState<'interaction' | 'completion'>('interaction');
    const [introHearts, setIntroHearts] = useState<{ id: number; left: string; size: number; duration: number; delay: number }[]>([]);
    const [ambientHearts, setAmbientHearts] = useState<{ id: number; left: string; size: number; duration: number; delay: number }[]>([]);
    const [borderHearts, setBorderHearts] = useState<{ id: string; top: number; left: number; size: number; rotation: number; color: string }[]>([]);
    const [introSparkles, setIntroSparkles] = useState<{ id: number; left: string; top: string; duration: number; delay: number }[]>([]);
    const [isSwiperReady, setIsSwiperReady] = useState(false);
    const [isLidOpening, setIsLidOpening] = useState(false);

    useEffect(() => {
        // Initial hearts for both layers to prevent empty screen on load
        // OPTIMIZED: Reduce counts (12 -> 8) for smoother mobile experience
        const iHearts = Array.from({ length: 8 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            size: 15 + Math.random() * 30,
            duration: 8 + Math.random() * 10,
            delay: Math.random() * 8
        }));
        setIntroHearts(iHearts);

        const aHearts = Array.from({ length: 8 }).map((_, i) => ({
            id: i + 100,
            left: `${Math.random() * 100}%`,
            size: 10 + Math.random() * 20,
            duration: 20 + Math.random() * 20,
            delay: Math.random() * 10
        }));
        setAmbientHearts(aHearts);

        const colors = ["#FF3366", "#FF99AA", "#FF5577", "#D41442"];
        const bHeartsArr = [];
        for (let i = 0; i < 4; i++) bHeartsArr.push({ id: `t-${i}`, top: 2, left: 10 + i * 25, size: 22 + Math.random() * 8, rotation: Math.random() * 20 - 10, color: colors[i % 4] });
        for (let i = 0; i < 4; i++) bHeartsArr.push({ id: `b-${i}`, top: 92, left: 10 + i * 25, size: 22 + Math.random() * 8, rotation: Math.random() * 20 - 10, color: colors[i % 4] });
        for (let i = 0; i < 4; i++) bHeartsArr.push({ id: `l-${i}`, top: 10 + i * 22, left: 2, size: 18 + Math.random() * 8, rotation: Math.random() * 20 - 10, color: colors[i % 4] });
        for (let i = 0; i < 4; i++) bHeartsArr.push({ id: `r-${i}`, top: 10 + i * 22, left: 90, size: 18 + Math.random() * 8, rotation: Math.random() * 20 - 10, color: colors[i % 4] });
        setBorderHearts(bHeartsArr);

        const sparkles = Array.from({ length: 2 }).map((_, i) => ({
            id: i,
            left: `${15 + Math.random() * 70}%`,
            top: `${20 + Math.random() * 60}%`,
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 2
        }));
        setIntroSparkles(sparkles);
    }, []);

    // Swiper Config
    const swiperCreativeConfig = useMemo(() => ({
        prev: {
            translate: ['-115%', 0, 0],
            rotate: [0, 0, -12],
            opacity: 0,
        },
        next: {
            translate: ['12%', 0, -60],
            rotate: [0, 0, 4],
            scale: 0.94,
            opacity: 0.6,
        },
        perspective: true,
        limitProgress: 3,
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
    const containerRef = useRef<HTMLDivElement>(null);
    const lastBurstTimeRef = useRef<number>(0);
    const BURST_THROTTLE_MS = 800;
    const MAX_HEARTS = 6;
    const swiperRef = useRef<any>(null);
    const isInternalUpdateRef = useRef(false);
    const [isDownloading, setIsDownloading] = useState<number | null>(null);
    const [downloadProgress, setDownloadProgress] = useState(0);

    const handleDownloadCard = useCallback(async (index: number) => {
        const cardElements = document.querySelectorAll('.polaroid-card');
        const cardElement = cardElements[index] as HTMLElement;
        if (!cardElement) return;

        setIsDownloading(index);
        setDownloadProgress(10);

        try {
            // Start simulation of progress for better UX
            const progressInterval = setInterval(() => {
                setDownloadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + (90 - prev) * 0.1;
                });
            }, 200);

            // First, hide no-capture elements manually before capture
            const uiElements = cardElement.querySelectorAll('.no-capture');
            uiElements.forEach(el => (el as HTMLElement).style.opacity = '0');

            // Brief delay to ensure UI is hidden
            await new Promise(r => setTimeout(r, 100));

            // Capture with html-to-image
            const dataUrl = await toPng(cardElement, {
                quality: 1.0,
                pixelRatio: 3,
                backgroundColor: '#ffffff',
                cacheBust: true,
                filter: (node) => {
                    const exclusionClasses = ['no-capture'];
                    return !exclusionClasses.some(cls => (node as HTMLElement).classList?.contains(cls));
                }
            });

            clearInterval(progressInterval);
            setDownloadProgress(100);

            // Restore UI elements
            uiElements.forEach(el => (el as HTMLElement).style.opacity = '');

            const link = document.createElement('a');
            link.download = `hanflower-valentine-${index + 1}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Keep 100% visible for a moment
            await new Promise(r => setTimeout(r, 500));
        } catch (error) {
            console.error('Download failed:', error);
            alert('ไม่สามารถบันทึกรูปภาพได้ในขณะนี้');
        } finally {
            setIsDownloading(null);
            setDownloadProgress(0);
        }
    }, []);

    const triggerHeartBurst = useCallback((source: 'interaction' | 'completion' | 'swipe' = 'interaction') => {
        const now = Date.now();
        if (isTransitioning && source === 'interaction') return;

        // Throttle interaction/swipe bursts
        const throttle = source === 'swipe' ? 400 : BURST_THROTTLE_MS;
        if (now - lastBurstTimeRef.current < throttle && (source === 'interaction' || source === 'swipe')) return;
        lastBurstTimeRef.current = now;

        setHeartBurstSource(source === 'swipe' ? 'interaction' : source);

        const count = source === 'completion' ? 10 : (source === 'swipe' ? 3 : 5);
        const newHearts = Array.from({ length: count }).map((_, i) => ({
            id: now + i,
            left: source === 'completion' ? Math.random() * 100 : (source === 'swipe' ? 30 + Math.random() * 40 : 20 + Math.random() * 60),
            size: source === 'completion' ? 25 + Math.random() * 25 : (source === 'swipe' ? 12 + Math.random() * 10 : 15 + Math.random() * 15),
            duration: source === 'swipe' ? 1 + Math.random() * 0.8 : 2 + Math.random() * 1.5,
            delay: Math.random() * 0.15,
        }));

        setBurstHearts(newHearts);
        setTimeout(() => {
            setBurstHearts(prev => prev.filter(h => !newHearts.some(nh => nh.id === h.id)));
        }, 2500);
    }, [isTransitioning]);


    useEffect(() => {
        if (typeof document !== 'undefined') {
            const metaTags = [
                { name: 'apple-mobile-web-app-capable', content: 'yes' },
                { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
                { name: 'mobile-web-app-capable', content: 'yes' },
                { name: 'theme-color', content: content?.backgroundColor || '#FFF0F3' },
                { name: 'google', content: 'notranslate' }
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

    // Force stop loading after max 2 seconds (Ultimate Fail-safe)
    useEffect(() => {
        const t = setTimeout(() => {
            console.log("Ultimate fallback triggered");
            setIsLoading(false);
        }, 2000);
        return () => clearTimeout(t);
    }, []);

    // Main Fetch Logic
    useEffect(() => {
        const currentSlug = Array.isArray(slug) ? (slug as string[])[0] : (slug as string);

        const fetchData = async () => {
            if (!currentSlug) {
                console.log("No slug found, stopping load");
                setIsLoading(false);
                return;
            }

            // Add fetch timeout to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            try {
                const response = await fetch(`/api/valentine/${currentSlug}`, {
                    signal: controller.signal,
                    cache: 'no-store'
                });

                clearTimeout(timeoutId);

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
                        backgroundMusicUrl: data.backgroundMusicUrl ? proxyUrl(data.backgroundMusicUrl) : "",
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
                        const proxiedMemories = data.memories.map((m: any) => ({
                            ...m,
                            url: proxyUrl(m.url)
                        }));
                        setMemories(proxiedMemories);
                    }
                } else if (response.status === 404) {
                    setIsExpired(true);
                }
            } catch (error) {
                console.error("Failed to fetch valentine data, using defaults:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (currentSlug) {
            fetchData();
        }
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
        }, 500);
        return () => clearTimeout(fallbackTimer);
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

        // OPTIMIZED: Only preload the first 5 images/thumbnails immediately
        // The rest will lazy load when the swiper approaches them
        const preloadLimit = 5;

        const nonImageIndexes: number[] = [];

        memories.forEach((memory, index) => {
            if (index >= preloadLimit) {
                // For non-preloaded images, ensure they are marked as "loaded" eventually if not image/youtube
                if (memory.type !== 'image' && memory.type !== 'youtube') {
                    nonImageIndexes.push(index);
                }
                return;
            }

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

        // After a small delay, mark everything as loaded to be safe
        const safeTimeout = setTimeout(() => {
            setLoadedImages(prev => {
                const updated = new Set(prev);
                let changed = false;
                memories.forEach((_, idx) => {
                    if (!updated.has(idx)) {
                        updated.add(idx);
                        changed = true;
                    }
                });
                return changed ? updated : prev;
            });
        }, 3000);

        return () => {
            preloadImagesRef.current.forEach(img => {
                img.onload = null;
                img.onerror = null;
            });
        };
    }, [memories, handleImageLoaded]);

    const displayContent = content || DEFAULT_CONTENT;

    const handleOpenBox = () => {
        if (isOpen || isTransitioning || isLidOpening) return;

        // 1. STAGGERED START: Visual feedback first
        setIsLidOpening(true);
        triggerHeartBurst('interaction');

        // 2. DELAYED FULLSCREEN & TRANSITION (Wait for lid-pop to start)
        setTimeout(() => {
            // TRY FULLSCREEN - Use the specific container ref for cleaner transition
            const isIPhone = typeof window !== 'undefined' && /iPhone/.test(navigator.userAgent);
            if (typeof document !== 'undefined' && !isIPhone && !document.fullscreenElement) {
                const elem = containerRef.current || document.documentElement;
                const requestMethod = (elem as any).requestFullscreen || (elem as any).webkitRequestFullscreen || (elem as any).mozRequestFullScreen || (elem as any).msRequestFullscreen;
                if (requestMethod) {
                    requestMethod.call(elem).catch(() => { });
                    setIsFullscreen(true);
                }
            }

            setIsTransitioning(true);

            // Music Build-up
            if (displayContent.backgroundMusicUrl || displayContent.backgroundMusicYoutubeId) {
                setIsMusicStarted(true);
                setIsMusicPlaying(true);
                setIsMusicMuted(false);

                // Direct play attempt
                if (musicAudioRef.current) {
                    musicAudioRef.current.volume = 0.8;
                    musicAudioRef.current.play().catch(err => {
                        console.warn("Initial play failed, will retry on isOpen:", err);
                    });
                }
            }

            // Curtain Sequence
            setTimeout(() => {
                setCountdown(0);
                triggerHeartBurst('completion');

                setTimeout(() => {
                    setIsOpen(true);
                    setIsSwiperReady(true);

                    // Explicitly reveal Slide 0 when box opens
                    setRevealedSlides(prev => {
                        const next = new Set(prev);
                        next.add(0);
                        return next;
                    });

                    if (musicAudioRef.current) {
                        musicAudioRef.current.play().catch(() => { });
                    }

                    // Immediate interaction availability
                    setIsTransitioning(false);
                    setTimeout(() => setCountdown(null), 300);
                }, 400);
            }, 3000);
        }, 300);
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

    const toggleMusic = () => {
        const newMuted = !isMusicMuted;
        setIsMusicMuted(newMuted);
        if (musicAudioRef.current) {
            musicAudioRef.current.muted = newMuted;
        }
    };

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
            }, 1200); // Delayed footer for smoother sequence
            return () => clearTimeout(timeout);
        }
    }, [isOpen, isTransitioning]);

    const handleSlideChange = useCallback((swiper: any) => {
        if (!isOpen) return; // Prevent reveal logic before box is open
        const activeIndex = swiper.activeIndex;
        const previousIndex = swiper.previousIndex;

        // Use batching (automatic in React 18)
        setCurrentSlideIndex(activeIndex);

        if (activeIndex > 0) {
            setHasSwiped(true);
        }

        setSeenSlides(prev => {
            if (prev.has(previousIndex)) return prev;
            const next = new Set(prev);
            next.add(previousIndex);
            return next;
        });

        // Create the "Surprise" reveal delay
        setTimeout(() => {
            setRevealedSlides(prev => {
                if (prev.has(activeIndex)) return prev;
                const next = new Set(prev);
                next.add(activeIndex);
                return next;
            });
        }, 500); // Wait for swipe to finish before starting fade-out

        // Use dedicated burst for swipe
        triggerHeartBurst('swipe');
    }, [triggerHeartBurst]);

    if (isLoading) {
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
        <Box
            ref={containerRef}
            className="notranslate fullscreen-root"
            sx={{
                height: "100dvh",
                width: "100vw",
                backgroundColor: displayContent.backgroundColor || "#FFF0F3",
                backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 1) 0%, rgba(255, 230, 235, 1) 60%, rgba(245, 200, 210, 1) 100%)`,
                backgroundAttachment: 'fixed', // Helps with some mobile spacing
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                overflow: "hidden",
                position: "relative",
                fontFamily: "'Comfortaa', sans-serif"
            }}>
            <style jsx global>{`
                :root {
                    --valentine-bg: ${displayContent.backgroundColor || "#FFF0F3"};
                }
                :root, html, body {
                    background-color: var(--valentine-bg) !important;
                    background: var(--valentine-bg) !important;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                    height: 100%;
                    width: 100%;
                }
                /* Robust fullscreen background handling to prevent black flicker */
                :fullscreen, :modal, 
                ::backdrop, ::-webkit-backdrop, *::backdrop {
                    background-color: var(--valentine-bg) !important;
                }
                
                /* Targeted browser overrides */
                :-webkit-full-screen { background-color: var(--valentine-bg) !important; }
                :-moz-full-screen { background-color: var(--valentine-bg) !important; }
                :-ms-fullscreen { background-color: var(--valentine-bg) !important; }
                :fullscreen { background-color: var(--valentine-bg) !important; }
                
                /* Ensure the element being full-screened has the background */
                .fullscreen-root:fullscreen {
                    background-color: var(--valentine-bg) !important;
                    width: 100vw;
                    height: 100vh;
                }
                @keyframes gentle-bounce {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-10px) scale(1.02); }
                }
                @keyframes float-mini {
                    0%, 100% { transform: translate(0, 0); }
                    33% { transform: translate(5px, -5px); }
                    66% { transform: translate(-5px, 5px); }
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modal-in {
                    0% { opacity: 0; transform: scale(0.9) translateY(20px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes backdrop-in {
                    0% { opacity: 0; background-color: rgba(0,0,0,0); }
                    100% { opacity: 1; background-color: rgba(0,0,0,0.5); }
                }
                @keyframes lid-pop {
                    0% { transform: translateY(0) rotate(0); }
                    50% { transform: translateY(-30px) rotate(-5deg) scale(1.05); }
                    100% { transform: translateY(-20px) rotate(-3deg); }
                }
                @keyframes mask-bloom {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
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
                .fullscreen-mask {
                    will-change: opacity, background-color;
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                }
                .countdown-item {
                    will-change: transform, opacity;
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                }

                .valentine-swiper { 
                    overflow: visible !important; 
                    padding: 20px 0 40px 0 !important;
                    -webkit-transform-style: preserve-3d;
                    transform-style: preserve-3d;
                    -webkit-perspective: 1200px;
                    perspective: 1200px;
                    -webkit-backface-visibility: hidden;
                    backface-visibility: hidden;
                }
                .valentine-swiper .swiper-slide { 
                    background: transparent !important; 
                    border: none !important; 
                    box-shadow: none !important; 
                    overflow: visible !important; 
                    height: 100% !important;
                    will-change: transform, opacity;
                    -webkit-transform: translate3d(0,0,0);
                    transform: translate3d(0,0,0);
                    -webkit-backface-visibility: hidden;
                    backface-visibility: hidden;
                    -webkit-transform-style: preserve-3d;
                    transform-style: preserve-3d;
                }
                .stable-container {
                    -webkit-transform: translate3d(0,0,0);
                    transform: translate3d(0,0,0);
                    -webkit-backface-visibility: hidden;
                    backface-visibility: hidden;
                }
                @keyframes music-bar-dance {
                    0%, 100% { transform: scaleY(0.2); opacity: 0.5; }
                    50% { transform: scaleY(1); opacity: 1; }
                }
                .wave-bar {
                    width: 2px;
                    height: 12px;
                    background-color: #FF3366;
                    border-radius: 1px;
                    margin: 0 1px;
                    transform-origin: center;
                    will-change: transform;
                }
                .wave-bar:nth-child(1) { animation: music-bar-dance 0.8s ease-in-out infinite; }
                .wave-bar:nth-child(2) { animation: music-bar-dance 1.1s ease-in-out infinite 0.2s; }
                .wave-bar:nth-child(3) { animation: music-bar-dance 0.9s ease-in-out infinite 0.4s; }
                
                @keyframes music-icon-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .music-icon-spin {
                    animation: music-icon-spin 3s linear infinite;
                    will-change: transform;
                }
                
                .music-heart-pulse { 
                    animation: heartPulse 2s ease-in-out infinite;
                }
                .play-pulse {
                    animation: play-pulse 1.5s ease-in-out infinite;
                }
                @keyframes play-pulse {
                    0%, 100% { transform: scale(1); opacity: 0.9; }
                    50% { transform: scale(1.1); opacity: 1; }
                }
                .video-pattern {
                    background-color: #FFF0F3;
                    background-image:  radial-gradient(#FF99AA 0.5px, transparent 0.5px), radial-gradient(#FF99AA 0.5px, #FFF0F3 0.5px);
                    background-size: 20px 20px;
                    background-position: 0 0,10px 10px;
                }
                .card-shine { position: absolute; top: 0; left: 0; width: 50%; height: 100%; background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%); z-index: 15; pointer-events: none; }
                @keyframes shine-sweep {
                    0% { transform: translateX(-200%); }
                    30% { transform: translateX(200%); }
                    100% { transform: translateX(200%); }
                }
                .animate-shine { animation: shine-sweep 3s ease-in-out infinite; }
                @keyframes sparkle-twinkle {
                    0%, 100% { opacity: 0; transform: scale(0.5); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                @keyframes glow-pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.7; }
                }
                .shimmer-text { color: #4A151B; }
                .gold-ribbon { background: linear-gradient(90deg, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C); }
                
                @keyframes curtain-left {
                    0% { transform: translate3d(-100%, 0, 0); }
                    10%, 85% { transform: translate3d(0, 0, 0); }
                    100% { transform: translate3d(-100%, 0, 0); }
                }
                @keyframes curtain-right {
                    0% { transform: translate3d(100%, 0, 0); }
                    10%, 85% { transform: translate3d(0, 0, 0); }
                    100% { transform: translate3d(100%, 0, 0); }
                }
                .curtain-panel {
                    position: fixed;
                    top: 0;
                    width: 51%;
                    height: 100dvh;
                    background: #FFF0F3;
                    z-index: 9999;
                    transform: translate3d(0,0,0);
                    will-change: transform;
                }
                @keyframes num-pop-curtain {
                    0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
                    15% { transform: scale(1.2) rotate(5deg); opacity: 1; }
                    25% { transform: scale(1) rotate(0deg); opacity: 1; }
                    30% { transform: scale(1.4); opacity: 0; }
                    100% { opacity: 0; }
                }
                .curtain-num {
                    position: absolute;
                    opacity: 0;
                    will-change: transform, opacity;
                    animation: num-pop-curtain 3s linear forwards;
                    font-size: 8rem;
                    font-weight: 900;
                    color: #FF3366;
                    font-family: var(--font-dancing), cursive;
                }
                .c-num-3 { animation-delay: 0s; }
                .c-num-2 { animation-delay: 1s; }
                .c-num-1 { animation-delay: 2s; }

                @keyframes heart-grow-curtain {
                    0%, 100% { transform: scale(1); }
                    10%, 43%, 76% { transform: scale(1.1); }
                }
                @keyframes heartbeat-loading {
                    0% { transform: scale(1); opacity: 0.8; }
                    15% { transform: scale(1.3); opacity: 1; }
                    30% { transform: scale(1.1); opacity: 0.9; }
                    45% { transform: scale(1.4); opacity: 1; }
                    100% { transform: scale(1); opacity: 0.8; }
                }
                .curtain-heart {
                    animation: heart-grow-curtain 3s ease-in-out forwards;
                    opacity: 0.1;
                    position: absolute;
                }
                @keyframes fade-in-out-curtain {
                    0%, 100% { opacity: 0; }
                    10%, 90% { opacity: 1; }
                }
                .curtain-content {
                    position: fixed;
                    inset: 0;
                    height: 100dvh;
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    animation: fade-in-out-curtain 3.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                    pointer-events: none;
                    transform: translate3d(0,0,0);
                }
                @keyframes reveal-card-content {
                    0% { opacity: 0; transform: scale(0.9) translateY(40px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                .reveal-container {
                    animation: reveal-card-content 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                    will-change: transform, opacity;
                }
                @keyframes countdown-heart-pulse {
                    0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(255, 51, 102, 0)); }
                    50% { transform: scale(1.1); filter: drop-shadow(0 0 20px rgba(255, 51, 102, 0.4)); }
                }
                @keyframes shockwave {
                    0% { transform: scale(0.5); opacity: 0.8; border-width: 4px; }
                    100% { transform: scale(2.5); opacity: 0; border-width: 1px; }
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
                    0% { transform: translateY(110vh) rotate(0deg) translateZ(0); opacity: 0; }
                    15% { opacity: 0.8; }
                    40% { opacity: 0.6; }
                    75% { opacity: 0.3; }
                    100% { transform: translateY(-20vh) rotate(360deg) translateZ(0); opacity: 0; }
                }
                @keyframes heartbeat-cute {
                    0%, 100% { transform: scale(1) translateZ(0); }
                    50% { transform: scale(1.05) translateZ(0); }
                }
                @keyframes float-around {
                    0%, 100% { transform: translate(0, 0) rotate(0deg) translateZ(0); }
                    33% { transform: translate(10px, -15px) rotate(5deg) translateZ(0); }
                    66% { transform: translate(-10px, 10px) rotate(-5deg) translateZ(0); }
                }

                @keyframes reveal-fade {
                    0% { opacity: 1; }
                    100% { opacity: 0; }
                }

                .valentine-swiper { overflow: visible !important; padding: 20px 0 20px 0 !important; }
                .photo-gloss-dynamic {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(110deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 60%, rgba(255,255,255,0) 100%);
                    background-size: 200% 100%;
                    z-index: 15;
                    pointer-events: none;
                }
                .group:hover .photo-gloss-dynamic {
                    animation: gloss-sweep 1.5s ease-out forwards;
                }
                @keyframes gloss-sweep {
                    from { background-position: 200% 0; }
                    to { background-position: -200% 0; }
                }
                @keyframes photo-sparkle {
                    0%, 100% { transform: scale(0) rotate(0deg) translateZ(0); opacity: 0; }
                    20%, 80% { opacity: 1; }
                    50% { transform: scale(1.3) rotate(45deg) translateZ(0); opacity: 1; }
                }
                .sparkle-shape {
                    position: absolute;
                    background: white;
                    clip-path: polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%);
                    pointer-events: none;
                    z-index: 20;
                    will-change: transform, opacity;
                }
                .sparkle-glow {
                    position: absolute;
                    inset: -150%;
                    background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 30%, transparent 70%);
                    border-radius: 50%;
                    pointer-events: none;
                }
            `}</style>

            {/* Transition Mask */}
            <div
                className={`fullscreen-mask flex flex-col items-center justify-center overflow-hidden ${isTransitioning ? 'active' : ''}`}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 2147483647, // Absolute max for fullscreen UI
                    pointerEvents: isTransitioning ? 'auto' : 'none',
                    opacity: isTransitioning ? 1 : 0,
                    backgroundColor: displayContent.backgroundColor || '#FFF0F3',
                    background: (countdown === 0 || (isOpen && isTransitioning)) ? '#FFFFFF' : (displayContent.backgroundColor || '#FFF0F3'),
                    transition: 'opacity 0.3s ease-out',
                    willChange: 'opacity'
                }}
            >
                {/* Instant feedback mask (No loading pulse to avoid perceived lag) */}

                {/* Simplified background - no blur filter */}
                <div
                    style={{
                        position: 'absolute',
                        inset: '-50%',
                        background: 'radial-gradient(circle at center, rgba(255, 51, 102, 0.08) 0%, transparent 70%)',
                    }}
                />

                {/* New Curtain Transition UI with Countdown */}
                {isTransitioning && (
                    <>
                        <div className="curtain-panel left-0" style={{ animation: 'curtain-left 3.8s cubic-bezier(0.65, 0, 0.35, 1) forwards' }} />
                        <div className="curtain-panel right-0" style={{ animation: 'curtain-right 3.8s cubic-bezier(0.65, 0, 0.35, 1) forwards' }} />

                        <div className="curtain-content">
                            <div className="curtain-heart">
                                <Heart size={250} variant="Bold" color="#FF3366" />
                            </div>

                            <div className="relative flex items-center justify-center w-full h-40">
                                {countdown !== 0 ? (
                                    <>
                                        <div className="curtain-num c-num-3" style={{ animationName: 'num-pop-curtain' }}>3</div>
                                        <div className="curtain-num c-num-2" style={{ animationName: 'num-pop-curtain' }}>2</div>
                                        <div className="curtain-num c-num-1" style={{ animationName: 'num-pop-curtain' }}>1</div>
                                    </>
                                ) : (
                                    <Box className="scale-125 transition-transform duration-500" sx={{ position: 'relative', zIndex: 10 }}>
                                        <Heart size={150} variant="Bold" color="#FF3366" className="animate-pulse" />
                                    </Box>
                                )}
                            </div>

                            <Typography
                                sx={{
                                    mt: 4,
                                    color: '#D41442',
                                    fontWeight: 800,
                                    fontFamily: 'var(--font-mali)',
                                    fontSize: '1.1rem',
                                    letterSpacing: '0.2em'
                                }}
                            >
                                {countdown === 0 ? "SURPRISE!" : "GET READY..."}
                            </Typography>
                        </div>
                    </>
                )}
            </div>


            {/* Audio */}
            <audio
                ref={musicAudioRef}
                src={displayContent.backgroundMusicUrl || undefined}
                loop
                playsInline
                preload="auto"
                style={{ position: 'fixed', opacity: 0, pointerEvents: 'none', zIndex: -1 }}
            />
            {displayContent.backgroundMusicYoutubeId && !displayContent.backgroundMusicUrl && (
                <iframe ref={musicPlayerRef} src={isMusicStarted ? `https://www.youtube.com/embed/${displayContent.backgroundMusicYoutubeId}?autoplay=1&mute=${isMusicMuted ? 1 : 0}&loop=1&playlist=${displayContent.backgroundMusicYoutubeId}&controls=0` : ''} style={{ position: 'fixed', opacity: 0, pointerEvents: 'none' }} allow="autoplay; encrypted-media" title="bg-music" />
            )}

            {/* Music Control - Ultra Compact Style (Moved to bottom right to avoid header) */}
            {isOpen && (displayContent.backgroundMusicUrl || displayContent.backgroundMusicYoutubeId) && (
                <div className="fixed right-4 z-[60]" style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
                    <div
                        onClick={toggleMusic}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-full cursor-pointer transition-all duration-500 hover:scale-110 active:scale-95 shadow-lg border border-white/40"
                        style={{
                            background: 'rgba(255, 255, 255, 0.65)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            minWidth: '40px',
                            transform: 'translate3d(0,0,0)',
                            WebkitTransform: 'translate3d(0,0,0)'
                        }}
                    >
                        {/* Music Note Icon */}
                        <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-300 ${!isMusicMuted ? 'bg-[#FF3366] music-icon-spin' : 'bg-gray-200'}`}
                            style={{
                                transform: 'translate3d(0,0,0)',
                                WebkitTransform: 'translate3d(0,0,0)'
                            }}
                        >
                            <Music size="14" variant={isMusicMuted ? "Linear" : "Bold"} color={isMusicMuted ? "#9ca3af" : "white"} />
                        </div>

                        {/* Animated Waveform (Compact) */}
                        {!isMusicMuted && (
                            <div className="flex items-center h-4 pr-2" style={{ transform: 'translate3d(0,0,0)' }}>
                                <div className="wave-bar" />
                                <div className="wave-bar" />
                                <div className="wave-bar" />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* INTRO SCREEN (GIFT BOX) - LAYER 1 */}
            {!isOpen && (
                <div
                    className={`absolute inset-0 z-[100] flex flex-col items-center justify-center stable-container ${isTransitioning ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'}`}
                    style={{
                        willChange: 'opacity, transform',
                        zIndex: 100,
                        visibility: isOpen ? 'hidden' : 'visible',
                        transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out',
                        display: isOpen ? 'none' : 'flex',
                        transform: 'translate3d(0,0,0)'
                    }}
                >
                    {/* Intro Screen Content */}
                    <div className="w-full h-full flex flex-col justify-between items-center relative overflow-hidden pt-20 pb-5" onClick={handleOpenBox}>
                        {/* Animated Background Layers */}
                        <div className={`absolute inset-0 bg-gradient-to-br from-[#FFF0F3] via-[#FFE4EC] to-[#FFD6E0] ${isTransitioning ? '' : 'animate-[glow-pulse_5s_ease-in-out_infinite]'}`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#FF336620] via-transparent to-transparent pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/20 pointer-events-none" />

                        {/* Sparkle Effects */}
                        {introSparkles.map((s) => (
                            <div
                                key={`sparkle-${s.id}`}
                                className="absolute w-2 h-2 bg-white rounded-full"
                                style={{
                                    left: s.left,
                                    top: s.top,
                                    animation: `sparkle-twinkle ${s.duration}s ease-in-out infinite`,
                                    animationDelay: `${s.delay}s`,
                                    boxShadow: '0 0 8px 2px rgba(255, 255, 255, 0.8)'
                                }}
                            />
                        ))}

                        {/* Floating Hearts Layer */}
                        <div className="absolute inset-0 pointer-events-none z-0">
                            {introHearts.map((h) => (
                                <FastHeart
                                    key={h.id}
                                    color="#FF3366"
                                    size={h.size}
                                    style={{
                                        position: 'absolute',
                                        left: h.left,
                                        bottom: '-10%',
                                        opacity: 0,
                                        animation: `float-heart-up ${h.duration}s linear infinite`,
                                        animationDelay: `${h.delay}s`,
                                        transform: 'translate3d(0,0,0)',
                                        willChange: 'transform'
                                    }}
                                />
                            ))}
                            <BurstHearts hearts={burstHearts} source={heartBurstSource} />
                        </div>

                        {/* Top Section: Lid */}
                        <div className={`flex flex-col items-center z-20 ${isLidOpening ? 'animate-[lid-pop_0.6s_ease-out_forwards]' : 'animate-[float-lid_3s_ease-in-out_infinite]'}`} style={{ willChange: 'transform' }}>
                            <div className="relative w-64 h-16 bg-gradient-to-b from-[#9C2020] to-[#D32F2F] rounded-t-2xl shadow-[0_20px_40px_rgba(255,51,102,0.25)] border-b-4 border-black/10">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-full gold-ribbon shadow-inner" />
                                <div className="absolute -top-8 left-1/2 -translate-x-[90%] w-16 h-12 gold-ribbon rounded-full rotate-[-15deg] shadow-lg border border-yellow-600/20" />
                                <div className="absolute -top-8 left-1/2 translate-x-[-10%] w-16 h-12 gold-ribbon rounded-full rotate-[15deg] shadow-lg border border-yellow-600/20" />
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-[#FCF6BA] to-[#BF953F] rounded-full z-10 shadow-md border border-yellow-700/30" />
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
                                    fontFamily: 'var(--font-dancing), var(--font-mali), cursive !important',
                                    fontSize: '2.5rem',
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
                            <div className="relative w-52 h-44 bg-gradient-to-br from-[#B71C1C] via-[#D32F2F] to-[#8E0000] shadow-[0_25px_50px_rgba(255,51,102,0.3),0_10px_20px_rgba(180,30,30,0.2)] rounded-b-xl overflow-hidden border-t border-white/10">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-full gold-ribbon opacity-90" />
                                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-14 gold-ribbon opacity-80" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/15 pointer-events-none" />
                            </div>

                            <div className="flex flex-col items-center gap-6">
                                <div className="relative flex items-center justify-center">
                                    <div className="absolute w-14 h-14 bg-[#FF3366] rounded-full opacity-20 animate-[ring-spread_3s_ease-out_infinite]" />
                                    <div className="absolute w-14 h-14 bg-[#FF99AA] rounded-full opacity-10 animate-[ring-spread_3s_ease-out_infinite_1.5s]" />
                                    <div className="relative z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                                        <Heart size={20} variant="Bold" color="#FF1493" />
                                    </div>
                                </div>

                                <Typography
                                    sx={{
                                        color: '#4A151B',
                                        fontWeight: 700,
                                        fontFamily: 'var(--font-dancing), var(--font-mali), cursive',
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
                        <div className="w-[85%] max-w-sm h-32 bg-white/70 rounded-[40px] flex flex-col items-center justify-center p-4 shadow-[0_15px_30px_rgba(0,0,0,0.08)] border border-white/60 relative mb-4">
                            <div className="w-10 h-1 bg-gray-300/40 rounded-full mb-3 mt-2" />
                            <div className="flex flex-col items-center">
                                <div className="px-5 py-1 rounded-full bg-gradient-to-r from-[#DBA627] via-[#FFF6AA] to-[#DBA627] shadow-[0_4px_10px_rgba(219,166,39,0.3)] mb-1">
                                    <Typography sx={{ color: '#5A3A0B', letterSpacing: '0.3em', fontWeight: 800, fontSize: '0.7rem', textShadow: '0 1px 0 rgba(255,255,255,0.4)', lineHeight: 1 }}>
                                        PREMIUM
                                    </Typography>
                                </div>
                                <div className="flex items-center gap-3 my-1">
                                    <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#BF953F]" />
                                    <Typography sx={{ fontFamily: 'var(--font-dancing)', fontSize: '1.4rem', color: '#4A151B', fontWeight: 600 }}>{displayContent.campaignName}</Typography>
                                    <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#BF953F]" />
                                </div>
                                <Typography sx={{ color: '#8B1A1A', letterSpacing: '0.4em', fontWeight: 800, fontSize: '0.7rem', opacity: 0.6 }}>EXPERIENCE</Typography>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT LAYER - LAYER 2 */}
            <div
                className={`absolute inset-0 z-10 transition-opacity duration-400 ease-out stable-container ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                style={{ visibility: isTransitioning || isOpen ? 'visible' : 'hidden', willChange: 'opacity' }}
            >
                {/* Decorative Hearts Flowing in background (Optimized: Render only when nearly open) */}
                {isOpen && !showHeartGame && <AmbientHearts hearts={ambientHearts} />}
                {isOpen && !showHeartGame && <BorderHearts hearts={borderHearts} />}

                {/* Burst Hearts Layer - Main View */}
                {isOpen && !showHeartGame && <BurstHearts hearts={burstHearts} source={heartBurstSource} />}

                {/* Main Layout - Balanced */}
                <div className={`w-full h-full flex flex-col items-center justify-between py-4 relative z-10 uppercase-none ${isOpen && !isTransitioning ? 'reveal-container' : ''}`}>

                    {/* Header - Raised Z-index to avoid card overlap */}
                    <div className="text-center px-4 pt-6 pb-2 relative z-50">
                        <Typography className="text-[#FF3366] font-bold tracking-wider" sx={{ fontFamily: 'var(--font-dancing)', fontSize: '1.4rem', textShadow: '0 2px 10px rgba(255,255,255,0.5)' }}>{displayContent.greeting}</Typography>
                    </div>

                    {/* Card Area - Reduced height for non-fullscreen compatibility */}
                    <div
                        className="flex-1 w-full flex items-center justify-center py-2 relative"
                        style={{ maxHeight: '65dvh', width: '100%', willChange: 'opacity' }}
                    >
                        <Swiper
                            effect={"creative"}
                            grabCursor={true}
                            modules={[EffectCreative]}
                            className="valentine-swiper w-[88vw] max-w-[340px] aspect-[9/16] sm:max-w-[360px] md:max-w-[420px]"
                            initialSlide={0}
                            followFinger={true}
                            touchRatio={1.2}
                            threshold={5}
                            resistance={true}
                            resistanceRatio={0.7}
                            speed={300}
                            roundLengths={true}
                            onSwiper={(swiper) => {
                                swiperRef.current = swiper;
                                setTimeout(() => setIsSwiperReady(true), 150);
                            }}
                            onSlideChange={handleSlideChange}
                            creativeEffect={swiperCreativeConfig}
                            watchSlidesProgress={true}
                        >
                            {memories.map((memory, index) => (
                                <SwiperSlide key={index} className="!overflow-visible">
                                    <PolaroidCard
                                        memory={memory}
                                        index={index}
                                        isRevealed={revealedSlides.has(index)}
                                        isDownloading={isDownloading}
                                        currentSlideIndex={currentSlideIndex}
                                        totalCount={memories.length}
                                        handleDownloadCard={handleDownloadCard}
                                        handleOpenVideoModal={handleOpenVideoModal}
                                        handleImageLoaded={handleImageLoaded}
                                    />
                                </SwiperSlide>
                            ))}

                            {/* Last Slide: Puzzle/Game */}
                            {memories.length > 0 && (
                                <SwiperSlide key="game-slide">
                                    <div className="w-full h-full relative bg-white rounded-[32px] p-4 pb-5 shadow-[0_20px_40px_rgba(255,51,102,0.1)] flex flex-col ring-1 ring-pink-100/50 border border-white">
                                        <div className="w-full h-full relative overflow-hidden rounded-[24px] bg-gradient-to-b from-[#FFF5F7] to-white flex flex-col items-center justify-center p-6 border border-pink-50">

                                            {!isPuzzleComplete ? (
                                                <div className="text-center z-10 flex flex-col items-center">
                                                    {/* Cute Character/Icon Area */}
                                                    <div className="relative mb-8">
                                                        <div className="absolute inset-0 bg-pink-200/30 blur-2xl rounded-full animate-pulse" />
                                                        <div className="relative bg-white p-8 rounded-[40px] shadow-[0_15px_30px_rgba(255,51,102,0.15)] border border-pink-50 animate-[gentle-bounce_3s_ease-in-out_infinite]">
                                                            <Heart size={64} variant="Bold" color="#FF3366" className="drop-shadow-md" />
                                                            <div className="absolute -top-2 -right-2 bg-[#FFD700] p-2 rounded-full shadow-md animate-bounce">
                                                                <Star size={20} variant="Bold" color="white" />
                                                            </div>
                                                        </div>
                                                        {/* Mini Decorative Hearts */}
                                                        <Heart size={16} variant="Bold" color="#FF99AA" className="absolute top-0 -left-6 animate-[float-mini_4s_infinite]" />
                                                        <Heart size={20} variant="Bold" color="#FFBBDD" className="absolute bottom-4 -right-8 animate-[float-mini_5s_infinite_1s]" />
                                                    </div>

                                                    <Typography
                                                        className="text-[#D41442] font-black mb-3"
                                                        sx={{
                                                            fontFamily: 'var(--font-mali)',
                                                            fontSize: '2rem',
                                                            fontWeight: 600,
                                                            lineHeight: 1.2,
                                                            textShadow: '0 2px 0 rgba(255,255,255,1)'
                                                        }}
                                                    >
                                                        สะสมใจแทนคำรัก
                                                    </Typography>
                                                    <Typography
                                                        className="text-pink-400 font-bold mb-8 px-4"
                                                        sx={{
                                                            fontFamily: 'var(--font-prompt)',
                                                            fontSize: '1rem',
                                                            opacity: 0.9,
                                                            lineHeight: 1.5
                                                        }}
                                                    >
                                                        มาช่วยกันเก็บสะสมหัวใจ<br />เพื่อรับของขวัญพิเศษจากใจนะ
                                                    </Typography>
                                                </div>
                                            ) : (
                                                <div className="text-center animate-[scaleIn_0.8s_ease-out] z-10 flex flex-col items-center">
                                                    <div className="bg-white p-8 rounded-full shadow-xl mb-6 relative border border-pink-50">
                                                        <Heart size={80} variant="Bold" color="#FF3366" className="animate-bounce" />
                                                        <div className="absolute inset-0 bg-pink-300/20 blur-xl rounded-full" />
                                                    </div>
                                                    <Typography className="text-[#FF3366] font-bold mb-4" sx={{ fontFamily: 'var(--font-dancing)', fontSize: '2.8rem' }}>Forever Yours 💕</Typography>

                                                    {heartGameScore >= 1000 ? (
                                                        <div className="bg-gradient-to-br from-orange-50 to-pink-50 p-6 rounded-[24px] border border-orange-100 shadow-inner max-w-[280px]">
                                                            <Typography className="text-[#D41442] font-black text-lg mb-1" sx={{ fontFamily: 'var(--font-mali)' }}>ยินดีด้วยนะคนเก่ง! 🎁</Typography>
                                                            <Typography className="text-sm text-[#8B1D36] font-medium" sx={{ fontFamily: 'var(--font-prompt)' }}>ทำคะแนนได้ {heartGameScore} แต้ม!<br />รับรางวัลพิเศษจากเบบี๋ได้เลย!</Typography>
                                                        </div>
                                                    ) : (
                                                        <Typography
                                                            className="text-[#8B1D36] opacity-70 italic px-6"
                                                            sx={{ fontFamily: 'var(--font-mali)', fontSize: '1.2rem' }}
                                                        >
                                                            "ทุกวินาทีที่มีเธอ คือของขวัญที่พิเศษที่สุด"
                                                        </Typography>
                                                    )}
                                                </div>
                                            )}

                                            {/* Extra Decorative Background Elements */}
                                            <div className="absolute -top-10 -left-10 w-48 h-48 bg-pink-100/30 rounded-full blur-3xl" />
                                            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-red-100/20 rounded-full blur-3xl" />
                                            <div className="absolute top-1/4 right-0 w-2 h-2 bg-pink-300 rounded-full animate-ping" />
                                            <div className="absolute bottom-1/3 left-4 w-3 h-3 bg-pink-200 rounded-full animate-pulse" />

                                            {/* Reveal Overlay */}
                                            <div
                                                className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center transition-opacity duration-1000"
                                                style={{
                                                    background: 'linear-gradient(135deg, #FFF5F7 0%, #FFFFFF 50%, #FFE4EC 100%)',
                                                    opacity: revealedSlides.has(memories.length) ? 0 : 1,
                                                    transition: 'opacity 0.8s ease-out',
                                                }}
                                            >
                                                <div className="flex flex-col items-center gap-4">
                                                    <Heart size={56} variant="Bold" color="#FF3366" className="animate-pulse opacity-30" />
                                                    <div className="w-12 h-1 bg-pink-100 rounded-full overflow-hidden">
                                                        <div className="w-full h-full bg-pink-400 origin-left animate-[loading-bar_2s_infinite]" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Unified Button Area Inside Slide for Balance */}
                                            {currentSlideIndex === memories.length && !isPuzzleComplete && (
                                                <div
                                                    className="absolute bottom-5 left-0 w-full px-6 z-50 transition-all duration-500"
                                                    style={{
                                                        opacity: (revealedSlides.has(memories.length) && !showHeartGame) ? 1 : 0,
                                                        transform: revealedSlides.has(memories.length) ? 'translateY(0)' : 'translateY(10px)',
                                                        pointerEvents: (revealedSlides.has(memories.length) && !showHeartGame) ? 'auto' : 'none'
                                                    }}
                                                >
                                                    <button
                                                        onClick={() => setShowHeartGame(true)}
                                                        className="w-full bg-gradient-to-r from-[#FF3366] via-[#FF5C8A] to-[#D41442] text-white py-3 px-5 rounded-[20px] font-bold shadow-[0_12px_24px_rgba(255,51,102,0.2)] flex items-center justify-between gap-2 group overflow-hidden relative active:scale-95 transition-transform"
                                                    >
                                                        {/* Stable Shine Effect */}
                                                        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] pointer-events-none animate-shine" />

                                                        <div className="flex items-center gap-2 relative z-10">
                                                            <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-md">
                                                                <Play size={18} variant="Bold" color="white" />
                                                            </div>
                                                            <span style={{ fontSize: '0.95rem', fontFamily: 'var(--font-mali)' }}>เริ่มเก็บหัวใจกันเถอะ!</span>
                                                        </div>
                                                        <Heart size={18} variant="Bold" className="text-white relative z-10" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </SwiperSlide>
                            )}
                        </Swiper>



                        {/* Old Button Container Removed for Balance */}
                    </div>

                    {/* Footer Message - Stable & Smooth Entrance */}
                    <div className="w-full max-w-xs px-4 pt-2 pb-2 text-center" style={{ minHeight: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Paper
                            elevation={0}
                            sx={{
                                bgcolor: (showMessage && isSwiperReady) ? 'rgba(255,255,255,0.7)' : 'transparent',
                                opacity: (showMessage && isSwiperReady) ? 1 : 0,
                                py: 1.5,
                                px: 2,
                                borderRadius: '16px',
                                border: (showMessage && isSwiperReady) ? '1px solid rgba(255,255,255,0.6)' : '1px solid transparent',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 0.5,
                                transition: 'opacity 1.2s ease-out',
                                willChange: 'opacity',
                                pointerEvents: (showMessage && isSwiperReady) ? 'auto' : 'none'
                            }}
                        >
                            <Typography
                                sx={{
                                    fontFamily: 'var(--font-prompt)',
                                    fontSize: '0.85rem',
                                    lineHeight: 1.4,
                                    color: '#4A151B',
                                    textAlign: 'center',
                                    fontWeight: 500
                                }}
                            >
                                {displayContent.message ? `"${displayContent.message}"` : ''}
                            </Typography>
                            <Typography
                                sx={{
                                    fontFamily: 'var(--font-dancing), cursive',
                                    fontSize: '1rem',
                                    color: '#FF3366',
                                    fontWeight: 600,
                                }}
                            >
                                - {displayContent.signer} -
                            </Typography>
                        </Paper>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {activeVideo && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 stable-container">
                    <button onClick={handleCloseVideoModal} className="absolute top-4 right-4 text-white p-2 bg-white/10 rounded-full z-[110]"><div className="rotate-45" style={{ fontSize: '2rem' }}>+</div></button>
                    <div className="w-full max-w-[400px] aspect-[9/16] max-h-[85vh] bg-black rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative border border-white/10">
                        {activeVideo.type === 'youtube' ? (
                            <iframe src={`https://www.youtube.com/embed/${activeVideo.url}?autoplay=1`} className="w-full h-full object-cover" allowFullScreen allow="autoplay" title="video-modal" />
                        ) : activeVideo.type === 'tiktok' ? (
                            <iframe src={`https://www.tiktok.com/player/v1/${activeVideo.url}?autoplay=1`} className="w-full h-full object-cover" allowFullScreen title="tiktok-modal" />
                        ) : (
                            <video src={activeVideo.url} controls autoPlay className="w-full h-full object-contain" />
                        )}
                    </div>
                </div>
            )}

            {showHeartGame && (
                <div
                    className="fixed inset-0 z-[120] bg-black/40 flex items-center justify-center stable-container"
                    style={{
                        opacity: 0,
                        animation: 'backdrop-in 0.5s ease-out forwards'
                    }}
                >
                    <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                            opacity: 0,
                            animation: 'modal-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                        }}
                    >
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
                </div>
            )}

            {/* Premium Download Overlay */}
            {isDownloading !== null && (
                <div
                    className="fixed inset-0 z-[200] flex flex-col items-center justify-center transition-all duration-500 overflow-hidden"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                    }}
                >
                    <div className="relative mb-10">
                        <div
                            className="absolute inset-0 bg-pink-200/50 rounded-full blur-3xl animate-pulse"
                            style={{ transform: 'scale(1.5)' }}
                        />
                        <div style={{ animation: 'heartbeat-loading 1.5s infinite ease-in-out' }}>
                            <Heart size={80} variant="Bold" color="#FF3366" />
                        </div>
                    </div>

                    <Typography
                        sx={{
                            fontFamily: 'var(--font-mali)',
                            fontSize: '1.4rem',
                            fontWeight: 700,
                            color: '#4A151B',
                            mb: 1
                        }}
                    >
                        {downloadProgress === 100 ? "บันทึกเรียบร้อย!" : "กำลังบันทึกความทรงจำ..."}
                    </Typography>

                    <Typography
                        sx={{
                            fontFamily: 'var(--font-prompt)',
                            fontSize: '0.9rem',
                            color: '#D41442',
                            opacity: 0.6,
                            mb: 5
                        }}
                    >
                        {downloadProgress === 100 ? "เก็บไว้ในภาพถ่ายของคุณ" : "กรุณารอสักครู่เพื่อภาพที่คมชัดที่สุด"}
                    </Typography>

                    {/* Minimal Progress Bar */}
                    <div className="w-64 h-1.5 bg-pink-100 rounded-full overflow-hidden relative">
                        <div
                            className="h-full bg-gradient-to-r from-[#FF3366] to-[#FF99AA] transition-all duration-300 ease-out rounded-full"
                            style={{ width: `${downloadProgress}%` }}
                        />
                    </div>
                </div>
            )}
        </Box>
    );
}
