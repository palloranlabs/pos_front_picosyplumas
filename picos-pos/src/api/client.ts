import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';

// Extended request config to track retries
declare module 'axios' {
    export interface AxiosRequestConfig {
        _retry?: boolean;
    }
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// 1. Request Interceptor: Inject Token
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 2. Response Interceptor: Handle 401 Refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = useAuthStore.getState().refreshToken;

                if (!refreshToken) {
                    throw new Error("No refresh token");
                }

                // Call refresh endpoint
                const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/refresh-token`, {
                    refresh_token: refreshToken
                });

                // Update Store
                useAuthStore.getState().setTokens(data);

                // Retry original request
                originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed - Force Logout
                useAuthStore.getState().logout();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
