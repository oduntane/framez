
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { postService } from '../../services/postService';
import { useAuthStore } from '../../stores/authStore';
import { usePostsStore } from '../../stores/postsStore';
import CreatePostScreen from '../CreatePostScreen';

jest.mock('../../services/postService');
jest.mock('../../stores/authStore');
jest.mock('../../stores/postsStore');

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
}));

describe('CreatePostScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        (useAuthStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                user: { id: 'user1', email: 'test@example.com' },
            };
            return selector ? selector(store) : store;
        });

        (usePostsStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                addPost: jest.fn(),
            };
            return selector ? selector(store) : store;
        });
    });

    it('should render PostForm component', () => {
        const { getByPlaceholderText } = render(<CreatePostScreen />);

        expect(getByPlaceholderText("What's on your mind?")).toBeTruthy();
    })

    it('should call postService.uploadImage() when image is selected', async () => {
        const mockImageUri = 'file://test-image.jpg';
        const mockPublicUrl = 'https://example.com/image.jpg';

        (postService.uploadImage as jest.Mock).mockResolvedValue(mockPublicUrl);
        (postService.createPost as jest.Mock).mockResolvedValue({
            id: '1',
            user_id: 'user1',
            text: 'Test post',
            image_url: mockPublicUrl,
            created_at: new Date().toISOString(),
        });

        const { getByPlaceholderText, getByText } = render(<CreatePostScreen />);

        fireEvent.changeText(getByPlaceholderText("What's on your mind?"), 'Test post');
        
        // Simulate image selection
        fireEvent.press(getByText('Select Image'));

        fireEvent.press(getByText('Post'));

        await waitFor(() => {
            expect(postService.uploadImage).toHaveBeenCalledWith({
                uri: expect.any(String),
                type: expect.any(String),
                name: expect.any(String),
            });
        });
    })

    it('should call postService.createPost() when form submitted', async () => {
        const mockPost = {
            id: '1',
            user_id: 'user1',
            text: 'Test post content',
            image_url: null,
            created_at: new Date().toISOString(),
        };

        (postService.createPost as jest.Mock).mockResolvedValue(mockPost);

        const { getByPlaceholderText, getByText } = render(<CreatePostScreen />);

        fireEvent.changeText(getByPlaceholderText("What's on your mind?"), 'Test post content');
        fireEvent.press(getByText('Post'));

        await waitFor(() => {
            expect(postService.createPost).toHaveBeenCalledWith('user1', 'Test post content', undefined);
        });
    })

    it('should call postsStore.addPost() after successful post creation', async () => {
        const mockPost = {
            id: '1',
            user_id: 'user1',
            text: 'Test post',
            image_url: null,
            created_at: new Date().toISOString(),
        };

        const mockAddPost = jest.fn();
        (usePostsStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                addPost: mockAddPost,
            };
            return selector ? selector(store) : store;
        });

        (postService.createPost as jest.Mock).mockResolvedValue(mockPost);

        const { getByPlaceholderText, getByText } = render(<CreatePostScreen />);

        fireEvent.changeText(getByPlaceholderText("What's on your mind?"), 'Test post');
        fireEvent.press(getByText('Post'));

        await waitFor(() => {
            expect(mockAddPost).toHaveBeenCalledWith(mockPost);
        });
    })

    it('should navigate back to FeedScreen after successful post', async () => {
        const mockPost = {
            id: '1',
            user_id: 'user1',
            text: 'Test post',
            image_url: null,
            created_at: new Date().toISOString(),
        };

        (postService.createPost as jest.Mock).mockResolvedValue(mockPost);

        const { getByPlaceholderText, getByText } = render(<CreatePostScreen />);

        fireEvent.changeText(getByPlaceholderText("What's on your mind?"), 'Test post');
        fireEvent.press(getByText('Post'));

        await waitFor(() => {
            expect(mockGoBack).toHaveBeenCalled();
        });
    })

    it('should display error message on post creation failure', async () => {
        (postService.createPost as jest.Mock).mockRejectedValue(new Error('Failed to create post'));

        const { getByPlaceholderText, getByText, findByText } = render(<CreatePostScreen />);

        fireEvent.changeText(getByPlaceholderText("What's on your mind?"), 'Test post');
        fireEvent.press(getByText('Post'));

        const errorMessage = await findByText('Failed to create post');
        expect(errorMessage).toBeTruthy();
    })

    it('should show loading indicator while submitting', async () => {
        (postService.createPost as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        const { getByPlaceholderText, getByText, getByTestId } = render(<CreatePostScreen />);

        fireEvent.changeText(getByPlaceholderText("What's on your mind?"), 'Test post');
        fireEvent.press(getByText('Post'));

        expect(getByTestId('loading-indicator')).toBeTruthy();
    })
})