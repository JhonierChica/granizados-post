import apiClient from './apiClient';
import type { Delivery, DeliveryStatus } from '../types';

export const deliveryService = {
  getAllDeliveries: async (): Promise<Delivery[]> => {
    const response = await apiClient.get<Delivery[]>('/deliveries');
    return response.data;
  },

  getDeliveryById: async (id: number): Promise<Delivery> => {
    const response = await apiClient.get<Delivery>(`/deliveries/${id}`);
    return response.data;
  },

  createDelivery: async (deliveryData: any): Promise<Delivery> => {
    const response = await apiClient.post<Delivery>('/deliveries', deliveryData);
    return response.data;
  },

  updateDeliveryStatus: async (id: number, status: DeliveryStatus): Promise<Delivery> => {
    const response = await apiClient.patch<Delivery>(`/deliveries/${id}/status`, { status });
    return response.data;
  },

  getDeliveriesByStatus: async (status: DeliveryStatus): Promise<Delivery[]> => {
    const response = await apiClient.get<Delivery[]>(`/deliveries?status=${status}`);
    return response.data;
  },

  getPendingDeliveries: async (): Promise<Delivery[]> => {
    const response = await apiClient.get<Delivery[]>('/deliveries/pending');
    return response.data;
  },
};