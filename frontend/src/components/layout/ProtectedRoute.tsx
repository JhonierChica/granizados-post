import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, USER_ROLES } from '../../utils/constants';
import Loading from '../common/Loading';
import { normalizeProfileCode } from '../../utils/roles';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole | string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading message="Verificando autenticación..." />;
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const userRole = normalizeProfileCode(user.role);

  // ADMIN tiene acceso a todo
  if (userRole === USER_ROLES.ADMIN) {
    return <>{children}</>;
  }

  // Si se requiere un rol específico, verificar
  if (requiredRole) {
    const required = normalizeProfileCode(requiredRole as string);
    
    if (userRole !== required) {
      // Redirigir según el rol del usuario
      if (userRole === USER_ROLES.WAITER) {
        return <Navigate to={ROUTES.WAITER_ORDERS} replace />;
      } else if (userRole === USER_ROLES.CASHIER) {
        return <Navigate to={ROUTES.CASHIER_TABLES} replace />;
      } else {
        return <Navigate to={ROUTES.LOGIN} replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;