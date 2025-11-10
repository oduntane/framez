jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { authService } from '../../services/authService';
import { useAuthStore } from '../authStore';

jest.mock('../../services/authService');

describe('AuthStore', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset Zustand store to initial state
        const store = useAuthStore.getState();
        store.setUser(null);
        store.setAuthenticated(false);
        store.setLoading(false);
    });

    it('should have an initial state', () => {
        const state = useAuthStore.getState();
        
        expect(state.user).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(state.loading).toBe(false);
    })

    describe('Actions', () => {
        
        test('setUser(userData) should update user state', () => {
            const mockUser = { id: '1', email: 'test@example.com' };
            
            useAuthStore.getState().setUser(mockUser as any);

            expect(useAuthStore.getState().user).toEqual(mockUser);
        })

        test('setAuthennticated(true) should set isAuthenticated state to true', () => {
            useAuthStore.getState().setAuthenticated(true);

            expect(useAuthStore.getState().isAuthenticated).toBe(true);
        })

        test('setLoading(true) should set loading to true', () => {
            useAuthStore.getState().setLoading(true);

            expect(useAuthStore.getState().loading).toBe(true);
        })

        describe('checkAuthStatus()', () => {
            it('should call authService.getCurrentUser()', async () => {
                (authService.getCurrentUser as jest.Mock).mockResolvedValue(null);

                await useAuthStore.getState().checkAuthStatus();

                expect(authService.getCurrentUser).toHaveBeenCalled();
            })

            it('should set user and isAuthenticated if session exists', async () => {
                const mockUser = { id: '1', email: 'test@example.com' };
                (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

                await useAuthStore.getState().checkAuthStatus();

                const state = useAuthStore.getState();
                expect(state.user).toEqual(mockUser);
                expect(state.isAuthenticated).toBe(true);
            })

            it('should keep user null if no session', async () => {
                (authService.getCurrentUser as jest.Mock).mockResolvedValue(null);

                await useAuthStore.getState().checkAuthStatus();

                const state = useAuthStore.getState();
                expect(state.user).toBeNull();
                expect(state.isAuthenticated).toBe(false);
            })
        })
    })
})