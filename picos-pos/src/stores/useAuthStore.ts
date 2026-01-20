import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    user: string | null;
    setTokens: (tokens: { access_token: string; refresh_token: string }, username: string) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            accessToken: null,
            refreshToken: null,
            user: null,
            setTokens: (tokens, username) => set({
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                user: username
            }),
            logout: () => {
                set({ accessToken: null, refreshToken: null, user: null });
                localStorage.removeItem('auth-storage');
                localStorage.removeItem('session-storage');
                localStorage.removeItem('cart-storage');
                // Force reload to clean any in-memory state
                window.location.href = '/login';
            },
            isAuthenticated: () => !!get().accessToken,
        }),
        {
            name: 'auth-storage',
        }
    )
);
