
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { act, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { postService } from '../../services/postService';
import { usePostsStore } from '../../stores/postsStore';
import FeedScreen from '../FeedScreen';

jest.mock('../../stores/postsStore');
jest.mock('../../services/postService');

describe('FeedScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should call postStore.fetchPosts() on mount', () => {
        const mockFetchPosts = jest.fn();

        (usePostsStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                posts: [],
                loading: false,
                error: null,
                fetchPosts: mockFetchPosts,
            };
            return selector ? selector(store) : store;
        });

        render(<FeedScreen />);

        expect(mockFetchPosts).toHaveBeenCalled();
    })

    it('should call postsStore.subscribeToRealtimeUpdates() on mount', () => {
        const mockUnsubscribe = jest.fn();
        (postService.subscribeToPostsRealtime as jest.Mock).mockReturnValue({
            unsubscribe: mockUnsubscribe,
        });

        (usePostsStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                posts: [],
                loading: false,
                error: null,
                fetchPosts: jest.fn(),
                addPost: jest.fn(),
            };
            return selector ? selector(store) : store;
        });

        render(<FeedScreen />);

        expect(postService.subscribeToPostsRealtime).toHaveBeenCalled();
    })

    it('should render FlatList with PostCard items', () => {
        const mockPosts = [
            {
                id: '1',
                user_id: 'user1',
                text: 'First post',
                image_url: null,
                created_at: new Date().toISOString(),
                profiles: { email: 'user1@example.com' },
            },
            {
                id: '2',
                user_id: 'user2',
                text: 'Second post',
                image_url: null,
                created_at: new Date().toISOString(),
                profiles: { email: 'user2@example.com' },
            },
        ];

        (usePostsStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                posts: mockPosts,
                loading: false,
                error: null,
                fetchPosts: jest.fn(),
            };
            return selector ? selector(store) : store;
        });

        const { getByText } = render(<FeedScreen />);

        expect(getByText('First post')).toBeTruthy();
        expect(getByText('Second post')).toBeTruthy();
    })

    it('should show loading spinner while fetchinng posts', () => {
        (usePostsStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                posts: [],
                loading: true,
                error: null,
                fetchPosts: jest.fn(),
            };
            return selector ? selector(store) : store;
        });

        const { getByTestId } = render(<FeedScreen />);

        expect(getByTestId('loading-indicator')).toBeTruthy();
    })

    it('should show error message on fetch failure', () => {
        (usePostsStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                posts: [],
                loading: false,
                error: 'Failed to fetch posts',
                fetchPosts: jest.fn(),
            };
            return selector ? selector(store) : store;
        });

        const { getByText } = render(<FeedScreen />);

        expect(getByText('Failed to fetch posts')).toBeTruthy();
    })

    it('should show empty state message when no posts exist', () => {
        (usePostsStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                posts: [],
                loading: false,
                error: null,
                fetchPosts: jest.fn(),
            };
            return selector ? selector(store) : store;
        });

        const { getByText } = render(<FeedScreen />);

        expect(getByText(/no posts yet/i)).toBeTruthy();
    })

    it('should call fetchPosts() again on pull-to-refresh', async () => {
        const mockFetchPosts = jest.fn().mockResolvedValue(undefined);

        (usePostsStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                posts: [],
                loading: false,
                error: null,
                fetchPosts: mockFetchPosts,
            };
            return selector ? selector(store) : store;
        });

        const { UNSAFE_root } = render(<FeedScreen />);

        // Find the RefreshControl and trigger onRefresh
        const refreshControl = UNSAFE_root.findAllByProps({ testID: 'posts-list' })[0]
            .findByProps({ refreshing: false });
        
        await act(async () => {
            await refreshControl.props.onRefresh();
        });

        await waitFor(() => {
            expect(mockFetchPosts).toHaveBeenCalledTimes(2); // Once on mount, once on refresh
        });
    })

    it('should unsubscribe from realtime on unmount', () => {
        const mockUnsubscribe = jest.fn();
        (postService.subscribeToPostsRealtime as jest.Mock).mockReturnValue({
            unsubscribe: mockUnsubscribe,
        });

        (usePostsStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                posts: [],
                loading: false,
                error: null,
                fetchPosts: jest.fn(),
                addPost: jest.fn(),
            };
            return selector ? selector(store) : store;
        });

        const { unmount } = render(<FeedScreen />);

        unmount();

        expect(mockUnsubscribe).toHaveBeenCalled();
    })
})