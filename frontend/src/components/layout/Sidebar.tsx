import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, USER_ROLES } from '../../utils/constants';
import { Separator } from '../ui/separator';
import {
  OrdersIcon,
  TableIcon,
  ClientsIcon,
  PaymentIcon,
  DeliveryIcon,
  CashRegisterIcon,
  MenuIcon,
  CategoryIcon,
  TeamIcon,
  EmployeeIcon,
  BriefcaseIcon,
  ProfileIcon,
  UsersIcon,
  SettingsIcon,
  CollapseIcon,
  ExpandIcon,
  ChevronDownIcon,
  LogoutIcon,
} from '../common/Icons';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: MenuItem[];
}

interface MenuStructure {
  mainItems: MenuItem[];
  groups: MenuGroup[];
}

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

const Sidebar: React.FC<SidebarProps> = React.memo(
  ({ collapsed, mobileOpen, onToggleCollapse, onCloseMobile }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
      try {
        const saved = localStorage.getItem('sidebarExpandedGroups');
        return saved
          ? JSON.parse(saved)
          : { menu: false, personal: false, configuracion: false };
      } catch {
        return { menu: false, personal: false, configuracion: false };
      }
    });

    // Close mobile sidebar on route change
    useEffect(() => {
      onCloseMobile();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const handleLogout = useCallback(() => {
      logout();
      navigate(ROUTES.LOGIN);
    }, [logout, navigate]);

    const toggleGroup = useCallback((groupName: string) => {
      setExpandedGroups((prev) => {
        const next = { ...prev, [groupName]: !prev[groupName] };
        try {
          localStorage.setItem('sidebarExpandedGroups', JSON.stringify(next));
        } catch {
          // localStorage not available
        }
        return next;
      });
    }, []);

    const userRole = user?.role ?? 'WAITER';

    const menuStructure = useMemo<MenuStructure>(() => {
      switch (userRole) {
        case USER_ROLES.ADMIN:
          return {
            mainItems: [
              { path: ROUTES.WAITER_ORDERS, label: 'Pedidos', icon: <OrdersIcon size={20} /> },
              { path: ROUTES.CASHIER_DELIVERIES, label: 'Domicilios', icon: <DeliveryIcon size={20} /> },
              { path: ROUTES.CASHIER_PAYMENTS, label: 'Pagos', icon: <PaymentIcon size={20} /> },
              {
                path: ROUTES.CASHIER_CASH_REGISTER,
                label: 'Cierre de Caja',
                icon: <CashRegisterIcon size={20} />,
              },
              { path: ROUTES.CASHIER_CLIENTS, label: 'Clientes', icon: <ClientsIcon size={20} /> },
              { path: ROUTES.CASHIER_TABLES, label: 'Mesas', icon: <TableIcon size={20} /> },
            ],
            groups: [
              {
                id: 'menu',
                label: 'Menú',
                icon: <MenuIcon size={20} />,
                items: [
                  { path: ROUTES.ADMIN_MENU, label: 'Gestión de Menú', icon: <MenuIcon size={14} /> },
                  { path: ROUTES.ADMIN_CATEGORIES, label: 'Categorías', icon: <CategoryIcon size={14} /> },
                ],
              },
              {
                id: 'personal',
                label: 'Personal',
                icon: <TeamIcon size={20} />,
                items: [
                  { path: ROUTES.ADMIN_EMPLOYEES, label: 'Empleados', icon: <EmployeeIcon size={14} /> },
                  { path: ROUTES.ADMIN_POSITIONS, label: 'Cargos', icon: <BriefcaseIcon size={14} /> },
                  { path: ROUTES.ADMIN_PROFILES, label: 'Perfiles', icon: <ProfileIcon size={14} /> },
                  { path: ROUTES.ADMIN_USERS, label: 'Usuarios', icon: <UsersIcon size={14} /> },
                ],
              },
              {
                id: 'configuracion',
                label: 'Configuración',
                icon: <SettingsIcon size={20} />,
                items: [
                  {
                    path: ROUTES.ADMIN_PAYMENT_METHODS,
                    label: 'Métodos de Pago',
                    icon: <PaymentIcon size={14} />,
                  },
                ],
              },
            ],
          };
        case USER_ROLES.WAITER:
          return {
            mainItems: [
              { path: ROUTES.WAITER_ORDERS, label: 'Pedidos', icon: <OrdersIcon size={20} /> },
              { path: ROUTES.WAITER_TABLES, label: 'Mesas', icon: <TableIcon size={20} /> },
            ],
            groups: [],
          };
        case USER_ROLES.CASHIER:
          return {
            mainItems: [
              { path: ROUTES.CASHIER_TABLES, label: 'Mesas', icon: <TableIcon size={20} /> },
              { path: ROUTES.CASHIER_CLIENTS, label: 'Clientes', icon: <ClientsIcon size={20} /> },
              { path: ROUTES.CASHIER_PAYMENTS, label: 'Pagos', icon: <PaymentIcon size={20} /> },
              { path: ROUTES.CASHIER_DELIVERIES, label: 'Domicilios', icon: <DeliveryIcon size={20} /> },
              {
                path: ROUTES.CASHIER_CASH_REGISTER,
                label: 'Cierre de Caja',
                icon: <CashRegisterIcon size={20} />,
              },
            ],
            groups: [],
          };
        default:
          return { mainItems: [], groups: [] };
      }
    }, [userRole]);

    const isItemActive = (path: string) => location.pathname === path;
    const isGroupActive = (group: MenuGroup) =>
      group.items.some((item) => location.pathname === item.path);

    // Shared nav item button
    const NavButton: React.FC<{
      path?: string;
      onClick?: () => void;
      active: boolean;
      icon: React.ReactNode;
      label: string;
      collapsed: boolean;
      badge?: React.ReactNode;
    }> = ({ path, onClick, active, icon, label, collapsed: isCollapsed, badge }) => (
      <button
        onClick={() => {
          if (path) navigate(path);
          if (onClick) onClick();
        }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm
          ${
            active
              ? 'bg-primary/15 text-primary font-bold shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }
        `}
      >
        <span
          className={`shrink-0 transition-transform duration-200 ${
            active ? 'scale-110' : 'group-hover:scale-110'
          }`}
        >
          {icon}
        </span>
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left text-[11px] font-extrabold uppercase tracking-[0.08em]">
              {label}
            </span>
            {badge}
          </>
        )}
      </button>
    );

    const roleBadgeColors: Record<string, string> = {
      ADMIN: 'bg-primary/20 text-primary border-primary/30',
      WAITER: 'bg-secondary/20 text-secondary border-secondary/30',
      CASHIER: 'bg-accent/20 text-accent border-accent/30',
    };

    const roleLabels: Record<string, string> = {
      ADMIN: 'Admin',
      WAITER: 'Mesero',
      CASHIER: 'Cajero',
    };

    const badgeColor = roleBadgeColors[userRole] || roleBadgeColors.WAITER;
    const roleLabel = roleLabels[userRole] || userRole;

    return (
      <>
        {/* Mobile overlay backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
            onClick={onCloseMobile}
          />
        )}

        <aside
          className={`fixed left-0 top-0 bottom-0 z-50 md:z-40 bg-card border-r border-border flex flex-col overflow-hidden transition-all duration-300
            ${collapsed ? 'w-[4.5rem]' : 'w-64'}
            ${
              mobileOpen
                ? 'translate-x-0 w-[85vw] max-w-[320px]'
                : '-translate-x-full md:translate-x-0'
            }
          `}
        >
          {/* ── Header: Logo + brand + collapse toggle ── */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-1 rounded-lg bg-primary/10 shrink-0">
                <img
                  src="/logo-bombonera.png"
                  alt="Logo"
                  className="h-7 w-auto"
                />
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-primary font-black text-xs uppercase tracking-tighter leading-tight truncate">
                    La Bombonera
                  </span>
                  <span className="text-secondary font-extrabold text-[9px] uppercase leading-tight">
                    Bebidas
                  </span>
                </div>
              )}
            </div>

            {/* Collapse toggle (desktop) */}
            <button
              className="p-1.5 hover:bg-muted rounded-lg transition-colors hidden md:flex shrink-0"
              onClick={onToggleCollapse}
              title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            >
              {collapsed ? <ExpandIcon size={16} /> : <CollapseIcon size={16} />}
            </button>

            {/* Close button (mobile) */}
            <button
              className="p-1.5 bg-muted rounded-lg md:hidden shrink-0"
              onClick={onCloseMobile}
            >
              <CollapseIcon size={18} className="rotate-180" />
            </button>
          </div>

          {/* ── User section ── */}
          {user && !collapsed && (
            <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-base shadow-md shadow-primary/15 shrink-0">
                {user.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="font-extrabold text-xs uppercase tracking-tight truncate leading-tight">
                  {user.username || 'Usuario'}
                </p>
                <span
                  className={`text-[8px] font-black uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-md border inline-block mt-0.5 ${badgeColor}`}
                >
                  {roleLabel}
                </span>
              </div>
            </div>
          )}

          {/* ── Navigation ── */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
            {menuStructure.mainItems.map((item) => (
              <NavButton
                key={item.path}
                path={item.path}
                active={isItemActive(item.path)}
                icon={item.icon}
                label={item.label}
                collapsed={collapsed}
              />
            ))}

            {menuStructure.groups.length > 0 && (
              <Separator className="my-3 opacity-40" />
            )}

            {menuStructure.groups.map((group) => (
              <div key={group.id}>
                <NavButton
                  onClick={() => toggleGroup(group.id)}
                  active={isGroupActive(group)}
                  icon={group.icon}
                  label={group.label}
                  collapsed={collapsed}
                  badge={
                    !collapsed && (
                      <ChevronDownIcon
                        size={14}
                        className={`shrink-0 transition-transform duration-300 ${
                          expandedGroups[group.id] ? 'rotate-180' : ''
                        }`}
                      />
                    )
                  }
                />

                {/* Group children */}
                {!collapsed && expandedGroups[group.id] && (
                  <div className="ml-4 pl-3 border-l-2 border-muted/40 space-y-0.5 my-1 animate-in fade-in slide-in-from-left-2 duration-200">
                    {group.items.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-[0.06em] transition-all
                          ${
                            isItemActive(item.path)
                              ? 'text-primary bg-primary/10'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                          }
                        `}
                      >
                        <span className="shrink-0 opacity-60">{item.icon}</span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* ── Logout ── */}
          <div className="p-3 border-t border-border shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 font-extrabold text-[10px] uppercase tracking-[0.10em]"
            >
              <LogoutIcon size={16} />
              {!collapsed && <span>Cerrar Sesión</span>}
            </button>
          </div>
        </aside>
      </>
    );
  }
);

Sidebar.displayName = 'Sidebar';

export default Sidebar;
