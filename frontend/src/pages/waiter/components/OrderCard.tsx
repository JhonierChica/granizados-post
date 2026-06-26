import React from 'react';
import { EditIcon, DeleteIcon, ToggleIcon, WalletIcon, InfoIcon } from '../../../components/common/Icons';
import { ORDER_STATUS, USER_ROLES } from '../../../utils/constants';
import { useAuth } from '../../../context/AuthContext';
import { normalizeProfileCode } from '../../../utils/roles';
import type { Order, StatusBadge } from '../../../types';
import Card from '../../../components/common/Card';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';

interface OrderCardProps {
  order: Order;
  getStatusBadge: (status: string) => StatusBadge;
  getMenuItemName: (id: number) => string;
  getMenuItemPrice: (id: number) => number;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
  onToggleStatus: (order: Order) => void;
  onInitiatePayment: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  getStatusBadge,
  getMenuItemName,
  getMenuItemPrice,
  onEdit,
  onDelete,
  onToggleStatus,
  onInitiatePayment,
}) => {
  const { user } = useAuth();
  const statusBadge = getStatusBadge(order.status);
  const items = order.items || [];
  const userRole = normalizeProfileCode(user?.role);
  const canCollectPayment = userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.CASHIER;
  const canDeleteOrder = userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.CASHIER;

  return (
    <Card className="h-full flex flex-col group border-b-8 border-b-primary/5 hover:border-b-primary/40 transition-all duration-500">
      {/* Header — flex-wrap para que nunca se desborde */}
      <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-lg sm:text-2xl font-black tracking-tighter text-foreground">ORDER</span>
            <span className="font-mono text-base sm:text-xl font-black text-primary bg-primary/5 px-1.5 rounded-md">#{order.id}</span>
          </div>
          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-wider opacity-60">
             {order.createdAt
              ? (() => {
                  const [, time] = order.createdAt.split('T');
                  const [hourStr, minute] = time.split(':');
                  const hour24 = parseInt(hourStr, 10);
                  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
                  const ampm = hour24 >= 12 ? 'PM' : 'AM';
                  return `${hour12}:${minute} ${ampm}`;
                })()
              : 'Sin fecha'} — TDS
          </p>
        </div>
        <Badge className={`rounded-lg font-black text-[8px] sm:text-[9px] uppercase tracking-wider px-2 py-0.5 flex items-center gap-1 shadow-sm shrink-0 ${statusBadge.class}`}>
          {statusBadge.emoji} {statusBadge.text}
        </Badge>
      </div>

      {/* Info compacta: Mesa + Cliente en una sola fila flexible */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 bg-muted/30 px-2.5 py-2 rounded-lg border border-muted/50 min-w-0">
          <span className="text-[7px] sm:text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Mesa</span>
          <p className="font-black text-foreground text-[11px] sm:text-xs truncate">
            {order.orderType === 'DOMICILIO' ? '🏍️ Domicilio' : `🪑 Mesa ${order.tableNumber || 'N/A'}`}
          </p>
        </div>
        <div className="flex-1 bg-muted/30 px-2.5 py-2 rounded-lg border border-muted/50 min-w-0">
          <span className="text-[7px] sm:text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Cliente</span>
          <p className="font-black text-foreground text-[11px] sm:text-xs truncate">{order.clientName || 'General'}</p>
        </div>
      </div>
      <div className="flex gap-2 mb-3">
        <div className="flex-1 bg-muted/30 px-2.5 py-2 rounded-lg border border-muted/50 min-w-0">
          <span className="text-[7px] sm:text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Mesero</span>
          <p className="font-black text-foreground text-[11px] sm:text-xs truncate">{order.waiterName || 'N/A'}</p>
        </div>
      </div>

      {/* Items List — compacto y sin overflow */}
      <div className="flex-1 space-y-2 mb-3">
        <div className="flex items-center gap-2 px-0.5">
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
            Productos
          </span>
          <Badge variant="secondary" className="h-4 px-1.5 text-[7px] rounded-sm">{items.length}</Badge>
          <Separator className="flex-1 bg-muted/60" />
        </div>
        
        <div className="space-y-0.5 max-h-28 overflow-y-auto no-scrollbar">
          {items.length > 0 ? items.map((item, idx) => {
            const itemName = item.menuItemName || item.name || getMenuItemName(item.menuItemId);
            const itemPrice = item.menuItemPrice || item.unitPrice || item.price || getMenuItemPrice(item.menuItemId);
            const subtotal = (itemPrice || 0) * (item.quantity || 1);
            return (
              <div key={idx} className="flex justify-between items-center py-1.5 px-1 rounded-md hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="font-mono text-[10px] font-black text-primary/60 bg-primary/5 w-5 h-5 flex items-center justify-center rounded shrink-0">
                    {item.quantity}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-foreground/80 uppercase tracking-tight truncate">{itemName}</span>
                </div>
                <span className="font-mono text-[10px] font-black text-foreground/60 shrink-0 ml-2">${subtotal.toLocaleString('es-CO')}</span>
              </div>
            );
          }) : (
            <div className="py-4 text-center text-[9px] text-muted-foreground/50 font-black uppercase italic border border-dashed border-muted/30 rounded-lg">
              Comanda vacía
            </div>
          )}
        </div>
      </div>

      {/* Total — bien visible, sin overflow posible */}
      <div className="space-y-3">
        <div className="bg-primary p-3 rounded-xl text-white flex items-center justify-between">
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-80">Total</span>
          <span className="text-lg sm:text-xl font-black tracking-tighter">${(order.total || 0).toLocaleString('es-CO')}</span>
        </div>

        {order.notes && (
          <div className="p-2.5 bg-amber-50/50 border border-amber-100 rounded-lg flex gap-2">
            <InfoIcon size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-800/80 font-medium leading-relaxed italic wrap-break-word">
              {order.notes}
            </p>
          </div>
        )}
      </div>

      {/* Actions — siempre en fila, compactos */}
      <div className="flex gap-1.5 pt-4 mt-4 border-t border-dashed border-muted/60">
        <button 
          className="flex-1 flex items-center justify-center h-10 rounded-lg bg-muted/40 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all active:scale-95" 
          onClick={() => onEdit(order)} 
          title="Editar"
        >
          <EditIcon size={16} />
        </button>
        <button 
          className="flex-1 flex items-center justify-center h-10 rounded-lg bg-muted/40 text-muted-foreground hover:bg-amber-100 hover:text-amber-600 transition-all active:scale-95" 
          onClick={() => onToggleStatus(order)} 
          title="Estado"
        >
          <ToggleIcon size={16} />
        </button>
        {canDeleteOrder && (
          <button 
            className="flex-1 flex items-center justify-center h-10 rounded-lg bg-muted/40 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all active:scale-95" 
            onClick={() => onDelete(order)} 
            title="Eliminar"
          >
            <DeleteIcon size={16} />
          </button>
        )}

        {order.status === ORDER_STATUS.DELIVERED && canCollectPayment && (
          <button
            onClick={() => onInitiatePayment(order)}
            className="flex-1 flex items-center justify-center gap-1.5 h-10 bg-secondary text-white rounded-lg font-black text-[8px] uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-secondary/20"
          >
            <WalletIcon size={14} />
            COBRAR
          </button>
        )}
      </div>
    </Card>
  );
};

export default OrderCard;