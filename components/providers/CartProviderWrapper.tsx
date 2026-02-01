'use client';

import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';
import { ReactNode } from 'react';

export default function CartProviderWrapper({ children }: { children: ReactNode }) {
    return (
        <CartProvider>
            {children}
            <CartDrawer />
        </CartProvider>
    );
}
