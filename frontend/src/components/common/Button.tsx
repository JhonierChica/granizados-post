import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'success' | 'default';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs';
  isLoading?: boolean;
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/85 active:bg-primary/75 shadow-md shadow-primary/20',
  default:
    'bg-primary text-primary-foreground hover:bg-primary/85 active:bg-primary/75 shadow-md shadow-primary/20',
  secondary:
    'bg-card text-foreground border border-border hover:bg-muted hover:text-foreground shadow-sm',
  destructive:
    'bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30 shadow-sm',
  outline:
    'border border-border bg-transparent text-foreground hover:bg-muted shadow-sm',
  ghost:
    'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 shadow-md shadow-emerald-600/20',
};

const sizeStyles: Record<string, string> = {
  xs: 'h-7 gap-1 px-2.5 text-[10px] rounded-lg',
  sm: 'h-9 gap-1.5 px-3 text-xs rounded-xl',
  default: 'h-11 gap-2 px-5 text-sm rounded-xl',
  lg: 'h-14 gap-2 px-8 text-base rounded-2xl',
  icon: 'h-11 w-11 rounded-xl',
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'default',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex shrink-0 items-center justify-center font-black uppercase tracking-widest whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0';

  const variantClass = variantStyles[variant] || variantStyles.primary;
  const sizeClass = sizeStyles[size] || sizeStyles.default;

  return (
    <button
      className={cn(baseStyles, variantClass, sizeClass, className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
