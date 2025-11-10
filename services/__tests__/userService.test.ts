
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

import { supabase } from '../../lib/supabase';
import { userService } from '../userService';

describe('userService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getCurrentUserProfile', () => {
        it('should call supabase user query', async () => {
            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: { id: 'user1', email: 'test@example.com' } },
                error: null,
            });

            const mockSelect = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: { id: 'user1', email: 'test@example.com' },
                        error: null,
                    }),
                }),
            });

            (supabase.from as jest.Mock).mockReturnValue({
                select: mockSelect,
            });

            await userService.getCurrentUserProfile();

            expect(supabase.auth.getUser).toHaveBeenCalled();
            expect(supabase.from).toHaveBeenCalledWith('profiles');
        })

        it('should return user profile object', async () => {
            const mockProfile = {
                id: 'user1',
                email: 'test@example.com',
                created_at: new Date().toISOString(),
            };

            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: { id: 'user1' } },
                error: null,
            });

            const mockSelect = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: mockProfile,
                        error: null,
                    }),
                }),
            });

            (supabase.from as jest.Mock).mockReturnValue({
                select: mockSelect,
            });

            const result = await userService.getCurrentUserProfile();

            expect(result).toEqual(mockProfile);
        })

        it('should throw error on query failure', async () => {
            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: { id: 'user1' } },
                error: null,
            });

            const mockSelect = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Profile not found' },
                    }),
                }),
            });

            (supabase.from as jest.Mock).mockReturnValue({
                select: mockSelect,
            });

            await expect(userService.getCurrentUserProfile()).rejects.toThrow('Profile not found');
        })
    })

    describe('getUserPosts', () => {
        it('should call supabase query with userId filter', async () => {
            const mockSelect = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue({
                        data: [],
                        error: null,
                    }),
                }),
            });

            (supabase.from as jest.Mock).mockReturnValue({
                select: mockSelect,
            });

            await userService.getUserPosts('user1');

            expect(supabase.from).toHaveBeenCalledWith('posts');
            expect(mockSelect).toHaveBeenCalledWith('*, profiles(email)');
        })

        it('should return array of user\'s posts', async () => {
            const mockPosts = [
                {
                    id: '1',
                    user_id: 'user1',
                    text: 'User post 1',
                    image_url: null,
                    created_at: new Date().toISOString(),
                    profiles: { email: 'user1@example.com' },
                },
                {
                    id: '2',
                    user_id: 'user1',
                    text: 'User post 2',
                    image_url: null,
                    created_at: new Date().toISOString(),
                    profiles: { email: 'user1@example.com' },
                },
            ];

            const mockSelect = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue({
                        data: mockPosts,
                        error: null,
                    }),
                }),
            });

            (supabase.from as jest.Mock).mockReturnValue({
                select: mockSelect,
            });

            const result = await userService.getUserPosts('user1');

            expect(result).toEqual(mockPosts);
            expect(result).toHaveLength(2);
        })

        it('should return empty array if no posts', async () => {
            const mockSelect = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue({
                        data: [],
                        error: null,
                    }),
                }),
            });

            (supabase.from as jest.Mock).mockReturnValue({
                select: mockSelect,
            });

            const result = await userService.getUserPosts('user1');

            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        })

        it('should throw error if userId is missing', async () => {
            await expect(userService.getUserPosts('')).rejects.toThrow('User ID is required');
        })
    })
})