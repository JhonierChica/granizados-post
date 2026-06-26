import apiClient from './apiClient';

export interface Permission {
  id: number;
  name: string;
  code: string;
  module: string;
  description?: string;
  active: boolean;
}

export const permissionService = {
  getAll: async (): Promise<Permission[]> => {
    const response = await apiClient.get<Permission[]>('/permissions');
    return response.data;
  },

  getActive: async (): Promise<Permission[]> => {
    const response = await apiClient.get<Permission[]>('/permissions/active');
    return response.data;
  },

  getByModule: async (module: string): Promise<Permission[]> => {
    const response = await apiClient.get<Permission[]>(`/permissions/module/${module}`);
    return response.data;
  },

  getModules: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/permissions/modules');
    return response.data;
  },
};