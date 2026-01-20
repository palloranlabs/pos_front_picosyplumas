import api from './client';
import type { AuthResponse } from '../types/models.types';

export const login = async (username: string, password: string): Promise<AuthResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('grant_type', 'password');
    // formData.append('scope', '');
    // formData.append('client_id', '');
    // formData.append('client_secret', '');

    const { data } = await api.post<AuthResponse>('/api/v1/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return data;
};

export const changePassword = async (newPassword: string, userId?: number): Promise<void> => {
    // The API expects a body with { user_id?: number, new_password: string }
    // If user_id is 0 or undefined, it changes the current user's password (based on token usually, or API logic)
    // The user request says: "If user_id is provided, changes that user's password. If user_id is not provided, changes admin's own password."
    // And schema shows user_id: 0. Let's send it if it's truthy, otherwise omit or send 0?
    // Request body: { "user_id": 0, "new_password": "string" }
    // It seems user_id is required in the body structure shown in request, but description says "If user_id is not provided".
    // I will pass whatever is provided.

    await api.post('/api/v1/auth/change-password', {
        user_id: userId,
        new_password: newPassword
    });
};

export interface RegisterUserRequest {
    username: string;
    password: string;
    role: 'user' | 'admin';
    is_active: boolean;
}

export const registerUser = async (userData: RegisterUserRequest): Promise<void> => {
    await api.post('/api/v1/auth/register', userData);
};
