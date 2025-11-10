
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import UserHeader from '../UserHeader';

jest.mock('../../stores/authStore');

describe('UserHeader', () => {
    const mockUser = {
        id: 'user1',
        email: 'test@example.com',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render user avatar', () => {
        (useAuthStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                user: mockUser,
                loading: false,
                logout: jest.fn(),
            };
            return selector ? selector(store) : store;
        });

        const { getByTestId } = render(<UserHeader />);

        expect(getByTestId('user-avatar')).toBeTruthy();
    })

    it('should render user name', () => {
        const userWithName = { ...mockUser, name: 'Test User' };

        (useAuthStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                user: userWithName,
                loading: false,
                logout: jest.fn(),
            };
            return selector ? selector(store) : store;
        });

        const { getByText } = render(<UserHeader />);

        expect(getByText('Test User')).toBeTruthy();
    })

    it('should render user email', () => {
        (useAuthStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                user: mockUser,
                loading: false,
                logout: jest.fn(),
            };
            return selector ? selector(store) : store;
        });

        const { getByText } = render(<UserHeader />);

        expect(getByText('test@example.com')).toBeTruthy();
    })

    it('should render logout button', () => {
        (useAuthStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                user: mockUser,
                loading: false,
                logout: jest.fn(),
            };
            return selector ? selector(store) : store;
        });

        const { getByTestId } = render(<UserHeader />);

        expect(getByTestId('logout-button')).toBeTruthy();
    })

    it('should call authStore.logout() when logout button pressed', () => {
        const mockLogout = jest.fn();

        (useAuthStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                user: mockUser,
                loading: false,
                logout: mockLogout,
            };
            return selector ? selector(store) : store;
        });

        const { getByTestId } = render(<UserHeader />);

        const logoutButton = getByTestId('logout-button');
        fireEvent.press(logoutButton);

        expect(mockLogout).toHaveBeenCalled();
    })

    it('should show loading state while user data is loading', () => {
        (useAuthStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                user: null,
                loading: true,
                logout: jest.fn(),
            };
            return selector ? selector(store) : store;
        });

        const { getByTestId } = render(<UserHeader />);

        expect(getByTestId('loading-indicator')).toBeTruthy();
    })
})