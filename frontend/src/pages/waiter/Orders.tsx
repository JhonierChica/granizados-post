import React from 'react';
import PageHeader from '../../components/common/PageHeader';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { OrdersIcon, PlusIcon, FilterIcon, ClipboardListIcon, ClockIcon, CheckCircleIcon } from '../../components/common/Icons';
import { ORDER_STATUS } from '../../utils/constants';
import { useOrders } from '../../hooks/useOrders';

import OrderCard from './components/OrderCard';
import StatusChangeModal from './components/StatusChangeModal';
import PaymentModal from './components/PaymentModal';
import OrderFormModal from './components/OrderFormModal';
import { Badge } from '../../components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_FILTERS = [
  { value: 'TODOS', label: 'Todos', icon: <FilterIcon size={14} /> },
  { value: ORDER_STATUS.PENDING, label: 'Pendiente', icon: <ClockIcon size={14} /> },
  { value: ORDER_STATUS.DELIVERED, label: 'Servido', icon: <CheckCircleIcon size={14} /> },
];

const Orders: React.FC = () => {
  const hook = useOrders();

  if (hook.loading) return <Loading type="card" message="Sincronizando comandas..." />;

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
        <PageHeader
          title="Panel de Comandas"
          subtitle="Seguimiento en tiempo real de pedidos."
          icon={<OrdersIcon size={22} />}
          iconColor="text-primary bg-primary/10"
          action={
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                onClick={hook.handleAdd} 
                disabled={hook.availableTables.length === 0}
                size="lg"
                className="hidden sm:flex rounded-xl sm:rounded-2xl font-black h-11 sm:h-14 px-6 sm:px-10 shadow-lg shadow-primary/20 bg-primary text-white border-none group transition-all w-full sm:w-auto"
              >
                <PlusIcon size={18} className="mr-2 group-hover:rotate-90 transition-transform" />
                NUEVA COMANDA
              </Button>
            </div>
          }
        />
        
        {/* WebSocket Connection Status Indicator */}
        <div className="flex items-center justify-end gap-2 -mt-3 mb-1">
          <span
            className={cn(
              'inline-block w-2.5 h-2.5 rounded-full',
              hook.connectionStatus === 'connected' && 'bg-green-500',
              hook.connectionStatus === 'reconnecting' && 'bg-yellow-500 animate-pulse',
              hook.connectionStatus === 'disconnected' && 'bg-red-500',
            )}
          />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {hook.connectionStatus === 'connected' && 'Conectado'}
            {hook.connectionStatus === 'reconnecting' && 'Reconectando...'}
            {hook.connectionStatus === 'disconnected' && 'Desconectado'}
          </span>
        </div>

        {/* Mobile FAB (Floating Action Button) */}
        <button
          onClick={hook.handleAdd}
          disabled={hook.availableTables.length === 0}
          className="sm:hidden fixed bottom-6 right-6 z-40 w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform shadow-primary/40 border-4 border-white"
        >
          <PlusIcon size={28} />
        </button>

        {/* Available Tables Alert */}
        {hook.availableTables.length === 0 && (
          <div className="bg-amber-50 border-2 border-amber-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-3 sm:gap-4 text-amber-800 font-bold text-xs sm:text-sm animate-pulse">
            <div className="bg-amber-500 text-white p-1 rounded-full shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M12 9v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 17c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <span>No hay mesas disponibles en este momento.</span>
          </div>
        )}

        {/* Filter Section */}
        <div className="bg-muted/30 p-2 sm:p-3 rounded-2xl sm:rounded-4xl border border-muted flex flex-col gap-3">
          <div className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-muted-foreground font-black text-[9px] sm:text-[10px] uppercase tracking-widest border-b border-muted/60">
            <FilterIcon size={12} />
            Filtrar:
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="flex items-center gap-1.5 p-0.5 overflow-x-auto no-scrollbar">
              {STATUS_FILTERS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => hook.setStatusFilter(opt.value)}
                  className={`
                    flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-tight transition-all shrink-0
                    ${hook.statusFilter === opt.value 
                      ? 'bg-background text-primary shadow-md scale-105 border border-primary/20' 
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }
                  `}
                >
                    <span className="text-muted-foreground">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-white/80 border border-primary/10 rounded-2xl px-3 py-2 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Nombre</span>
              <input
                value={hook.clientNameFilter}
                onChange={(e) => hook.setClientNameFilter(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full h-10 bg-muted/20 rounded-xl px-4 outline-none font-black text-xs uppercase tracking-widest placeholder:text-muted-foreground/50 focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 pt-2">
          {hook.filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              getStatusBadge={hook.getStatusBadge}
              getMenuItemName={hook.getMenuItemName}
              getMenuItemPrice={hook.getMenuItemPrice}
              onEdit={hook.handleEdit}
              onDelete={hook.handleDelete}
              onToggleStatus={hook.openStatusModal}
              onInitiatePayment={hook.handleInitiatePayment}
            />
          ))}
        </div>

        {/* Empty State */}
        {hook.filteredOrders.length === 0 && (
          <div className="text-center py-32 bg-muted/10 rounded-6xl border-2 border-dashed border-muted shadow-inner">
            <div className="bg-muted/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClipboardListIcon size={48} className="text-muted-foreground opacity-30" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 text-muted-foreground">
              {hook.statusFilter === 'TODOS' ? 'No hay actividad' : 'Sin coincidencias'}
            </h3>
            <p className="text-muted-foreground font-medium mb-10 max-w-xs mx-auto italic">
              {hook.statusFilter === 'TODOS'
                ? 'El salón está tranquilo. Inicia una comanda para ver la magia.'
                : `No encontramos pedidos con el estado que seleccionaste.`}
            </p>
            {hook.statusFilter !== 'TODOS' && (
              <Button onClick={() => hook.setStatusFilter('TODOS')} variant="outline" className="rounded-xl px-8 font-black">
                VER TODOS
              </Button>
            )}
          </div>
        )}

        {/* Modals & Dialogs */}
        <StatusChangeModal
          isOpen={hook.showStatusModal}
          statusOrder={hook.statusOrder}
          newStatus={hook.newStatus}
          onClose={() => { hook.setShowStatusModal(false); hook.setStatusOrder(null); }}
          onConfirm={hook.handleConfirmStatusChange}
          onSelectStatus={hook.setNewStatus}
          getStatusBadge={hook.getStatusBadge}
        />

        <OrderFormModal
          isOpen={hook.showModal}
          onClose={() => hook.setShowModal(false)}
          onConfirm={hook.handleSubmit}
          editingOrder={hook.editingOrder}
          formData={hook.formData}
          handleChange={hook.handleChange}
          clientStep={hook.clientStep}
          setClientStep={hook.setClientStep}
          existingClient={hook.existingClient}
          searchingClient={hook.searchingClient}
          orderType={hook.orderType}
          setOrderType={hook.setOrderType}
          searchExistingClient={hook.searchExistingClient}
          createNewClientAndProceed={hook.createNewClientAndProceed}
          handleQuickOrder={hook.handleQuickOrder}
          availableTables={hook.availableTables}
          menuItems={hook.menuItems}
          categories={hook.categories}
          selectedCategory={hook.selectedCategory}
          setSelectedCategory={hook.setSelectedCategory}
          selectedItems={hook.selectedItems}
          getFilteredMenuItems={hook.getFilteredMenuItems}
          handleAddItem={hook.handleAddItem}
          handleRemoveItem={hook.handleRemoveItem}
          handleQuantityChange={hook.handleQuantityChange}
          getMenuItemName={hook.getMenuItemName}
          getMenuItemPrice={hook.getMenuItemPrice}
          calculateOrderTotal={hook.calculateOrderTotal}
        />

        <ConfirmDialog
          isOpen={hook.showPaymentConfirm}
          onClose={() => hook.setShowPaymentConfirm(false)}
          onConfirm={hook.handleConfirmPaymentStart}
          title="CONFIRMAR CIERRE"
          message={`¿Vas a proceder con el cobro del Pedido #${hook.paymentOrder?.id || ''}? Valor: $${(hook.paymentOrder?.total || 0).toLocaleString('es-CO')}`}
        />

        <PaymentModal
          isOpen={hook.showPaymentModal}
          paymentOrder={hook.paymentOrder}
          paymentMethods={hook.paymentMethods}
          paidAmount={hook.paymentOrder ? (hook.paidByOrder[hook.paymentOrder.id] || 0) : 0}
          onClose={() => { hook.setShowPaymentModal(false); }}
          onConfirm={hook.handlePaymentSubmit}
          isSubmitting={hook.isSubmittingPayment}
        />
      </div>
    </Layout>
  );
};

export default Orders;