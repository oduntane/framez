import { supabase } from '../lib/supabase';

interface ImageFile {
  uri: string;
  type: string;
  name: string;
}

interface Post {
  id: string;
  user_id: string;
  text: string;
  image_url: string | null;
  created_at: string;
}

export const postService = {
  uploadImage: async (file: ImageFile): Promise<string> => {
    // Get current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to upload images');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`; // Scope to user ID

    // Read file as ArrayBuffer for React Native
    const response = await fetch(file.uri);
    const arrayBuffer = await response.arrayBuffer();

    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data: urlData } = supabase.storage
      .from('post-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },

  createPost: async (userId: string, text: string, imageUrl?: string): Promise<Post> => {
    if (!userId || userId.trim() === '') {
      throw new Error('User ID is required');
    }

    if (!text || text.trim() === '') {
      throw new Error('Post text is required');
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        text,
        image_url: imageUrl || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  getPosts: async (): Promise<Post[]> => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(email)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },

  subscribeToPostsRealtime: (callback: (post: Post) => void) => {
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          callback(payload.new as Post);
        }
      )
      .subscribe();

    return channel;
  },
};
