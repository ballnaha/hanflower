import { AdminUIProvider } from '@/context/AdminUIContext';
import { SessionProvider } from 'next-auth/react';

export default function AdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider>
            <AdminUIProvider>
                {children}
            </AdminUIProvider>
        </SessionProvider>
    );
}
