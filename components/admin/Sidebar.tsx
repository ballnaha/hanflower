'use client';

import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import {
    Element3,
    Box as BoxIcon,
    Category,
    ReceiptItem,
    People,
    Setting2,
    Shop,
    Logout
} from 'iconsax-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

const SIDEBAR_WIDTH = 280;

const menuItems = [
    { text: 'Dashboard', icon: Element3, path: '/admin' },
    { text: 'จัดการสินค้า', icon: BoxIcon, path: '/admin/products' },
    { text: 'จัดการหมวดหมู่', icon: Category, path: '/admin/collections' },
    { text: 'คำสั่งซื้อ', icon: ReceiptItem, path: '/admin/orders' },
    { text: 'ลูกค้า', icon: People, path: '/admin/customers' },
    { text: 'ตั้งค่าร้านค้า', icon: Setting2, path: '/admin/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        // Clear authentication cookie/session here
        // For now, redirect to login
        router.push('/admin/login');
    };

    return (
        <Box sx={{
            width: SIDEBAR_WIDTH,
            height: '100vh',
            bgcolor: '#FFFFFF',
            borderRight: '1px solid rgba(0,0,0,0.05)',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1100
        }}>
            {/* Logo Section */}
            <Box sx={{ p: 4, mb: 2 }}>
                <Link href="/admin" style={{ textDecoration: 'none' }}>
                    <Box sx={{ position: 'relative', width: '150px', height: '50px', mb: 1 }}>
                        <Image
                            src="/images/logo5.png"
                            alt="HanFlower Logo"
                            fill
                            style={{ objectFit: 'contain' }}
                        />
                    </Box>
                    <Typography variant="caption" sx={{
                        color: '#B76E79',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        fontSize: '0.65rem',
                        textTransform: 'uppercase'
                    }}>
                        Administrative Portal
                    </Typography>
                </Link>
            </Box>

            {/* Navigation Section */}
            <Box sx={{ flex: 1, px: 2 }}>
                <List>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                                <ListItemButton
                                    component={Link}
                                    href={item.path}
                                    sx={{
                                        borderRadius: '12px',
                                        py: 1.5,
                                        bgcolor: isActive ? '#FFF9F8' : 'transparent',
                                        color: isActive ? '#B76E79' : '#666',
                                        '&:hover': {
                                            bgcolor: isActive ? '#FFF9F8' : '#F5F5F5',
                                            color: isActive ? '#B76E79' : '#1A1A1A'
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 45 }}>
                                        <item.icon
                                            size={22}
                                            color={isActive ? '#B76E79' : '#666'}
                                            variant={isActive ? 'Bulk' : 'Outline'}
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontSize: '0.9rem',
                                            fontWeight: isActive ? 600 : 500
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>

            {/* Bottom Section */}
            <Box sx={{ p: 2 }}>
                <Divider sx={{ mb: 2, opacity: 0.5 }} />
                <ListItemButton
                    onClick={handleLogout}
                    sx={{
                        borderRadius: '12px',
                        py: 1.5,
                        color: '#FF4D4F',
                        '&:hover': {
                            bgcolor: '#FFF1F0',
                        }
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 45 }}>
                        <Logout size={22} color="#FF4D4F" />
                    </ListItemIcon>
                    <ListItemText
                        primary="ออกจากระบบ"
                        primaryTypographyProps={{
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}
                    />
                </ListItemButton>

                <Box sx={{ mt: 3, p: 2, bgcolor: '#FAFAFA', borderRadius: '12px', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#AAA', display: 'block' }}>
                        HanFlower v1.0.0
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
