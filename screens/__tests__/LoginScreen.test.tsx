
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../stores/authStore';
import LoginScreen from '../LoginScreen';

jest.mock('../../services/authService');
jest.mock('../../stores/authStore');

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
    }),
}));

describe('LoginScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            setUser: jest.fn(),
            setAuthenticated: jest.fn(),
            setLoading: jest.fn(),
            loading: false,
        });
    });

    it('should render email input field', () => {
        const { getByPlaceholderText } = render(<LoginScreen />);
        
        expect(getByPlaceholderText('Email')).toBeTruthy();
    })

    it('should render password input field', () => {
        const { getByPlaceholderText } = render(<LoginScreen />);
        
        expect(getByPlaceholderText('Password')).toBeTruthy();
    })

    it('should render login button', () => {
        const { getByText } = render(<LoginScreen />);
        
        expect(getByText('Login')).toBeTruthy();
    })

    it('should call authService.login() when form submitted with valid data', async () => {
        const { getByPlaceholderText, getByText } = render(<LoginScreen />);
        const mockUser = { id: '1', email: 'test@example.com' };
        
        (authService.login as jest.Mock).mockResolvedValue({
            user: mockUser,
            session: { access_token: 'token123' }
        });

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.press(getByText('Login'));

        await waitFor(() => {
            expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
        });
    })

    it('should display error message on login failure', async () => {
        const { getByPlaceholderText, getByText, findByText } = render(<LoginScreen />);
        
        (authService.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpassword');
        fireEvent.press(getByText('Login'));

        const errorMessage = await findByText('Invalid credentials');
        expect(errorMessage).toBeTruthy();
    })

    it('should navigate to FeedScreen on successful login', async () => {
        const { getByPlaceholderText, getByText } = render(<LoginScreen />);
        const mockUser = { id: '1', email: 'test@example.com' };
        
        (authService.login as jest.Mock).mockResolvedValue({
            user: mockUser,
            session: { access_token: 'token123' }
        });

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.press(getByText('Login'));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('Feed');
        });
    })

    it('should disable submit button when fields are empty', () => {
        const { getByTestId } = render(<LoginScreen />);
        const loginButton = getByTestId('login-button');

        expect(loginButton.props.accessibilityState?.disabled).toBe(true);
    })

    it('should show loading spinner while authenticating', () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            setUser: jest.fn(),
            setAuthenticated: jest.fn(),
            setLoading: jest.fn(),
            loading: true,
        });

        const { getByTestId } = render(<LoginScreen />);
        
        expect(getByTestId('loading-spinner')).toBeTruthy();
    })
})