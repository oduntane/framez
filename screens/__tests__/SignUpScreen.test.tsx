
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../stores/authStore';
import SignUpScreen from '../SignUpScreen';

jest.mock('../../services/authService');
jest.mock('../../stores/authStore');

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
    }),
}));

describe('SignUpScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        (useAuthStore as unknown as jest.Mock).mockImplementation((selector) => {
            const store = {
                setUser: jest.fn(),
                setAuthenticated: jest.fn(),
                setLoading: jest.fn(),
                loading: false,
            };
            return selector ? selector(store) : store;
        });
    });

    it('should render email, password, and confirm password inputs', () => {
        const { getByPlaceholderText } = render(<SignUpScreen />);
        
        expect(getByPlaceholderText('Email')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
        expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
    })

    it('should render sign up button', () => {
        const { getByText } = render(<SignUpScreen />);
        
        expect(getByText('Sign Up')).toBeTruthy();
    })

    it('should show error if passwords don\'t match', async () => {
        const { getByPlaceholderText, getByText, findByText } = render(<SignUpScreen />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password456');
        fireEvent.press(getByText('Sign Up'));

        const errorMessage = await findByText('Passwords do not match');
        expect(errorMessage).toBeTruthy();
    })

    it('should show error if email format is invalid', async () => {
        const { getByPlaceholderText, getByText, findByText } = render(<SignUpScreen />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'invalid-email');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');
        fireEvent.press(getByText('Sign Up'));

        const errorMessage = await findByText('Please enter a valid email');
        expect(errorMessage).toBeTruthy();
    })

    it('should call authService.signUp() when form submitted with valid data', async () => {
        const { getByPlaceholderText, getByText } = render(<SignUpScreen />);
        const mockUser = { id: '1', email: 'test@example.com' };
        
        (authService.signUp as jest.Mock).mockResolvedValue({
            user: mockUser,
            session: { access_token: 'token123' }
        });

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');
        fireEvent.press(getByText('Sign Up'));

        await waitFor(() => {
            expect(authService.signUp).toHaveBeenCalledWith('test@example.com', 'password123');
        });
    })

    it('should display error message on signup failure', async () => {
        const { getByPlaceholderText, getByText, findByText } = render(<SignUpScreen />);
        
        (authService.signUp as jest.Mock).mockRejectedValue(new Error('Email already in use'));

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');
        fireEvent.press(getByText('Sign Up'));

        const errorMessage = await findByText('Email already in use');
        expect(errorMessage).toBeTruthy();
    })

    it('should navigate to LoginScreen on successful signup', async () => {
        const { getByPlaceholderText, getByText } = render(<SignUpScreen />);
        const mockUser = { id: '1', email: 'test@example.com' };
        
        (authService.signUp as jest.Mock).mockResolvedValue({
            user: mockUser,
            session: { access_token: 'token123' }
        });

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');
        fireEvent.press(getByText('Sign Up'));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('Feed');
        });
    })

    it('should disable submit button when validation fails', () => {
        const { getByTestId } = render(<SignUpScreen />);
        const signUpButton = getByTestId('signup-button');

        expect(signUpButton.props.accessibilityState?.disabled).toBe(true);
    })
})