'use client';

import { Box, Container } from '@mui/material';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import { SnackbarProvider } from './AdminSnackbar';

const SIDEBAR_WIDTH = 280;

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export default function AdminLayout({ children, title = 'Dashboard' }: AdminLayoutProps) {
    return (
        <SnackbarProvider>
            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8F9FB' }}>
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content Area */}
                <Box sx={{
                    flexGrow: 1,
                    marginLeft: `${SIDEBAR_WIDTH}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    width: `calc(100% - ${SIDEBAR_WIDTH}px)`
                }}>
                    {/* Header */}
                    <AdminHeader title={title} />

                    {/* Page Content */}
                    <Box
                        component="main"
                        sx={{
                            flexGrow: 1,
                            p: { xs: 3, md: 5 },
                            animation: 'fadeIn 0.5s ease-out',
                            '@keyframes fadeIn': {
                                from: { opacity: 0, transform: 'translateY(10px)' },
                                to: { opacity: 1, transform: 'translateY(0)' }
                            }
                        }}
                    >
                        <Container maxWidth="xl" sx={{ px: '0 !important' }}>
                            {children}
                        </Container>
                    </Box>

                </Box>
            </Box>
        </SnackbarProvider>
    );
}
