jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useUserStore } from '../../stores/userStore';
import ProfileScreen from '../ProfileScreen';

jest.mock('../../stores/userStore');
jest.mock('../../stores/authStore');

describe('ProfileScreen', () => {
    const mockProfile = {
        id: 'user1',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
    };

    const mockUser = {
        id: 'user1',
        email: 'test@example.com',
    };

    const mockPosts = [
        {
            id: '1',
            user_id: 'user1',
            text: 'User post 1',
            image_url: null,
            created_at: new Date().toISOString(),
            profiles: { email: 'test@example.com' },
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock authStore by default
        (useAuthStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                user: mockUser,
                loading: false,
                logout: jest.fn(),
            };
            return selector ? selector(store) : store;
        });
    });

    it('should call useSotre.fetchUserProfile() on mount', async () => {
        const mockFetchUserProfile = jest.fn();

        (useUserStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                profile: null,
                posts: [],
                loading: false,
                error: null,
                fetchUserProfile: mockFetchUserProfile,
                fetchUserPosts: jest.fn(),
            };
            return selector ? selector(store) : store;
        });

        render(<ProfileScreen />);

        await waitFor(() => {
            expect(mockFetchUserProfile).toHaveBeenCalled();
        });
    })

    it('should call userStore.fetchUserPosts() on mount', async () => {
        const mockFetchUserPosts = jest.fn();

        (useUserStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                profile: null,
                posts: [],
                loading: false,
                error: null,
                fetchUserProfile: jest.fn(),
                fetchUserPosts: mockFetchUserPosts,
            };
            return selector ? selector(store) : store;
        });

        render(<ProfileScreen />);

        await waitFor(() => {
            expect(mockFetchUserPosts).toHaveBeenCalled();
        });
    })

    it('should render UserHeader component', () => {
        (useUserStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                profile: mockProfile,
                posts: [],
                loading: false,
                error: null,
                fetchUserProfile: jest.fn(),
                fetchUserPosts: jest.fn(),
            };
            return selector ? selector(store) : store;
        });

        const { getByTestId } = render(<ProfileScreen />);

        expect(getByTestId('user-avatar')).toBeTruthy();
    })

    it('should render UserPostsList component', () => {
        (useUserStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                profile: mockProfile,
                posts: mockPosts,
                loading: false,
                error: null,
                fetchUserProfile: jest.fn(),
                fetchUserPosts: jest.fn(),
            };
            return selector ? selector(store) : store;
        });

        const { getByTestId } = render(<ProfileScreen />);

        expect(getByTestId('user-posts-list')).toBeTruthy();
    })

    it('should show error message on fetch failure', () => {
        (useUserStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                profile: null,
                posts: [],
                loading: false,
                error: 'Failed to load profile',
                fetchUserProfile: jest.fn(),
                fetchUserPosts: jest.fn(),
            };
            return selector ? selector(store) : store;
        });

        const { getByText } = render(<ProfileScreen />);

        expect(getByText('Failed to load profile')).toBeTruthy();
    })

    it('should show loading state while data is loading', () => {
        (useUserStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                profile: null,
                posts: [],
                loading: true,
                error: null,
                fetchUserProfile: jest.fn(),
                fetchUserPosts: jest.fn(),
            };
            return selector ? selector(store) : store;
        });

        const { getByTestId } = render(<ProfileScreen />);

        expect(getByTestId('loading-indicator')).toBeTruthy();
    })
})