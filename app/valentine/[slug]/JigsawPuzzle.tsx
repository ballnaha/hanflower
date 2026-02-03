"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Heart } from "iconsax-react";
import { Typography } from "@mui/material";

interface JigsawPuzzleProps {
    imageUrl: string;
    gridSize?: number; // 3 = 3x3, 4 = 4x4
    onComplete: () => void;
    onSkip?: () => void;
    completionMessage?: string;
    completionSubMessage?: string;
}

interface PuzzlePiece {
    id: number;
    currentIndex: number;
    correctIndex: number;
    row: number;
    col: number;
}

export default function JigsawPuzzle({
    imageUrl,
    gridSize = 3,
    onComplete,
    onSkip,
    completionMessage = "You completed the puzzle! 💕",
    completionSubMessage = "Your love makes everything complete",
}: JigsawPuzzleProps) {
    const totalPieces = gridSize * gridSize;
    const pieceSize = 100 / gridSize;

    // Initialize puzzle pieces in shuffled order
    const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
    const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [moveCount, setMoveCount] = useState(0);
    const [celebrationHearts, setCelebrationHearts] = useState<{ id: number; left: number; delay: number; size: number }[]>([]);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Fisher-Yates shuffle
    const shuffleArray = useCallback((array: number[]) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }, []);

    // Initialize pieces on mount
    useEffect(() => {
        const indices = Array.from({ length: totalPieces }, (_, i) => i);
        const shuffledIndices = shuffleArray(indices);

        // Make sure puzzle is solvable (not already solved)
        if (shuffledIndices.every((val, idx) => val === idx)) {
            // If somehow solved, swap first two
            [shuffledIndices[0], shuffledIndices[1]] = [shuffledIndices[1], shuffledIndices[0]];
        }

        const initialPieces: PuzzlePiece[] = shuffledIndices.map((correctIndex, currentIndex) => ({
            id: correctIndex,
            currentIndex,
            correctIndex,
            row: Math.floor(correctIndex / gridSize),
            col: correctIndex % gridSize,
        }));

        setPieces(initialPieces);
    }, [gridSize, totalPieces, shuffleArray]);

    // Preload image
    useEffect(() => {
        if (!imageUrl) return;
        setImageLoaded(false);
        const img = new Image();
        img.onload = () => {
            setImageLoaded(true);
            console.log("Jigsaw image loaded successfully");
        };
        img.onerror = () => {
            console.error("Failed to load Jigsaw image:", imageUrl);
            // Fallback load anyway so it doesn't stay stuck on loading
            setImageLoaded(true);
        };
        img.src = imageUrl;
    }, [imageUrl]);

    // Check if puzzle is complete
    useEffect(() => {
        if (pieces.length === 0) return;

        const isSolved = pieces.every((piece) => piece.currentIndex === piece.correctIndex);

        if (isSolved && !isComplete) {
            setIsComplete(true);
            // Generate celebration hearts
            const hearts = Array.from({ length: 20 }, (_, i) => ({
                id: Date.now() + i,
                left: Math.random() * 100,
                delay: Math.random() * 0.5,
                size: 16 + Math.random() * 24,
            }));
            setCelebrationHearts(hearts);

            // Call onComplete after animation
            setTimeout(() => {
                onComplete();
            }, 2500);
        }
    }, [pieces, isComplete, onComplete]);

    // Handle piece click (tap-to-swap mechanic)
    const handlePieceClick = useCallback((clickedIndex: number) => {
        // Find the piece at this position
        const clickedPiece = pieces.find(p => p.currentIndex === clickedIndex);

        // 🔒 Lock Check: If piece is already in correct position, prevent interaction
        if (clickedPiece && clickedPiece.correctIndex === clickedPiece.currentIndex) {
            console.log("Piece is locked in correct position");
            return;
        }

        console.log("Piece clicked:", clickedIndex, "Selected:", selectedPiece);

        if (isComplete) return;

        if (selectedPiece === null) {
            // Select first piece
            console.log("Selecting piece at", clickedIndex);
            setSelectedPiece(clickedIndex);
        } else if (selectedPiece === clickedIndex) {
            // Deselect if same piece clicked
            console.log("Deselecting/Canceling");
            setSelectedPiece(null);
        } else {
            // Check if target swap position is locked (shouldn't happen via UI but good for safety)
            const targetPiece = pieces.find(p => p.currentIndex === selectedPiece);
            if (targetPiece && targetPiece.correctIndex === targetPiece.currentIndex) {
                return; // Source was locked?
            }

            // Swap pieces
            console.log("Swapping piece at", selectedPiece, "with", clickedIndex);

            setPieces(prev => {
                // Correctly map to new objects to avoid mutation
                return prev.map(p => {
                    if (p.currentIndex === selectedPiece) {
                        return { ...p, currentIndex: clickedIndex };
                    }
                    if (p.currentIndex === clickedIndex) {
                        return { ...p, currentIndex: selectedPiece };
                    }
                    return p;
                });
            });

            setMoveCount(prev => prev + 1);
            setSelectedPiece(null);
        }
    }, [selectedPiece, isComplete, pieces]);

    // Render puzzle grid
    const puzzleGrid = useMemo(() => {
        if (!imageLoaded || pieces.length === 0) return null;

        return pieces.map((piece) => {
            const isSelected = selectedPiece === piece.currentIndex;
            const isCorrect = piece.correctIndex === piece.currentIndex;

            // Calculate current position within the grid
            const currentRow = Math.floor(piece.currentIndex / gridSize);
            const currentCol = piece.currentIndex % gridSize;

            return (
                <div
                    key={piece.id}
                    className={`
                        absolute transition-all duration-400 ease-in-out
                        ${isSelected ? 'z-20 scale-105' : 'z-10'}
                        ${!isCorrect && !isComplete ? 'cursor-pointer hover:scale-[1.02]' : ''}
                    `}
                    style={{
                        width: `${pieceSize}%`,
                        height: `${pieceSize}%`,
                        top: `${currentRow * pieceSize}%`,
                        left: `${currentCol * pieceSize}%`,
                        padding: '1px', // Tiny gap between pieces
                        willChange: 'top, left, transform',
                    }}
                    onClick={() => handlePieceClick(piece.currentIndex)}
                >
                    <div
                        className="w-full h-full relative overflow-hidden rounded-sm"
                        style={{
                            boxShadow: isSelected
                                ? '0 8px 24px rgba(255, 51, 102, 0.5), inset 0 0 0 2px #FF3366'
                                : isCorrect && !isComplete
                                    ? 'none'
                                    : '0 2px 6px rgba(0, 0, 0, 0.1)',
                            border: isSelected
                                ? '2px solid white'
                                : isCorrect && !isComplete
                                    ? '1px solid rgba(0,0,0,0.05)'
                                    : '1px solid rgba(255,255,255,0.4)',
                            filter: isCorrect && !isComplete ? 'grayscale(80%) opacity(0.9)' : 'none',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `url("${imageUrl}")`,
                                backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                                backgroundPosition: `${piece.col * (100 / (gridSize - 1))}% ${piece.row * (100 / (gridSize - 1))}%`,
                                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                                transition: 'transform 0.3s ease-out',
                            }}
                        />
                    </div>
                </div>
            );
        });
    }, [pieces, imageLoaded, selectedPiece, gridSize, pieceSize, imageUrl, handlePieceClick, isComplete]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-rose-50 to-pink-100" />

            {/* Floating decorative hearts */}
            <div className="absolute top-4 left-4 opacity-30 animate-[heart-float_3s_infinite]">
                <Heart size={24} variant="Bold" color="#FF3366" />
            </div>
            <div className="absolute top-12 right-6 opacity-20 animate-[heart-float_2.5s_infinite_400ms]">
                <Heart size={18} variant="Bold" color="#FF99AC" />
            </div>
            <div className="absolute bottom-20 left-8 opacity-25 animate-[heart-float_2.8s_infinite_200ms]">
                <Heart size={20} variant="Bold" color="#FF6B8A" />
            </div>

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-[320px] px-4">
                {/* Header */}
                <div className="text-center mb-4">
                    <Typography
                        className="text-[#FF3366] font-bold mb-1"
                        sx={{ fontFamily: 'var(--font-dancing), cursive', fontSize: '1.8rem' }}
                    >
                        {isComplete ? "💕 Perfect!" : "🧩 Puzzle Time!"}
                    </Typography>
                    <Typography
                        className="text-[#8B1D36] opacity-70 text-sm"
                        sx={{ fontFamily: 'var(--font-prompt)' }}
                    >
                        {isComplete ? completionSubMessage : "Tap two pieces to swap them"}
                    </Typography>
                </div>

                {/* Puzzle Container */}
                <div
                    className={`
                        swiper-no-swiping
                        relative w-full aspect-square rounded-2xl overflow-hidden
                        shadow-[0_10px_40px_rgba(255,51,102,0.2)]
                        ${isComplete ? 'animate-[pulse_1s_ease-in-out_2]' : ''}
                    `}
                    style={{
                        background: 'white',
                        border: '3px solid rgba(255, 51, 102, 0.2)',
                        touchAction: 'none' // Prevent browser scroll/zoom on puzzle
                    }}
                >
                    {!imageLoaded ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-pink-50">
                            <div className="flex flex-col items-center">
                                <Heart size={40} variant="Bulk" color="#FF3366" className="animate-bounce" />
                                <Typography className="text-[#FF3366] mt-2 text-xl" sx={{ fontFamily: 'var(--font-dancing), cursive' }}>Preparing puzzle...</Typography>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-wrap">
                            {puzzleGrid}
                        </div>
                    )}

                    {/* Completion overlay */}
                    {isComplete && (
                        <div className="absolute inset-0 flex items-center justify-center animate-[fadeIn_0.5s_ease-out] z-40">
                            <div className="text-center relative">
                                {/* Text with strong shadow for readability on any image */}
                                <div className="relative inline-block px-6 py-4 rounded-2xl bg-black/30 backdrop-blur-sm border border-white/20 shadow-xl">
                                    <div className="mb-2 flex justify-center">
                                        <Heart
                                            size={50}
                                            variant="Bold"
                                            color="#FF3366"
                                            className="animate-[heartPulse_1s_ease-in-out_infinite] drop-shadow-md"
                                        />
                                    </div>
                                    <Typography
                                        className="text-white font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                                        sx={{ fontFamily: 'var(--font-dancing), cursive', fontSize: '2rem' }}
                                    >
                                        {completionMessage}
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Celebration hearts animation */}
                {celebrationHearts.map(heart => (
                    <div
                        key={heart.id}
                        className="absolute pointer-events-none"
                        style={{
                            left: `${heart.left}%`,
                            bottom: '-20px',
                            animation: `burst-float 2s ease-out ${heart.delay}s forwards`,
                        }}
                    >
                        <Heart size={heart.size} variant="Bold" color="#FF3366" />
                    </div>
                ))}

                {/* CSS for puzzle-specific animations */}
                <style jsx>{`
                    @keyframes heartPulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.15); }
                    }
                    .hover\\:scale-102:hover {
                        transform: scale(1.02);
                    }
                    .active\\:scale-98:active {
                        transform: scale(0.98);
                    }
                `}</style>
            </div>
        </div>
    );
}
