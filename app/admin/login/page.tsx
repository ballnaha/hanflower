'use client';

import { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton
} from '@mui/material';
import { Profile, Lock, Eye, EyeSlash } from 'iconsax-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { signIn } from 'next-auth/react';

export default function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await signIn('credentials', {
                username,
                password,
                redirect: false,
            });

            if (result?.error) {
                throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
            }

            // Redirect to admin dashboard
            router.push('/admin');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #FFF9F8 0%, #F5EDED 100%)',
            pt: 8,
            pb: 8
        }}>
            <Container maxWidth="xs">
                <Paper elevation={0} sx={{
                    p: { xs: 4, md: 5 },
                    borderRadius: '24px',
                    border: '1px solid rgba(183, 110, 121, 0.1)',
                    boxShadow: '0 20px 40px rgba(93, 64, 55, 0.05)',
                    textAlign: 'center'
                }}>
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ position: 'relative', width: '150px', height: '60px', mx: 'auto', mb: 2 }}>
                            <Image
                                src="/images/logo5.png"
                                alt="HanFlower Logo"
                                fill
                                style={{ objectFit: 'contain' }}
                            />
                        </Box>
                        <Typography variant="h5" sx={{
                            fontWeight: 700,
                            color: '#5D4037',
                            letterSpacing: '0.05em',
                            fontFamily: 'Prompt'
                        }}>
                            Admin Portal
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#888', mt: 1 }}>
                            กรุณาเข้าสู่ระบบเพื่อจัดการร้านค้าของคุณ
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', fontSize: '0.85rem' }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Username"
                            variant="outlined"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            margin="normal"
                            required
                            error={!!error}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Profile size={20} color="#B76E79" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '12px' }
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                            required
                            error={!!error}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock size={20} color="#B76E79" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                            {showPassword ? <EyeSlash size={20} color="#888" /> : <Eye size={20} color="#888" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '12px' }
                            }}
                        />

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{
                                mt: 4,
                                py: 1.8,
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #B76E79 0%, #A45D68 100%)',
                                boxShadow: '0 10px 20px rgba(183, 110, 121, 0.2)',
                                fontWeight: 600,
                                fontSize: '1rem',
                                color: '#FFFFFF',
                                textTransform: 'none',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #A45D68 0%, #8E4A55 100%)',
                                }
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'เข้าสู่ระบบ'}
                        </Button>
                    </form>

                    <Typography variant="caption" sx={{ display: 'block', mt: 4, color: '#AAA', letterSpacing: '0.1em' }}>
                        © 2026 HANFLOWER ADMINISTRATIVE SYSTEM
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
}
