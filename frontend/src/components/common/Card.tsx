import React, { ReactNode } from 'react';
import { Card as ShadcnCard, CardHeader, CardTitle, CardContent } from '../ui/card';

interface CardProps {
  title?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ title, children, actions, className = '', onClick }) => {
  return (
    <ShadcnCard
      className={`overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${className}`}
      onClick={onClick}
    >
      {title && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-5 py-4 sm:px-6 sm:py-5 border-b border-border/60 bg-muted/20">
          <CardTitle className="text-sm font-black uppercase tracking-tight text-foreground flex items-center gap-2">
            {title}
          </CardTitle>
          {actions && <div className="flex gap-2">{actions}</div>}
        </CardHeader>
      )}
      <CardContent className="p-4 sm:p-6">
        {children}
      </CardContent>
    </ShadcnCard>
  );
};

export default Card;
