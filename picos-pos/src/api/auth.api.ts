import api from './client';
import type { AuthResponse } from '../types/models.types';

export const login = async (username: string, password: string): Promise<AuthResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const { data } = await api.post<AuthResponse>('/api/v1/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return data;
};
