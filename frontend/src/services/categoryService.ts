import apiClient from './apiClient';
import type { Category } from '../types';

export const categoryService = {
  getAllCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/categories');
    return response.data;
  },

  getCategoryById: async (id: number): Promise<Category> => {
    const response = await apiClient.get<Category>(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (categoryData: Partial<Category>): Promise<Category> => {
    const response = await apiClient.post<Category>('/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id: number, categoryData: Partial<Category>): Promise<Category> => {
    const response = await apiClient.put<Category>(`/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },
};