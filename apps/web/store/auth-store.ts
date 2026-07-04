import { create } from 'zustand';
import type { User } from '@hen-n-slice/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoaded: boolean;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoaded: false,

  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isLoaded: true }),
}));
