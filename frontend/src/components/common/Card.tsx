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
      className={`overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:border-primary/50 sm:hover:scale-[1.02] ${className}`}
      onClick={onClick}
    >
      {title && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 py-4 border-b bg-muted/30">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            {title}
          </CardTitle>
          {actions && <div className="flex gap-2">{actions}</div>}
        </CardHeader>
      )}
      <CardContent className="p-3 sm:p-6">
        {children}
      </CardContent>
    </ShadcnCard>
  );
};

export default Card;