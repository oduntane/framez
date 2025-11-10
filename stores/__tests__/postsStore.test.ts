jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { postService } from '../../services/postService';
import { usePostsStore } from '../postsStore';

jest.mock('../../services/postService');

describe('PostsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Zustand store to initial state
    const store = usePostsStore.getState();
    store.setPosts([]);
    store.setLoading(false);
  });

  it('should have an initial state', () => {
    const state = usePostsStore.getState();

    expect(state.posts).toEqual([]);
    expect(state.loading).toBe(false);
  });

  describe('Actions', () => {
    test('setPosts(posts) should update posts state', () => {
      const mockPosts = [
        { id: '1', user_id: 'user1', text: 'Post 1', image_url: null, created_at: new Date().toISOString() },
        { id: '2', user_id: 'user2', text: 'Post 2', image_url: null, created_at: new Date().toISOString() },
      ];

      usePostsStore.getState().setPosts(mockPosts);

      expect(usePostsStore.getState().posts).toEqual(mockPosts);
    });

    test('setLoading(true) should set loading to true', () => {
      usePostsStore.getState().setLoading(true);

      expect(usePostsStore.getState().loading).toBe(true);
    });

    describe('fetchPosts()', () => {
      it('should call postService.getPosts()', async () => {
        (postService.getPosts as jest.Mock).mockResolvedValue([]);

        await usePostsStore.getState().fetchPosts();

        expect(postService.getPosts).toHaveBeenCalled();
      });

      it('should set posts on successful fetch', async () => {
        const mockPosts = [
          { id: '1', user_id: 'user1', text: 'Post 1', image_url: null, created_at: new Date().toISOString() },
          { id: '2', user_id: 'user2', text: 'Post 2', image_url: null, created_at: new Date().toISOString() },
        ];

        (postService.getPosts as jest.Mock).mockResolvedValue(mockPosts);

        await usePostsStore.getState().fetchPosts();

        const state = usePostsStore.getState();
        expect(state.posts).toEqual(mockPosts);
      });

      it('should set loading to true while fetching', async () => {
        (postService.getPosts as jest.Mock).mockImplementation(
          () => new Promise((resolve) => {
            // Check if loading is true during the fetch
            expect(usePostsStore.getState().loading).toBe(true);
            setTimeout(() => resolve([]), 100);
          })
        );

        await usePostsStore.getState().fetchPosts();
      });

      it('should set loading to false after fetch completes', async () => {
        (postService.getPosts as jest.Mock).mockResolvedValue([]);

        await usePostsStore.getState().fetchPosts();

        expect(usePostsStore.getState().loading).toBe(false);
      });

      it('should handle errors gracefully', async () => {
        (postService.getPosts as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

        await usePostsStore.getState().fetchPosts();

        expect(usePostsStore.getState().loading).toBe(false);
      });
    });

    describe('addPost()', () => {
      it('should add a new post to the beginning of posts array', () => {
        const existingPosts = [
          { id: '1', user_id: 'user1', text: 'Post 1', image_url: null, created_at: new Date().toISOString() },
        ];

        usePostsStore.getState().setPosts(existingPosts);

        const newPost = {
          id: '2',
          user_id: 'user2',
          text: 'New Post',
          image_url: null,
          created_at: new Date().toISOString(),
        };

        usePostsStore.getState().addPost(newPost);

        const state = usePostsStore.getState();
        expect(state.posts).toHaveLength(2);
        expect(state.posts[0]).toEqual(newPost);
      });
    });

    describe('removePost()', () => {
      it('should remove a post by id', () => {
        const mockPosts = [
          { id: '1', user_id: 'user1', text: 'Post 1', image_url: null, created_at: new Date().toISOString() },
          { id: '2', user_id: 'user2', text: 'Post 2', image_url: null, created_at: new Date().toISOString() },
        ];

        usePostsStore.getState().setPosts(mockPosts);

        usePostsStore.getState().removePost('1');

        const state = usePostsStore.getState();
        expect(state.posts).toHaveLength(1);
        expect(state.posts[0].id).toBe('2');
      });
    });
  });
});
