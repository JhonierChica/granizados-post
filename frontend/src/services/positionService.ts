import apiClient from './apiClient';
import type { Position } from '../types/domain';

export const positionService = {
  getAll: async (): Promise<Position[]> => {
    const response = await apiClient.get<Position[]>('/positions');
    return response.data;
  },

  getById: async (id: number): Promise<Position> => {
    const response = await apiClient.get<Position>(`/positions/${id}`);
    return response.data;
  },

  create: async (positionData: Partial<Position>): Promise<Position> => {
    const response = await apiClient.post<Position>('/positions', positionData);
    return response.data;
  },

  update: async (id: number, positionData: Partial<Position>): Promise<Position> => {
    const response = await apiClient.put<Position>(`/positions/${id}`, positionData);
    return response.data;
  },

  delete: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/positions/${id}`);
    return response.data;
  },

  getActive: async (): Promise<Position[]> => {
    const response = await apiClient.get<Position[]>('/positions/active');
    return response.data;
  },

  getByDepartment: async (department: string): Promise<Position[]> => {
    const response = await apiClient.get<Position[]>(`/positions/department/${department}`);
    return response.data;
  },
};
