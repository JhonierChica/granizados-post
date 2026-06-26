import type { User } from './domain';

// === Auth ===
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  username: string;
  email?: string;
  fullName?: string;
  pin?: string;
  profile?: { id: number; name: string; code: string };
  token: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

// === Generic API ===
export interface ApiError {
  message: string;
  status: number;
  timestamp?: string;
}

// === DTOs para creación/actualización ===
export interface CreateOrderDTO {
  userId: number;
  tableId: number | null;
  clientId: number;
  orderType: string;
  items: { menuItemId: number; quantity: number }[];
  notes?: string;
}

export interface UpdateOrderDTO {
  tableId: number;
  status: string;
  items: { menuItemId: number; quantity: number }[];
  notes?: string;
}

export interface CreatePaymentDTO {
  orderId: number;
  paymentMethodId: number;
  amount: number;
  deliveryFee?: number;
}

export interface CreateClientDTO {
  name: string;
  identificationNumber: string;
  phone: string;
  address?: string;
  email?: string;
  notes?: string;
}