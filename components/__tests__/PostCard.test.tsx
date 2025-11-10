
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { render } from '@testing-library/react-native';
import React from 'react';
import PostCard from '../PostCard';

describe('PostCard', () => {
    const mockPost = {
        id: '1',
        user_id: 'user1',
        text: 'Test post content',
        image_url: null,
        created_at: new Date().toISOString(),
        profiles: { email: 'test@example.com' },
    };

    it('should render author avatar', () => {
        const { getByTestId } = render(<PostCard post={mockPost} />);

        expect(getByTestId('author-avatar')).toBeTruthy();
    })

    it('should render author name', () => {
        const { getByText } = render(<PostCard post={mockPost} />);

        expect(getByText('test')).toBeTruthy(); // Email prefix
    })

    it('should render post timestamp', () => {
        const { getByTestId } = render(<PostCard post={mockPost} />);

        expect(getByTestId('post-timestamp')).toBeTruthy();
    })

    it('should render post text', () => {
        const { getByText } = render(<PostCard post={mockPost} />);

        expect(getByText('Test post content')).toBeTruthy();
    })

    it('should render post image if exists', () => {
        const postWithImage = {
            ...mockPost,
            image_url: 'https://example.com/image.jpg',
        };

        const { getByTestId } = render(<PostCard post={postWithImage} />);

        expect(getByTestId('post-image')).toBeTruthy();
    })

    it('should not render image component if no image URL', () => {
        const { queryByTestId } = render(<PostCard post={mockPost} />);

        expect(queryByTestId('post-image')).toBeNull();
    })

    it('should format timestamp correctly (e.g., "2 hours ago")', () => {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
        const postWithTimestamp = {
            ...mockPost,
            created_at: twoHoursAgo,
        };

        const { getByText } = render(<PostCard post={postWithTimestamp} />);

        expect(getByText('2 hours ago')).toBeTruthy();
    })
})