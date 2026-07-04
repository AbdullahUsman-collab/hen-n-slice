'use client';

import { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import BranchSelectorModal from '../components/BranchSelectorModal';
import ClerkSync from './clerk-sync';
import { useAppStore } from '../store/app-store';
import { useCartStore } from '../store/cart-store';

export default function AppRoot({ children }: { children: React.ReactNode }) {
  const branchId = useAppStore((s) => s.branchId);
  const clearCart = useCartStore((s) => s.clearCart);
  const itemCount = useCartStore((s) => s.items.length);
  const prevBranchId = useRef(branchId);

  useEffect(() => {
    const prev = prevBranchId.current;
    prevBranchId.current = branchId;
    if (prev && branchId && prev !== branchId && itemCount > 0) {
      clearCart();
      console.warn('[HenNSlice] Branch changed — cart cleared');
    }
  }, [branchId, clearCart, itemCount]);

  return (
    <>
      <ClerkSync />
      <Navbar />
      <BranchSelectorModal />
      {children}
    </>
  );
}
