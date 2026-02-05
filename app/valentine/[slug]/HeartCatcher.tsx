"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Heart, Star, Magicpen, Forbidden, Gift, Gallery, CloseCircle, Timer1, Cup, HeartSlash } from "iconsax-react";
import { Typography, Box, IconButton, Button } from "@mui/material";
import { useParams } from "next/navigation";
import Leaderboard from "./Leaderboard";

interface FallingHeart {
    id: string;
    x: number;
    y: number;
    size: number;
    type: 'normal' | 'rare' | 'super' | 'bomb' | 'rainbow' | 'clock';
    points: number;
    color: string;
}

interface HeartCatcherProps {
    onComplete: (score: number) => void;
    onClose: () => void;
    targetScore?: number;
    images?: string[];
}

// --- OPTIMIZED SUB-COMPONENTS ---

const MemoizedHeart = React.memo(({ heart, onCatch }: { heart: FallingHeart, onCatch: (id: string, x: number, y: number, points: number, color: string) => void }) => {
    return (
        <div
            className="absolute cursor-pointer select-none group animate-[heart-lifecycle_1.5s_ease-in-out_forwards]"
            style={{
                left: `${heart.x}%`,
                top: `${heart.y}%`,
                transform: `translate3d(-50%, -50%, 0)`,
                zIndex: heart.type === 'super' ? 50 : 40,
                willChange: 'opacity, transform'
            }}
            onMouseDown={(e) => {
                e.stopPropagation();
                onCatch(heart.id, heart.x, heart.y, heart.points, heart.color);
            }}
            onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCatch(heart.id, heart.x, heart.y, heart.points, heart.color);
            }}
        >
            <div className="transition-transform active:scale-125 duration-150" style={{ transform: 'translateZ(0)' }}>
                {heart.type === 'rainbow' && (
                    <div className="absolute inset-0 bg-white/20 blur-xl rounded-full animate-pulse" />
                )}
                {heart.type === 'super' && (
                    <div className="absolute inset-0 bg-yellow-300/30 blur-lg rounded-full animate-pulse" />
                )}
                {heart.type === 'bomb' ? (
                    <div className="relative">
                        <HeartSlash
                            size={heart.size}
                            variant="Bold"
                            color={heart.color}
                            className="opacity-90 drop-shadow-[0_0_10px_rgba(255,51,102,0.3)]"
                        />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping" />
                    </div>
                ) : heart.type === 'clock' ? (
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-400/20 blur-lg rounded-full animate-pulse" />
                        <Timer1
                            size={heart.size}
                            variant="Bold"
                            color={heart.color}
                            className="opacity-90 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-bounce"
                        />
                    </div>
                ) : (
                    <div
                        style={{
                            position: 'relative',
                            width: heart.size,
                            height: heart.size,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {heart.type === 'rainbow' ? (
                            <div
                                className="animate-[rainbow-rotate_3s_linear_infinite]"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(45deg, #FF3366, #FFD700, #33FFF6, #A033FF)',
                                    WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E")`,
                                    maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E")`,
                                    WebkitMaskSize: 'contain',
                                    maskSize: 'contain',
                                    WebkitMaskRepeat: 'no-repeat',
                                    maskRepeat: 'no-repeat',
                                    WebkitMaskPosition: 'center',
                                    maskPosition: 'center',
                                    filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))'
                                }}
                            />
                        ) : (
                            <Heart
                                size={heart.size}
                                variant="Bold"
                                color={heart.color}
                                className="opacity-90"
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});
MemoizedHeart.displayName = 'MemoizedHeart';

const MemoizedParticle = React.memo(({ p }: { p: any }) => {
    return (
        <div
            className="absolute pointer-events-none z-[90] animate-[particle-fade_1s_forwards]"
            style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                '--angle': `${p.angle}rad`,
                '--speed': `${p.speed}`,
                transform: 'translateZ(0)'
            } as any}
        >
            {p.color.includes('gradient') ? (
                <div
                    className="animate-[rainbow-rotate_2s_linear_infinite]"
                    style={{
                        width: 14,
                        height: 14,
                        background: p.color,
                        WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E")`,
                        maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='black'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E")`,
                        WebkitMaskSize: 'contain',
                        maskSize: 'contain'
                    }}
                />
            ) : (
                <Heart size={14} variant="Bold" color={p.color} className="opacity-80 drop-shadow-sm" />
            )}
        </div>
    );
});
MemoizedParticle.displayName = 'MemoizedParticle';

// --- MAIN COMPONENT ---
export default function HeartCatcher({ onComplete, onClose, targetScore = 1000, images }: HeartCatcherProps) {
    const params = useParams();
    const slug = params.slug as string;
    const [score, setScore] = useState(0);
    const [spawnInterval, setSpawnInterval] = useState(250);
    const [speedMultiplier, setSpeedMultiplier] = useState(1);
    const [gameDuration, setGameDuration] = useState(0); // Total seconds played this round
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [hearts, setHearts] = useState<FallingHeart[]>([]);
    const [isGameOver, setIsGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [floatingScores, setFloatingScores] = useState<{ id: string, x: number, y: number, points: number | string }[]>([]);
    const [particles, setParticles] = useState<{ id: string, x: number, y: number, color: string, angle: number, speed: number }[]>([]);

    const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);
    const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
    const rainbowSpawnedRef = useRef<number>(0);
    const spawnsSinceLastClockRef = useRef<number>(0);
    const timeLeftRef = useRef(timeLeft);
    const scoreRef = useRef(score);

    // Sync refs with state for use in intervals/callbacks
    useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);
    useEffect(() => { scoreRef.current = score; }, [score]);

    const spawnHeart = useCallback(() => {
        const rand = Math.random();
        let type: 'normal' | 'rare' | 'super' | 'bomb' | 'rainbow' | 'clock' = 'normal';
        let points = 5;
        let color = "#FF3366";
        let size = 45 + Math.random() * 20;

        const currentTimeLeft = timeLeftRef.current;
        const currentScore = scoreRef.current;

        // Dynamic Luck: Increase clock rate when time is low (Clutch Luck)
        const clockThreshold = currentTimeLeft < 10 ? 0.985 : 0.995;

        // Pity System
        const scoreFactor = Math.floor(currentScore / 500) * 10;
        const pityThreshold = (currentTimeLeft < 10 ? 30 : 60) + scoreFactor;
        const needsPityClock = spawnsSinceLastClockRef.current >= pityThreshold;

        if (rainbowSpawnedRef.current < 2 && rand > 0.99) {
            type = 'rainbow';
            points = 250;
            color = "linear-gradient(45deg, #FF3366, #FFD700, #33FFF6, #A033FF)";
            size = 55 + Math.random() * 10;
            rainbowSpawnedRef.current += 1;
        } else if (rand > clockThreshold || needsPityClock) {
            type = 'clock';
            points = 0;
            color = "#3B82F6";
            size = 40 + Math.random() * 10;
            spawnsSinceLastClockRef.current = 0;
        } else {
            spawnsSinceLastClockRef.current += 1;

            if (rand > 0.95) {
                type = 'super';
                points = 25;
                color = "#FFD700";
                size = 40 + Math.random() * 10;
            } else if (rand > 0.82) {
                type = 'bomb';
                points = -100;
                color = "#2D1219"; // Deep Dark Rose (Almost Black)
                size = 50 + Math.random() * 10;
            } else if (rand > 0.65) {
                type = 'rare';
                points = 12;
                color = "#D41442";
                size = 40 + Math.random() * 15;
            }
        }

        const id = `heart-${performance.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newHeart: FallingHeart = {
            id,
            x: 10 + Math.random() * 80,
            y: 15 + Math.random() * 70,
            size,
            type,
            points,
            color
        };

        setHearts(prev => {
            const maxHearts = currentTimeLeft < 10 ? 12 : 8;
            if (prev.length >= maxHearts) return prev;
            return [...prev, newHeart];
        });

        // Auto-remove heart after animation
        setTimeout(() => {
            setHearts(prev => prev.filter(h => h.id !== id));
        }, 1500);
    }, []); // No dependencies - use refs instead

    const createParticles = (x: number, y: number, color: string) => {
        const timestamp = Date.now();
        const randSeed = Math.random();
        const newParticles = Array.from({ length: 8 }).map((_, i) => ({
            id: `p-${timestamp}-${i}-${Math.random().toString(36).substr(2, 5)}`,
            x,
            y,
            color,
            angle: (Math.PI * 2 / 8) * i,
            speed: 2 + Math.random() * 3
        }));
        setParticles(prev => [...prev, ...newParticles]);
        setTimeout(() => {
            setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
        }, 1000);
    };

    const stopGame = useCallback(() => {
        setIsGameOver(true);
        if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
        if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    }, []);

    const startGame = () => {
        setGameStarted(true);
        setScore(0);
        setTimeLeft(30);
        setGameDuration(0); // Reset game duration
        setHearts([]);
        setIsGameOver(false);
        rainbowSpawnedRef.current = 0;
        spawnsSinceLastClockRef.current = 0;

        // Clear any existing timers before starting new ones
        if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
        if (gameTimerRef.current) clearInterval(gameTimerRef.current);

        // Heart Spawning Interval
        spawnTimerRef.current = setInterval(spawnHeart, spawnInterval);

        // Game Timer and Duration Tracking
        gameTimerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    stopGame(); // Use stopGame to clear all timers
                    return 0;
                }
                return prev - 1;
            });
            // Track total duration played
            setGameDuration(d => d + 1);
        }, 1000);
    };

    useEffect(() => {
        if (gameStarted && !isGameOver && timeLeft === 10) {
            // Restart interval with frenzy speed
            if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
            spawnTimerRef.current = setInterval(spawnHeart, 150);
        }
    }, [timeLeft === 10, gameStarted, isGameOver, spawnHeart]);

    const catchHeart = useCallback((id: string, x: number, y: number, points: number, color: string) => {
        setHearts(prev => {
            const heart = prev.find(h => h.id === id);
            if (!heart) return prev;

            let bonusText: number | string = "";

            if (heart.type === 'clock') {
                const extraTime = 3 + Math.floor(Math.random() * 4);
                setTimeLeft(prevTime => Math.min(prevTime + extraTime, 60));
                bonusText = `+${extraTime}s`;
            } else {
                setScore(prevScore => prevScore + points);
                bonusText = points > 0 ? `+${points}` : `${points}`;
            }

            // Sync Particles and Scores
            createParticles(x, y, color);
            const scoreId = `score-${performance.now()}-${Math.random().toString(36).substr(2, 9)}`;
            setFloatingScores(fs => [...fs, { id: scoreId, x, y, points: bonusText as any }]);
            setTimeout(() => {
                setFloatingScores(fs => fs.filter(s => s.id !== scoreId));
            }, 800);

            return prev.filter(h => h.id !== id);
        });
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
            if (gameTimerRef.current) clearInterval(gameTimerRef.current);
        };
    }, []);

    return (
        <div className="relative w-full h-[100dvh] bg-gradient-to-br from-rose-50 to-pink-100 overflow-hidden flex flex-col items-center">
            {/* Simple Background Overlay */}

            {/* Dreamy Background Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-300 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-300 blur-[120px] rounded-full animate-pulse [animation-delay:1s]" />
            </div>

            {/* Header / Stats - Fixed Height and No Wrap to prevent layout jumping */}
            <div className="relative z-20 w-full shrink-0 flex justify-between items-center px-4 py-4 h-[72px] border-b border-pink-100 bg-white/40 backdrop-blur-md">
                <div className="flex flex-col min-w-0 flex-shrink">
                    <Typography
                        className="text-[#8B1D36] font-bold text-xl sm:text-2xl truncate whitespace-nowrap"
                        sx={{ fontFamily: 'var(--font-dancing), cursive', letterSpacing: '0.02em' }}
                    >
                        Catch My Love
                    </Typography>
                    <div className="h-1 w-12 bg-gradient-to-r from-[#FF3366] to-transparent rounded-full mt-0.5" />
                </div>

                <div className="flex gap-2 sm:gap-4 items-center flex-shrink-0">
                    <div className="px-3 py-1.5 bg-rose-50 rounded-full border border-pink-100 flex items-center gap-1.5 shadow-sm min-w-[70px] justify-center">
                        <Star size="16" variant="Bold" color="#FFD700" />
                        <Typography className="text-[#8B1D36] font-black text-base font-mali leading-none">
                            {score}
                        </Typography>
                    </div>
                    <div className="px-3 py-1.5 bg-rose-50 rounded-full border border-pink-100 flex items-center gap-1.5 shadow-sm min-w-[70px] justify-center">
                        <Magicpen size="16" variant="Bold" color="#FF3366" />
                        <Typography className={`font-black text-base font-mali leading-none ${timeLeft < 10 ? 'text-red-600 animate-pulse' : 'text-[#8B1D36]'}`}>
                            {timeLeft}s
                        </Typography>
                    </div>

                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{ bgcolor: 'rgba(255, 51, 102, 0.05)', color: '#FF3366', ml: 0.5 }}
                    >
                        <CloseCircle color="#FF3366" size="20" variant="Outline" />
                    </IconButton>
                </div>
            </div>

            {/* Game Canvas / Area */}
            <div className="relative flex-grow w-full touch-none overflow-hidden">
                {!gameStarted ? (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm p-5 text-center">
                        <div className="mb-8 relative">
                            <div className="absolute inset-0 bg-pink-400/20 blur-3xl animate-[pulse_4s_infinite] scale-150 rounded-full" />
                            <Heart size={100} variant="Bold" color="#FF3366" className="relative drop-shadow-2xl" />
                        </div>
                        <Typography className="text-[#8B1D36] font-bold mb-5" sx={{ fontSize: '2.5rem', fontFamily: 'var(--font-dancing), cursive' }}>
                            Ready to collect love?
                        </Typography>
                        <Typography className="text-gray-600 mb-8 max-w-[280px] font-mali text-sm pt-5 pb-10">
                            แตะที่หัวใจเพื่อเก็บแต้มรักกันเถอะ<br />
                            <span className="text-rose-500 font-bold">เป้าหมาย: {targetScore.toLocaleString()} แต้ม</span> เพื่อรับรางวัลพิเศษ จากคนที่รักคุณ! 🎁
                        </Typography>
                        <button
                            onClick={startGame}
                            className="px-10 py-3 bg-gradient-to-r from-[#FF3366] to-[#D41442] text-white font-bold rounded-full shadow-[0_12px_24px_rgba(212,20,66,0.25)] hover:shadow-[0_15px_35px_rgba(212,20,66,0.4)] transition-all active:scale-95 text-lg mb-4"
                            style={{ fontFamily: 'var(--font-mali), sans-serif' }}
                        >
                            เริ่มเล่นเลย!
                        </button>

                        <button
                            onClick={() => setShowLeaderboard(true)}
                            className="px-8 py-2 border-2 border-[#D41442] text-[#D41442] font-extrabold rounded-full hover:bg-rose-50 transition-all flex items-center gap-2"
                            style={{ fontFamily: 'var(--font-mali), sans-serif' }}
                        >
                            <Cup size="20" variant="Bold" color="#D41442" />
                            ตารางอันดับ 🏆
                        </button>
                    </div>
                ) : isGameOver ? (
                    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md p-4 text-center animate-[fadeIn_0.5s_ease-out]">
                        {/* 🃏 MAIN RESULT CARD */}
                        <div className="w-full max-w-[320px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-pink-100 flex flex-col items-center p-6 relative">
                            <div className="absolute top-4 left-4 opacity-10 rotate-[-15deg]"><Heart size={24} variant="Bold" color="#FF3366" /></div>
                            <div className="absolute bottom-4 right-4 opacity-10 rotate-[15deg]"><Heart size={24} variant="Bold" color="#FF3366" /></div>

                            <Typography className="text-[#8B1D36] font-bold mb-1" sx={{ fontSize: '2.2rem', fontFamily: 'var(--font-dancing), cursive' }}>
                                Time's Up! ⏰
                            </Typography>

                            <div className="mb-4 flex flex-col items-center">
                                <Typography className="text-gray-400 text-[0.6rem] uppercase tracking-[0.3em] font-bold mb-1 font-mali">คะแนนของคุณ</Typography>
                                <Typography className="text-[#FF3366] font-black text-5xl font-mali leading-none">{score}</Typography>
                            </div>

                            <div className="w-full mb-6">
                                {score >= targetScore ? (
                                    <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl border-2 border-yellow-200/50 shadow-sm animate-[pulse_3s_infinite] flex flex-col items-center gap-1.5">
                                        <Gift size={32} variant="Bold" color="#FFD700" className="drop-shadow-sm" />
                                        <Typography className="text-[#8B1D36] font-bold text-xs uppercase font-mali tracking-wider">
                                            Mystery Reward Unlocked!
                                        </Typography>
                                        <Typography className="text-gray-500 text-[0.6rem] font-mali leading-tight">
                                            มารับของขวัญพิเศษจากแฟนคุณนะคะ 🎁
                                        </Typography>
                                    </div>
                                ) : (
                                    <div className="px-4 py-3 bg-rose-50 rounded-2xl border border-rose-100 italic font-mali text-rose-300 text-[0.65rem] text-center">
                                        ขาดอีก {targetScore - score} แต้ม เพื่อรับรางวัลพิเศษนะ!
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 w-full">
                                <button
                                    onClick={() => onComplete(score)}
                                    className="w-full py-2.5 bg-gradient-to-r from-[#D41442] to-[#FF3366] text-white font-bold rounded-xl shadow-md active:scale-95 transition-all text-md"
                                    style={{ fontFamily: 'var(--font-mali), sans-serif' }}
                                >
                                    กลับหน้าแรก ✨
                                </button>

                                <button
                                    onClick={() => setShowLeaderboard(true)}
                                    className="w-full py-2 border-2 border-pink-200 text-[#FF3366] font-bold rounded-xl hover:bg-pink-50 transition-all flex items-center justify-center gap-2 text-md"
                                    style={{ fontFamily: 'var(--font-mali), sans-serif' }}
                                >
                                    <Cup size="16" variant="Bold" color="#FF3366" />
                                    ดูตารางอันดับ 🏆
                                </button>

                                <button
                                    onClick={startGame}
                                    className="w-full py-2 bg-gray-50 text-gray-400 font-bold rounded-xl active:scale-95 transition-all text-md"
                                    style={{ fontFamily: 'var(--font-mali), sans-serif' }}
                                >
                                    เล่นอีกรอบ 🔄
                                </button>
                            </div>
                        </div>

                    </div>
                ) : (
                    <>
                        {/* Faint Background Countdown */}
                        {gameStarted && !isGameOver && timeLeft <= 5 && timeLeft > 0 && (
                            <Box
                                key={timeLeft}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
                                sx={{
                                    zIndex: 1,
                                    '& > *': { transform: 'translateZ(0)' }
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: { xs: '18rem', sm: '28rem' },
                                        fontWeight: 900,
                                        color: 'rgba(255, 51, 102, 0.3)',
                                        fontFamily: 'var(--font-mali), sans-serif',
                                        lineHeight: 1,
                                        animation: 'countdown-pop 1s cubic-bezier(0.17, 0.67, 0.83, 0.67) forwards',
                                        textShadow: '0 0 30px rgba(255, 255, 255, 0.4)',
                                        willChange: 'transform, opacity, filter'
                                    }}
                                >
                                    {timeLeft}
                                </Typography>
                            </Box>
                        )}

                        {hearts.map(heart => (
                            <MemoizedHeart key={heart.id} heart={heart} onCatch={catchHeart} />
                        ))}

                        {/* Floating Scores Feedback */}
                        {floatingScores.map(score => (
                            <div
                                key={score.id}
                                className="absolute pointer-events-none z-[100] animate-[score-float_0.8s_ease-out_forwards]"
                                style={{
                                    left: `${score.x}%`,
                                    top: `${score.y}%`,
                                    transform: `translate3d(-50%, -50%, 0)`
                                }}
                            >
                                <Typography
                                    className={`font-black text-2xl drop-shadow-md ${typeof score.points === 'number' && (score.points as number) >= 250
                                        ? 'animate-[rainbow-text_1s_linear_infinite]'
                                        : (String(score.points).includes('s')
                                            ? 'text-blue-500'
                                            : (typeof score.points === 'number' && (score.points as number) > 0 ? 'text-[#FF3366]' : 'text-gray-600'))
                                        }`}
                                    sx={typeof score.points === 'number' && (score.points as number) >= 250 ? {
                                        background: 'linear-gradient(45deg, #FF3366, #FFD700, #33FFF6, #A033FF)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                                    } : {}}
                                >
                                    {String(score.points).startsWith('+') || String(score.points).startsWith('-')
                                        ? score.points
                                        : (typeof score.points === 'number' && score.points > 0 ? `+${score.points}` : score.points)}
                                </Typography>
                            </div>
                        ))}

                        {/* Particle Burst Effects */}
                        {particles.map(p => (
                            <MemoizedParticle key={p.id} p={p} />
                        ))}
                    </>
                )}

                {/* Global Leaderboard Modal Overlay */}
                {showLeaderboard && (
                    <Leaderboard
                        slug={slug}
                        currentScore={score}
                        gameDuration={gameDuration}
                        onClose={() => setShowLeaderboard(false)}
                    />
                )}
            </div>

            {/* Custom Animations */}
            <style jsx global>{`
                @keyframes particle-fade {
                    0% { transform: translate3d(-50%, -50%, 0) scale(1); opacity: 1; }
                    100% { 
                        transform: translate3d(
                            calc(-50% + cos(var(--angle)) * var(--speed) * 40px), 
                            calc(-50% + sin(var(--angle)) * var(--speed) * 40px), 
                            0
                        ) scale(0); 
                        opacity: 0; 
                    }
                }
                @keyframes heart-lifecycle {
                    0% { opacity: 0; transform: translate3d(-50%, -20%, 0) scale(0.5); }
                    20% { opacity: 1; transform: translate3d(-50%, -50%, 0) scale(1.1); }
                    40% { transform: translate3d(-50%, -60%, 0) scale(1); }
                    80% { opacity: 1; transform: translate3d(-50%, -80%, 0) scale(1); }
                    100% { opacity: 0; transform: translate3d(-50%, -100%, 0) scale(0.8); }
                }
                @keyframes score-float {
                    0% { transform: translate3d(-50%, -50%, 0) scale(0.5); opacity: 0; }
                    20% { opacity: 1; transform: translate3d(-50%, -100%, 0) scale(1.2); }
                    100% { transform: translate3d(-50%, -200%, 0) scale(1); opacity: 0; }
                }
                @keyframes rainbow-rotate {
                    0% { filter: hue-rotate(0deg) drop-shadow(0 0 6px rgba(255, 255, 255, 0.6)); }
                    100% { filter: hue-rotate(360deg) drop-shadow(0 0 10px rgba(255, 255, 255, 0.9)); }
                }
                @keyframes rainbow-text {
                    0% { filter: hue-rotate(0deg); }
                    100% { filter: hue-rotate(360deg); }
                }
                @keyframes countdown-pop {
                    0% { transform: scale(2); opacity: 0; filter: blur(10px); }
                    15% { transform: scale(1); opacity: 0.3; filter: blur(0px); }
                    80% { transform: scale(1); opacity: 0.3; filter: blur(0px); }
                    100% { transform: scale(0.8); opacity: 0; filter: blur(5px); }
                }
            `}</style>
        </div >
    );
}
