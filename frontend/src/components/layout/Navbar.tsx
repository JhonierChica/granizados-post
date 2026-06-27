import React, { useState, useCallback, useMemo, useRef, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, USER_ROLES } from '../../utils/constants';
import { Separator } from "../ui/separator";
import {
  OrdersIcon,
  MenuIcon,
  TableIcon,
  ClientsIcon,
  TeamIcon,
  EmployeeIcon,
  BriefcaseIcon,
  ProfileIcon,
  UsersIcon,
  PaymentIcon,
  SettingsIcon,
  CategoryIcon,
  LogoutIcon,
  CollapseIcon,
  ExpandIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  DeliveryIcon,
  CashRegisterIcon,
} from '../common/Icons';

interface MenuItem {
  path: string;
  label: string;
  icon: ReactNode;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: ReactNode;
  items: MenuItem[];
}

interface MenuStructure {
  mainItems: MenuItem[];
  groups: MenuGroup[];
}

interface NavbarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = React.memo(({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('sidebarExpandedGroups');
    return saved ? JSON.parse(saved) : {
      menu: false,
      personal: false,
      finanzas: false,
      configuracion: false
    };
  });

  const handleLogout = useCallback(() => {
    logout();
    navigate(ROUTES.LOGIN);
  }, [logout, navigate]);

  const toggleGroup = useCallback((groupName: string) => {
    setExpandedGroups(prev => {
      const newState = { ...prev, [groupName]: !prev[groupName] };
      localStorage.setItem('sidebarExpandedGroups', JSON.stringify(newState));
      return newState;
    });
  }, []);

  const menuStructure = useMemo<MenuStructure>(() => {
    if (!user) return { mainItems: [], groups: [] };

    switch (user.role) {
      case USER_ROLES.ADMIN:
        return {
          mainItems: [
            { path: ROUTES.WAITER_ORDERS, label: 'Pedidos', icon: <OrdersIcon /> },
            { path: ROUTES.CASHIER_DELIVERIES, label: 'Domicilios', icon: <DeliveryIcon /> },
            { path: ROUTES.CASHIER_PAYMENTS, label: 'Pagos', icon: <PaymentIcon /> },
            { path: ROUTES.CASHIER_CASH_REGISTER, label: 'Cierre de Caja', icon: <CashRegisterIcon /> },
            { path: ROUTES.CASHIER_CLIENTS, label: 'Clientes', icon: <ClientsIcon /> },
            { path: ROUTES.CASHIER_TABLES, label: 'Mesas', icon: <TableIcon /> },
          ],
          groups: [
            {
              id: 'menu',
              label: 'Menú',
              icon: <MenuIcon />,
              items: [
                { path: ROUTES.ADMIN_MENU, label: 'Gestión de Menú', icon: <MenuIcon /> },
                { path: ROUTES.ADMIN_CATEGORIES, label: 'Categorías', icon: <CategoryIcon /> },
              ]
            },
            {
              id: 'personal',
              label: 'Personal',
              icon: <TeamIcon />,
              items: [
                { path: ROUTES.ADMIN_EMPLOYEES, label: 'Empleados', icon: <EmployeeIcon /> },
                { path: ROUTES.ADMIN_POSITIONS, label: 'Cargos', icon: <BriefcaseIcon /> },
                { path: ROUTES.ADMIN_PROFILES, label: 'Perfiles', icon: <ProfileIcon /> },
                { path: ROUTES.ADMIN_USERS, label: 'Usuarios', icon: <UsersIcon /> },
              ]
            },
            {
              id: 'configuracion',
              label: 'Configuración',
              icon: <SettingsIcon />,
              items: [
                { path: ROUTES.ADMIN_PAYMENT_METHODS, label: 'Métodos de Pago', icon: <PaymentIcon /> },
              ]
            }
          ]
        };
      case USER_ROLES.WAITER:
        return {
          mainItems: [
            { path: ROUTES.WAITER_ORDERS, label: 'Pedidos', icon: <OrdersIcon /> },
            { path: ROUTES.WAITER_TABLES, label: 'Mesas', icon: <TableIcon /> },
          ],
          groups: []
        };
      case USER_ROLES.CASHIER:
        return {
          mainItems: [
            { path: ROUTES.CASHIER_TABLES, label: 'Mesas', icon: <TableIcon /> },
            { path: ROUTES.CASHIER_CLIENTS, label: 'Clientes', icon: <ClientsIcon /> },
            { path: ROUTES.CASHIER_PAYMENTS, label: 'Pagos', icon: <PaymentIcon /> },
            { path: ROUTES.CASHIER_DELIVERIES, label: 'Domicilios', icon: <DeliveryIcon /> },
            { path: ROUTES.CASHIER_CASH_REGISTER, label: 'Cierre de Caja', icon: <CashRegisterIcon /> },
          ],
          groups: []
        };
      default:
        return { mainItems: [], groups: [] };
    }
  }, [user]);

  const isItemActive = useCallback((path: string) => location.pathname === path, [location.pathname]);
  const isGroupActive = useCallback((group: MenuGroup) => group.items.some(item => location.pathname === item.path), [location.pathname]);

  return (
    <>
      {/* Mobile Nav Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-20 bg-primary text-white flex items-center justify-between px-6 z-50 shadow-lg">
        <button 
          className="w-12 h-12 flex items-center justify-center bg-white/20 rounded-xl active:scale-95 transition-transform" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <div className="relative w-6 h-5 flex flex-col justify-between">
            <span className={`w-6 h-1 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-4 h-1 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-6 h-1 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
        <div className="flex flex-col items-center">
          <span className="font-black text-sm uppercase tracking-widest leading-none">La Bombonera</span>
          <span className="font-bold text-[10px] opacity-70">Bebidas</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm backdrop-blur-md border border-white/10">
          {user?.username.charAt(0).toUpperCase()}
        </div>
      </div>

      <aside 
        className={`fixed left-0 top-0 bottom-0 bg-card border-r z-50 transition-all duration-300 flex flex-col overflow-hidden
          ${collapsed ? 'w-17.5' : 'w-64'}
          ${mobileMenuOpen ? 'translate-x-0 w-[85vw]' : 'max-md:-translate-x-full'}
        `}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-primary/10 rounded-xl">
               <img src="/logo-bombonera.png" alt="Logo" className="h-8 w-auto" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-primary font-black text-sm leading-tight uppercase tracking-tighter">La Bombonera</span>
                <span className="text-secondary font-bold text-[10px] uppercase">Bebidas</span>
              </div>
            )}
          </div>
          
          <button 
            className="p-2 hover:bg-muted rounded-xl transition-colors border md:flex hidden"
            onClick={onToggle}
          >
            {collapsed ? <ExpandIcon size={16} /> : <CollapseIcon size={16} />}
          </button>

          {/* Mobile Close Button */}
          <button 
            className="p-2 bg-muted rounded-xl md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <CollapseIcon size={20} className="rotate-180" />
          </button>
        </div>

        {user && !collapsed && (
          <div className="p-6 bg-muted/20 border-b flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-lg shadow-lg shadow-primary/20">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-black text-sm truncate uppercase tracking-tight">{user.username}</p>
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.2em] opacity-60 italic">{user.role}</p>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 no-scrollbar" ref={navRef}>
          {menuStructure.mainItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group relative
                ${isItemActive(item.path) 
                  ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
              `}
            >
              <span className={`transition-transform duration-300 ${isItemActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              {!collapsed && <span className="ml-4 text-xs font-black uppercase tracking-widest">{item.label}</span>}
              {isItemActive(item.path) && !collapsed && (
                <div className="ml-auto w-1.5 h-6 rounded-full bg-primary-foreground/40" />
              )}
            </button>
          ))}

          {menuStructure.groups.length > 0 && <Separator className="my-6 opacity-50" />}

          {menuStructure.groups.map((group) => (
            <div key={group.id} className="space-y-2">
              <button
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group
                  ${isGroupActive(group) ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                `}
              >
                <span className="group-hover:scale-110 transition-transform">{group.icon}</span>
                {!collapsed && (
                  <>
                    <span className="ml-4 text-xs font-black uppercase tracking-widest text-left flex-1">{group.label}</span>
                    <ChevronDownIcon 
                      size={14} 
                      className={`transition-transform duration-500 ${expandedGroups[group.id] ? 'rotate-180' : ''}`} 
                    />
                  </>
                )}
              </button>

              {!collapsed && expandedGroups[group.id] && (
                <div className="ml-6 pl-4 border-l-2 border-muted/50 space-y-1.5 animate-in fade-in slide-in-from-left-2 duration-300">
                  {group.items.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                        ${isItemActive(item.path) ? 'text-primary bg-primary/10 shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}
                      `}
                    >
                      <span className="scale-75 opacity-50">{item.icon}</span>
                      <span className="ml-3">{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 font-black text-xs uppercase tracking-widest"
          >
            <LogoutIcon size={16} />
            {!collapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
});

export default Navbar;

