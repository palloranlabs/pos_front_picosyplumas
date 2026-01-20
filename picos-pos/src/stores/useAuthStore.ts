import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    setTokens: (tokens: { access_token: string; refresh_token: string }) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            accessToken: null,
            refreshToken: null,
            setTokens: (tokens) => set({
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token
            }),
            logout: () => set({ accessToken: null, refreshToken: null }),
            isAuthenticated: () => !!get().accessToken,
        }),
        {
            name: 'auth-storage',
        }
    )
);
