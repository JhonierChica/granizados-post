import React, { InputHTMLAttributes } from 'react';
import { Input as ShadcnInput } from '../ui/input';

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
    <div className={`${fullWidth ? 'w-full' : ''} space-y-2 mb-4`}>
      {label && (
        <label className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <ShadcnInput
        className={`transition-all ${error ? 'border-destructive focus-visible:ring-destructive' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
};

export default Input;