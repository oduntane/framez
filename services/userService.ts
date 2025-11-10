import { supabase } from '../lib/supabase';
import { Post } from '../types/post';

interface Profile {
  id: string;
  email: string;
  display_name?: string;
  created_at: string;
}

export const userService = {
  getCurrentUserProfile: async (): Promise<Profile> => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      // If auth error, user session is invalid - throw to trigger logout
      throw new Error(authError?.message || 'User not authenticated');
    }

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Try to get existing profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // Some error other than "not found"
      throw new Error(error.message);
    }

    // If profile exists, update display_name if needed and return
    if (data) {
      const authDisplayName = user.user_metadata?.display_name;
      if (authDisplayName && data.display_name !== authDisplayName) {
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .update({ display_name: authDisplayName })
          .eq('id', user.id)
          .select()
          .single();
        
        if (updatedProfile) {
          return updatedProfile;
        }
      }
      return data;
    }

    // Profile doesn't exist, create it with display name from user metadata
    const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';
    
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        display_name: displayName,
      })
      .select()
      .single();

    if (insertError) {
      // If insert failed due to duplicate key, try fetching again
      // (race condition - profile was created by trigger)
      if (insertError.code === '23505') {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (existingProfile) {
          return existingProfile;
        }
      }
      throw new Error(insertError.message);
    }

    return newProfile;
  },

  getUserPosts: async (userId: string): Promise<Post[]> => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(email, display_name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },
};
