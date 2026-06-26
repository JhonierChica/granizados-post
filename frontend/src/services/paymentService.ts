import apiClient from './apiClient';
import type { Payment, CreatePaymentDTO } from '../types';

export const paymentService = {
  getAllPayments: async (): Promise<Payment[]> => {
    const response = await apiClient.get<Payment[]>('/payments');
    return response.data;
  },

  getUnclosedPayments: async (): Promise<Payment[]> => {
    const response = await apiClient.get<Payment[]>('/payments/unclosed');
    return response.data;
  },

  getPaymentById: async (id: number): Promise<Payment> => {
    const response = await apiClient.get<Payment>(`/payments/${id}`);
    return response.data;
  },

  createPayment: async (paymentData: CreatePaymentDTO): Promise<Payment> => {
    const response = await apiClient.post<Payment>('/payments', paymentData);
    return response.data;
  },

  getPaymentsByOrder: async (orderId: number): Promise<Payment[]> => {
    const response = await apiClient.get<Payment[]>(`/payments/order/${orderId}`);
    return response.data;
  },

  getPendingPayments: async (): Promise<Payment[]> => {
    const response = await apiClient.get<Payment[]>('/payments/pending');
    return response.data;
  },

  getPaymentsByDateRange: async (startDate: string, endDate: string): Promise<Payment[]> => {
    const response = await apiClient.get<Payment[]>(`/payments/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  getDailySummary: async (date: string): Promise<any> => {
    const response = await apiClient.get(`/payments/daily-summary?date=${date}`);
    return response.data;
  },
};