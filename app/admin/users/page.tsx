'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Chip,
    CircularProgress,
    Tooltip
} from '@mui/material';
import { UserAdd, Trash, Edit2, ProfileCircle } from 'iconsax-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useSnackbar } from '@/components/admin/AdminSnackbar';
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog';

interface User {
    id: string;
    username: string;
    role: string;
    createdAt: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ username: '', password: '', role: 'ADMIN' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { showMessage } = useSnackbar();

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            const data = await response.json();
            if (response.ok) {
                setUsers(data);
            } else {
                showMessage(data.error || 'Failed to fetch users', 'error');
            }
        } catch (error) {
            showMessage('Error fetching users', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenDialog = (user?: User) => {
        if (user) {
            setSelectedUser(user);
            setFormData({ username: user.username, password: '', role: user.role });
        } else {
            setSelectedUser(null);
            setFormData({ username: '', password: '', role: 'ADMIN' });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedUser(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.username || (!selectedUser && !formData.password)) {
            showMessage('กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            const url = selectedUser
                ? `/api/admin/users/${selectedUser.id}`
                : '/api/admin/users';

            const method = selectedUser ? 'PATCH' : 'POST';

            // Only send password if it's a new user or password was provided for update
            const body = { ...formData };
            if (selectedUser && !formData.password) {
                delete (body as any).password;
            }

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(selectedUser ? 'แก้ไขข้อมูลสำเร็จ' : 'สร้างผู้ดูแลระบบสำเร็จ', 'success');
                handleCloseDialog();
                fetchUsers();
            } else {
                showMessage(data.error || 'Failed to process request', 'error');
            }
        } catch (error) {
            showMessage('Error processing request', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setOpenDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                showMessage('ลบผู้ดูแลระบบสำเร็จ', 'success');
                fetchUsers();
                setOpenDeleteConfirm(false);
            } else {
                const data = await response.json();
                showMessage(data.error || 'Failed to delete user', 'error');
            }
        } catch (error) {
            showMessage('Error deleting user', 'error');
        } finally {
            setIsDeleting(false);
            setUserToDelete(null);
        }
    };

    return (
        <AdminLayout title="จัดการผู้ดูแลระบบ">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ color: '#666' }}>
                    จัดการรายชื่อผู้ที่มีสิทธิ์เข้าถึงระบบหลังบ้าน
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<UserAdd size={20} color="#FFFFFF" variant="Bulk" />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                        bgcolor: '#B76E79',
                        borderRadius: '12px',
                        px: 3,
                        '&:hover': { bgcolor: '#A45D68' },
                        textTransform: 'none',
                        boxShadow: '0 4px 12px rgba(183, 110, 121, 0.2)'
                    }}
                >
                    เพิ่มผู้ดูแล
                </Button>
            </Box>

            <Paper elevation={0} sx={{
                borderRadius: '24px',
                border: '1px solid rgba(0,0,0,0.03)',
                overflow: 'hidden',
                bgcolor: '#FFFFFF'
            }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#FAFAFA' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>ผู้ดูแลระบบ</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>บทบาท</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>วันที่สร้าง</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600, color: '#5D4037' }}>จัดการ</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                        <CircularProgress size={40} sx={{ color: '#B76E79' }} />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                        <Typography variant="body2" sx={{ color: '#AAA' }}>ไม่พบข้อมูลผู้ดูแลระบบ</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: '12px',
                                                    bgcolor: '#B76E7915',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <ProfileCircle size={24} color="#B76E79" variant="Bulk" />
                                                </Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                    {user.username}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.role}
                                                size="small"
                                                sx={{
                                                    bgcolor: '#B76E7910',
                                                    color: '#B76E79',
                                                    fontWeight: 600,
                                                    borderRadius: '8px'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ color: '#666' }}>
                                            {new Date(user.createdAt).toLocaleDateString('th-TH', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="แก้ไข">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenDialog(user)}
                                                    sx={{ color: '#D4AF37', mr: 1, '&:hover': { bgcolor: '#D4AF3710' } }}
                                                >
                                                    <Edit2 size={18} variant="Bulk" color="#D4AF37" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="ลบ">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteClick(user)}
                                                    sx={{ color: '#FF4D4F', '&:hover': { bgcolor: '#FFF1F0' } }}
                                                >
                                                    <Trash size={18} variant="Bulk" color="#FF4D4F" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} PaperProps={{
                sx: { borderRadius: '24px', p: 1, width: '100%', maxWidth: '400px' }
            }}>
                <DialogTitle sx={{ fontWeight: 700, px: 3, pt: 3 }}>
                    {selectedUser ? 'แก้ไขข้อมูลผู้ดูแล' : 'เพิ่มผู้ดูแลระบบใหม่'}
                </DialogTitle>
                <DialogContent sx={{ px: 3 }}>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            fullWidth
                            label="ชื่อผู้ใช้งาน (Username)"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                            }}
                        />
                        <TextField
                            fullWidth
                            label={selectedUser ? "รหัสผ่านใหม่ (ปล่อยว่างถ้าไม่ต้องการเปลี่ยน)" : "รหัสผ่าน (Password)"}
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseDialog} sx={{ color: '#666', borderRadius: '12px' }}>
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        variant="contained"
                        sx={{
                            bgcolor: '#B76E79',
                            borderRadius: '12px',
                            px: 4,
                            '&:hover': { bgcolor: '#A45D68' },
                            boxShadow: 'none'
                        }}
                    >
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (selectedUser ? 'บันทึก' : 'สร้างบัญชี')}
                    </Button>
                </DialogActions>
            </Dialog>

            <AdminConfirmDialog
                open={openDeleteConfirm}
                onClose={() => setOpenDeleteConfirm(false)}
                onConfirm={handleConfirmDelete}
                title="ยืนยันการลบผู้ดูแล"
                message={`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ดูแลระบบ "${userToDelete?.username}"? การกระทำนี้ไม่สามารถย้อนกลับได้`}
                isLoading={isDeleting}
            />
        </AdminLayout>
    );
}
