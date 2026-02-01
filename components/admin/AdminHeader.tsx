'use client';

import { Box, Typography, IconButton, Badge, Avatar, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Notification, SearchNormal1, DirectRight } from 'iconsax-react';
import Link from 'next/link';

export default function AdminHeader({ title }: { title: string }) {
    return (
        <Box sx={{
            height: '80px',
            bgcolor: '#FFFFFF',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 4,
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
            <Box>
                <Breadcrumbs aria-label="breadcrumb" separator={<DirectRight size={14} color="#BBB" />}>
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
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1A1A1A', mt: 0.5 }}>
                    {title}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {/* Search */}
                <IconButton sx={{ bgcolor: '#F9F9F9', borderRadius: '12px' }}>
                    <SearchNormal1 size={20} color="#666" />
                </IconButton>

                {/* Notifications */}
                <IconButton sx={{ bgcolor: '#F9F9F9', borderRadius: '12px' }}>
                    <Badge badgeContent={4} color="error" sx={{ '& .MuiBadge-badge': { backgroundColor: '#B76E79' } }}>
                        <Notification size={20} color="#666" />
                    </Badge>
                </IconButton>

                <Box sx={{ width: '1px', height: '30px', bgcolor: '#EEE', mx: 1 }} />

                {/* User Profile */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
                    <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2 }}>
                            Admin User
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#888' }}>
                            Main Administrator
                        </Typography>
                    </Box>
                    <Avatar
                        sx={{
                            width: 40,
                            height: 40,
                            bgcolor: '#B76E79',
                            fontWeight: 700,
                            fontSize: '0.9rem',
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
