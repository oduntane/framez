jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
    },
  },
}));

import { supabase } from './../../lib/supabase';

import { authService } from '../authService';

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("signUp", () => {
        it('should call Supabase signup with correct parameters', async () => {
            const email = 'test@example.com';
            const password = 'password123';
            
            (supabase.auth.signUp as jest.Mock).mockResolvedValue({
                data: { user: { id: '1', email }, session: {} },
                error: null
            });

            await authService.signUp(email, password);

            expect(supabase.auth.signUp).toHaveBeenCalledWith({
                email,
                password
            });
        })
        
        it('should return user object and session on success', async () => {
            const mockUser = { id: '1', email: 'test@example.com' };
            const mockSession = { access_token: 'token123' };
            
            (supabase.auth.signUp as jest.Mock).mockResolvedValue({
                data: { user: mockUser, session: mockSession },
                error: null
            });

            const result = await authService.signUp('test@example.com', 'password123');

            expect(result.user).toEqual(mockUser);
            expect(result.session).toEqual(mockSession);
        })

        it('should throw error on invalid email', async () => {
            (supabase.auth.signUp as jest.Mock).mockResolvedValue({
                data: { user: null, session: null },
                error: { message: 'Invalid email' }
            });

            await expect(authService.signUp('invalid-email', 'password123'))
                .rejects.toThrow('Invalid email');
        })
    })

    describe('login', () => {
        it('should call Supabase login with correct credentials', async () => {
            const email = 'test@example.com';
            const password = 'password123';
            
            (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
                data: { user: { id: '1', email }, session: {} },
                error: null
            });

            await authService.login(email, password);

            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
                email,
                password
            });
        })

        it('should return user object and session on success', async () => {
            const mockUser = { id: '1', email: 'test@example.com' };
            const mockSession = { access_token: 'token123' };
            
            (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
                data: { user: mockUser, session: mockSession },
                error: null
            });

            const result = await authService.login('test@example.com', 'password123');

            expect(result.user).toEqual(mockUser);
            expect(result.session).toEqual(mockSession);
        })

        it('should throw error on wrong password', async () => {
            (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
                data: { user: null, session: null },
                error: { message: 'Invalid credentials' }
            });

            await expect(authService.login('test@example.com', 'wrongpassword'))
                .rejects.toThrow('Invalid credentials');
        })

    })

    describe('logout', () => {
        it('should call Supabase singOut', async () => {
            (supabase.auth.signOut as jest.Mock).mockResolvedValue({
                error: null
            });

            await authService.logout();

            expect(supabase.auth.signOut).toHaveBeenCalled();
        })
    })

    describe('getCurrentUser', () => {
        it('should return current user session if it exists', async () => {
            const mockUser = { id: '1', email: 'test@example.com' };
            const mockSession = { access_token: 'token123' };
            
            (supabase.auth.getSession as jest.Mock).mockResolvedValue({
                data: { session: mockSession },
                error: null
            });
            
            (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: mockUser },
                error: null
            });

            const result = await authService.getCurrentUser();

            expect(result).toEqual(mockUser);
        })

        it('should return null if no session exists', async () => {
            (supabase.auth.getSession as jest.Mock).mockResolvedValue({
                data: { session: null },
                error: null
            });

            const result = await authService.getCurrentUser();

            expect(result).toBeNull();
        })
    })
})