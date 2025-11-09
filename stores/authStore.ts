import { User as SupabaseUser } from '@supabase/supabase-js';
import { create } from 'zustand';
import { authService } from '../services/authService';

interface AuthState {
  user: SupabaseUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: SupabaseUser | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  setUser: (user) => set({ user }),

  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  setLoading: (loading) => set({ loading }),

  checkAuthStatus: async () => {
    try {
      const user = await authService.getCurrentUser();
      
      if (user) {
        set({ user, isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
