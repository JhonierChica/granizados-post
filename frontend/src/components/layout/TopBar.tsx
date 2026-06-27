import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';
import { normalizeProfileCode } from '../../utils/roles';
import { LogOut } from 'lucide-react';
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

const TopBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userRole = normalizeProfileCode(user?.role);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const badgeColor = roleBadgeColors[userRole] || roleBadgeColors.WAITER;
  const roleLabel = roleLabels[userRole] || userRole;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Brand */}
        <button
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img
            src="/logo-bombonera.png"
            alt="La Bombonera"
            className="h-8 w-auto"
          />
          <span className="hidden sm:block text-xs font-black text-foreground/80 uppercase tracking-[0.15em]">
            La Bombonera
          </span>
        </button>

        {/* Center: nothing (clean) */}

        {/* Right: User + Logout */}
        <div className="flex items-center gap-3">
          {/* User avatar circle */}
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center font-black text-sm text-primary">
            {user?.username?.charAt(0).toUpperCase() || '?'}
          </div>

          {/* Username + Role */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-foreground leading-tight">
              {user?.username || 'Usuario'}
            </span>
            <span className={cn(
              'text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border',
              badgeColor,
            )}>
              {roleLabel}
            </span>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-destructive transition-all duration-200"
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
