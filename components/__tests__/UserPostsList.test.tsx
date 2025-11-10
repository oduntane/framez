jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { render } from '@testing-library/react-native';
import React from 'react';
import UserPostsList from '../UserPostsList';

describe('UserPostsList', () => {
  const mockPosts = [
    {
      id: '1',
      user_id: 'user1',
      text: 'First post',
      image_url: null,
      created_at: new Date().toISOString(),
      profiles: { email: 'user@example.com' },
    },
    {
      id: '2',
      user_id: 'user1',
      text: 'Second post',
      image_url: 'https://example.com/image.jpg',
      created_at: new Date().toISOString(),
      profiles: { email: 'user@example.com' },
    },
  ];

  it('should render FlatList with PostCard items', () => {
    const { getByTestId, getByText } = render(<UserPostsList posts={mockPosts} />);

    expect(getByTestId('user-posts-list')).toBeTruthy();
    expect(getByText('First post')).toBeTruthy();
    expect(getByText('Second post')).toBeTruthy();
  })

  it('should show empty state message when no posts', () => {
    const { getByText } = render(<UserPostsList posts={[]} />);

    expect(getByText(/no posts yet/i)).toBeTruthy();
  })

  it('should pass correct post data to PostCard', () => {
    const { getByText, getAllByText } = render(<UserPostsList posts={mockPosts} />);

    // Check that post text is rendered (via PostCard)
    expect(getByText('First post')).toBeTruthy();
    expect(getByText('Second post')).toBeTruthy();
    
    // Check that author email prefix is rendered (via PostCard)
    const usernames = getAllByText('user');
    expect(usernames.length).toBeGreaterThan(0);
  })

  it('should show loading indicator while posts are loading', () => {
    const { getByTestId } = render(<UserPostsList posts={[]} loading={true} />);

    expect(getByTestId('loading-indicator')).toBeTruthy();
  })
})