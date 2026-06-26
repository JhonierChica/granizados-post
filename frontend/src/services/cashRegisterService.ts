import apiClient from './apiClient';
import type { CashRegisterClose } from '../types';

export const cashRegisterService = {
  getAll: async (): Promise<CashRegisterClose[]> => {
    const response = await apiClient.get<CashRegisterClose[]>('/cash-register-closes');
    return response.data;
  },

  getById: async (id: number): Promise<CashRegisterClose> => {
    const response = await apiClient.get<CashRegisterClose>(`/cash-register-closes/${id}`);
    return response.data;
  },

  close: async (data: any): Promise<CashRegisterClose> => {
    const response = await apiClient.post<CashRegisterClose>('/cash-register-closes', data);
    return response.data;
  },

  getLatest: async (): Promise<CashRegisterClose | null> => {
    const response = await apiClient.get<CashRegisterClose>('/cash-register-closes/last');
    return response.data;
  },

  getCurrentBalance: async (): Promise<any> => {
    const response = await apiClient.get('/cash-register-closes/current-balance');
    return response.data;
  },

  getDailySalesSummary: async (date: string): Promise<any> => {
    const response = await apiClient.get(`/cash-register-closes/daily-summary?date=${date}`);
    return response.data;
  },
};
