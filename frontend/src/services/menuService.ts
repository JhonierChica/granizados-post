import apiClient from './apiClient';
import type { MenuItem } from '../types';

export const menuService = {
  getAllMenuItems: async (): Promise<MenuItem[]> => {
    const response = await apiClient.get<MenuItem[]>('/menu');
    return response.data;
  },

  getMenuItemById: async (id: number): Promise<MenuItem> => {
    const response = await apiClient.get<MenuItem>(`/menu/${id}`);
    return response.data;
  },

  createMenuItem: async (menuItemData: Partial<MenuItem>): Promise<MenuItem> => {
    const response = await apiClient.post<MenuItem>('/menu', menuItemData);
    return response.data;
  },

  updateMenuItem: async (id: number, menuItemData: Partial<MenuItem>): Promise<MenuItem> => {
    const response = await apiClient.put<MenuItem>(`/menu/${id}`, menuItemData);
    return response.data;
  },

  deleteMenuItem: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/menu/${id}`);
    return response.data;
  },

  bulkSave: async (items: Array<{
    id?: number;
    name: string;
    description?: string;
    price: number;
    categoryId: number;
    available?: boolean;
  }>): Promise<MenuItem[]> => {
    const response = await apiClient.post<MenuItem[]>('/menu/bulk', { items });
    return response.data;
  },

  getMenuItemsByCategory: async (categoryId: number): Promise<MenuItem[]> => {
    const response = await apiClient.get<MenuItem[]>(`/menu/category/${categoryId}`);
    return response.data;
  },
};
