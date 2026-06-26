import React, { ReactNode } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '../ui/dialog';
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
  showActions = true 
}) => {
  const maxWidths = {
    'small': 'sm:max-w-sm',
    'medium': 'sm:max-w-md',
    'large': 'sm:max-w-2xl',
    'extra-large': 'sm:max-w-[95vw] lg:max-w-5xl'
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={maxWidths[size]}>
        <DialogHeader className="p-6 pb-0 sm:p-0">
          <DialogTitle className="text-2xl sm:text-xl font-black uppercase tracking-tight">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4 sm:px-0 sm:py-4">
          {children}
        </div>
        {showActions && (
          <DialogFooter className="gap-3 p-6 sm:p-4">
            <Button variant="secondary" onClick={onClose} className="h-14 sm:h-10 font-bold">
              Cancelar
            </Button>
            {onConfirm && (
              <Button
                variant="primary"
                onClick={onConfirm}
                disabled={confirmDisabled}
                className={`h-14 sm:h-10 font-black transition-opacity ${confirmDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {confirmText}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;