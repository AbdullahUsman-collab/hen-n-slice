'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/auth-store';

export function useAuthGuard() {
  const router = useRouter();
  const isLoaded = useAuthStore((s) => s.isLoaded);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isLoaded, isAuthenticated, router]);
}

export function useAdminGuard() {
  const router = useRouter();
  const isLoaded = useAuthStore((s) => s.isLoaded);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.user?.role);

  useEffect(() => {
    if (isLoaded && (!isAuthenticated || (role !== 'branch_admin' && role !== 'super_admin'))) {
      router.push('/');
    }
  }, [isLoaded, isAuthenticated, role, router]);
}
