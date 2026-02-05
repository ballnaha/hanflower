"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Divider,
    CircularProgress,
    Fade,
    Paper,
    IconButton
} from "@mui/material";
import { Cup, Send2, Refresh2, CloseCircle, Heart, Crown } from "iconsax-react";

interface Score {
    id: string;
    name: string;
    score: number;
    createdAt: string;
}

interface LeaderboardProps {
    slug: string;
    currentScore: number;
    gameDuration: number;
    onClose: () => void;
}

export default function Leaderboard({ slug, currentScore, gameDuration, onClose }: LeaderboardProps) {
    const [scores, setScores] = useState<Score[]>([]);
    const [name, setName] = useState("");
    const [savedName, setSavedName] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [totalPlayers, setTotalPlayers] = useState(0);
    const [userRank, setUserRank] = useState<number | null>(null);
    const [userBestScore, setUserBestScore] = useState(0); // Track history

    // Persistent Player ID & Name in localStorage
    useEffect(() => {
        let pId = localStorage.getItem("valentine_player_id");
        if (!pId) {
            pId = 'val_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem("valentine_player_id", pId);
        }

        const storedName = localStorage.getItem("valentine_player_name");
        if (storedName) {
            setName(storedName);
            setSavedName(storedName);
        }
    }, []);

    const fetchScores = async (isSilent = false) => {
        if (!isSilent) setIsLoading(true);
        else setIsRefreshing(true);

        try {
            const pId = localStorage.getItem("valentine_player_id");
            const response = await fetch(`/api/valentine/${slug}/score?playerId=${pId || ''}`);
            if (response.ok) {
                const data = await response.json();
                setScores(data.scores || []);
                setTotalPlayers(data.totalPlayers || 0);
                setUserRank(data.userRank || null);
                setUserBestScore(data.userBestScore || 0);

                // Sync user presence
                const stored = localStorage.getItem("valentine_player_name");
                if (stored && !hasSubmitted && !data.userRank) {
                    localStorage.removeItem("valentine_player_name");
                    setSavedName(null);
                    setName("");
                    setIsEditingName(true);
                }
            }
        } catch (error) {
            console.error("Failed to fetch scores:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchScores();
    }, [slug]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmedName = name.trim();

        // Prevent if score is not higher than previous record
        if (!trimmedName || isSubmitting || currentScore <= userBestScore) return;

        const pId = localStorage.getItem("valentine_player_id");
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            const response = await fetch(`/api/valentine/${slug}/score`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    playerId: pId,
                    name: trimmedName,
                    score: currentScore,
                    duration: gameDuration
                }),
            });

            if (response.ok) {
                localStorage.setItem("valentine_player_name", trimmedName);
                setSavedName(trimmedName);
                setIsEditingName(false);
                setHasSubmitted(true);
                fetchScores(true); // Silent update after submit
            } else {
                const errorData = await response.json();
                setSubmitError(errorData.error || "ไม่สามารถส่งคะแนนได้ กรุณาลองใหม่");
                if (response.status === 409) {
                    setIsEditingName(true);
                    setSavedName(null);
                }
            }
        } catch (error) {
            console.error("Failed to submit score:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box className="leaderboard-view" sx={{
            position: 'fixed',
            inset: 0,
            width: '100%',
            height: '100%',
            bgcolor: '#FDF2F4',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
        }}>
            {/* Header */}
            <Box sx={{
                p: 3,
                background: 'linear-gradient(135deg, #FF3366 0%, #D41442 100%)',
                color: 'white',
                position: 'relative'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex' }}>
                        <Cup size="32" variant="Bold" color="#FFD700" />
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'var(--font-mali)', lineHeight: 1.2, mb: 0.5 }}>
                            ตารางอันดับ
                        </Typography>
                        <Typography sx={{ fontWeight: 600, fontFamily: 'var(--font-dancing), cursive', fontSize: '1.4rem', color: '#FFD700', lineHeight: 1 }}>
                            Heart Rankings
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9, fontFamily: 'var(--font-mali)', letterSpacing: '0.05em' }}>
                            GLOBAL RANKING
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        color: 'white',
                        bgcolor: 'rgba(0,0,0,0.1)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.2)' }
                    }}
                >
                    <CloseCircle variant="Outline" size="24" color="white" />
                </IconButton>
            </Box>

            <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1, position: 'relative', minHeight: 0 }}>
                {/* Score Submission Card */}
                {!hasSubmitted && (
                    <Fade in={!hasSubmitted}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2, mb: 3, bgcolor: '#FFF5F7', borderRadius: '1.5rem', border: '2px solid #FFE4E9',
                                position: 'relative', overflow: 'hidden'
                            }}
                        >
                            <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.05 }}>
                                <Heart size="80" variant="Bold" color="#FF3366" />
                            </Box>
                            <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                                {isLoading && scores.length === 0 ? (
                                    <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                        <CircularProgress size={30} sx={{ color: '#FF3366' }} />
                                        <Typography sx={{ fontSize: '0.8rem', color: '#666', fontFamily: 'var(--font-mali)' }}>
                                            กำลังตรวจสอบอันดับ...
                                        </Typography>
                                    </Box>
                                ) : currentScore <= 0 ? (
                                    // Case 1: No score in this round
                                    <Box sx={{ py: 2 }}>
                                        <Typography sx={{ fontWeight: 800, color: '#8B1D36', fontFamily: 'var(--font-mali)', fontSize: '0.9rem', mb: 1 }}>
                                            {savedName ? `ยินดีต้อนรับกลับมา, ${savedName}! ❤️` : "พร้อมแข่งขันหรือยัง? ❤️"}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.75rem', color: '#666', fontFamily: 'var(--font-mali)' }}>
                                            {savedName
                                                ? <>สถิติสูงสุดของคุณคือ <b>{userBestScore.toLocaleString()}</b> แต้ม</>
                                                : "พยายามเก็บหัวใจให้ได้เพื่อติดอันดับในตารางนี้!"}
                                        </Typography>
                                    </Box>
                                ) : savedName && currentScore <= userBestScore ? (
                                    // Case 2: Returning player but score is NOT a high score
                                    <Box sx={{ py: 2 }}>
                                        <Typography sx={{ fontWeight: 800, color: '#8B1D36', fontFamily: 'var(--font-mali)', fontSize: '0.9rem', mb: 1 }}>
                                            พยายามอีกนิดนะ, {savedName}! ❤️
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.75rem', color: '#666', fontFamily: 'var(--font-mali)' }}>
                                            คะแนนรอบนี้คือ <b>{currentScore.toLocaleString()}</b> ยังไม่ทำลายสถิติเดิม (<b>{userBestScore.toLocaleString()}</b>)
                                        </Typography>
                                    </Box>
                                ) : (
                                    // Case 3: New player OR New High Score
                                    <>
                                        {savedName && currentScore > userBestScore && (
                                            <Box sx={{
                                                display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.4,
                                                bgcolor: '#FF3366', color: 'white', borderRadius: '50px', mb: 1.5, boxShadow: '0 4px 12px rgba(255, 51, 102, 0.3)'
                                            }}>
                                                <Crown size="14" variant="Bold" color="#FFD700" />
                                                <Typography sx={{ fontSize: '0.8rem', fontWeight: 900, fontFamily: 'var(--font-dancing), cursive', letterSpacing: '0.05em' }}>New High Score!</Typography>
                                            </Box>
                                        )}
                                        <Typography sx={{ mb: 1, fontWeight: 800, color: '#D41442', fontFamily: 'var(--font-mali)', fontSize: '0.9rem' }}>
                                            {!savedName ? "ว้าว! คุณทำได้ดีมาก ✍️" : "สุดยอด! สถิติใหม่ของคุณ 🌟"}
                                        </Typography>
                                        <Typography sx={{ mb: 2, fontWeight: 900, color: '#FF3366', fontFamily: 'var(--font-mali)', fontSize: '2.2rem', lineHeight: 1 }}>
                                            {currentScore.toLocaleString()} <Box component="span" sx={{ fontSize: '0.8rem', fontWeight: 700 }}>แต้ม</Box>
                                        </Typography>

                                        {savedName ? (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'center' }}>
                                                <Typography sx={{ fontSize: '0.85rem', color: '#6A1B1B', fontFamily: 'var(--font-mali)' }}>
                                                    บันทึกสถิติใหม่ในนาม: <b>{savedName}</b>
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleSubmit()}
                                                    disabled={isSubmitting}
                                                    sx={{
                                                        borderRadius: '50px',
                                                        bgcolor: '#FF3366',
                                                        fontFamily: 'var(--font-mali)',
                                                        fontSize: '0.8rem',
                                                        px: 3,
                                                        py: 0.7,
                                                        boxShadow: '0 4px 10px rgba(255, 51, 102, 0.15)',
                                                        '&:hover': { bgcolor: '#D41442' },
                                                        textTransform: 'none'
                                                    }}
                                                >
                                                    {isSubmitting ? <CircularProgress size={18} color="inherit" /> : "อัปเดตสถิติใหม่ 🚀"}
                                                </Button>
                                            </Box>
                                        ) : (
                                            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
                                                <TextField
                                                    autoFocus fullWidth placeholder="ใส่ชื่อของคุณเพื่อบันทึก..."
                                                    variant="outlined" size="small" value={name}
                                                    onChange={(e) => { setName(e.target.value); setSubmitError(null); }}
                                                    disabled={isSubmitting} error={!!submitError}
                                                    helperText={submitError}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '50px', bgcolor: 'white', fontFamily: 'var(--font-mali)', fontSize: '0.9rem',
                                                            '& fieldset': { borderColor: submitError ? '#d32f2f' : '#FFC1CC' },
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    type="submit" variant="contained" disabled={isSubmitting || !name.trim()}
                                                    sx={{
                                                        borderRadius: '50px',
                                                        bgcolor: '#FF3366',
                                                        minWidth: '40px',
                                                        color: 'white',
                                                        height: '38px',
                                                        '&:hover': { bgcolor: '#D41442' }
                                                    }}
                                                >
                                                    {isSubmitting ? <CircularProgress size={18} color="inherit" /> : "save"}
                                                </Button>
                                            </form>
                                        )}
                                    </>
                                )}
                            </Box>
                        </Paper>
                    </Fade>
                )}

                {/* Score List Container */}
                <Box sx={{ flex: 1, minHeight: '300px' }}>
                    <Box sx={{ mb: 2, px: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#8B112D', fontFamily: 'var(--font-mali)' }}>
                            Top 10 อันดับสูงสุด (Global)
                        </Typography>
                        <IconButton
                            size="small" onClick={() => fetchScores(true)}
                            disabled={isLoading || isRefreshing}
                            sx={{ bgcolor: '#FFF', '&:hover': { bgcolor: '#FFE4E9' } }}
                        >
                            <Refresh2 size="18" color="#FF3366" variant="Bold" className={isRefreshing ? 'animate-spin' : ''} />
                        </IconButton>
                    </Box>

                    {isLoading && scores.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress size={40} thickness={4} sx={{ color: '#FF3366' }} />
                        </Box>
                    ) : (
                        <List disablePadding sx={{ opacity: isRefreshing ? 0.7 : 1, transition: 'opacity 0.2s' }}>
                            {scores.map((s, index) => (
                                <React.Fragment key={s.id}>
                                    <ListItem sx={{ px: 1, py: 1.5 }}>
                                        <ListItemAvatar sx={{ minWidth: 52, position: 'relative' }}>
                                            {index < 3 && (
                                                <Box sx={{ position: 'absolute', top: -12, left: 19, transform: 'translateX(-50%) rotate(-15deg)', zIndex: 1 }}>
                                                    <Crown size="20" variant="Bold" color={index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : "#CD7F32"} />
                                                </Box>
                                            )}
                                            <Avatar sx={{
                                                bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#E5E7EB' : index === 2 ? '#FDBA74' : 'white',
                                                border: index < 3 ? 'none' : '2px solid #FFE4E9',
                                                color: index === 0 ? '#854D0E' : index === 1 ? '#4B5563' : index === 2 ? '#9A3412' : '#FF3366',
                                                fontWeight: 900, width: 38, height: 38, fontSize: '1rem', fontFamily: 'var(--font-mali)'
                                            }}>{index + 1}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={s.name}
                                            primaryTypographyProps={{ fontWeight: 800, sx: { color: '#4A151B', fontFamily: 'var(--font-mali)', fontSize: '1rem' } }}
                                        />
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography sx={{ fontWeight: 900, color: '#FF3366', fontSize: '1.1rem', fontFamily: 'var(--font-mali)' }}>
                                                {s.score.toLocaleString()}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', fontFamily: 'var(--font-mali)', fontWeight: 700 }}>แต้ม</Typography>
                                        </Box>
                                    </ListItem>
                                    {index < scores.length - 1 && <Divider variant="inset" component="li" sx={{ my: 0.5, opacity: 0.5 }} />}
                                </React.Fragment>
                            ))}
                        </List>
                    )}

                    {/* User Specific Rank */}
                    {!isLoading && userRank && userRank > 10 && (
                        <Box sx={{ mt: 2, p: 2, borderRadius: '16px', bgcolor: 'rgba(255, 51, 102, 0.05)', border: '1px dashed #FFC1CC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ bgcolor: '#FFF', color: '#FF3366', fontWeight: 900, fontSize: '0.9rem', width: 32, height: 32, border: '1px solid #FFC1CC' }}>{userRank}</Avatar>
                                <Box>
                                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#8B112D', fontFamily: 'var(--font-mali)' }}>คุณ {savedName}</Typography>
                                    <Typography sx={{ fontSize: '0.65rem', color: '#666', fontFamily: 'var(--font-mali)' }}>อันดับที่ {userRank} จาก {totalPlayers} คน</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography sx={{ fontWeight: 900, color: '#FF3366', fontSize: '1.1rem', fontFamily: 'var(--font-mali)' }}>
                                    {userBestScore.toLocaleString()}
                                </Typography>
                                <Typography sx={{ fontSize: '0.65rem', color: '#9CA3AF', fontFamily: 'var(--font-mali)', fontWeight: 700 }}>แต้ม</Typography>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>

            <style jsx>{`
                .leaderboard-view { contain: content; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </Box>
    );
}
