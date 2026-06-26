/**
 * Domain Interfaces for Restaurant Management System
 * Matches backend entity structures while providing flexible fields for UI state.
 */

export interface User {
  id: number;
  username: string;
  role: UserRole;
  email?: string;
  fullName?: string;
  pin?: string;
  employee?: Employee;
  profile?: Profile;
  active?: boolean;
  createdAt?: string;
  status?: boolean;
}

export type UserRole = 'ADMIN' | 'CASHIER' | 'WAITER' | 'CHEF';

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  document: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  position?: Position;
  profile?: Profile;
  status: boolean;
  active?: boolean;
  salary?: number;
  fullName?: string;
  createdAt?: string;
}

export interface Position {
  id: number;
  name: string;
  department: string;
  description?: string;
  baseSalary?: number | null;
  active?: boolean;
}

export interface Profile {
  id: number;
  name: string;
  code?: string;
  active?: boolean;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  code: string;
  module: string;
  description?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  active?: boolean;
  status?: boolean;
  orderNumber?: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  category?: Category;
  image?: string;
  available: boolean;
  active?: boolean;
  status?: boolean;
  categoryName?: string;
}

export interface Table {
  id: number;
  tableNumber: number | string;
  capacity: number;
  location?: string;
  status: string;
  active?: boolean;
  isActive?: boolean;
}

export interface Order {
  id: number;
  tableId?: number;
  clientId?: number;
  tableNumber?: string;
  clientName?: string;
  clientPhone?: string;
  address?: string;
  clientAddress?: string;
  orderType: 'LOCAL' | 'DOMICILIO' | 'PARA_LLEVAR';
  status: string;
  total: number;
  waiterId?: number;
  waiterName?: string;
  items: OrderItem[];
  createdAt: string;
  notes?: string;
  userId?: number;
}

export interface OrderItem {
  id?: number;
  menuItemId: number;
  quantity: number;
  menuItemName?: string;
  menuItemPrice?: number;
  unitPrice?: number;
  price?: number;
  name?: string;
  notes?: string;
  categoryName?: string;
}

export interface Payment {
  id: number;
  orderId: number;
  paymentMethodId: number;
  amount: number;
  deliveryFee?: number;
  reference?: string;
  paymentDate?: string;
  status?: string;
  items?: OrderItem[];
}

export interface Delivery {
  id: number;
  orderId: number;
  deliveryDate?: string;
  createdAt?: string;
  status: DeliveryStatus;
  deliveryAddress?: string;
  deliveryPersonId?: number;
}

export type DeliveryStatus = 'PENDING' | 'DELIVERED';

export interface PaymentMethod {
  id: number;
  name: string;
  requiresReference: boolean;
  active?: boolean;
  status?: boolean;
  isActive?: boolean;
}

export interface ItemSalesSummary {
  name: string;
  categoryName?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaymentLine {
  id: string;
  paymentMethodId: number;
  amount: number;
  receivedAmount: number;
  change: number;
}

export interface PaymentFormData {
  paymentMethodId: string | number;
  amount: number;
  receivedAmount: string | number;
  change: number;
  reference?: string;
  deliveryFee?: number;
}

export interface CashRegisterClose {
  id: number;
  closingDate: string;
  initialAmount: number;
  finalAmount: number;
  expectedAmount: number;
  totalSales: number;
  totalTransactions: number;
  cashAmount?: number;
  transferAmount?: number;
  cardAmount?: number;
  otherAmount?: number;
  difference: number;
  closedBy?: string;
  notes?: string;
  active?: boolean;
  itemSales?: ItemSalesSummary[];
}

export interface StatusBadge {
  class: string;
  emoji: string;
  text: string;
}

export interface Client {
  id: number;
  name: string;
  identificationNumber: string;
  phone: string;
  address?: string;
  email?: string;
  notes?: string;
  active?: boolean;
}

export type ClientStep = 'selection' | 'existing' | 'new' | 'orderType' | 'order';

export interface OrderFormData {
  clientName: string;
  clientIdentification: string;
  clientPhone: string;
  clientAddress: string;
  tableId: string | number;
  status: string;
  notes: string;
}