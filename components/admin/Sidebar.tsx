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
    Logout,
    Ticket,
    Truck,
    Card,
    Heart,
    Gallery,
    Eye,
    Notification as NotificationIcon
} from 'iconsax-react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAdminUI } from '@/context/AdminUIContext';
import { signOut } from 'next-auth/react';
import { useSnackbar } from '@/components/admin/AdminSnackbar';
import AdminConfirmDialog from './AdminConfirmDialog';
import { useState } from 'react';

const SIDEBAR_WIDTH = 280;
const COLLAPSED_WIDTH = 88;

const menuGroups = [
    {
        title: 'ภาพรวม',
        items: [
            { text: 'Dashboard', icon: Element3, path: '/admin' },
        ]
    },
    {
        title: 'การขาย & สินค้า',
        items: [
            { text: 'คำสั่งซื้อ', icon: ReceiptItem, path: '/admin/orders' },
            { text: 'จัดการสินค้า', icon: BoxIcon, path: '/admin/products' },
            { text: 'จัดการหมวดหมู่', icon: Category, path: '/admin/categories' },
            { text: 'จัดการ Events', icon: Gallery, path: '/admin/events' },
            { text: 'ลูกค้า (Our Customer)', icon: People, path: '/admin/our-customer' },
        ]
    },
    {
        title: 'การตลาด & ขนส่ง',
        items: [
            { text: 'ลูกค้า', icon: People, path: '/admin/customers' },
            { text: 'โค้ดส่วนลด (Coupons)', icon: Ticket, path: '/admin/coupons' },
            { text: 'จัดการโปรโมชั่น', icon: NotificationIcon, path: '/admin/settings' },
            { text: 'ค่าจัดส่ง (Shipping)', icon: Truck, path: '/admin/shipping' },
            { text: 'วิธีการชำระเงิน (Payments)', icon: Card, path: '/admin/payment' },
            { text: 'วาเลนไทน์ (Valentine)', icon: Heart, path: '/admin/valentine' },
        ]
    },
    {
        title: 'ตั้งค่าระบบ',
        items: [
            { text: 'ผู้ดูแลระบบ', icon: ProfileCircle, path: '/admin/users' },
        ]
    }
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { showSuccess, showError } = useSnackbar();
    const { isSidebarOpen, closeSidebar, isCollapsed } = useAdminUI();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            // Thoroughly clear sessions and local state
            await signOut({ redirect: false });

            // Clear all local storage related to admin if any
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('admin') || key.includes('next-auth'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));

            // Clear cookies explicitly if needed (Next-Auth handles its own but good for thoroughness)
            document.cookie.split(";").forEach((c) => {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });

            showSuccess('ออกจากระบบสำเร็จ กำลังกลับสู่หน้าแรก...');

            setTimeout(() => {
                window.location.href = '/admin/login';
            }, 1000);
        } catch (error) {
            showError('เกิดข้อผิดพลาดในการออกจากระบบ');
            setIsLoggingOut(false);
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
            <Box sx={{ flex: 1, px: isCollapsed && !isMobile ? 1 : 2, overflowY: 'auto', '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: '#EEEEEE', borderRadius: '4px' } }}>
                {menuGroups.map((group, index) => (
                    <Box key={group.title} sx={{ mb: 2 }}>
                        {(!isCollapsed || isMobile) && (
                            <Typography
                                variant="caption"
                                sx={{
                                    px: 2,
                                    mb: 1,
                                    display: 'block',
                                    color: '#AAA',
                                    fontWeight: 700,
                                    fontSize: '0.7rem',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase'
                                }}
                            >
                                {group.title}
                            </Typography>
                        )}
                        <List disablePadding>
                            {group.items.map((item) => {
                                const isActive = item.path === '/admin'
                                    ? pathname === '/admin'
                                    : pathname.startsWith(item.path);
                                const button = (
                                    <ListItemButton
                                        component={Link}
                                        href={item.path}
                                        onClick={isMobile ? closeSidebar : undefined}
                                        sx={{
                                            borderRadius: '12px',
                                            py: 1,
                                            px: isCollapsed && !isMobile ? 0 : 2,
                                            justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start',
                                            bgcolor: isActive ? '#FFF9F8' : 'transparent',
                                            color: isActive ? '#B76E79' : '#666',
                                            transition: 'all 0.2s',
                                            mb: 0.5,
                                            '&:hover': {
                                                bgcolor: isActive ? '#FFF9F8' : '#F5F5F5',
                                                color: isActive ? '#B76E79' : '#1A1A1A'
                                            }
                                        }}
                                    >
                                        <ListItemIcon sx={{
                                            minWidth: isCollapsed && !isMobile ? 0 : 36,
                                            justifyContent: 'center'
                                        }}>
                                            <item.icon
                                                size={20}
                                                color={isActive ? '#B76E79' : '#666'}
                                                variant={isActive ? 'Bulk' : 'Outline'}
                                            />
                                        </ListItemIcon>
                                        {(!isCollapsed || isMobile) && (
                                            <ListItemText
                                                primary={item.text}
                                                primaryTypographyProps={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: isActive ? 600 : 500,
                                                    sx: { whiteSpace: 'nowrap' }
                                                }}
                                            />
                                        )}
                                    </ListItemButton>
                                );

                                return (
                                    <ListItem key={item.text} disablePadding>
                                        {isCollapsed && !isMobile ? (
                                            <Tooltip title={item.text} placement="right">
                                                <Box sx={{ width: '100%' }}>{button}</Box>
                                            </Tooltip>
                                        ) : button}
                                    </ListItem>
                                );
                            })}
                        </List>
                        {index < menuGroups.length - 1 && !isCollapsed && <Box sx={{ height: 8 }} />}
                    </Box>
                ))}
            </Box>

            {/* Bottom Section */}
            <Box sx={{ p: isCollapsed && !isMobile ? 1 : 2, mt: 'auto' }}>
                <Divider sx={{ mb: 2, opacity: 0.5 }} />
                <Tooltip title={isCollapsed && !isMobile ? "ออกจากระบบ" : ""} placement="right">
                    <ListItemButton
                        onClick={() => setLogoutOpen(true)}
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
            </Box>

            <AdminConfirmDialog
                open={logoutOpen}
                onClose={() => setLogoutOpen(false)}
                onConfirm={handleLogout}
                isLoading={isLoggingOut}
                title="ยืนยันการออกจากระบบ"
                message="คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบการจัดการ?"
                confirmLabel="ออกจากระบบ"
                cancelLabel="ยกเลิก"
                icon={<Logout size={32} color="#FF4D4F" variant="Bulk" />}
            />
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
