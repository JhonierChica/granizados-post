import React from 'react';
import Modal from '../../../components/common/Modal';
import { ORDER_STATUS } from '../../../utils/constants';
import { ToggleIcon, CheckCircleIcon } from '../../../components/common/Icons';
import type { Order, StatusBadge } from '../../../types';
import { Badge } from '../../../components/ui/badge';

interface StatusChangeModalProps {
  isOpen: boolean;
  statusOrder: Order | null;
  newStatus: string;
  onClose: () => void;
  onConfirm: () => void;
  onSelectStatus: (status: string) => void;
  getStatusBadge: (status: string) => StatusBadge;
}

const STATUS_OPTIONS = [
  { value: ORDER_STATUS.PENDING, label: 'PENDIENTE', emoji: '🟡', class: 'bg-amber-100 border-amber-200 text-amber-700' },
  { value: ORDER_STATUS.DELIVERED, label: 'YA SERVIDO', emoji: '✅', class: 'bg-indigo-100 border-indigo-200 text-indigo-700' },
];

const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  isOpen,
  statusOrder,
  newStatus,
  onClose,
  onConfirm,
  onSelectStatus,
  getStatusBadge,
}) => {
  if (!statusOrder) return null;

  const currentBadge = getStatusBadge(statusOrder.status);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ACTUALIZAR ESTADO DE COMANDA"
      onConfirm={onConfirm}
      size="medium"
      confirmText="GUARDAR CAMBIO"
    >
      <div className="space-y-8 py-2 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between bg-muted/20 p-5 rounded-3xl border border-muted/50 shadow-inner">
           <div className="space-y-1">
             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Pedido Actual</span>
             <h4 className="text-xl font-black tracking-tighter uppercase">Comanda #{statusOrder.id}</h4>
           </div>
           <div className="text-right space-y-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Estado Actual</span>
              <Badge className={`rounded-xl font-black text-[9px] uppercase tracking-wider px-3 py-1 flex items-center gap-2 ${currentBadge.class}`}>
                {currentBadge.emoji} {currentBadge.text}
              </Badge>
           </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
            <ToggleIcon size={14} className="text-primary" /> Seleccionar nuevo estado para cocina:
          </label>
          
          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onSelectStatus(opt.value)}
                className={`
                  group w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all text-left
                  ${newStatus === opt.value 
                    ? `${opt.class} ring-4 ring-primary/5 scale-[1.02] shadow-lg` 
                    : 'bg-white border-muted/40 text-muted-foreground hover:border-primary/20 hover:bg-muted/5'
                  }
                `}
              >
                <div className={`p-2 sm:p-3 rounded-xl transition-all ${newStatus === opt.value ? 'bg-white/40' : 'bg-muted/30 group-hover:bg-primary/5'}`}>
                   <span className="text-lg sm:text-xl leading-none">{opt.emoji}</span>
                </div>
                
                <div className="flex-1">
                  <span className="block font-black text-xs sm:text-sm uppercase tracking-tight">{opt.label}</span>
                  <span className="text-[9px] sm:text-[10px] opacity-70 font-medium italic hidden sm:block">Actualizar pedido a {opt.label.toLowerCase()}</span>
                </div>

                {newStatus === opt.value && (
                  <div className="bg-white/50 p-1 rounded-full text-current shadow-sm animate-in zoom-in duration-300">
                    <CheckCircleIcon size={20} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default StatusChangeModal;
