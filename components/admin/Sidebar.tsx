'use client';

import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Drawer, useMediaQuery, useTheme, Tooltip } from '@mui/material';
import {
    Element3,
    Box as BoxIcon,
    Category,
    ReceiptItem,
    People,
    ProfileCircle,
    Setting2,
    Logout
} from 'iconsax-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSnackbar } from './AdminSnackbar';
import { useAdminUI } from '@/context/AdminUIContext';

const SIDEBAR_WIDTH = 280;
const COLLAPSED_WIDTH = 88;

const menuItems = [
    { text: 'Dashboard', icon: Element3, path: '/admin' },
    { text: 'จัดการสินค้า', icon: BoxIcon, path: '/admin/products' },
    { text: 'จัดการหมวดหมู่', icon: Category, path: '/admin/categories' },
    { text: 'คำสั่งซื้อ', icon: ReceiptItem, path: '/admin/orders' },
    { text: 'ลูกค้า', icon: People, path: '/admin/customers' },
    { text: 'จัดการผู้ดูแลระบบ', icon: ProfileCircle, path: '/admin/users' },
    { text: 'ตั้งค่าร้านค้า', icon: Setting2, path: '/admin/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { showMessage } = useSnackbar();
    const { isSidebarOpen, closeSidebar, isCollapsed } = useAdminUI();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    const handleLogout = async () => {
        if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
            try {
                const response = await fetch('/api/admin/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (response.ok) {
                    showMessage('ออกจากระบบสำเร็จ', 'success');
                    router.push('/admin/login');
                    router.refresh();
                } else {
                    showMessage('เกิดข้อผิดพลาดในการออกจากระบบ', 'error');
                }
            } catch (error) {
                showMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
            }
        }
    };

    const sidebarContent = (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#FFFFFF',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden'
        }}>
            {/* Logo Section */}
            <Box sx={{
                p: isCollapsed && !isMobile ? 2 : 4,
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: isCollapsed && !isMobile ? 'center' : 'flex-start',
                transition: 'all 0.3s'
            }}>
                <Link href="/admin" style={{ textDecoration: 'none' }} onClick={isMobile ? closeSidebar : undefined}>
                    <Box sx={{
                        position: 'relative',
                        width: isCollapsed && !isMobile ? '40px' : '150px',
                        height: isCollapsed && !isMobile ? '40px' : '50px',
                        mb: 1,
                        transition: 'all 0.3s'
                    }}>
                        <Image
                            src={isCollapsed && !isMobile ? "/favicon.ico" : "/images/logo5.png"}
                            alt="HanFlower Logo"
                            fill
                            style={{ objectFit: 'contain' }}
                        />
                    </Box>
                    {(!isCollapsed || isMobile) && (
                        <Typography variant="caption" sx={{
                            color: '#B76E79',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            fontSize: '0.65rem',
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap'
                        }}>
                            Administrative Portal
                        </Typography>
                    )}
                </Link>
            </Box>

            {/* Navigation Section */}
            <Box sx={{ flex: 1, px: isCollapsed && !isMobile ? 1 : 2 }}>
                <List>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        const button = (
                            <ListItemButton
                                component={Link}
                                href={item.path}
                                onClick={isMobile ? closeSidebar : undefined}
                                sx={{
                                    borderRadius: '12px',
                                    py: 1.5,
                                    px: isCollapsed && !isMobile ? 0 : 2,
                                    justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start',
                                    bgcolor: isActive ? '#FFF9F8' : 'transparent',
                                    color: isActive ? '#B76E79' : '#666',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        bgcolor: isActive ? '#FFF9F8' : '#F5F5F5',
                                        color: isActive ? '#B76E79' : '#1A1A1A'
                                    }
                                }}
                            >
                                <ListItemIcon sx={{
                                    minWidth: isCollapsed && !isMobile ? 0 : 45,
                                    justifyContent: 'center'
                                }}>
                                    <item.icon
                                        size={22}
                                        color={isActive ? '#B76E79' : '#666'}
                                        variant={isActive ? 'Bulk' : 'Outline'}
                                    />
                                </ListItemIcon>
                                {(!isCollapsed || isMobile) && (
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontSize: '0.9rem',
                                            fontWeight: isActive ? 600 : 500,
                                            sx: { whiteSpace: 'nowrap' }
                                        }}
                                    />
                                )}
                            </ListItemButton>
                        );

                        return (
                            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                                {isCollapsed && !isMobile ? (
                                    <Tooltip title={item.text} placement="right">
                                        <Box sx={{ width: '100%' }}>{button}</Box>
                                    </Tooltip>
                                ) : button}
                            </ListItem>
                        );
                    })}
                </List>
            </Box>

            {/* Bottom Section */}
            <Box sx={{ p: isCollapsed && !isMobile ? 1 : 2 }}>
                <Divider sx={{ mb: 2, opacity: 0.5 }} />
                <Tooltip title={isCollapsed && !isMobile ? "ออกจากระบบ" : ""} placement="right">
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            borderRadius: '12px',
                            py: 1.5,
                            px: isCollapsed && !isMobile ? 0 : 2,
                            justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start',
                            color: '#FF4D4F',
                            '&:hover': {
                                bgcolor: '#FFF1F0',
                            }
                        }}
                    >
                        <ListItemIcon sx={{
                            minWidth: isCollapsed && !isMobile ? 0 : 45,
                            justifyContent: 'center'
                        }}>
                            <Logout size={22} color="#FF4D4F" />
                        </ListItemIcon>
                        {(!isCollapsed || isMobile) && (
                            <ListItemText
                                primary="ออกจากระบบ"
                                primaryTypographyProps={{
                                    fontSize: '0.9rem',
                                    fontWeight: 600
                                }}
                            />
                        )}
                    </ListItemButton>
                </Tooltip>

                {(!isCollapsed || isMobile) && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: '#FAFAFA', borderRadius: '12px', textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#AAA', display: 'block' }}>
                            v1.0.0
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );

    if (isMobile) {
        return (
            <Drawer
                anchor="left"
                open={isSidebarOpen}
                onClose={closeSidebar}
                PaperProps={{
                    sx: { width: SIDEBAR_WIDTH, border: 'none' }
                }}
            >
                {sidebarContent}
            </Drawer>
        );
    }

    return (
        <Box sx={{
            width: isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH,
            height: '100vh',
            bgcolor: '#FFFFFF',
            borderRight: '1px solid rgba(0,0,0,0.05)',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1100,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
            {sidebarContent}
        </Box>
    );
}
