import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, USER_ROLES } from '../utils/constants';
import { normalizeProfileCode } from '../utils/roles';
import { cn } from '../lib/utils';
import {
  ShoppingBag, Truck, CreditCard, Calculator,
  Users, Table2, Utensils, Tags,
  Briefcase, UserCog, UsersRound, Settings,
  ChevronRight, Sparkles
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ModuleCardData {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: LucideIcon;
  colorKey: string;
}

interface ModuleGroup {
  label: string;
  items: ModuleCardData[];
}

// ---------------------------------------------------------------------------
// Color palette — one unique accent per module
// ---------------------------------------------------------------------------
const cardColors: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  orders:     { border: 'border-t-primary',       bg: 'bg-primary/15',       text: 'text-primary',       glow: 'hover:shadow-primary/20' },
  deliveries: { border: 'border-t-accent',        bg: 'bg-accent/15',        text: 'text-accent',        glow: 'hover:shadow-accent/20' },
  payments:   { border: 'border-t-secondary',     bg: 'bg-secondary/15',     text: 'text-secondary',     glow: 'hover:shadow-secondary/20' },
  cashreg:    { border: 'border-t-emerald-400',   bg: 'bg-emerald-400/15',   text: 'text-emerald-400',   glow: 'hover:shadow-emerald-400/20' },
  clients:    { border: 'border-t-sky-400',       bg: 'bg-sky-400/15',       text: 'text-sky-400',       glow: 'hover:shadow-sky-400/20' },
  tables:     { border: 'border-t-amber-400',     bg: 'bg-amber-400/15',     text: 'text-amber-400',     glow: 'hover:shadow-amber-400/20' },
  menu:       { border: 'border-t-rose-400',      bg: 'bg-rose-400/15',      text: 'text-rose-400',      glow: 'hover:shadow-rose-400/20' },
  categories: { border: 'border-t-cyan-400',      bg: 'bg-cyan-400/15',      text: 'text-cyan-400',      glow: 'hover:shadow-cyan-400/20' },
  employees:  { border: 'border-t-violet-400',    bg: 'bg-violet-400/15',    text: 'text-violet-400',    glow: 'hover:shadow-violet-400/20' },
  positions:  { border: 'border-t-teal-400',      bg: 'bg-teal-400/15',      text: 'text-teal-400',      glow: 'hover:shadow-teal-400/20' },
  profiles:   { border: 'border-t-fuchsia-400',   bg: 'bg-fuchsia-400/15',   text: 'text-fuchsia-400',   glow: 'hover:shadow-fuchsia-400/20' },
  users:      { border: 'border-t-blue-400',      bg: 'bg-blue-400/15',      text: 'text-blue-400',      glow: 'hover:shadow-blue-400/20' },
  settings:   { border: 'border-t-lime-400',      bg: 'bg-lime-400/15',      text: 'text-lime-400',      glow: 'hover:shadow-lime-400/20' },
};

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userRole = normalizeProfileCode(user?.role);

  // ------------------------------------------------------------------
  // Module groups per role
  // ------------------------------------------------------------------
  const groups = useMemo<ModuleGroup[]>(() => {
    if (userRole === USER_ROLES.ADMIN) {
      return [
        {
          label: 'Ventas',
          items: [
            { id: 'orders',     title: 'Pedidos',        description: 'Tomar y gestionar pedidos activos',   path: ROUTES.WAITER_ORDERS,          icon: ShoppingBag, colorKey: 'orders' },
            { id: 'deliveries', title: 'Domicilios',     description: 'Entregas pendientes y completadas',  path: ROUTES.CASHIER_DELIVERIES,     icon: Truck,       colorKey: 'deliveries' },
            { id: 'payments',   title: 'Pagos',           description: 'Cobros multi-método y referencias',  path: ROUTES.CASHIER_PAYMENTS,       icon: CreditCard,  colorKey: 'payments' },
            { id: 'cashreg',    title: 'Cierre de Caja',  description: 'Balance diario y reportes de venta', path: ROUTES.CASHIER_CASH_REGISTER,  icon: Calculator,  colorKey: 'cashreg' },
            { id: 'clients',    title: 'Clientes',        description: 'Registro de clientes frecuentes',    path: ROUTES.CASHIER_CLIENTS,        icon: Users,       colorKey: 'clients' },
            { id: 'tables',     title: 'Mesas',           description: 'Distribución y estado del salón',    path: ROUTES.CASHIER_TABLES,         icon: Table2,      colorKey: 'tables' },
          ],
        },
        {
          label: 'Menú',
          items: [
            { id: 'menu',       title: 'Gestión de Menú', description: 'Bebidas, precios y presentaciones', path: ROUTES.ADMIN_MENU,             icon: Utensils,    colorKey: 'menu' },
            { id: 'categories', title: 'Categorías',      description: 'Organizar el menú por tipo',        path: ROUTES.ADMIN_CATEGORIES,      icon: Tags,        colorKey: 'categories' },
          ],
        },
        {
          label: 'Personal',
          items: [
            { id: 'employees',  title: 'Empleados',       description: 'Meseras y personal del local',      path: ROUTES.ADMIN_EMPLOYEES,       icon: UserCog,     colorKey: 'employees' },
            { id: 'positions',  title: 'Cargos',           description: 'Roles y departamentos',             path: ROUTES.ADMIN_POSITIONS,       icon: Briefcase,   colorKey: 'positions' },
            { id: 'profiles',   title: 'Perfiles',         description: 'Permisos por perfil de usuario',    path: ROUTES.ADMIN_PROFILES,        icon: UsersRound,  colorKey: 'profiles' },
            { id: 'users',      title: 'Usuarios',         description: 'Cuentas de acceso al sistema',      path: ROUTES.ADMIN_USERS,           icon: Users,       colorKey: 'users' },
          ],
        },
        {
          label: 'Configuración',
          items: [
            { id: 'settings',   title: 'Métodos de Pago',  description: 'Efectivo, tarjeta, transferencia...', path: ROUTES.ADMIN_PAYMENT_METHODS, icon: Settings,    colorKey: 'settings' },
          ],
        },
      ];
    }

    if (userRole === USER_ROLES.WAITER) {
      return [
        {
          label: 'Servicio',
          items: [
            { id: 'orders', title: 'Pedidos', description: 'Tomar y gestionar pedidos activos', path: ROUTES.WAITER_ORDERS, icon: ShoppingBag, colorKey: 'orders' },
            { id: 'tables', title: 'Mesas',   description: 'Ver distribución del salón',        path: ROUTES.WAITER_TABLES, icon: Table2,      colorKey: 'tables' },
          ],
        },
      ];
    }

    if (userRole === USER_ROLES.CASHIER) {
      return [
        {
          label: 'Caja',
          items: [
            { id: 'orders',     title: 'Pedidos',          description: 'Tomar y gestionar pedidos activos',   path: ROUTES.WAITER_ORDERS,          icon: ShoppingBag, colorKey: 'orders' },
            { id: 'tables',     title: 'Mesas',           description: 'Ver estado de todas las mesas',      path: ROUTES.CASHIER_TABLES,         icon: Table2,     colorKey: 'tables' },
            { id: 'clients',    title: 'Clientes',        description: 'Registro de clientes frecuentes',    path: ROUTES.CASHIER_CLIENTS,        icon: Users,      colorKey: 'clients' },
            { id: 'payments',   title: 'Pagos',           description: 'Cobros multi-método y referencias',  path: ROUTES.CASHIER_PAYMENTS,       icon: CreditCard, colorKey: 'payments' },
            { id: 'cashreg',    title: 'Cierre de Caja',  description: 'Balance diario y reportes de venta', path: ROUTES.CASHIER_CASH_REGISTER,  icon: Calculator, colorKey: 'cashreg' },
          ],
        },
      ];
    }

    return [];
  }, [userRole]);

  // ------------------------------------------------------------------
  // Dynamic greeting
  // ------------------------------------------------------------------
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-secondary" />
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
            {greeting}
          </p>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-foreground">
          Panel <span className="text-primary">Principal</span>
        </h1>
        <p className="text-sm text-muted-foreground/70 max-w-xl">
          {userRole === USER_ROLES.ADMIN
            ? 'Gestión completa de La Bombonera. Todos los módulos al alcance.'
            : 'Seleccioná un módulo para empezar a trabajar.'}
        </p>
      </div>

      {/* Module Groups */}
      {groups.map((group) => (
        <section key={group.label} className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
              {group.label}
            </h2>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {group.items.map((item) => {
              const color = cardColors[item.colorKey] || cardColors.orders;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'group relative flex flex-col items-start gap-4 p-5 rounded-2xl',
                    'bg-card border border-border/50',
                    'border-t-2',
                    color.border,
                    'transition-all duration-300 ease-out',
                    'hover:-translate-y-1 hover:shadow-xl hover:border-border',
                    color.glow,
                    'text-left w-full',
                  )}
                >
                  {/* Icon Circle */}
                  <div className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center',
                    'transition-transform duration-300 group-hover:scale-110',
                    color.bg, color.text,
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-1">
                    <h3 className="text-sm font-black tracking-tight text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground/60 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Arrow on hover */}
                  <ChevronRight className={cn(
                    'absolute top-5 right-5 w-4 h-4 transition-all duration-300',
                    'opacity-0 -translate-x-2',
                    'group-hover:opacity-100 group-hover:translate-x-0',
                    color.text,
                  )} />
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

export default Dashboard;
