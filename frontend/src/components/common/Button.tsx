import React, { ButtonHTMLAttributes } from 'react';
import { Button as ShadcnButton } from '../ui/button';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link' | 'primary' | 'success';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'default',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  // Mapeo de variantes legacy a shadcn
  const getVariant = (): any => {
    if (variant === 'primary') return 'default';
    if (variant === 'success') return 'default'; // Se podría extender shadcn con una variante success
    return variant;
  };

  return (
    <ShadcnButton
      variant={getVariant()}
      size={size as any}
      className={className}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 animate-spin">
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </span>
      ) : null}
      {children}
    </ShadcnButton>
  );
};

export default Button;