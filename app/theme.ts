'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#FADAD8', // Rose Poudre
            light: '#FFF0F5',
            dark: '#E6BEc5',
        },
        secondary: {
            main: '#FFFFFF',
            light: '#FFFFFF',
            dark: '#F5F5F5',
        },
        warning: {
            main: '#D4AF37', // Gold
        },
        text: {
            primary: '#5D4037', // Warm Bronze/Brown
            secondary: '#8D6E63', // Muted Earthy Pink
        },
        background: {
            default: '#FFF5F7', // Very pale rose
            paper: '#FFFFFF',
        },
    },
    typography: {
        fontFamily: 'var(--font-prompt), sans-serif',
        h1: {
            fontFamily: '"Playfair Display", serif',
            fontWeight: 500,
            letterSpacing: '0.05em',
            color: '#5D4037',
            textTransform: 'uppercase',
            lineHeight: 1.1,
        },
        h2: {
            fontFamily: '"Playfair Display", serif',
            fontWeight: 400,
            letterSpacing: '0.05em',
            color: '#5D4037',
            textTransform: 'uppercase',
        },
        h3: {
            fontFamily: '"Playfair Display", serif',
            fontWeight: 400,
        },
        h4: {
            fontFamily: 'var(--font-prompt), sans-serif',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#5D4037',
        },
        overline: {
            letterSpacing: '0.3em',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#D4AF37', // Gold accents
            fontSize: '0.75rem',
        },
        body1: {
            fontFamily: 'var(--font-prompt), sans-serif',
            fontSize: '1rem',
            lineHeight: 1.8,
            fontWeight: 300,
            color: '#6D4C41',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '0px', // Sharp
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    padding: '16px 48px',
                    transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    letterSpacing: '0.2em',
                    border: '1px solid #D4AF37', // Gold Border
                },
                contained: {
                    bgcolor: '#FADAD8', // Soft Pink
                    color: '#5D4037', // Brown Text
                    border: '1px solid #FADAD8',
                    boxShadow: 'none',
                    '&:hover': {
                        bgcolor: '#FFFFFF',
                        color: '#D4AF37',
                        borderColor: '#D4AF37',
                        boxShadow: '0 4px 20px rgba(212, 175, 55, 0.15)', // Gold Shadow
                        transform: 'translateY(-2px)',
                    },
                },
                outlined: {
                    borderWidth: '1px',
                    borderColor: '#D4AF37', // Gold
                    color: '#5D4037',
                    '&:hover': {
                        borderWidth: '1px',
                        bgcolor: '#FADAD8', // Soft Pink (Primary)
                        color: '#5D4037',
                        borderColor: '#FADAD8',
                        transform: 'translateY(-2px)',
                    },
                },
            },
        },
    },
});

export default theme;
