import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import { refreshToken } from '../api/auth.api';

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    user: string | null;
    setTokens: (tokens: { access_token: string; refresh_token: string }, username: string) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
    validateToken: () => Promise<void>;
}

interface DecodedToken {
    exp: number;
    sub: string;
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
            validateToken: async () => {
                const state = get();
                const { accessToken, refreshToken: tokenInfo } = state;

                if (!accessToken || !tokenInfo) return;

                try {
                    const decoded = jwtDecode<DecodedToken>(accessToken);
                    const currentTime = Date.now() / 1000;

                    // If token expires in less than 30 seconds
                    if (decoded.exp - currentTime < 30) {
                        console.log("Token expiring soon, refreshing...");
                        try {
                            const splitToken = tokenInfo; // Assuming stored as string path
                            const data = await refreshToken(splitToken);
                            // Update store with new tokens
                            state.setTokens(data, state.user || 'Unknown');
                            console.log("Token refreshed successfully");
                        } catch (refreshError) {
                            console.error("Failed to refresh token", refreshError);
                            state.logout();
                        }
                    }
                } catch (error) {
                    console.error("Invalid token", error);
                    state.logout();
                }
            },
            isAuthenticated: () => !!get().accessToken,
        }),
        {
            name: 'auth-storage',
        }
    )
);
