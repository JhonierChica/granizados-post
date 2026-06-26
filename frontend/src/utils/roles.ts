import { USER_ROLES } from './constants';
import type { UserRole } from '../types';

/**
 * Normaliza el código de perfil (puede venir en español o inglés)
 */
export const normalizeProfileCode = (code?: string): UserRole => {
  if (!code) return USER_ROLES.WAITER as UserRole; // Default a WAITER si no hay rol? O 'USER'
  
  const upperCode = code.toUpperCase();
  
  // Mapeo de códigos en español a inglés
  const mapping: Record<string, UserRole> = {
    'MESERO': USER_ROLES.WAITER,
    'WAITER': USER_ROLES.WAITER,
    'CAJERO': USER_ROLES.CASHIER,
    'CASHIER': USER_ROLES.CASHIER,
    'ADMINISTRADOR': USER_ROLES.ADMIN,
    'ADMIN': USER_ROLES.ADMIN,
  };
  
  return mapping[upperCode] || (upperCode as UserRole);
};
