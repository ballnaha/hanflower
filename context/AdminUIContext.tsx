'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AdminUIContextType {
    isSidebarOpen: boolean; // For mobile drawer
    isCollapsed: boolean;   // For desktop collapse
    toggleSidebar: () => void;
    closeSidebar: () => void;
    toggleCollapse: () => void;
}

const AdminUIContext = createContext<AdminUIContextType | undefined>(undefined);

export function AdminUIProvider({ children }: { children: ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Persist collapse state
    useEffect(() => {
        const saved = localStorage.getItem('admin-sidebar-collapsed');
        if (saved === 'true') setIsCollapsed(true);
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    const closeSidebar = () => setIsSidebarOpen(false);
    const toggleCollapse = () => {
        setIsCollapsed(prev => {
            const newValue = !prev;
            localStorage.setItem('admin-sidebar-collapsed', String(newValue));
            return newValue;
        });
    };

    return (
        <AdminUIContext.Provider value={{
            isSidebarOpen,
            isCollapsed,
            toggleSidebar,
            closeSidebar,
            toggleCollapse
        }}>
            {children}
        </AdminUIContext.Provider>
    );
}

export function useAdminUI() {
    const context = useContext(AdminUIContext);
    if (!context) {
        throw new Error('useAdminUI must be used within an AdminUIProvider');
    }
    return context;
}
