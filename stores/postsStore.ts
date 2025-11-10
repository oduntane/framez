import { create } from 'zustand';
import { postService } from '../services/postService';

interface Post {
  id: string;
  user_id: string;
  text: string;
  image_url: string | null;
  created_at: string;
}

interface PostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  setPosts: (posts: Post[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchPosts: () => Promise<void>;
  addPost: (post: Post) => void;
  removePost: (postId: string) => void;
}

export const usePostsStore = create<PostsState>((set) => ({
  posts: [],
  loading: false,
  error: null,

  setPosts: (posts) => set({ posts }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  fetchPosts: async () => {
    try {
      set({ loading: true, error: null });
      const posts = await postService.getPosts();
      set({ posts });
    } catch (error) {
      console.error('Error fetching posts:', error);
      set({ error: (error as Error).message || 'Failed to fetch posts' });
    } finally {
      set({ loading: false });
    }
  },

  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),

  removePost: (postId) =>
    set((state) => ({ posts: state.posts.filter((post) => post.id !== postId) })),
}));
