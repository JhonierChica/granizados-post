import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { generateId } from '../../utils/idGenerator';
import PageHeader from '../../components/common/PageHeader';
import Layout from '../../components/layout/Layout';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { TruckIcon, FilterIcon, DeliveryIcon, CheckCircleIcon, WalletIcon, ReceiptIcon, UserIcon, ClipboardIcon, TrendingUpIcon, ShoppingCartIcon, TrashIcon, ChevronLeftIcon, InfoIcon, SearchIcon, FastForwardIcon, HistoryIcon, ClockIcon } from '../../components/common/Icons';
import { deliveryService } from '../../services/deliveryService';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import { paymentMethodService } from '../../services/paymentMethodService';
import { menuService } from '../../services/menuService';
import { categoryService } from '../../services/categoryService';
import type { Delivery, Order, Payment, PaymentMethod, PaymentLine, DeliveryStatus, MenuItem, Category } from '../../types';
import DeliveryCard from './components/DeliveryCard';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { useWebSocket } from '../../hooks/useWebSocket';

type DeliveryFilter = 'TODOS' | DeliveryStatus;

interface DeliveryStatusOption {
  value: string;
  label: string;
  emoji: React.ReactNode;
  class: string;
}

const DELIVERY_STATUS_FILTERS: (DeliveryStatusOption & { value: DeliveryFilter })[] = [
  { value: 'TODOS', label: 'Todos', emoji: <FilterIcon size={14} />, class: 'bg-muted/50 border-muted text-muted-foreground' },
  { value: 'PENDING', label: 'Pendiente', emoji: <ClockIcon size={14} />, class: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
  { value: 'DELIVERED', label: 'Entregado', emoji: <CheckCircleIcon size={14} />, class: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
];

const DELIVERY_STATUS_OPTIONS: DeliveryStatusOption[] = [
  { value: 'PENDING', label: 'PENDIENTE', emoji: <ClockIcon size={20} />, class: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
  { value: 'DELIVERED', label: 'ENTREGADO', emoji: <CheckCircleIcon size={20} />, class: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
];

const getStatusBadge = (status: string) => {
  const map: Record<string, { text: string; class: string }> = {
    PENDING:   { text: 'PENDIENTE', class: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
    DELIVERED: { text: 'ENTREGADO', class: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  };
  return map[status] || map.PENDING;
};

const getMenuItemName = (_id: number) => '';
const getMenuItemPrice = (_id: number) => 0;

const Deliveries: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [ordersMap, setOrdersMap] = useState<Record<number, Order>>({});
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<DeliveryFilter>('PENDING');
  const [deliveryOrderIds, setDeliveryOrderIds] = useState<Set<number>>(new Set());

  // Status change modal
  const [showDeliveryStatusModal, setShowDeliveryStatusModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [newDeliveryStatus, setNewDeliveryStatus] = useState<DeliveryStatus | ''>('');

  // Delete confirm
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deliveryToDelete, setDeliveryToDelete] = useState<Delivery | null>(null);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editItems, setEditItems] = useState<{ menuItemId: number; quantity: number }[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Add item to edit modal
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<number | ''>('');
  const [selectedMenuItemQty, setSelectedMenuItemQty] = useState(1);

  // Edit modal: category + menu filter
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Payment modals
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentLines, setPaymentLines] = useState<PaymentLine[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(0);

  const { onEvent } = useWebSocket();

  useEffect(() => { loadData(); }, []);

  // WebSocket subscription for real-time delivery updates
  useEffect(() => {
    const unsubStatus = onEvent('DELIVERY_STATUS_CHANGED', (data: any) => {
      const deliveryId = data?.deliveryId;
      const newStatus = data?.newStatus;
      if (!deliveryId || !newStatus) return;

      setDeliveries((prev) => {
        const updated = prev.map((d) =>
          d.id === deliveryId ? { ...d, status: newStatus } : d,
        );
        return updated;
      });
    });

    const unsubCreated = onEvent('DELIVERY_CREATED', (data: any) => {
      const deliveryId = data?.deliveryId;
      const orderId = data?.orderId;
      if (!deliveryId || !orderId) return;

      // Fetch the new delivery's order data and add to local state
      Promise.all([
        deliveryService.getDeliveryById(deliveryId),
        orderService.getOrderById(orderId),
        paymentService.getAllPayments(),
      ])
        .then(([delivery, order, paymentsData]) => {
          const paidOrderIds = new Set(
            paymentsData.filter((p: Payment) => p.status === 'COMPLETADO').map((p: Payment) => p.orderId),
          );
          if (paidOrderIds.has(orderId)) return; // already paid, don't add

          setDeliveries((prev) => {
            const exists = prev.some((d) => d.id === deliveryId);
            if (exists) return prev;
            return [...prev, delivery];
          });
          setDeliveryOrderIds((prev) => new Set(prev).add(orderId));
          setOrdersMap((prev) => ({ ...prev, [orderId]: order }));
        })
        .catch((err) => console.error('Error fetching delivery created event data:', err));
    });

    // When a DOMICILIO order is edited, update ordersMap in real time
    const unsubOrderUpdated = onEvent('ORDER_UPDATED', (data: any) => {
      const orderId = data?.id;
      if (!orderId) return;

      setOrdersMap((prev) => {
        if (!prev[orderId]) return prev; // not a DOMICILIO order we track
        // data is the full OrderResponse — merge items, total, notes, etc.
        const updated: Order = {
          id: data.id,
          tableId: data.tableId,
          clientId: data.clientId,
          tableNumber: data.tableNumber,
          clientName: data.clientName,
          clientPhone: data.clientPhone,
          address: data.address,
          clientAddress: data.clientAddress,
          orderType: data.orderType || 'DOMICILIO',
          status: data.status,
          total: data.total,
          waiterId: data.waiterId,
          waiterName: data.waiterName,
          items: data.items || [],
          createdAt: data.createdAt,
          notes: data.notes,
        };
        return { ...prev, [orderId]: updated };
      });
    });

    // When a DOMICILIO order is deleted, remove the delivery from state
    const unsubOrderDeleted = onEvent('ORDER_DELETED', (data: any) => {
      const orderId = data?.orderId;
      if (!orderId) return;

      setDeliveries((prev) => prev.filter((d) => d.orderId !== orderId));
      setOrdersMap((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
      setDeliveryOrderIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    });

    return () => {
      unsubStatus();
      unsubCreated();
      unsubOrderUpdated();
      unsubOrderDeleted();
    };
  }, [onEvent]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deliveriesData, paymentMethodsData, paymentsData] = await Promise.all([
        deliveryService.getAllDeliveries(),
        paymentMethodService.getActivePaymentMethods(),
        paymentService.getAllPayments(),
      ]);

      const paidOrderIds = new Set(
        paymentsData.filter((p: Payment) => p.status === 'COMPLETADO').map((p: Payment) => p.orderId),
      );
      const unpaid = deliveriesData.filter((d: Delivery) => !paidOrderIds.has(d.orderId));

      const map: Record<number, Order> = {};
      for (const delivery of unpaid) {
        try {
          map[delivery.orderId] = await orderService.getOrderById(delivery.orderId);
        } catch (err) {
          console.error(`Error al cargar pedido ${delivery.orderId}:`, err);
        }
      }

      // Track ALL delivery order IDs to filter stats correctly
      const allDeliveryOrderIds = new Set(deliveriesData.map((d: Delivery) => d.orderId));
      setDeliveryOrderIds(allDeliveryOrderIds);

      setDeliveries(unpaid);
      setOrdersMap(map);
      setAllPayments(paymentsData);
      setPaymentMethods(paymentMethodsData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  // === Stats ===
  const completedPaymentsDomicilio = allPayments.filter(
    (p) => p.status === 'COMPLETADO' && deliveryOrderIds.has(p.orderId),
  );
  const totalDomicilios = completedPaymentsDomicilio.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalDeliveryFees = completedPaymentsDomicilio.reduce((sum, p) => sum + (p.deliveryFee || 0), 0);

  // === Handlers: Status Change ===
  const handleToggleStatus = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setNewDeliveryStatus(delivery.status || 'PENDING');
    setShowDeliveryStatusModal(true);
  };

  const handleDeliveryStatusSubmit = async () => {
    if (!selectedDelivery || !newDeliveryStatus) return;
    try {
      await deliveryService.updateDeliveryStatus(selectedDelivery.id, newDeliveryStatus as DeliveryStatus);
      setShowDeliveryStatusModal(false);
      setSelectedDelivery(null);
      toast.success('Estado del envío actualizado');
      loadData();
    } catch (err) {
      console.error('Error al actualizar estado del domicilio:', err);
      toast.error('Error al actualizar estado');
    }
  };

  // === Handlers: Edit ===
  const handleEdit = (delivery: Delivery, order: Order | null) => {
    setEditingDelivery(delivery);
    setEditingOrder(order);
    setEditNotes(order?.notes || '');
    setEditItems(order?.items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })) || []);
    setSelectedMenuItemId('');
    setSelectedMenuItemQty(1);
    setSelectedCategory('');

    // Load menu items + categories once
    if (menuItems.length === 0) {
      menuService.getAllMenuItems().then(setMenuItems).catch(() => {});
    }
    if (categories.length === 0) {
      categoryService.getAllCategories().then(setCategories).catch(() => {});
    }

    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editingOrder) return;
    try {
      const sanitizedItems = editItems
        .filter((i) => i.menuItemId && i.quantity > 0)
        .map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity }));

      await orderService.updateOrder(editingOrder.id, {
        tableId: editingOrder.tableId ?? 0,
        status: editingOrder.status,
        items: sanitizedItems,
        notes: editNotes,
      });
      setShowEditModal(false);
      setEditingDelivery(null);
      setEditingOrder(null);
      toast.success('Pedido actualizado');
      loadData();
    } catch (err: any) {
      console.error('Error al editar pedido:', err);
      toast.error('Error al guardar cambios');
    }
  };

  const handleEditItemQuantity = (menuItemId: number, delta: number) => {
    setEditItems((prev) =>
      prev.map((item) =>
        item.menuItemId === menuItemId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };

  const handleRemoveEditItem = (menuItemId: number) => {
    setEditItems((prev) => prev.filter((item) => item.menuItemId !== menuItemId));
  };

  const getFilteredMenuItems = () => {
    if (!selectedCategory) return menuItems.filter((m) => m.available);
    return menuItems.filter((m) => m.available && m.categoryId === parseInt(selectedCategory));
  };

  const handleAddItemByClick = (menuItemId: number) => {
    setEditItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItemId);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { menuItemId, quantity: 1 }];
    });
  };

  const handleAddItemToOrder = () => {
    if (selectedMenuItemId === '' || selectedMenuItemQty < 1) return;
    const id = selectedMenuItemId as number;
    setEditItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === id ? { ...i, quantity: i.quantity + selectedMenuItemQty } : i,
        );
      }
      return [...prev, { menuItemId: id, quantity: selectedMenuItemQty }];
    });
    setSelectedMenuItemId('');
    setSelectedMenuItemQty(1);
  };

  // === Handlers: Delete ===
  const handleDeleteClick = (delivery: Delivery) => {
    setDeliveryToDelete(delivery);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deliveryToDelete) return;
    try {
      await orderService.deleteOrder(deliveryToDelete.orderId);
      setShowDeleteConfirm(false);
      setDeliveryToDelete(null);
      toast.success('Pedido eliminado');
      loadData();
    } catch (err: any) {
      console.error('Error al eliminar pedido:', err);
      toast.error('Error al eliminar el pedido');
    }
  };

  // === Handlers: Payment ===
  const handleInitiatePayment = (delivery: Delivery) => {
    const order = ordersMap[delivery.orderId];
    if (!order) return;
    setPaymentOrder(order);
    setShowPaymentConfirm(true);
  };

  const handleConfirmPaymentStart = () => {
    if (!paymentOrder) return;
    setShowPaymentConfirm(false);
    const orderTotal = paymentOrder.total || 0;
    setDeliveryFee(0);
    setPaymentLines([
      { id: generateId(), paymentMethodId: 0, amount: orderTotal, receivedAmount: 0, change: 0 }
    ]);
    setShowPaymentModal(true);
  };

  // --- Payment lines helpers ---
  const totalPedido = paymentOrder?.total || 0;
  const totalAPagar = totalPedido + deliveryFee;
  const totalLinesAmount = paymentLines.reduce((sum, l) => sum + (l.amount || 0), 0);
  const difference = totalAPagar - totalLinesAmount;

  const addPaymentLine = () => {
    setPaymentLines(prev => [...prev, { id: generateId(), paymentMethodId: 0, amount: 0, receivedAmount: 0, change: 0 }]);
  };

  const removePaymentLine = (id: string) => {
    if (paymentLines.length <= 1) return;
    setPaymentLines(prev => prev.filter(l => l.id !== id));
  };

  const updatePaymentLine = (id: string, field: 'paymentMethodId' | 'amount' | 'receivedAmount', value: number) => {
    setPaymentLines(prev => prev.map(l => {
      if (l.id !== id) return l;
      const updated = { ...l, [field]: value };
      if (field === 'receivedAmount') {
        updated.change = Math.max(0, value - l.amount);
      } else if (field === 'amount') {
        updated.change = Math.max(0, l.receivedAmount - value);
      }
      return updated;
    }));
  };

  const isLineTransfer = (paymentMethodId: number): boolean => {
    if (!paymentMethodId) return false;
    const method = paymentMethods.find(m => m.id === paymentMethodId);
    if (!method) return false;
    const name = (method.name || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase();
    return name.includes('TRANSFER') || name.includes('TRASFER');
  };

  const arePaymentLinesValid = (): boolean => {
    if (paymentLines.length === 0) return false;
    const allHaveMethod = paymentLines.every(l => l.paymentMethodId > 0);
    const allHaveAmount = paymentLines.every(l => l.amount > 0);
    const matchesTotal = Math.abs(difference) < 0.01;
    return allHaveMethod && allHaveAmount && matchesTotal;
  };

  const handlePaymentSubmit = async () => {
    try {
      if (!paymentOrder?.id) return;
      if (!arePaymentLinesValid()) return;

      let totalPaid = 0;
      const errors: string[] = [];

      for (let i = 0; i < paymentLines.length; i++) {
        const line = paymentLines[i];
        try {
          const paymentPayload: { orderId: number; paymentMethodId: number; amount: number; deliveryFee?: number } = {
            orderId: paymentOrder.id,
            paymentMethodId: line.paymentMethodId,
            amount: line.amount,
          };
          // Only attach delivery fee to the first payment line
          if (i === 0 && deliveryFee > 0) {
            paymentPayload.deliveryFee = deliveryFee;
          }
          await paymentService.createPayment(paymentPayload);
          totalPaid += line.amount;
        } catch (err: any) {
          const method = paymentMethods.find(m => m.id === line.paymentMethodId);
          const methodName = method?.name || `ID ${line.paymentMethodId}`;
          const msg = err.response?.data?.message || err.message || 'Error desconocido';
          errors.push(`Línea ${methodName}: ${msg}`);
        }
      }

      if (errors.length > 0) {
        errors.forEach(e => toast.error(e));
        return;
      }

      setShowPaymentModal(false);
      setPaymentOrder(null);
      toast.success('Pagos registrados');
      loadData();
    } catch (err: any) {
      console.error('Error al registrar pagos:', err);
      toast.error('Error al registrar pagos');
    }
  };

  const filteredDeliveries = deliveryStatusFilter === 'TODOS' ? deliveries : deliveries.filter((d) => d.status === deliveryStatusFilter);

  if (loading) return <Loading type="card" message="Sincronizando despachos..." />;

  return (
    <Layout>
      <div className="space-y-5 sm:space-y-8 animate-in fade-in duration-700">
        <PageHeader
          title="Despacho Express"
          subtitle="Logística de entregas y domicilios activos."
          icon={<DeliveryIcon size={22} />}
          iconColor="text-primary bg-primary/10"
          action={
            <div className="flex items-center gap-1.5 sm:gap-2 bg-muted/20 p-1 rounded-lg sm:rounded-xl border border-muted/50 overflow-x-auto no-scrollbar w-full sm:w-auto">
              <div className="flex items-center gap-1 px-2 py-1 bg-background border border-muted rounded-md sm:rounded-lg text-[8px] sm:text-[10px] font-black uppercase tracking-tighter shadow-sm shrink-0">
                <TruckIcon size={10} className="text-primary" /> {deliveries.length} TOTAL
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-400 rounded-md sm:rounded-lg text-[8px] sm:text-[10px] font-black uppercase tracking-tighter shrink-0">
                {deliveries.filter(d => d.status === 'PENDING').length} PEND.
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md sm:rounded-lg text-[8px] sm:text-[10px] font-black uppercase tracking-tighter shrink-0">
                {deliveries.filter(d => d.status === 'DELIVERED').length} ENT.
              </div>
            </div>
          }
        />

        {/* Stats / Report Section */}
        {allPayments.length > 0 && (
          <div className="bg-primary/5 rounded-3xl border border-primary/10 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUpIcon size={16} className="text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Reporte de Domicilios</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Total en Domicilios</span>
                <span className="text-2xl font-black text-primary tracking-tighter">${totalDomicilios.toLocaleString('es-CO')}</span>
              </div>
              <div className="bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Ganancias Domiciliarios</span>
                <span className="text-2xl font-black text-secondary tracking-tighter">${totalDeliveryFees.toLocaleString('es-CO')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-muted/30 p-1.5 sm:p-2 rounded-2xl sm:rounded-4xl border border-muted flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 px-2 sm:px-4 py-2 text-muted-foreground font-black text-[9px] sm:text-[10px] uppercase tracking-widest border-r border-muted shrink-0">
            <FilterIcon size={12} /> Estado:
          </div>
          <div className="flex items-center gap-1 sm:gap-2 p-0.5">
            {DELIVERY_STATUS_FILTERS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDeliveryStatusFilter(opt.value)}
                className={`
                  flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-xs uppercase tracking-tight transition-all shrink-0
                  ${deliveryStatusFilter === opt.value
                    ? 'bg-background text-primary shadow-md scale-105 border border-primary/20'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }
                `}
              >
                  <span className="text-muted-foreground">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Deliveries Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 pt-2">
          {filteredDeliveries.map((delivery) => {
            const order = ordersMap[delivery.orderId];
            return (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                order={order || null}
                getStatusBadge={getStatusBadge}
                getMenuItemName={getMenuItemName}
                getMenuItemPrice={getMenuItemPrice}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onToggleStatus={handleToggleStatus}
                onInitiatePayment={handleInitiatePayment}
              />
            );
          })}
        </div>

        {/* Empty State */}
        {filteredDeliveries.length === 0 && (
          <div className="text-center py-32 bg-muted/10 rounded-6xl border-2 border-dashed border-muted shadow-inner">
            <TruckIcon size={64} className="mx-auto text-muted-foreground opacity-20 mb-6" />
            <h3 className="text-2xl font-black uppercase tracking-tighter text-muted-foreground">
              {deliveryStatusFilter === 'PENDING' ? 'Sin envíos pendientes' : 'Sin resultados'}
            </h3>
            <p className="text-muted-foreground font-medium italic opacity-60">
              {deliveryStatusFilter === 'TODOS' ? 'No hay actividad de domicilios actualmente.' : `No hay domicilios en estado ${deliveryStatusFilter.toLowerCase()}.`}
            </p>
          </div>
        )}

        {/* Change Status Modal */}
        <Modal
          isOpen={showDeliveryStatusModal}
          onClose={() => { setShowDeliveryStatusModal(false); setSelectedDelivery(null); }}
          title="LOGÍSTICA DE ENTREGA"
          onConfirm={handleDeliveryStatusSubmit}
          size="small"
          confirmText="ACTUALIZAR ENVÍO"
        >
          {selectedDelivery && (
            <div className="space-y-8 py-2 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-4 bg-primary/5 p-5 rounded-3xl border border-primary/10">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                  <DeliveryIcon size={28} />
                </div>
                <div>
                  <span className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Seguimiento de envío</span>
                  <h4 className="text-xl font-black tracking-tighter uppercase leading-none">Venta # {selectedDelivery.orderId}</h4>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Seleccionar hito de logística:</label>
                <div className="grid grid-cols-1 gap-3">
                  {DELIVERY_STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setNewDeliveryStatus(opt.value as DeliveryStatus)}
                      className={`
                        w-full flex items-center justify-between p-5 rounded-2xl border-2 font-black text-xs uppercase tracking-tight transition-all
                        ${newDeliveryStatus === opt.value 
                          ? `${opt.class} ring-4 ring-primary/5` 
                          : 'bg-card border-border/60 text-muted-foreground hover:bg-muted hover:border-primary/20'
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl leading-none">{opt.emoji}</span>
                        <span>{opt.label}</span>
                      </div>
                      {newDeliveryStatus === opt.value && <CheckCircleIcon size={18} className="text-current" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Edit Modal — estilo MODIFICAR COMANDA */}
        <Modal
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); setEditingDelivery(null); setEditingOrder(null); }}
          title={`MODIFICAR PEDIDO #${editingOrder?.id || ''}`}
          onConfirm={handleEditSubmit}
          size="extra-large"
          confirmText="ACTUALIZAR PEDIDO"
        >
          {editingOrder && (
            <div className="space-y-4 sm:space-y-5 py-2 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                {/* Left Column — Category + Menu Items */}
                <div className="lg:col-span-5 space-y-4 sm:space-y-6 px-4 sm:px-0">
                  {/* Category Filter */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Categorías</label>
                    <div className="relative">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full h-11 px-4 bg-muted/50 border-2 border-transparent focus:border-secondary focus:bg-background rounded-xl outline-none transition-all font-black text-xs appearance-none shadow-inner"
                      >
                        <option value="">Todas las categorías</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id.toString()}>
                            {cat.name.toUpperCase()}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                        <ChevronLeftIcon size={14} className="-rotate-90" />
                      </div>
                    </div>
                  </div>

                  {/* Menu Items Selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Productos</label>
                    <div className="bg-muted/10 p-2 rounded-2xl border border-muted/50 max-h-75 lg:max-h-[35vh] overflow-y-auto space-y-1.5 custom-scrollbar">
                      {getFilteredMenuItems().length > 0 ? (
                        getFilteredMenuItems().map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleAddItemByClick(item.id)}
                            className="w-full flex items-center justify-between p-3 bg-card hover:bg-primary/5 border border-border/60 hover:border-primary/30 rounded-xl transition-all group active:scale-[0.98]"
                          >
                            <div className="text-left flex-1 pr-2">
                              <p className="font-black text-[10px] uppercase text-foreground leading-tight truncate">{item.name}</p>
                              <p className="text-[8px] font-bold text-muted-foreground italic line-clamp-1">{item.description}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-black text-primary text-[10px] sm:text-xs">${item.price.toLocaleString('es-CO')}</span>
                              <div className="p-1.5 bg-muted rounded-lg text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="py-12 text-center space-y-3">
                          <SearchIcon size={24} className="mx-auto text-muted-foreground opacity-20" />
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic px-6">
                            {selectedCategory ? 'No hay productos en esta categoría' : 'Selecciona una categoría'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column — Order Summary */}
                <div className="lg:col-span-7 space-y-4 px-4 sm:px-0">
                  <div className="bg-background border-2 border-primary/20 rounded-3xl shadow-xl overflow-hidden flex flex-col h-full lg:max-h-[55vh]">
                    <div className="bg-primary p-3 sm:p-4 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md">
                          <ShoppingCartIcon size={16} />
                        </div>
                        <div>
                          <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-widest">Resumen</h4>
                          <p className="text-[8px] sm:text-[9px] font-medium opacity-70 italic">{editItems.length} items</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 rounded-lg backdrop-blur-md text-[8px] px-2 py-0">
                        DOMICILIO
                      </Badge>
                    </div>

                    <div className="p-2 sm:p-3 flex-1 space-y-2 overflow-y-auto max-h-62.5 lg:max-h-none custom-scrollbar bg-muted/20">
                      {editItems.length > 0 ? (
                        editItems.map((item) => {
                          const menuItem = menuItems.find((m) => m.id === item.menuItemId);
                          const name = menuItem?.name || `Item #${item.menuItemId}`;
                          const price = menuItem?.price || 0;
                          const subtotal = price * item.quantity;
                          return (
                            <div key={item.menuItemId} className="flex items-center gap-2 bg-card p-2.5 rounded-xl border border-border/60 shadow-sm animate-in slide-in-from-right-4 duration-300">
                              <div className="flex-1 min-w-0">
                                <p className="font-black text-[9px] uppercase text-foreground leading-tight truncate">{name}</p>
                                <p className="text-[8px] font-bold text-muted-foreground italic">${price.toLocaleString('es-CO')}</p>
                              </div>
                              <div className="flex items-center bg-muted/50 rounded-xl p-0.5 gap-1">
                                <button type="button" onClick={() => handleEditItemQuantity(item.menuItemId, -1)} className="w-6 h-6 flex items-center justify-center bg-card rounded-lg shadow-sm text-primary font-black hover:bg-primary hover:text-primary-foreground transition-all text-[10px]">-</button>
                                <span className="w-4 text-center font-black text-[10px] text-foreground">{item.quantity}</span>
                                <button type="button" onClick={() => handleEditItemQuantity(item.menuItemId, 1)} className="w-6 h-6 flex items-center justify-center bg-card rounded-lg shadow-sm text-primary font-black hover:bg-primary hover:text-primary-foreground transition-all text-[10px]">+</button>
                              </div>
                              <div className="text-right min-w-15">
                                <p className="font-black text-secondary text-[10px]">${subtotal.toLocaleString('es-CO')}</p>
                              </div>
                              <button type="button" onClick={() => handleRemoveEditItem(item.menuItemId)} className="p-1 text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 h-full opacity-20">
                          <ShoppingCartIcon size={40} className="text-muted-foreground" />
                          <p className="text-sm font-black uppercase tracking-tighter text-muted-foreground">Vacío</p>
                        </div>
                      )}
                    </div>

                    {/* Bottom: Notes + Total */}
                    <div className="p-4 bg-muted/10 border-t-2 border-dashed border-muted mt-auto space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-1 italic">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg> Notas:
                          </label>
                          <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="Comentarios..."
                            className="w-full h-12 p-2 bg-card border border-border/60 rounded-xl outline-none transition-all font-medium text-[10px] shadow-sm resize-none focus:border-ring text-foreground placeholder:text-muted-foreground/40"
                          />
                        </div>

                        <div className="flex flex-col items-end pb-1">
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Total a Pagar</p>
                          <span className="text-2xl sm:text-3xl font-black tracking-tighter text-foreground">
                            ${editItems.reduce((sum, item) => {
                              const price = menuItems.find((m) => m.id === item.menuItemId)?.price || 0;
                              return sum + price * item.quantity;
                            }, 0).toLocaleString('es-CO')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => { setShowDeleteConfirm(false); setDeliveryToDelete(null); }}
          onConfirm={handleDeleteConfirm}
          title="ELIMINAR PEDIDO"
          message={`¿Estás seguro de eliminar el Pedido #${deliveryToDelete?.orderId || ''}? Se eliminará también el envío asociado. Esta acción no se puede deshacer.`}
        />

        {/* Payment Confirmation */}
        <ConfirmDialog
          isOpen={showPaymentConfirm}
          onClose={() => setShowPaymentConfirm(false)}
          onConfirm={handleConfirmPaymentStart}
          title="REGISTRAR COBRO"
          message={`¿Vas a liquidar el Pedido #${paymentOrder?.id || ''}? Total a recaudar: $${Number(paymentOrder?.total || 0).toLocaleString('es-CO')} (sin incluir domicilio)`}
        />

        {/* Payment Modal — multi-line payments */}
        <Modal
          isOpen={showPaymentModal}
          onClose={() => { setShowPaymentModal(false); setPaymentOrder(null); }}
          title="CAJA DE DOMICILIOS"
          onConfirm={handlePaymentSubmit}
          size="medium"
          confirmText="CERRAR CUENTA"
          confirmDisabled={!arePaymentLinesValid()}
        >
          {paymentOrder && (
            <div className="space-y-6 py-2 animate-in slide-in-from-bottom-4 duration-500">
              {/* Resumen de Cuenta */}
              <div className="bg-primary/5 rounded-4xl border border-primary/10 overflow-hidden shadow-inner">
                <div className="bg-primary p-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ReceiptIcon size={20} />
                    <span className="text-xs font-black uppercase tracking-widest">Resumen de Cuenta</span>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 rounded-lg">
                    PEDIDO #{paymentOrder.id}
                  </Badge>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl shadow-sm text-primary">
                        <UserIcon size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Cliente</p>
                        <p className="font-black text-xs uppercase truncate max-w-30">{paymentOrder.clientName || 'General'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl shadow-sm text-primary">
                        <ClipboardIcon size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Servicio</p>
                        <p className="font-black text-xs uppercase truncate max-w-30">Domicilio</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-primary/10" />

                  {/* Items del pedido */}
                  <div className="max-h-32 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                    {paymentOrder.items?.map((item, idx) => {
                      const price = item.menuItemPrice || item.unitPrice || 0;
                      const qty = item.quantity || 1;
                      return (
                        <div key={idx} className="flex justify-between items-center py-1 text-[10px] font-bold text-muted-foreground uppercase italic px-1">
                          <span>{item.menuItemName || 'Producto'} <span className="text-primary not-italic">x{qty}</span></span>
                          <span className="font-black text-foreground/70">${(price * qty).toLocaleString('es-CO')}</span>
                        </div>
                      );
                    })}
                  </div>

                  <Separator className="bg-primary/10" />

                  {/* Desglose de totales + input valor domicilio */}
                  <div className="space-y-4">
                    {/* Total Pedido (solo items) */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Pedido</span>
                      <span className="font-black text-sm text-foreground">${totalPedido.toLocaleString('es-CO')}</span>
                    </div>

                    {/* Total Domicilio — input inline */}
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest shrink-0">Domicilio</span>
                      <div className="relative flex-1 max-w-36">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-black opacity-30 text-sm">$</div>
                        <input
                          type="number"
                          value={deliveryFee || ''}
                          onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                          className="w-full h-10 pl-7 pr-3 bg-card border border-border/60 focus:border-ring rounded-xl outline-none font-black text-sm text-right transition-all shadow-sm text-foreground"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>

                    <Separator className="bg-primary/10" />

                    {/* Total a Pagar */}
                    <div className="flex items-center justify-between bg-primary/10 p-3 rounded-2xl -mx-1">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Total a Pagar</span>
                      <span className="text-xl font-black text-primary tracking-tighter">${totalAPagar.toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-line Payment Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                    Líneas de Pago ({paymentLines.length})
                  </label>
                  <button
                    type="button"
                    onClick={addPaymentLine}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
                  >
                    <span className="text-sm leading-none">+</span> Agregar línea
                  </button>
                </div>

                <div className="space-y-3">
                  {paymentLines.map((line) => {
                    const lineTransfer = isLineTransfer(line.paymentMethodId);
                    const lineReceived = line.receivedAmount || 0;
                    const lineChange = line.change || 0;
                    const lineIsValid = lineTransfer || lineReceived >= line.amount;

                    return (
                      <div
                        key={line.id}
                        className="bg-muted/10 rounded-3xl border border-muted/30 p-4 sm:p-5 space-y-3"
                      >
                        {/* Row 1: method + amount + remove */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                          <div className="sm:col-span-5 space-y-1.5">
                            <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                              Medio de Pago *
                            </label>
                            <select
                              value={line.paymentMethodId || ''}
                              onChange={(e) => updatePaymentLine(line.id, 'paymentMethodId', Number(e.target.value))}
                              className="w-full h-12 px-4 bg-card border border-border/60 focus:border-ring rounded-xl outline-none font-black text-xs uppercase tracking-tight transition-all appearance-none shadow-inner text-foreground"
                            >
                              <option value="">Seleccione...</option>
                              {paymentMethods.map((method) => (
                                <option key={method.id} value={method.id}>
                                  {method.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:col-span-4 space-y-1.5">
                            <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                              Monto *
                            </label>
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-black opacity-30 text-sm">$</div>
                              <input
                                type="number"
                                value={line.amount || ''}
                                onChange={(e) => updatePaymentLine(line.id, 'amount', parseFloat(e.target.value) || 0)}
                                className="w-full h-12 pl-8 pr-4 bg-card border border-border/60 focus:border-ring rounded-xl outline-none font-black text-lg tracking-tighter transition-all shadow-inner text-foreground"
                                placeholder="0"
                                min="0"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3 flex items-end justify-end gap-2">
                            {paymentLines.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removePaymentLine(line.id)}
                                className="h-10 w-10 rounded-full bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 font-black text-sm flex items-center justify-center transition-all"
                                title="Eliminar línea"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Row 2: received amount + change (cash only) */}
                        {!lineTransfer && line.paymentMethodId > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-muted/30">
                            <div className="space-y-1.5">
                              <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                                Efectivo Recibido
                              </label>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-black opacity-30 text-sm">$</div>
                                <input
                                  type="number"
                                  value={line.receivedAmount || ''}
                                  onChange={(e) => updatePaymentLine(line.id, 'receivedAmount', parseFloat(e.target.value) || 0)}
                                  className={`w-full h-12 pl-8 pr-4 bg-card border rounded-xl outline-none font-black text-lg tracking-tighter transition-all shadow-inner text-foreground ${
                                    line.receivedAmount > 0 && !lineIsValid
                                      ? 'border-rose-500/30 text-rose-400 focus:border-rose-500 bg-rose-500/5'
                                      : 'border-border/60 focus:border-ring'
                                  }`}
                                  placeholder="0"
                                  min="0"
                                />
                                {lineIsValid && line.receivedAmount > 0 && (
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 animate-in zoom-in">
                                    <CheckCircleIcon size={16} />
                                  </div>
                                )}
                              </div>
                              {!lineIsValid && line.receivedAmount > 0 && (
                                <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest ml-1 animate-pulse italic">
                                  Insuficiente
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-center bg-amber-500/10 rounded-2xl px-4 py-3 border border-amber-500/20">
                              <div className="flex items-center gap-2">
                                <HistoryIcon size={12} className={lineChange > 0 ? 'text-amber-400' : 'text-muted-foreground'} />
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Devuelta:</p>
                                <span className={`text-sm font-black tracking-tighter ${lineChange > 0 ? 'text-amber-400' : 'text-muted-foreground/40'}`}>
                                  ${lineChange.toLocaleString('es-CO')}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Transfer badge */}
                        {lineTransfer && line.paymentMethodId > 0 && (
                          <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-2xl flex items-center gap-3">
                            <div className="p-1.5 bg-blue-500/20 rounded-lg shadow-sm text-blue-400">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                                <line x1="22" y1="9" x2="12" y2="14"></line>
                                <line x1="2" y1="9" x2="12" y2="14"></line>
                              </svg>
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest">Transferencia</p>
                              <p className="text-[8px] font-medium text-blue-300/60 italic">Sin manejo de efectivo</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Summary bar */}
                <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  Math.abs(difference) < 0.01
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : difference > 0
                      ? 'bg-amber-500/10 border-amber-500/20'
                      : 'bg-rose-500/10 border-rose-500/20'
                }`}>
                  <div className="flex items-center gap-2">
                    <WalletIcon size={14} className={
                      Math.abs(difference) < 0.01 ? 'text-emerald-400' : difference > 0 ? 'text-amber-400' : 'text-rose-400'
                    } />
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      {Math.abs(difference) < 0.01
                        ? '✓ Pago completo'
                        : difference > 0
                          ? `Falta por asignar: $${difference.toLocaleString('es-CO')}`
                          : `Excede en: $${Math.abs(difference).toLocaleString('es-CO')}`
                      }
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground">
                    ${totalLinesAmount.toLocaleString('es-CO')} / ${totalAPagar.toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default Deliveries;
