import apiClient from './apiClient';
import type { Profile } from '../types';

export const profileService = {
  getAll: async (): Promise<Profile[]> => {
    const response = await apiClient.get<Profile[]>('/profiles');
    return response.data;
  },

  getById: async (id: number): Promise<Profile> => {
    const response = await apiClient.get<Profile>(`/profiles/${id}`);
    return response.data;
  },

  create: async (profileData: Partial<Profile>): Promise<Profile> => {
    const response = await apiClient.post<Profile>('/profiles', profileData);
    return response.data;
  },

  update: async (id: number, profileData: Partial<Profile>): Promise<Profile> => {
    const response = await apiClient.put<Profile>(`/profiles/${id}`, profileData);
    return response.data;
  },

  delete: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/profiles/${id}`);
    return response.data;
  },

  toggleStatus: async (id: number): Promise<Profile> => {
    const response = await apiClient.patch<Profile>(`/profiles/${id}/toggle-status`);
    return response.data;
  },

  getActive: async (): Promise<Profile[]> => {
    const response = await apiClient.get<Profile[]>('/profiles/active');
    return response.data;
  },

  getByCode: async (code: string): Promise<Profile | null> => {
    const response = await apiClient.get<Profile>(`/profiles/code/${code}`);
    return response.data;
  },
};
