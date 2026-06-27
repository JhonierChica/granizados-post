import React, { ReactNode } from 'react';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  confirmDisabled?: boolean;
  size?: 'small' | 'medium' | 'large' | 'extra-large';
  showActions?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = 'Guardar',
  confirmDisabled = false,
  size = 'medium',
  showActions = true,
}) => {
  const maxWidths: Record<string, string> = {
    small: 'sm:max-w-sm',
    medium: 'sm:max-w-md',
    large: 'sm:max-w-2xl',
    'extra-large': 'sm:max-w-[95vw] lg:max-w-5xl',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      {/* Content */}
      <div
        className={cn(
          'relative z-50 w-full max-h-[100dvh] overflow-y-auto bg-card border border-border rounded-none sm:rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 fade-in-0 duration-200',
          'sm:max-h-[calc(100vh-4rem)] sm:max-w-[calc(100%-2rem)]',
          maxWidths[size],
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 border-b border-border/60 shrink-0">
          <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-foreground">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Cerrar"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">{children}</div>

        {/* Footer */}
        {showActions && (
          <div className="flex flex-col-reverse gap-3 border-t border-border/60 px-5 py-4 sm:px-6 sm:py-4 sm:flex-row sm:justify-end shrink-0">
            <Button variant="secondary" onClick={onClose} size="default">
              Cancelar
            </Button>
            {onConfirm && (
              <Button
                variant="primary"
                onClick={onConfirm}
                disabled={confirmDisabled}
                isLoading={confirmDisabled}
              >
                {confirmText}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
