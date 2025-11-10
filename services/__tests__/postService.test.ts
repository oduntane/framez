
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

            // Mock fetch and blob
            const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
            (global.fetch as jest.Mock).mockResolvedValue({
                blob: jest.fn().mockResolvedValue(mockBlob),
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

            // Mock fetch and blob
            const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
            (global.fetch as jest.Mock).mockResolvedValue({
                blob: jest.fn().mockResolvedValue(mockBlob),
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

            // Mock fetch and blob
            const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
            (global.fetch as jest.Mock).mockResolvedValue({
                blob: jest.fn().mockResolvedValue(mockBlob),
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
})