'use client';

import { Box, Typography, IconButton, Badge, Avatar, Breadcrumbs, Link as MuiLink, useMediaQuery, useTheme } from '@mui/material';
import { Notification, SearchNormal1, DirectRight, HambergerMenu, SidebarLeft, SidebarRight } from 'iconsax-react';
import Link from 'next/link';
import { useAdminUI } from '@/context/AdminUIContext';

export default function AdminHeader({ title }: { title: string }) {
    const { toggleSidebar, toggleCollapse, isCollapsed } = useAdminUI();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    const handleToggle = () => {
        if (isMobile) {
            toggleSidebar();
        } else {
            toggleCollapse();
        }
    };

    return (
        <Box sx={{
            height: '80px',
            bgcolor: '#FFFFFF',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 2, md: 4 },
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton
                    onClick={handleToggle}
                    sx={{
                        bgcolor: '#FFF9F8',
                        borderRadius: '12px',
                        color: '#B76E79',
                        '&:hover': { bgcolor: '#FFF1F0' }
                    }}
                >
                    {isMobile ? (
                        <HambergerMenu size={24} variant="Bulk" color="#B76E79" />
                    ) : (
                        isCollapsed ? (
                            <HambergerMenu size={24} variant="Bulk" color="#B76E79" />
                        ) : (
                            <HambergerMenu size={24} variant="Bulk" color="#B76E79" />
                        )
                    )}
                </IconButton>

                <Box>
                    <Breadcrumbs
                        aria-label="breadcrumb"
                        separator={<DirectRight size={14} color="#BBB" />}
                        sx={{ display: { xs: 'none', sm: 'flex' } }}
                    >
                        <MuiLink
                            component={Link}
                            underline="hover"
                            color="inherit"
                            href="/admin"
                            sx={{ fontSize: '0.8rem', color: '#888' }}
                        >
                            Admin
                        </MuiLink>
                        <Typography color="text.primary" sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1A1A1A' }}>
                            {title}
                        </Typography>
                    </Breadcrumbs>
                    <Typography
                        variant={isMobile ? "h6" : "h5"}
                        sx={{ fontWeight: 700, color: '#1A1A1A', mt: isMobile ? 0 : 0.5 }}
                    >
                        {title}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 3 } }}>
                {/* Search - Hide on very small screens */}
                <IconButton sx={{ bgcolor: '#F9F9F9', borderRadius: '12px', display: { xs: 'none', sm: 'flex' } }}>
                    <SearchNormal1 size={20} color="#666" />
                </IconButton>

                {/* Notifications */}
                <IconButton sx={{ bgcolor: '#F9F9F9', borderRadius: '12px' }}>
                    <Badge badgeContent={4} color="error" sx={{ '& .MuiBadge-badge': { backgroundColor: '#B76E79' } }}>
                        <Notification size={20} color="#666" />
                    </Badge>
                </IconButton>

                <Box sx={{ width: '1px', height: '30px', bgcolor: '#EEE', mx: { xs: 0.5, sm: 1 } }} />

                {/* User Profile */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
                    <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2 }}>
                            Admin User
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#888' }}>
                            Main Administrator
                        </Typography>
                    </Box>
                    <Avatar
                        sx={{
                            width: { xs: 32, sm: 40 },
                            height: { xs: 32, sm: 40 },
                            bgcolor: '#B76E79',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            border: '2px solid #FFF9F8'
                        }}
                    >
                        AD
                    </Avatar>
                </Box>
            </Box>
        </Box>
    );
}
