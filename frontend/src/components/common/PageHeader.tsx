import React, { ReactNode } from 'react';
import { Separator } from '../ui/separator';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  iconColor?: string;
  action?: ReactNode;
}

/**
 * PageHeader — Componente reutilizable para encabezados de pagina.
 * Mobile-first: titulo compacto en mobile, expandido en desktop.
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  iconColor = 'text-primary bg-primary/10',
  action,
}) => {
  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1 min-w-0">
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight flex items-center gap-3 text-foreground leading-tight">
            <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-inner shrink-0 ${iconColor}`}>
              {icon}
            </div>
            <span className="truncate">{title}</span>
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground font-medium opacity-70 line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="w-full sm:w-auto sm:shrink-0">{action}</div>}
      </div>
      <Separator className="bg-border/60" />
    </div>
  );
};

export default PageHeader;
