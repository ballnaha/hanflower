"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Heart, Star, CloseCircle, Refresh, Cup } from "iconsax-react";
import { Typography, Box, IconButton, Button, Paper } from "@mui/material";

interface OXGameProps {
    onComplete: (score: number) => void;
    onClose: () => void;
}

type Player = "X" | "O" | null;

export default function OXGame({ onComplete, onClose }: OXGameProps) {
    const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true); // X is User, O is AI
    const [winner, setWinner] = useState<Player | "Draw" | null>(null);
    const [winningLine, setWinningLine] = useState<number[] | null>(null);
    const [message, setMessage] = useState("Your turn! Place your 💖");
    const [gameActive, setGameActive] = useState(true);

    const calculateWinner = (squares: Player[]) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return { winner: squares[a], line: lines[i] };
            }
        }
        if (squares.every(s => s !== null)) return { winner: "Draw" as const, line: null };
        return null;
    };

    const minimax = (tempBoard: Player[], depth: number, isMaximizing: boolean): number => {
        const result = calculateWinner(tempBoard);
        if (result?.winner === "O") return 10 - depth;
        if (result?.winner === "X") return depth - 10;
        if (result?.winner === "Draw") return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (tempBoard[i] === null) {
                    tempBoard[i] = "O";
                    const score = minimax(tempBoard, depth + 1, false);
                    tempBoard[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (tempBoard[i] === null) {
                    tempBoard[i] = "X";
                    const score = minimax(tempBoard, depth + 1, true);
                    tempBoard[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    };

    const makeAIMove = useCallback(() => {
        if (!gameActive || winner) return;

        const currentBoard = [...board];

        // AI Strategy - Mix of Smart and Sweet
        // 1. Check if AI can win now
        // 2. Check if User is about to win and block
        // 3. Otherwise use Minimax or Random based on "Love Level"

        let bestMove = -1;
        let bestScore = -Infinity;

        // "Love Level" Logic: 30% chance to make a non-optimal move to let user have fun
        const beSweet = Math.random() > 0.7;

        for (let i = 0; i < 9; i++) {
            if (currentBoard[i] === null) {
                currentBoard[i] = "O";
                const score = minimax(currentBoard, 0, false);
                currentBoard[i] = null;
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }

        if (bestMove !== -1) {
            const nextBoard = [...board];
            nextBoard[bestMove] = "O";
            setBoard(nextBoard);
            setIsXNext(true);

            const result = calculateWinner(nextBoard);
            if (result) {
                setWinner(result.winner);
                setWinningLine(result.line);
                setGameActive(false);
                if (result.winner === "O") setMessage("I won your heart! 💘");
                else if (result.winner === "Draw") setMessage("A Perfect Match! It's a draw. 💝");
            } else {
                setMessage("Your turn! 💖");
            }
        }
    }, [board, gameActive, winner]);

    useEffect(() => {
        if (!isXNext && gameActive && !winner) {
            const timer = setTimeout(makeAIMove, 600);
            return () => clearTimeout(timer);
        }
    }, [isXNext, gameActive, winner, makeAIMove]);

    const handleClick = (i: number) => {
        if (!gameActive || board[i] || !isXNext) return;

        const nextBoard = [...board];
        nextBoard[i] = "X";
        setBoard(nextBoard);
        setIsXNext(false);
        setMessage("Thinking... 🤍");

        const result = calculateWinner(nextBoard);
        if (result) {
            setWinner(result.winner);
            setWinningLine(result.line);
            setGameActive(false);
            if (result.winner === "X") {
                setMessage("You won! You're my champion! 🏆💖");
            } else if (result.winner === "Draw") {
                setMessage("A Perfect Match! It's a draw. 💝");
            }
        }
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setWinner(null);
        setWinningLine(null);
        setGameActive(true);
        setMessage("Your turn! Place your 💖");
    };

    return (
        <div className="relative w-full h-[100dvh] bg-gradient-to-br from-[#FFF0F3] to-[#FFE4EC] flex flex-col items-center">
            {/* Header */}
            <div className="relative z-20 w-full flex justify-between items-center px-4 py-4 h-[72px] border-b border-pink-100 bg-white/40 backdrop-blur-md">
                <Typography className="text-[#8B1D36] font-bold text-2xl" sx={{ fontFamily: 'var(--font-dancing), cursive' }}>
                    Valentine OX
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'rgba(255, 51, 102, 0.05)', color: '#FF3366' }}>
                    <CloseCircle color="#FF3366" size="24" variant="Outline" />
                </IconButton>
            </div>

            <Box className="flex-grow w-full flex flex-col items-center justify-center p-4">
                <Paper elevation={0} className="p-6 rounded-[2.5rem] bg-white/80 backdrop-blur-sm border-2 border-pink-100 shadow-xl flex flex-col items-center max-w-[360px] w-full">

                    <Typography className="text-[#D41442] font-bold mb-6 text-xl text-center" sx={{ fontFamily: 'var(--font-mali)' }}>
                        {message}
                    </Typography>

                    {/* OX Board */}
                    <div className="grid grid-cols-3 gap-3 w-full aspect-square mb-6">
                        {board.map((cell, i) => {
                            const isWinningCell = winningLine?.includes(i);
                            return (
                                <Box
                                    key={i}
                                    onClick={() => handleClick(i)}
                                    className={`aspect-square rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 ${cell ? 'bg-white shadow-inner' : 'bg-pink-50/50 hover:bg-pink-100/50'
                                        } ${isWinningCell ? 'ring-4 ring-[#FF3366] animate-pulse bg-pink-50' : 'border border-pink-100'}`}
                                >
                                    {cell === "X" && (
                                        <div className="animate-[scaleIn_0.3s_ease-out]">
                                            <Heart size={48} variant="Bold" color="#FF3366" className="drop-shadow-sm" />
                                        </div>
                                    )}
                                    {cell === "O" && (
                                        <div className="animate-[scaleIn_0.3s_ease-out]">
                                            <Heart size={48} variant="Outline" color="#FF99AA" className="drop-shadow-sm" />
                                        </div>
                                    )}
                                </Box>
                            );
                        })}
                    </div>

                    {winner && (
                        <div className="flex flex-col gap-3 w-full animate-[fadeIn_0.5s_ease-out]">
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => onComplete(winner === "X" ? 1000 : (winner === "Draw" ? 500 : 0))}
                                sx={{
                                    borderRadius: '16px',
                                    py: 1.5,
                                    bgcolor: '#FF3366',
                                    '&:hover': { bgcolor: '#D41442' },
                                    fontFamily: 'var(--font-mali)',
                                    fontWeight: 'bold',
                                    boxShadow: '0 8px 20px rgba(255, 51, 102, 0.2)'
                                }}
                            >
                                {winner === "O" ? "Try again for love 🔄" : "Perfect! Return to card ✨"}
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={resetGame}
                                sx={{
                                    borderRadius: '16px',
                                    py: 1.2,
                                    color: '#FF3366',
                                    borderColor: '#FF3366',
                                    fontFamily: 'var(--font-mali)',
                                    fontWeight: 'bold'
                                }}
                            >
                                Play again
                            </Button>
                        </div>
                    )}

                    {!winner && !isXNext && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" />
                        </Box>
                    )}
                </Paper>

                <Typography className="mt-8 text-pink-400/60 font-mali text-sm text-center px-6">
                    "Every move I make is because of you"<br />
                    💖 = You | 🤍 = Me
                </Typography>
            </Box>

            <style jsx global>{`
                @keyframes scaleIn {
                    0% { transform: scale(0.5); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes fadeIn {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
