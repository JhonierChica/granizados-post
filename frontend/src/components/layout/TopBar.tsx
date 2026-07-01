import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ROUTES, USER_ROLES } from '../../utils/constants';
import { normalizeProfileCode } from '../../utils/roles';
import { LogOut, Sun, Moon, Menu } from 'lucide-react';
import { cn } from '../../lib/utils';

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

interface TopBarProps {
  onMenuClick?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const userRole = normalizeProfileCode(user?.role);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const badgeColor = roleBadgeColors[userRole] || roleBadgeColors.WAITER;
  const roleLabel = roleLabels[userRole] || userRole;

  return (
    <header className="fixed top-0 left-0 md:left-60 right-0 h-16 z-50 bg-theme-glass backdrop-blur-md border-b border-theme-subtle transition-all duration-300">
      <div className="h-full px-3 sm:px-6 flex items-center justify-between">
        {/* Left: hamburger (mobile) + brand */}
        <div className="flex items-center gap-2">
          {/* Hamburger — mobile only */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl hover:bg-theme-muted text-theme-muted hover:text-theme transition-all duration-200"
            title="Menú"
          >
            <Menu size={20} />
          </button>

          <button
            onClick={() => {
              const role = normalizeProfileCode(user?.role);
              if (role === USER_ROLES.WAITER) navigate(ROUTES.WAITER_ORDERS);
              else if (role === USER_ROLES.CASHIER) navigate(ROUTES.CASHIER_TABLES);
              else navigate(ROUTES.ADMIN_PROFILES);
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src="/logo-bombonera.png"
              alt="La Bombonera"
              className="h-8 w-auto"
            />
            <span className="hidden sm:block text-xs font-black text-theme-subtle uppercase tracking-[0.15em] truncate">
              La Bombonera
            </span>
          </button>
        </div>

        {/* Center: nothing (clean) */}

        {/* Right: theme toggle + user + logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-theme-muted text-theme-muted hover:text-theme transition-all duration-200"
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User avatar circle */}
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center font-black text-sm text-primary shrink-0">
            {user?.username?.charAt(0).toUpperCase() || '?'}
          </div>

          {/* Username + Role */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-theme leading-tight">
              {user?.username || 'Usuario'}
            </span>
            <span
              className={cn(
                'text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border',
                badgeColor
              )}
            >
              {roleLabel}
            </span>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl hover:bg-theme-muted text-theme-muted hover:text-destructive transition-all duration-200"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
