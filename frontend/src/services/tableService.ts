import apiClient from './apiClient';
import type { Table } from '../types';

export const tableService = {
  getAllTables: async (): Promise<Table[]> => {
    const response = await apiClient.get<Table[]>('/tables');
    return response.data;
  },

  getTableById: async (id: number): Promise<Table> => {
    const response = await apiClient.get<Table>(`/tables/${id}`);
    return response.data;
  },

  createTable: async (tableData: Partial<Table>): Promise<Table> => {
    const response = await apiClient.post<Table>('/tables', tableData);
    return response.data;
  },

  updateTable: async (id: number, tableData: Partial<Table>): Promise<Table> => {
    const response = await apiClient.put<Table>(`/tables/${id}`, tableData);
    return response.data;
  },

  deleteTable: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/tables/${id}`);
    return response.data;
  },

  getAvailableTables: async (): Promise<Table[]> => {
    const response = await apiClient.get<Table[]>('/tables?status=DISPONIBLE');
    return response.data;
  },
};