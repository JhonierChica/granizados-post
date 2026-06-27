import React, { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = true,
  className = '',
  ...props
}) => {
  return (
    <div className={cn('space-y-1.5', fullWidth && 'w-full')}>
      {label && (
        <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider ml-0.5">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full h-11 rounded-xl border border-input bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 outline-none',
          'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive/30',
          className,
        )}
        {...props}
      />
      {error && (
        <p className="text-[10px] font-bold text-destructive mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;
