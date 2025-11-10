
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    storage: {
      from: jest.fn(),
    },
    auth: {
      getUser: jest.fn(),
    },
  },
}));

// Mock global fetch
global.fetch = jest.fn();

import { supabase } from '../../lib/supabase';
import { postService } from '../postService';

describe('postService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('uploadImage()', () => {
        it('should call supabase storage upload with correct file', async () => {
            const mockFile = {
                uri: 'file://test.jpg',
                type: 'image/jpeg',
                name: 'test.jpg',
            };

            // Mock authenticated user
            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: { id: 'user123' } },
                error: null,
            });

            // Mock fetch and arrayBuffer
            const mockArrayBuffer = new ArrayBuffer(8);
            (global.fetch as jest.Mock).mockResolvedValue({
                arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer),
            });

            const mockUpload = jest.fn().mockResolvedValue({
                data: { path: 'user123/test.jpg' },
                error: null,
            });

            const mockGetPublicUrl = jest.fn().mockReturnValue({
                data: { publicUrl: 'https://example.com/test.jpg' },
            });

            (supabase.storage.from as jest.Mock).mockReturnValue({
                upload: mockUpload,
                getPublicUrl: mockGetPublicUrl,
            });

            await postService.uploadImage(mockFile);

            expect(supabase.storage.from).toHaveBeenCalledWith('post-images');
            expect(mockUpload).toHaveBeenCalled();
        })

        it('should return public URL on success', async () => {
            const mockFile = {
                uri: 'file://test.jpg',
                type: 'image/jpeg',
                name: 'test.jpg',
            };

            // Mock authenticated user
            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: { id: 'user123' } },
                error: null,
            });

            // Mock fetch and arrayBuffer
            const mockArrayBuffer = new ArrayBuffer(8);
            (global.fetch as jest.Mock).mockResolvedValue({
                arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer),
            });

            const mockUpload = jest.fn().mockResolvedValue({
                data: { path: 'user123/test.jpg' },
                error: null,
            });

            const mockGetPublicUrl = jest.fn().mockReturnValue({
                data: { publicUrl: 'https://example.com/test.jpg' },
            });

            (supabase.storage.from as jest.Mock).mockReturnValue({
                upload: mockUpload,
                getPublicUrl: mockGetPublicUrl,
            });

            const result = await postService.uploadImage(mockFile);

            expect(result).toBe('https://example.com/test.jpg');
        })

        it('should throw error on upload failure', async () => {
            const mockFile = {
                uri: 'file://test.jpg',
                type: 'image/jpeg',
                name: 'test.jpg',
            };

            // Mock authenticated user
            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: { id: 'user123' } },
                error: null,
            });

            // Mock fetch and arrayBuffer
            const mockArrayBuffer = new ArrayBuffer(8);
            (global.fetch as jest.Mock).mockResolvedValue({
                arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer),
            });

            const mockUpload = jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Upload failed' },
            });

            const mockGetPublicUrl = jest.fn().mockReturnValue({
                data: { publicUrl: 'https://example.com/test.jpg' },
            });

            (supabase.storage.from as jest.Mock).mockReturnValue({
                upload: mockUpload,
                getPublicUrl: mockGetPublicUrl,
            });

            await expect(postService.uploadImage(mockFile)).rejects.toThrow('Upload failed');
        })
    })

    describe('createPost', () => {
        it('should call supabase insert with correct data', async () => {
            const mockPost = {
                id: '1',
                user_id: 'user1',
                text: 'Test post',
                image_url: 'https://example.com/image.jpg',
                created_at: new Date().toISOString(),
            };

            const mockInsert = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: mockPost,
                        error: null,
                    }),
                }),
            });

            (supabase.from as jest.Mock).mockReturnValue({
                insert: mockInsert,
            });

            await postService.createPost('user1', 'Test post', 'https://example.com/image.jpg');

            expect(supabase.from).toHaveBeenCalledWith('posts');
            expect(mockInsert).toHaveBeenCalledWith({
                user_id: 'user1',
                text: 'Test post',
                image_url: 'https://example.com/image.jpg',
            });
        })

        it('should return created post object', async () => {
            const mockPost = {
                id: '1',
                user_id: 'user1',
                text: 'Test post',
                image_url: null,
                created_at: new Date().toISOString(),
            };

            const mockInsert = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: mockPost,
                        error: null,
                    }),
                }),
            });

            (supabase.from as jest.Mock).mockReturnValue({
                insert: mockInsert,
            });

            const result = await postService.createPost('user1', 'Test post');

            expect(result).toEqual(mockPost);
        })

        it('should throw error if userId is missing', async () => {
            await expect(postService.createPost('', 'Test post')).rejects.toThrow(
                'User ID is required'
            );
        })

        it('should throw error if text is empty', async () => {
            await expect(postService.createPost('user1', '')).rejects.toThrow(
                'Post text is required'
            );
        })
    })

    describe('getPosts()', () => {
        it('should call supabase query', async () => {
            const mockSelect = jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                    data: [],
                    error: null,
                }),
            });

            (supabase.from as jest.Mock).mockReturnValue({
                select: mockSelect,
            });

            await postService.getPosts();

            expect(supabase.from).toHaveBeenCalledWith('posts');
            expect(mockSelect).toHaveBeenCalledWith('*, profiles(email)');
        })

        it('should return array of posts with author details', async () => {
            const mockPosts = [
                {
                    id: '1',
                    user_id: 'user1',
                    text: 'Post 1',
                    image_url: null,
                    created_at: new Date().toISOString(),
                    profiles: { email: 'user1@example.com' },
                },
                {
                    id: '2',
                    user_id: 'user2',
                    text: 'Post 2',
                    image_url: null,
                    created_at: new Date().toISOString(),
                    profiles: { email: 'user2@example.com' },
                },
            ];

            const mockSelect = jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                    data: mockPosts,
                    error: null,
                }),
            });

            (supabase.from as jest.Mock).mockReturnValue({
                select: mockSelect,
            });

            const result = await postService.getPosts();

            expect(result).toEqual(mockPosts);
            expect(result).toHaveLength(2);
            expect((result[0] as any).profiles).toBeDefined();
        })

        it('should return posts sorted by newest first', async () => {
            const mockPosts = [
                {
                    id: '2',
                    user_id: 'user2',
                    text: 'Newer post',
                    image_url: null,
                    created_at: '2024-01-02T00:00:00Z',
                    profiles: { email: 'user2@example.com' },
                },
                {
                    id: '1',
                    user_id: 'user1',
                    text: 'Older post',
                    image_url: null,
                    created_at: '2024-01-01T00:00:00Z',
                    profiles: { email: 'user1@example.com' },
                },
            ];

            const mockOrder = jest.fn().mockResolvedValue({
                data: mockPosts,
                error: null,
            });

            const mockSelect = jest.fn().mockReturnValue({
                order: mockOrder,
            });

            (supabase.from as jest.Mock).mockReturnValue({
                select: mockSelect,
            });

            await postService.getPosts();

            expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
        })

        it('should throw error on query failure', async () => {
            const mockSelect = jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch posts' },
                }),
            });

            (supabase.from as jest.Mock).mockReturnValue({
                select: mockSelect,
            });

            await expect(postService.getPosts()).rejects.toThrow('Failed to fetch posts');
        })

    })

    describe('subscribeToPostsRealtime()', () => {
        it('should set up supabase realtime channel', () => {
            const mockCallback = jest.fn();
            const mockOn = jest.fn().mockReturnValue({
                subscribe: jest.fn(),
            });
            const mockChannel = jest.fn().mockReturnValue({
                on: mockOn,
            });

            (supabase as any).channel = mockChannel;

            postService.subscribeToPostsRealtime(mockCallback);

            expect(mockChannel).toHaveBeenCalledWith('posts-changes');
            expect(mockOn).toHaveBeenCalledWith(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'posts' },
                expect.any(Function)
            );
        })


        it('should call callback on new post insert', () => {
            const mockCallback = jest.fn();
            let insertHandler: Function;

            const mockOn = jest.fn().mockImplementation((event, config, handler) => {
                insertHandler = handler;
                return {
                    subscribe: jest.fn(),
                };
            });

            const mockChannel = jest.fn().mockReturnValue({
                on: mockOn,
            });

            (supabase as any).channel = mockChannel;

            postService.subscribeToPostsRealtime(mockCallback);

            const newPost = {
                id: '1',
                user_id: 'user1',
                text: 'New post',
                image_url: null,
                created_at: new Date().toISOString(),
            };

            // Simulate a new post insert
            insertHandler({ new: newPost });

            expect(mockCallback).toHaveBeenCalledWith(newPost);
        })
    })
})