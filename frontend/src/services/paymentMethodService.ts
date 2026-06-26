import apiClient from './apiClient';
import type { PaymentMethod } from '../types';

export const paymentMethodService = {
  getAllPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await apiClient.get<PaymentMethod[]>('/payment-methods');
    return response.data;
  },

  getActivePaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await apiClient.get<PaymentMethod[]>('/payment-methods?activeOnly=true');
    return response.data;
  },

  getPaymentMethodById: async (id: number): Promise<PaymentMethod> => {
    const response = await apiClient.get<PaymentMethod>(`/payment-methods/${id}`);
    return response.data;
  },

  createPaymentMethod: async (paymentMethodData: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    const response = await apiClient.post<PaymentMethod>('/payment-methods', paymentMethodData);
    return response.data;
  },

  updatePaymentMethod: async (id: number, paymentMethodData: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    const response = await apiClient.put<PaymentMethod>(`/payment-methods/${id}`, paymentMethodData);
    return response.data;
  },

  deletePaymentMethod: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/payment-methods/${id}`);
    return response.data;
  },

  togglePaymentMethodStatus: async (id: number): Promise<PaymentMethod> => {
    const response = await apiClient.patch<PaymentMethod>(`/payment-methods/${id}/toggle-status`);
    return response.data;
  },
};
