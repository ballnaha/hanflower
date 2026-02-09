import { AdminUIProvider } from '@/context/AdminUIContext';
import { SessionProvider } from 'next-auth/react';
import { SnackbarProvider } from '@/components/admin/AdminSnackbar';

export default function AdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider>
            <AdminUIProvider>
                <SnackbarProvider>
                    {children}
                </SnackbarProvider>
            </AdminUIProvider>
        </SessionProvider>
    );
}
