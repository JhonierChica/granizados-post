// API a través del proxy de Vite — funciona en localhost y en red
export const API_BASE_URL = '/api';
export const API_URL = API_BASE_URL; // Mantener compatibilidad por las dudas
export const APP_NAME = 'La Bombonera';

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  CASHIER: 'CASHIER',
  WAITER: 'WAITER',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  
  // Admin
  ADMIN_PROFILES: '/admin/profiles',
  ADMIN_POSITIONS: '/admin/positions',
  ADMIN_EMPLOYEES: '/admin/employees',
  ADMIN_USERS: '/admin/users',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_MENU: '/admin/menu',
  ADMIN_PAYMENT_METHODS: '/admin/payment-methods',
  
  // Waiter
  WAITER_ORDERS: '/waiter/orders',
  WAITER_TABLES: '/waiter/tables',
  
  // Cashier
  CASHIER_TABLES: '/cashier/tables',
  CASHIER_CLIENTS: '/cashier/clients',
  CASHIER_PAYMENTS: '/cashier/payments',
  CASHIER_DELIVERIES: '/cashier/deliveries',
  CASHIER_CASH_REGISTER: '/cashier/cash-register',
} as const;

export const DEPARTMENTS = {
  ADMINISTRATION: 'Administración',
  KITCHEN: 'Cocina',
  SERVICE: 'Servicio',
  BAR: 'Bar',
  DELIVERY: 'Domicilios',
  CLEANING: 'Limpieza',
} as const;

export const ORDER_STATUS = {
  PENDING: 'PENDIENTE',
  DELIVERED: 'SERVIDO',
} as const;

export const TABLE_STATUS = {
  AVAILABLE: 'DISPONIBLE',
  OCCUPIED: 'OCUPADA',
  RESERVED: 'RESERVADA',
  OUT_OF_SERVICE: 'FUERA_DE_SERVICIO',
} as const;