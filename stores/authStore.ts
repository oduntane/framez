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
  login: (email: string, password: string) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  setUser: (user) => set({ user }),

  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  setLoading: (loading) => set({ loading }),

  login: async (email: string, password: string) => {
    // support both shapes: { data, error } (supabase-like) and { user, session } (custom)
    const result = await authService.login(email, password);

    const possibleError = (result as any).error ?? null;
    if (possibleError) {
      throw possibleError;
    }

    const user =
      (result as any).data?.user ?? // supabase-like response
      (result as any).user ?? // custom response shape
      null;

    if (user) {
      set({ user: user as SupabaseUser, isAuthenticated: true });
    }
  },

  checkAuthStatus: async () => {
    try {
      const user = await authService.getCurrentUser();
      
      if (user) {
        set({ user: user as SupabaseUser, isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    }
  },

  logout: async () => {
    try {
      const { error } = await authService.logout();
      if (error) {
        throw error;
      }
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  signUp: async (email, password, username) => {
    try {
      set({ loading: true });
      const { data, error } = await authService.signUp(email, password, username);
      
      if (error) {
        throw error;
      }

      // Check if email confirmation is required
      if (data?.user && !data?.session) {
        // Email confirmation required
        throw new Error('Please check your email to confirm your account');
      }

      // Don't auto-login after signup - user will be redirected to login
      // if (data?.user && data?.session) {
      //   set({ user: data.user, isAuthenticated: true });
      // }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
