import { create } from 'zustand';
import { userService } from '../services/userService';

interface UserPost {
  id: string;
  userId: string;
  title: string;
  body?: string;
  created_at: string;
}

interface Profile {
  id: string;
  email: string;
  created_at: string;
}

interface UserState {
  profile: Profile | null;
  posts: UserPost[];
  loading: boolean;
  error: string | null;
  setProfile: (profile: Profile | null) => void;
  setPosts: (posts: UserPost[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchUserProfile: () => Promise<void>;
  fetchUserPosts: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  posts: [],
  loading: false,
  error: null,

  setProfile: (profile) => set({ profile }),

  setPosts: (posts) => set({ posts }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  fetchUserProfile: async () => {
    set({ loading: true, error: null });
    try {
      const profile = await userService.getCurrentUserProfile();
      set({ profile, loading: false });
    } catch (error: any) {
      console.error('Error fetching user profile:', error);

      // If auth session is missing, logout the user
      if (
        error.message?.includes('Auth session missing') ||
        error.message?.includes('not authenticated')
      ) {
        const { useAuthStore } = await import('./authStore');
        await useAuthStore.getState().logout();
      }

      set({
        error: error.message || 'Failed to fetch profile',
        loading: false,
      });
    }
  },

  fetchUserPosts: async () => {
    const { profile } = get();
    if (!profile) return;

    try {
      set({ loading: true, error: null });
      const posts = await userService.getUserPosts(profile.id);
      // Cast to local UserPost[] to avoid cross-module "Post" type name conflict.
      set({ posts: posts as unknown as UserPost[] });
    } catch (error) {
      console.error('Error fetching user posts:', error);
      set({ error: (error as Error).message || 'Failed to load posts' });
    } finally {
      set({ loading: false });
    }
  },
}));
