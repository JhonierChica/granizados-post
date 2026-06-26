import apiClient from './apiClient';
import type { Order, CreateOrderDTO, UpdateOrderDTO } from '../types';

export const orderService = {
  getAllOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>('/orders');
    return response.data;
  },

  getAllOrdersForPayments: async (): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>('/orders/all-for-payments');
    return response.data;
  },

  getOrderById: async (id: number): Promise<Order> => {
    const response = await apiClient.get<Order>(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (orderData: CreateOrderDTO): Promise<Order> => {
    const response = await apiClient.post<Order>('/orders', orderData);
    return response.data;
  },

  updateOrder: async (id: number, orderData: UpdateOrderDTO): Promise<Order> => {
    const response = await apiClient.put<Order>(`/orders/${id}`, orderData);
    return response.data;
  },

  deleteOrder: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id: number, status: string): Promise<Order> => {
    const response = await apiClient.patch<Order>(`/orders/${id}/status`, { status });
    return response.data;
  },

  getOrdersByTable: async (tableId: number): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>(`/orders?tableId=${tableId}`);
    return response.data;
  },

  getPendingOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>('/orders?status=PENDIENTE');
    return response.data;
  },
};
