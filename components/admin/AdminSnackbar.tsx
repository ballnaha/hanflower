'use client';

import { Snackbar, Alert, AlertColor } from '@mui/material';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface SnackbarState {
    open: boolean;
    message: string;
    severity: AlertColor;
}

interface SnackbarContextType {
    showMessage: (message: string, severity?: AlertColor) => void;
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showWarning: (message: string) => void;
    showInfo: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export function useSnackbar() {
    const context = useContext(SnackbarContext);
    if (!context) {
        throw new Error('useSnackbar must be used within a SnackbarProvider');
    }
    return context;
}

interface SnackbarProviderProps {
    children: ReactNode;
}

export function SnackbarProvider({ children }: SnackbarProviderProps) {
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'success'
    });

    const showMessage = useCallback((message: string, severity: AlertColor = 'success') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    const showSuccess = useCallback((message: string) => {
        showMessage(message, 'success');
    }, [showMessage]);

    const showError = useCallback((message: string) => {
        showMessage(message, 'error');
    }, [showMessage]);

    const showWarning = useCallback((message: string) => {
        showMessage(message, 'warning');
    }, [showMessage]);

    const showInfo = useCallback((message: string) => {
        showMessage(message, 'info');
    }, [showMessage]);

    const handleClose = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <SnackbarContext.Provider value={{ showMessage, showSuccess, showError, showWarning, showInfo }}>
            {children}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleClose}
                    severity={snackbar.severity}
                    sx={{
                        width: '100%',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        fontWeight: 500
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </SnackbarContext.Provider>
    );
}
