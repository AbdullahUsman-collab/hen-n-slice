'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useUser, useAuth } from '@clerk/nextjs';
import { useAppStore } from '../store/app-store';
import { useCartStore } from '../store/cart-store';
import { useAuthStore } from '../store/auth-store';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Deals', href: '/deals' },
  { label: 'Menu', href: '/menu' },
  { label: 'Combos', href: '/menu/combos' },
  { label: 'Sides', href: '/menu/sides' },
  { label: 'Beverages', href: '/menu/beverages' },
  { label: 'About Us', href: '/about' },
];

export default function Navbar() {
  const { branchName, deliveryArea, orderType, hasSelectedBranch, openModal } = useAppStore();
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const { isSignedIn, isLoaded: clerkLoaded } = useUser();
  const role = useAuthStore((s) => s.user?.role);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const isAdmin = clerkLoaded && isSignedIn && (role === 'branch_admin' || role === 'super_admin');

  return (
    <header className="bg-brand-purple text-text-on-brand sticky top-0 z-50">
      <div className="mx-auto flex max-w-container items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gold text-sm font-bold text-text-primary">
            H&S
          </div>
          <span className="font-heading text-xl font-bold">Hen N Slice</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-opacity hover:opacity-80"
            >
              {link.label}
            </Link>
          ))}
          {mounted && isAdmin && (
            <div className="flex items-center gap-2">
              <Link
                href="/admin/orders"
                className="rounded-full bg-brand-gold/20 px-3 py-1 text-xs font-semibold text-brand-gold transition-colors hover:bg-brand-gold/30"
              >
                Orders
              </Link>
              <Link
                href="/admin/staff"
                className="rounded-full bg-brand-gold/20 px-3 py-1 text-xs font-semibold text-brand-gold transition-colors hover:bg-brand-gold/30"
              >
                Staff
              </Link>
            </div>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {mounted && hasSelectedBranch && branchName && (
            <button
              onClick={openModal}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/20"
            >
              <span>
                {orderType === 'delivery' ? '🚚' : '🏪'}
              </span>
              <span className="max-w-[120px] truncate md:max-w-[180px]">
                {orderType === 'delivery'
                  ? deliveryArea
                    ? `Delivering to: ${deliveryArea}`
                    : `Delivering from: ${branchName}`
                  : `Pick up at: ${branchName}`}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          )}

          <button className="transition-opacity hover:opacity-80" aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
          <ProfileSection />
          <Link href="/cart" className="relative transition-opacity hover:opacity-80" aria-label="Cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            {mounted && cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-orange text-[10px] font-bold text-white">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

function ProfileSection() {
  const { isLoaded: clerkLoaded, isSignedIn, user: clerkUser } = useUser();
  const { signOut } = useAuth();
  const dbUser = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!mounted) {
    return (
      <button className="transition-opacity hover:opacity-80" aria-label="Profile">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>
    );
  }

  if (!clerkLoaded || !isSignedIn) {
    return (
      <Link href="/auth" className="transition-opacity hover:opacity-80" aria-label="Sign In">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </Link>
    );
  }

  const displayName = dbUser?.full_name ?? clerkUser?.fullName ?? clerkUser?.primaryEmailAddress?.emailAddress ?? 'User';
  const initial = (dbUser?.full_name ?? clerkUser?.fullName ?? clerkUser?.primaryEmailAddress?.emailAddress ?? '?').charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold text-sm font-bold text-text-primary transition-opacity hover:opacity-80"
        aria-label="Profile"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-md border border-border-light bg-surface-card py-1 shadow-lg">
          <div className="border-b border-border-light px-4 py-2 text-xs text-text-muted">
            {displayName}
          </div>
          <Link
            href="/orders"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-text-primary transition-colors hover:bg-surface-background"
          >
            My Orders
          </Link>
          <button
            onClick={() => { signOut(); setOpen(false); }}
            className="block w-full px-4 py-2 text-left text-sm text-text-primary transition-colors hover:bg-surface-background"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
