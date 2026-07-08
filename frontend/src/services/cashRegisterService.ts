import apiClient from './apiClient';
import type { CashRegisterClose } from '../types';

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const cashRegisterService = {
  getAll: async (page?: number, size?: number): Promise<PaginatedResponse<CashRegisterClose>> => {
    const params: Record<string, string> = {};
    if (page !== undefined) params.page = String(page);
    if (size !== undefined) params.size = String(size);
    const queryString = Object.keys(params).length > 0
      ? '?' + new URLSearchParams(params).toString()
      : '';
    const response = await apiClient.get<PaginatedResponse<CashRegisterClose>>(`/cash-register-closes${queryString}`);
    return response.data;
  },

  getAllPaginated: async (page: number, size: number): Promise<PaginatedResponse<CashRegisterClose>> => {
    return cashRegisterService.getAll(page, size);
  },

  getFiltered: async (
    filterType: string,
    selectedDate?: string,
    selectedMonth?: number,
    selectedYear?: number,
    page?: number,
    size?: number,
  ): Promise<PaginatedResponse<CashRegisterClose>> => {
    const params = new URLSearchParams();
    params.set('filterType', filterType);
    if (selectedDate) params.set('selectedDate', selectedDate);
    if (selectedMonth !== undefined) params.set('selectedMonth', String(selectedMonth));
    if (selectedYear !== undefined) params.set('selectedYear', String(selectedYear));
    if (page !== undefined) params.set('page', String(page));
    if (size !== undefined) params.set('size', String(size));
    const response = await apiClient.get<PaginatedResponse<CashRegisterClose>>(
      `/cash-register-closes/filtered?${params.toString()}`
    );
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
