'use client';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Box,
    Typography
} from '@mui/material';
import { Trash, Danger } from 'iconsax-react';

interface AdminConfirmDialogProps {
    open: boolean;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onClose: () => void;
    isLoading?: boolean;
    icon?: React.ReactNode;
    color?: string;
}

export default function AdminConfirmDialog({
    open,
    title = 'ยืนยันการลบ',
    message = 'คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้',
    confirmLabel = 'ลบรายการ',
    cancelLabel = 'ยกเลิก',
    onConfirm,
    onClose,
    isLoading = false,
    icon,
    color = '#FF4D4F'
}: AdminConfirmDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: '24px',
                    p: 1,
                    maxWidth: '500px',
                    width: '100%'
                }
            }}
        >
            <DialogContent sx={{ textAlign: 'center', pt: 4 }}>
                <Box sx={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    bgcolor: `${color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    mb: 3
                }}>
                    {icon || <Trash size={32} color={color} variant="Bulk" />}
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1A1A1A' }}>
                    {title}
                </Typography>

                <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>
                    {message}
                </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
                <Button
                    fullWidth
                    onClick={onClose}
                    variant="text"
                    disabled={isLoading}
                    sx={{
                        borderRadius: '12px',
                        color: '#666',
                        py: 1.5,
                        '&:hover': { bgcolor: '#F5F5F5' }
                    }}
                >
                    {cancelLabel}
                </Button>
                <Button
                    fullWidth
                    onClick={onConfirm}
                    variant="contained"
                    disabled={isLoading}
                    sx={{
                        borderRadius: '12px',
                        bgcolor: color,
                        py: 1.5,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: color, opacity: 0.9, boxShadow: 'none' }
                    }}
                >
                    {isLoading ? 'กำลังดำเนินการ...' : confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
