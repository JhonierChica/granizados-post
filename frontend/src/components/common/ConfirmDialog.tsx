import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { DeleteIcon, ToggleIcon } from './Icons';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'warning' | 'danger' | 'info';
  confirmText?: string;
  cancelText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-4"><DeleteIcon size={48} /></div>;
      case 'warning':
        return <div className="p-4 rounded-full bg-amber-500/10 text-amber-500 mb-4"><ToggleIcon size={48} /></div>;
      default:
        return null;
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl">
        <AlertDialogHeader className="flex flex-col items-center">
          {getIcon()}
          <AlertDialogTitle className="text-xl sm:text-2xl font-black tracking-tight">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground pt-2 text-xs sm:text-sm font-medium italic">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center w-full gap-3 mt-6 sm:mt-4">
          <AlertDialogCancel onClick={onClose} className="flex-1 h-12 sm:h-10 rounded-xl font-bold">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className={`flex-1 h-12 sm:h-10 rounded-xl font-black ${type === 'danger' ? 'bg-destructive hover:bg-destructive/90' : 'bg-amber-500 hover:bg-amber-600'}`}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;