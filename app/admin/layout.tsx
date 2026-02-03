import { AdminUIProvider } from '@/context/AdminUIContext';

export default function AdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminUIProvider>
            {children}
        </AdminUIProvider>
    );
}
