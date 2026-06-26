import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';

// Admin pages
import Profiles from './pages/admin/Profiles';
import Positions from './pages/admin/Positions';
import Employees from './pages/admin/Employees';
import Users from './pages/admin/Users';
import Categories from './pages/admin/Categories';
import Menu from './pages/admin/Menu';
import PaymentMethods from './pages/admin/PaymentMethods';

// Waiter pages
import Orders from './pages/waiter/Orders';
import WaiterTables from './pages/waiter/Tables';

// Cashier pages
import Tables from './pages/cashier/Tables';
import Clients from './pages/cashier/Clients';
import Payments from './pages/cashier/Payments';
import Deliveries from './pages/cashier/Deliveries';
import CashRegister from './pages/cashier/CashRegister';

import { ROUTES, USER_ROLES } from './utils/constants';

import { Toaster } from 'sonner';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster 
        position="top-center" 
        expand={true} 
        richColors 
        closeButton
        toastOptions={{
          style: { 
            fontSize: '14px', 
            padding: '16px',
            borderRadius: '1.25rem',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
            border: '2px solid rgba(0,0,0,0.1)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          },
        }}
      />
      <Router>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<Login />} />
          
          <Route
            path={ROUTES.ADMIN_PROFILES}
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <Profiles />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_POSITIONS}
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <Positions />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_EMPLOYEES}
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <Employees />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_USERS}
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_CATEGORIES}
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <Categories />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_MENU}
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <Menu />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_PAYMENT_METHODS}
            element={
              <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
                <PaymentMethods />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.WAITER_ORDERS}
            element={
              <ProtectedRoute requiredRole={USER_ROLES.WAITER}>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.WAITER_TABLES}
            element={
              <ProtectedRoute requiredRole={USER_ROLES.WAITER}>
                <WaiterTables />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.CASHIER_TABLES}
            element={
              <ProtectedRoute requiredRole={USER_ROLES.CASHIER}>
                <Tables />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.CASHIER_CLIENTS}
            element={
              <ProtectedRoute requiredRole={USER_ROLES.CASHIER}>
                <Clients />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.CASHIER_PAYMENTS}
            element={
              <ProtectedRoute requiredRole={USER_ROLES.CASHIER}>
                <Payments />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.CASHIER_DELIVERIES}
            element={
              <ProtectedRoute requiredRole={USER_ROLES.CASHIER}>
                <Deliveries />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.CASHIER_CASH_REGISTER}
            element={
              <ProtectedRoute requiredRole={USER_ROLES.CASHIER}>
                <CashRegister />
              </ProtectedRoute>
            }
          />

          <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOGIN} replace />} />
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;