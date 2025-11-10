import { supabase } from '../lib/supabase';

interface Post {
  id: string;
  user_id: string;
  content?: string | null;
  created_at?: string | null;
  profiles?: {
    email?: string | null;
  } | null;
}

interface Profile {
  id: string;
  email: string;
  created_at: string;
}

export const userService = {
  getCurrentUserProfile: async (): Promise<Profile> => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(authError?.message || 'User not authenticated');
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  getUserPosts: async (userId: string): Promise<Post[]> => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(email)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },
};
