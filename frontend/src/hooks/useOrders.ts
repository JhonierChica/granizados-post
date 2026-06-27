import { useState, useEffect, useRef, useMemo, ChangeEvent } from 'react';
import { toast } from 'sonner';
import { orderService } from '../services/orderService';
import { tableService } from '../services/tableService';
import { menuService } from '../services/menuService';
import { clientService } from '../services/clientService';
import { categoryService } from '../services/categoryService';
import { paymentService } from '../services/paymentService';
import { paymentMethodService } from '../services/paymentMethodService';
import { ORDER_STATUS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from './useWebSocket';
import type {
  Order,
  OrderItem,
  Table,
  MenuItem,
  Category,
  Client,
  PaymentMethod,
  Payment,
  PaymentLine,
  ClientStep,
  OrderFormData,
  StatusBadge,
} from '../types';

const INITIAL_FORM: OrderFormData = {
  clientName: '',
  clientIdentification: '',
  clientPhone: '',
  clientAddress: '',
  tableId: '',
  status: ORDER_STATUS.PENDING,
  notes: '',
};

export function useOrders() {
  const { user } = useAuth();

  // --- Data State ---
  const [orders, setOrders] = useState<Order[]>([]);
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [allTables, setAllTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Order Modal State ---
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState<OrderFormData>(INITIAL_FORM);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(ORDER_STATUS.PENDING);
  const [clientNameFilter, setClientNameFilter] = useState('');

  // --- Client Flow ---
  const [clientStep, setClientStep] = useState<ClientStep>('selection');
  const [existingClient, setExistingClient] = useState<Client | null>(null);
  const [searchingClient, setSearchingClient] = useState(false);
  const [orderType, setOrderType] = useState('');

  // --- Status Modal ---
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusOrder, setStatusOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');

  // --- Payment State ---
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paidByOrder, setPaidByOrder] = useState<Record<number, number>>({});

  // ===================== WEBSOCKET INTEGRATION =====================
  const { isConnected, connectionStatus, onEvent } = useWebSocket();

  // Refs to avoid stale closures in WebSocket event callbacks
  const paidByOrderRef = useRef(paidByOrder);
  paidByOrderRef.current = paidByOrder;

  // Set up WebSocket event listeners: update local state on push events
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    unsubs.push(
      onEvent('ORDER_CREATED', (data: any) => {
        const newOrder = data as Order;
        setOrders((prev) => {
          if (prev.some((o) => o.id === newOrder.id)) return prev;
          const total = Number(newOrder.total || 0);
          const paid = paidByOrderRef.current[newOrder.id] || 0;
          if (total - paid <= 0.01) return prev; // skip fully-paid orders
          return [...prev, newOrder];
        });
      }),
    );

    unsubs.push(
      onEvent('ORDER_STATUS_CHANGED', (data: any) => {
        const { orderId, newStatus, order } = data;
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, ...order, status: newStatus } : o,
          ),
        );
      }),
    );

    unsubs.push(
      onEvent('ORDER_UPDATED', (data: any) => {
        const updated = data as Order;
        setOrders((prev) =>
          prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)),
        );
      }),
    );

    unsubs.push(
      onEvent('ORDER_DELETED', (data: any) => {
        const { orderId } = data;
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      }),
    );

    return () => {
      unsubs.forEach((fn) => fn());
    };
    // onEvent is stable (useCallback with [] in useWebSocket), subscriptions set once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===================== LOAD DATA =====================
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, tablesData, menuData, categoriesData, paymentMethodsData, paymentsData] =
        await Promise.all([
          orderService.getAllOrders(),
          tableService.getAllTables(),
          menuService.getAllMenuItems(),
          categoryService.getAllCategories(),
          paymentMethodService.getActivePaymentMethods(),
          paymentService.getAllPayments(),
        ]);

      const paidTotals = paymentsData.reduce<Record<number, number>>((acc, payment: Payment) => {
        const status = String(payment.status || '').toUpperCase();
        if (status === 'COMPLETADO' || status === 'C') {
          const orderId = payment.orderId;
          const amount = Number(payment.amount || 0);
          if (orderId) {
            acc[orderId] = (acc[orderId] || 0) + amount;
          }
        }
        return acc;
      }, {});
      setPaidByOrder(paidTotals);
      setOrders(
        ordersData.filter((order: Order) => {
          const total = Number(order.total || 0);
          const paid = paidTotals[order.id] || 0;
          return total - paid > 0.01;
        }),
      );
      setAllTables(tablesData);
      setAvailableTables(tablesData.filter((t: Table) => t.status === 'DISPONIBLE' && t.isActive));
      setMenuItems(menuData);
      setCategories(categoriesData.filter((c: Category) => c.active !== false));
      setPaymentMethods(paymentMethodsData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // ===================== HELPERS =====================
  const getMenuItemName = (menuItemId: number): string => {
    const item = menuItems.find((m) => m.id === menuItemId);
    return item ? item.name : 'N/A';
  };

  const getMenuItemPrice = (menuItemId: number): number => {
    const item = menuItems.find((m) => m.id === menuItemId);
    return item ? item.price : 0;
  };

  const getStatusBadge = (status: string): StatusBadge => {
    const badges: Record<string, StatusBadge> = {
      PENDIENTE: { emoji: '🟡', text: 'Pendiente', class: 'badge-warning' },
      SERVIDO: { emoji: '✅', text: 'Servido', class: 'badge-primary' },
    };
    return badges[status] || { emoji: '', text: status, class: 'badge-secondary' };
  };

  const calculateOrderTotal = (items: OrderItem[]): number => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => {
      const price = item.price || getMenuItemPrice(item.menuItemId);
      return sum + price * item.quantity;
    }, 0);
  };

  const getFilteredMenuItems = (): MenuItem[] => {
    if (!selectedCategory) return [];
    return menuItems.filter(
      (item) => item.available && item.categoryId === parseInt(selectedCategory),
    );
  };

  const filteredOrders = useMemo(() =>
    orders.filter((order) => {
      const matchStatus = statusFilter === 'TODOS' || order.status === statusFilter;
      const clientName = order.clientName || '';
      const matchClient = clientName.toLowerCase().includes(clientNameFilter.trim().toLowerCase());
      return matchStatus && matchClient;
    }),
    [orders, statusFilter, clientNameFilter],
  );

  // ===================== ORDER CRUD =====================
  const handleAdd = () => {
    setEditingOrder(null);
    setClientStep('selection');
    setExistingClient(null);
    setOrderType('');
    setFormData({ ...INITIAL_FORM, tableId: availableTables[0]?.id || '' });
    setSelectedItems([]);
    setSelectedCategory('');
    setShowModal(true);
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setClientStep('order');
    setSelectedCategory('');
    setExistingClient({ id: order.clientId || 0, name: order.clientName || '', identificationNumber: '', phone: '', });
    setFormData({
      clientName: order.clientName || '',
      clientIdentification: '',
      clientPhone: '',
      clientAddress: '',
      tableId: order.tableId || '',
      status: order.status,
      notes: order.notes || '',
    });
    setSelectedItems(order.items || []);
    setShowModal(true);
  };

  const handleDelete = async (order: Order) => {
    if (window.confirm(`¿Está seguro de eliminar la orden #${order.id}?`)) {
      try {
        await orderService.deleteOrder(order.id);
        toast.success('Orden eliminada exitosamente');
        loadData();
      } catch (err) {
        console.error('Error al eliminar orden:', err);
        toast.error('Error al eliminar orden');
      }
    }
  };

  // ===================== STATUS FLOW =====================
  const openStatusModal = (order: Order) => {
    setStatusOrder(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!statusOrder || !newStatus) return;
    if (newStatus === statusOrder.status) {
      setShowStatusModal(false);
      return;
    }
    try {
      await orderService.updateOrderStatus(statusOrder.id, newStatus);
      const badge = getStatusBadge(newStatus);
      toast.success(`Pedido #${statusOrder.id} ahora está "${badge.text}"`);
      setShowStatusModal(false);
      setStatusOrder(null);
      loadData();
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      toast.error('Error al actualizar estado');
    }
  };

  // ===================== CLIENT FLOW =====================
  const searchExistingClient = async () => {
    try {
      setSearchingClient(true);
      const clients = await clientService.getAllClients();
      const found = clients.find(
        (c: Client) => c.identificationNumber === formData.clientIdentification.trim(),
      );

      if (found) {
        setExistingClient(found);
        setFormData({
          ...formData,
          clientName: found.name,
          clientPhone: found.phone,
          clientAddress: found.address || '',
        });
        setClientStep('orderType');
        toast.info(`Cliente encontrado: ${found.name}`);
      } else {
        toast.warning('Cliente no encontrado. Iniciando registro nuevo.');
        setClientStep('new');
      }
    } catch (err) {
      console.error('Error al buscar cliente:', err);
      toast.error('Error al buscar cliente');
    } finally {
      setSearchingClient(false);
    }
  };

  const createNewClientAndProceed = async () => {
    try {
      const clientData = {
        name: formData.clientName.trim(),
        identificationNumber: formData.clientIdentification.trim(),
        phone: formData.clientPhone.trim(),
        address: formData.clientAddress?.trim() || '',
        email: '',
        notes: '',
      };
      const createdClient = await clientService.createClient(clientData);
      setExistingClient(createdClient);
      setClientStep('orderType');
      toast.success(`Cliente registrado: ${createdClient.name}`);
    } catch (err: any) {
      console.error('Error al crear cliente:', err);
      const msg = err.response?.data?.message || err.message || 'Error al registrar cliente';
      toast.error(`Error: ${msg}`);
    }
  };

  const handleQuickOrder = () => {
    const clientName = formData.clientName.trim();
    if (!clientName) {
      toast.warning('Ingrese el nombre del cliente para el pedido rápido');
      return;
    }

    const randomId = Math.floor(Math.random() * 9000) + 1000;
    const quickClient: Client = {
      id: 0,
      name: clientName.toUpperCase(),
      identificationNumber: `QR-${randomId}-${Date.now().toString().slice(-4)}`,
      phone: '0000000000',
      address: 'N/A',
    };

    setExistingClient(quickClient);
    setFormData({
      ...formData,
      clientName: quickClient.name,
      clientIdentification: quickClient.identificationNumber,
      clientPhone: quickClient.phone,
      clientAddress: quickClient.address || '',
    });
    setClientStep('orderType');
  };

  // ===================== MENU ITEMS =====================
  const handleAddItem = (menuItemId: number, presentation?: { id: number; name: string; price: number }) => {
    const menuItem = menuItems.find((item) => item.id === menuItemId);
    if (!menuItem) return;

    const unitPrice = presentation ? presentation.price : menuItem.price;

    // Buscar si ya existe el mismo item CON la misma presentación
    const existingIndex = selectedItems.findIndex(
      (item) => item.menuItemId === menuItem.id && item.presentationId === (presentation?.id || undefined)
    );
    if (existingIndex >= 0) {
      const newItems = [...selectedItems];
      newItems[existingIndex].quantity += 1;
      setSelectedItems(newItems);
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          menuItemId: menuItem.id,
          quantity: 1,
          name: menuItem.name,
          price: unitPrice,
          categoryName: menuItem.categoryName,
          presentationId: presentation?.id,
          presentationName: presentation?.name,
        },
      ]);
    }

    const displayName = presentation
      ? `${menuItem.name.toUpperCase()} (${presentation.name})`
      : menuItem.name.toUpperCase();
    toast.success(`${displayName} AGREGADO`, {
      description: "Se añadió correctamente a la lista de la comanda",
      icon: '✅',
      duration: 1500,
    });
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, quantity: number | string) => {
    const newItems = [...selectedItems];
    newItems[index].quantity = parseInt(String(quantity)) || 1;
    setSelectedItems(newItems);
  };

  // ===================== FORM CHANGE =====================
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ===================== SUBMIT ORDER =====================
  const handleSubmit = async () => {
    try {
      if (!editingOrder) {
        if (clientStep === 'selection') {
          toast.warning('Seleccione si el cliente es nuevo o existente');
          return;
        }

        if (clientStep === 'existing' && !existingClient) {
          if (!formData.clientIdentification?.trim()) {
            toast.warning('Ingrese la identificación del cliente');
            return;
          }
          await searchExistingClient();
          return;
        }

        if (clientStep === 'new') {
          if (!formData.clientName?.trim()) { toast.warning('Nombre del cliente obligatorio'); return; }
          if (!formData.clientIdentification?.trim()) { toast.warning('Identificación obligatoria'); return; }
          if (!formData.clientPhone?.trim()) { toast.warning('Teléfono obligatorio'); return; }
          await createNewClientAndProceed();
          return;
        }

        if (clientStep === 'order') {
          if (!user || !user.id) {
            toast.error('Sesión expirada. Inicie sesión nuevamente.');
            return;
          }
          if (orderType === 'ESTABLECIMIENTO' && !formData.tableId) {
            toast.warning('Seleccione una mesa');
            return;
          }
          if (selectedItems.length === 0) {
            toast.warning('Agregue al menos un producto');
            return;
          }

          let clientId = existingClient?.id;
          if (!clientId) {
            const createdClient = await clientService.createClient({
              name: formData.clientName.trim(),
              identificationNumber: formData.clientIdentification.trim(),
              phone: formData.clientPhone.trim(),
              address: formData.clientAddress?.trim() || '',
              email: '',
              notes: '',
            });
            clientId = createdClient.id;
          }

          let tableIdToUse = orderType === 'DOMICILIO'
            ? null
            : parseInt(String(formData.tableId));

          await orderService.createOrder({
            userId: user.id,
            tableId: tableIdToUse,
            clientId,
            orderType,
            items: selectedItems,
            notes: formData.notes,
          });

          toast.success(
            orderType === 'DOMICILIO'
              ? 'Pedido a domicilio creado. Revisar en Deliveries.'
              : 'Pedido creado exitosamente'
          );
          setShowModal(false);
          loadData();
        }
      } else {
        if (!formData.tableId) { toast.warning('Seleccione una mesa'); return; }
        if (selectedItems.length === 0) { toast.warning('Agregue al menos un producto'); return; }

        await orderService.updateOrder(editingOrder.id, {
          tableId: parseInt(String(formData.tableId)),
          status: formData.status,
          items: selectedItems,
          notes: formData.notes,
        });
        toast.success('Pedido actualizado exitosamente');
        setShowModal(false);
        loadData();
      }
    } catch (err: any) {
      console.error('Error al guardar pedido:', err);
      const msg = err.response?.data?.message || err.message || 'Error al guardar pedido';
      toast.error(`Error: ${msg}`);
    }
  };

  // ===================== PAYMENT FLOW =====================
  const handleInitiatePayment = (order: Order) => {
    setPaymentOrder(order);
    setShowPaymentConfirm(true);
  };

  const handleConfirmPaymentStart = () => {
    if (!paymentOrder) {
      alert('Error: No se encontró el pedido para cobrar');
      setShowPaymentConfirm(false);
      return;
    }
    setShowPaymentConfirm(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (payload: { lines: PaymentLine[] }) => {
    if (isSubmittingPayment) return false; // guard contra doble clic
    try {
      setIsSubmittingPayment(true);
      if (!paymentOrder?.id) { toast.error('Error: No se encontró el pedido'); return false; }

      const { lines } = payload;
      if (!lines || lines.length === 0) { toast.warning('Agregue al menos una línea de pago'); return false; }

      let totalPaid = 0;
      const errors: string[] = [];

      for (const line of lines) {
        try {
          await paymentService.createPayment({
            orderId: paymentOrder.id,
            paymentMethodId: line.paymentMethodId,
            amount: line.amount,
          });
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
        // If some payments went through, update tracking
        if (totalPaid > 0) {
          const paidBefore = paidByOrder[paymentOrder.id] || 0;
          setPaidByOrder((prev) => ({ ...prev, [paymentOrder.id]: paidBefore + totalPaid }));
        }
        return false;
      }

      const paidBefore = paidByOrder[paymentOrder.id] || 0;
      const paidAfter = paidBefore + totalPaid;
      setPaidByOrder((prev) => ({ ...prev, [paymentOrder.id]: paidAfter }));

      toast.success('Pagos registrados exitosamente', {
        description: `${lines.length} línea(s) — Total: $${totalPaid.toLocaleString('es-CO')}`,
      });

      setShowPaymentModal(false);
      setPaymentOrder(null);
      loadData();
      return true;
    } catch (err: any) {
      console.error('Error al registrar pagos:', err);
      toast.error('Error al registrar pagos');
      return false;
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // ===================== RETURN =====================
  return {
    // Data
    orders, filteredOrders, availableTables, allTables, menuItems,
    categories, paymentMethods, loading, user,

    // Order Modal
    showModal, setShowModal, editingOrder, formData, selectedItems,
    selectedCategory, setSelectedCategory, statusFilter, setStatusFilter,
    clientNameFilter, setClientNameFilter,

    // Client Flow
    clientStep, setClientStep, existingClient,
    searchingClient, orderType, setOrderType,

    // Status Modal
    showStatusModal, setShowStatusModal, statusOrder, setStatusOrder,
    newStatus, setNewStatus,

    // Payment
    showPaymentConfirm, setShowPaymentConfirm,
    showPaymentModal, setShowPaymentModal,
    paymentOrder, paidByOrder,

    // Actions
    handleAdd, handleEdit, handleDelete,
    openStatusModal, handleConfirmStatusChange,
    handleSubmit, handleChange,
    handleAddItem, handleRemoveItem, handleQuantityChange,
    searchExistingClient, createNewClientAndProceed, handleQuickOrder,
    handleInitiatePayment, handleConfirmPaymentStart,
    handlePaymentSubmit, isSubmittingPayment,

    // WebSocket state
    isConnected, connectionStatus,

    // Helpers
    getMenuItemName, getMenuItemPrice, getStatusBadge,
    calculateOrderTotal, getFilteredMenuItems,
  };
}
