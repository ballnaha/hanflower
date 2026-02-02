'use client';

import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import { useAdminUI } from '@/context/AdminUIContext';

const SIDEBAR_WIDTH = 280;
const COLLAPSED_WIDTH = 88;

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export default function AdminLayout({ children, title = 'Dashboard' }: AdminLayoutProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const { isCollapsed } = useAdminUI();

    const currentSidebarWidth = isMobile ? 0 : (isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8F9FB' }}>
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <Box sx={{
                flexGrow: 1,
                marginLeft: `${currentSidebarWidth}px`,
                display: 'flex',
                flexDirection: 'column',
                width: `calc(100% - ${currentSidebarWidth}px)`,
                minWidth: 0,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                {/* Header */}
                <AdminHeader title={title} />

                {/* Page Content */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: { xs: 2, sm: 3, md: 5 },
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
    );
}
