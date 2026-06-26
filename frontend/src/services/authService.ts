import apiClient from './apiClient';
import type { LoginResponse } from '../types';

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', { username, password });
    return response.data;
  },

  /**
   * Verifies the stored JWT token by calling GET /api/auth/verify.
   * Returns the user data if valid, throws on 401/error.
   */
  verifyToken: async (): Promise<LoginResponse> => {
    const response = await apiClient.get<LoginResponse>('/auth/verify');
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): any => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
};
