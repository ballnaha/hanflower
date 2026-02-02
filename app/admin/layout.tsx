'use client';

import { SnackbarProvider } from '@/components/admin/AdminSnackbar';
import { AdminUIProvider } from '@/context/AdminUIContext';

export default function AdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminUIProvider>
            <SnackbarProvider>
                {children}
            </SnackbarProvider>
        </AdminUIProvider>
    );
}
