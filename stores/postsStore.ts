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
  setPosts: (posts: Post[]) => void;
  setLoading: (loading: boolean) => void;
  fetchPosts: () => Promise<void>;
  addPost: (post: Post) => void;
  removePost: (postId: string) => void;
}

export const usePostsStore = create<PostsState>((set) => ({
  posts: [],
  loading: false,

  setPosts: (posts) => set({ posts }),

  setLoading: (loading) => set({ loading }),

  fetchPosts: async () => {
    try {
      set({ loading: true });
      const posts = await postService.getPosts();
      set({ posts });
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      set({ loading: false });
    }
  },

  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),

  removePost: (postId) =>
    set((state) => ({ posts: state.posts.filter((post) => post.id !== postId) })),
}));
