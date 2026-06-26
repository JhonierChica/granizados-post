import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { PaymentIcon, CashRegisterIcon, ReceiptIcon, WalletIcon, TrendingUpIcon, CalendarIcon, UserIcon, ShieldCheckIcon, AlertCircleIcon, ArrowRightIcon } from '../../components/common/Icons';
import { paymentService } from '../../services/paymentService';
import { cashRegisterService } from '../../services/cashRegisterService';
import { paymentMethodService } from '../../services/paymentMethodService';
import { useAuth } from '../../context/AuthContext';
import type { Payment, PaymentMethod } from '../../types';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { FilterIcon, CheckCircleIcon } from '../../components/common/Icons';
import { toast } from 'sonner';

const Payments: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCashCloseConfirm, setShowCashCloseConfirm] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [filterMethodId, setFilterMethodId] = useState<string>('all');
  const [mode, setMode] = useState<'current' | 'history'>('current');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  useEffect(() => {
    loadPayments();
  }, [mode, selectedDate]);

  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentMethodService.getActivePaymentMethods();
      setPaymentMethods(methods);
    } catch (err) {
      console.error('Error al cargar métodos de pago:', err);
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      let paymentsData: Payment[];

      if (mode === 'current') {
        paymentsData = await paymentService.getUnclosedPayments();
      } else {
        paymentsData = await paymentService.getPaymentsByDateRange(selectedDate, selectedDate);
      }

      setPayments(paymentsData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCashClose = async () => {
    try {
      await cashRegisterService.close({ closedBy: user?.username || 'Sistema' });
      setShowCashCloseConfirm(false);
      toast.success('Cierre de caja realizado exitosamente');
      await loadPayments();
    } catch (err: any) {
      console.error('Error al realizar cierre de caja:', err);
      toast.error('Error al realizar el cierre de caja');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-lg">🟡 PENDIENTE</Badge>;
      case 'COMPLETADO':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-lg">✅ COMPLETADO</Badge>;
      case 'CANCELADO':
        return <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-lg">🔴 CANCELADO</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground border-muted text-[9px] font-black uppercase px-2 py-0.5 rounded-lg">{status}</Badge>;
    }
  };

  const filteredPayments = filterMethodId === 'all'
    ? payments
    : payments.filter(p => p.paymentMethodId === Number(filterMethodId));

  const totalPayments = filteredPayments.length;
  const totalAmount = filteredPayments
    .filter(p => p.status === 'COMPLETADO')
    .reduce((sum, p) => sum + parseFloat(p.amount as any || 0), 0);

  if (loading) return <Loading type="card" message="Sincronizando flujos de caja..." />;

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
        <PageHeader
          title="Control de Ingresos"
          subtitle={mode === 'current'
            ? "Auditoría de transacciones abiertas y cierre de jornada."
            : `Historial del ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}`}
          icon={<ReceiptIcon size={22} />}
          iconColor={mode === 'current' ? "text-emerald-600 bg-emerald-500/10" : "text-blue-600 bg-blue-500/10"}
          action={
            mode === 'current' ? (
              <button
                onClick={() => setShowCashCloseConfirm(true)}
                disabled={payments.length === 0}
                className={`
                  h-12 sm:h-14 px-5 sm:px-8 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest flex items-center gap-2 sm:gap-3 transition-all shadow-xl w-full sm:w-auto justify-center
                  ${payments.length === 0
                    ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50 shadow-none'
                    : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200 active:scale-[0.98]'
                  }
                `}
              >
                <CashRegisterIcon size={18} /> CIERRE DE CAJA
              </button>
            ) : (
              <div className="h-12 sm:h-14 px-5 sm:px-8 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-700 border-2 border-blue-200 font-black text-xs sm:text-sm uppercase tracking-widest flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center">
                <CalendarIcon size={18} /> MODO CONSULTA
              </div>
            )
          }
        />

        {/* Mode Toggle */}
        <div className="flex items-center gap-2 p-1 bg-muted/20 rounded-2xl border-2 border-muted/30 w-fit">
          <button
            onClick={() => setMode('current')}
            className={`
              px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2
              ${mode === 'current'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            <CashRegisterIcon size={16} /> FLUJO ACTUAL
          </button>
          <button
            onClick={() => setMode('history')}
            className={`
              px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2
              ${mode === 'history'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            <CalendarIcon size={16} /> HISTORIAL
          </button>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
           <Card className="bg-white border-2 border-muted/60 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 transition-transform group-hover:scale-125 duration-700">
                 <PaymentIcon size={80} />
              </div>
              <div className="space-y-3 relative z-10">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted/60 rounded-xl text-muted-foreground"><TrendingUpIcon size={18} /></div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{mode === 'current' ? 'Movimientos Activos' : 'Movimientos del Día'}</span>
                 </div>
                 <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black tracking-tighter">{totalPayments}</span>
                    <span className="text-xs font-black text-muted-foreground uppercase opacity-40">Tickets</span>
                 </div>
              </div>
           </Card>

           <Card className={`${mode === 'current' ? 'bg-emerald-600' : 'bg-blue-600'} text-white border-none shadow-2xl relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 p-4 opacity-20 -rotate-12 transition-transform group-hover:scale-125 duration-700">
                 <WalletIcon size={80} />
              </div>
              <div className="space-y-3 relative z-10">
                 <div className="flex items-center gap-3 text-white/70">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><CashRegisterIcon size={18} /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{mode === 'current' ? 'Base de Cierre' : 'Total del Día'}</span>
                 </div>
                 <div className="flex items-baseline gap-2">
                    <span className="text-xs font-black opacity-60 uppercase">$</span>
                    <span className="text-4xl font-black tracking-tighter">{totalAmount.toLocaleString('es-CO')}</span>
                 </div>
              </div>
           </Card>

           <Card className="bg-foreground text-background border-none relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 rotate-45 transition-transform group-hover:scale-125 duration-700">
                 <ShieldCheckIcon size={80} />
              </div>
              <div className="space-y-4 relative z-10">
                 <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="p-2 bg-white/10 rounded-xl"><UserIcon size={18} /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Responsable</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <span className="text-xl font-black tracking-tight uppercase truncate">{user?.username || 'ADMIN'}</span>
                    <Badge variant="secondary" className={`${mode === 'current' ? 'bg-emerald-500' : 'bg-blue-500'} text-white border-none text-[8px] px-2 rounded-md`}>{mode === 'current' ? 'VERIFICADO' : 'CONSULTA'}</Badge>
                 </div>
              </div>
           </Card>
        </div>

        {/* Filters and List */}
        <div className="space-y-4 sm:space-y-6">
              <div className="bg-white p-4 sm:p-6 rounded-3xl sm:rounded-5xl border-2 border-muted/40 shadow-sm flex flex-col sm:flex-row items-end gap-3 sm:gap-6 transition-all hover:border-emerald-500/20">
                {mode === 'history' && (
                  <div className="flex flex-col gap-2 w-full sm:w-56 animate-in slide-in-from-left-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-blue-800/60">Consultar Fecha</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full h-12 px-5 bg-muted/30 border-2 border-transparent focus:border-blue-500 rounded-xl outline-none font-bold text-xs transition-all cursor-pointer"
                      />
                      <CalendarIcon size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-2 flex-1 w-full md:w-auto">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-emerald-800/60">Filtrar por Medio de Pago</label>
                   <div className="relative">
                      <select 
                        value={filterMethodId} 
                        onChange={(e) => setFilterMethodId(e.target.value)}
                        className="w-full h-12 px-5 bg-muted/30 border-2 border-transparent focus:border-emerald-500 rounded-xl outline-none font-black text-xs uppercase appearance-none transition-all cursor-pointer"
                      >
                        <option value="all">💳 Todos los Métodos</option>
                        {paymentMethods.map(method => (
                          <option key={method.id} value={method.id.toString()}>
                            ✨ {method.name.toUpperCase()}
                          </option>
                        ))}
                      </select>
                      <FilterIcon size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                   </div>
                </div>

              <div className="ml-auto p-4 bg-emerald-50/50 rounded-2xl border-2 border-dashed border-emerald-100 hidden lg:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[9px] font-black text-emerald-800 uppercase">Balance Filtrado</p>
                  <p className="font-black text-lg leading-none tracking-tighter text-emerald-600">{formatCurrency(totalAmount)}</p>
                </div>
                <div className="w-1 h-8 bg-emerald-200 rounded-full" />
                <TrendingUpIcon size={20} className="text-emerald-500 opacity-40" />
              </div>
            </div>

           <div className="flex items-center gap-3 px-2">
              <TrendingUpIcon size={20} className="text-muted-foreground opacity-40" />
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">{mode === 'current' ? 'Flujo de Caja Detallado' : 'Historial de Pagos'}</h3>
              <Separator className="flex-1 bg-muted/40 ml-4" />
           </div>

           <div className="grid grid-cols-1 gap-4">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <div key={payment.id} className="group bg-white p-5 rounded-3xl border-2 border-transparent hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col md:flex-row md:items-center gap-6">
                     <div className="flex items-center gap-6 flex-1">
                        <div className="w-14 h-14 bg-muted/40 rounded-2xl flex items-center justify-center text-muted-foreground group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-inner">
                           <ReceiptIcon size={24} />
                        </div>
                        <div className="space-y-1">
                           <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Ticket #{payment.id}</span>
                              <Badge variant="outline" className="text-[8px] font-black border-emerald-500/30 text-emerald-600 rounded-lg">ORDEN #{payment.orderId}</Badge>
                           </div>
                           <h4 className="text-lg font-black tracking-tighter uppercase leading-none">Pago Recibido — Comanda General</h4>
                           
                           {/* Item Details - Compact Card Style */}
                           {payment.items && payment.items.length > 0 && (
                             <div className="flex flex-wrap gap-1.5 mt-2.5 animate-in fade-in slide-in-from-left-2 duration-500">
                               {payment.items.map((item, idx) => (
                                 <div key={idx} className="bg-muted/40 hover:bg-white hover:shadow-md hover:scale-105 transition-all px-2.5 py-1 rounded-lg border border-muted/60 flex items-center gap-2 group/item">
                                   <div className="flex items-center justify-center bg-primary/10 text-primary w-4 h-4 rounded-md text-[8px] font-black">
                                     {item.quantity}
                                   </div>
                                   <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tight group-hover/item:text-foreground">
                                     {item.menuItemName || (item as any).name}
                                   </span>
                                   <span className="text-[8px] font-bold text-emerald-600/60 bg-emerald-50 px-1 rounded-sm">
                                      ${((item.menuItemPrice || (item as any).price || 0)).toLocaleString('es-CO')}
                                   </span>
                                 </div>
                               ))}
                             </div>
                           )}
                        </div>
                     </div>

                     <div className="flex flex-wrap items-center gap-8 md:gap-12 mr-6">
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 tracking-widest">Monto Neto</p>
                           <p className="font-black text-emerald-600 text-xl tracking-tighter">${(parseFloat(payment.amount as any)).toLocaleString('es-CO')}</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 tracking-widest">Medio</p>
                           <p className="font-bold text-foreground text-xs uppercase tracking-tight flex items-center gap-1.5 bg-muted/30 px-3 py-1 rounded-xl">
                              💳 {(payment as any).paymentMethodName || 'EFECTIVO'}
                           </p>
                        </div>
                        <div className="space-y-1 hidden lg:block">
                           <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 tracking-widest">Timestamp</p>
                           <p className="font-bold text-foreground/60 text-xs italic flex items-center gap-1.5">
                              <CalendarIcon size={12} /> {new Date(payment.paymentDate || '').toLocaleTimeString()}
                           </p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 tracking-widest">Status</p>
                           {getStatusBadge(payment.status || '')}
                        </div>
                     </div>
                  </div>
                ))
               ) : (
                <div className={`text-center py-32 rounded-6xl border-2 border-dashed flex flex-col items-center gap-6 shadow-inner ${mode === 'current' ? 'bg-emerald-50/20 border-emerald-100' : 'bg-blue-50/20 border-blue-100'}`}>
                   <div className={`p-6 rounded-full shadow-lg ${mode === 'current' ? 'bg-white shadow-emerald-500/5 text-emerald-500' : 'bg-white shadow-blue-500/5 text-blue-500'}`}>
                      <ShieldCheckIcon size={48} />
                   </div>
                   <div className="space-y-2">
                     <h3 className={`text-xl font-black uppercase tracking-tighter ${mode === 'current' ? 'text-emerald-800' : 'text-blue-800'}`}>
                       {mode === 'current' ? 'Cuentas al Día' : 'Sin Movimientos'}
                     </h3>
                     <p className={`font-medium italic max-w-sm mx-auto ${mode === 'current' ? 'text-emerald-700/60' : 'text-blue-700/60'}`}>
                       {mode === 'current'
                         ? 'No hay transacciones pendientes de auditoría. El flujo de caja está sincronizado satisfactoriamente.'
                         : `No se encontraron pagos registrados para el ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}.`}
                     </p>
                   </div>
                </div>
               )}
           </div>
        </div>

        {/* Security / Help Note — solo visible en modo flujo actual */}
        {mode === 'current' && payments.length > 0 && (
          <div className="bg-amber-50 p-6 rounded-4xl border border-amber-100 flex items-start gap-5">
             <div className="bg-amber-500 text-white p-2 rounded-xl mt-1 shadow-lg shadow-amber-200">
                <AlertCircleIcon size={20} />
             </div>
             <div className="space-y-1">
                <h4 className="text-sm font-black text-amber-800 uppercase tracking-widest italic">Aviso de Seguridad Operativa</h4>
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  Vas a realizar el arqueo de caja con <strong>{totalPayments} tickets</strong>. Verifica que el dinero físico en el punto de venta coincida con el total de <strong>${totalAmount.toLocaleString('es-CO')}</strong> antes de confirmar el cierre definitivo.
                </p>
             </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showCashCloseConfirm}
          onClose={() => setShowCashCloseConfirm(false)}
          onConfirm={handleCashClose}
          title="🔐 VALIDAR CIERRE FISCAL"
          message={`¿Confirma el arqueo definitivo de la jornada? Se consolidarán ${totalPayments} movimientos por un valor total de $${totalAmount.toLocaleString('es-CO')}. Esta operación notificará a gerencia y reiniciará el flujo de caja.`}
        />
      </div>
    </Layout>
  );
};

const formatCurrency = (value: number | string | undefined): string =>
  new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP', 
    minimumFractionDigits: 0
  }).format(parseFloat(String(value)) || 0).replace('COP', '$');

export default Payments;
