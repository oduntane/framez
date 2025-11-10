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
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // Convert file URI to blob for upload
    const response = await fetch(file.uri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(filePath, blob, {
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
};
