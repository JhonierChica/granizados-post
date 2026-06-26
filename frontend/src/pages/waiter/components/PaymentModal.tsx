import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { generateId } from '../../../utils/idGenerator';
import Modal from '../../../components/common/Modal';
import { WalletIcon, UserIcon, ClipboardIcon, ReceiptIcon, HistoryIcon, CheckCircleIcon, CalculatorIcon, PlusIcon } from '../../../components/common/Icons';
import type { Order, PaymentMethod, PaymentLine } from '../../../types';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';

interface PaymentModalProps {
  isOpen: boolean;
  paymentOrder: Order | null;
  paymentMethods: PaymentMethod[];
  paidAmount: number;
  onClose: () => void;
  onConfirm: (payload: { lines: PaymentLine[] }) => Promise<boolean> | boolean;
  isSubmitting?: boolean;
}

interface PersonSplit {
  id: string;
  name: string;
  selections: Record<string, number>;
  paid: boolean;
  paidAmount: number;
}

const INITIAL_LINE = (amount: number): PaymentLine => ({
  id: generateId(),
  paymentMethodId: 0,
  amount,
  receivedAmount: 0,
  change: 0,
});

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  paymentOrder,
  paymentMethods,
  paidAmount,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  if (!paymentOrder) return null;

  const total = paymentOrder.total || 0;
  const remaining = Math.max(0, total - paidAmount);

  const [splitMode, setSplitMode] = useState(false);
  const [persons, setPersons] = useState<PersonSplit[]>([
    { id: generateId(), name: 'Persona 1', selections: {}, paid: false, paidAmount: 0 }
  ]);
  const [activePersonId, setActivePersonId] = useState<string>('');
  const [paidCounts, setPaidCounts] = useState<Record<string, number>>({});
  const [editingPersonId, setEditingPersonId] = useState<string>('');

  // --- Multi-line payment state ---
  const [paymentLines, setPaymentLines] = useState<PaymentLine[]>([INITIAL_LINE(remaining)]);

  const getRemainingQty = useCallback((key: string, totalQty: number) => {
    const alreadyPaid = paidCounts[key] || 0;
    const selectedByOthers = persons
      .filter(p => p.id !== activePersonId)
      .reduce((sum, p) => sum + (p.selections[key] || 0), 0);
    return Math.max(0, totalQty - alreadyPaid - selectedByOthers);
  }, [paidCounts, persons, activePersonId]);

  const calcPersonTotal = useCallback((person: PersonSplit) => {
    const items = paymentOrder?.items || [];
    return items.reduce((sum, item, idx) => {
      const key = `${item.menuItemId ?? item.id ?? idx}`;
      const qty = person.selections[key] || 0;
      if (qty <= 0) return sum;
      const price = item.menuItemPrice || item.unitPrice || item.price || 0;
      return sum + price * qty;
    }, 0);
  }, [paymentOrder]);

  const items = paymentOrder.items || [];
  const activePerson = useMemo(() => persons.find(p => p.id === activePersonId), [persons, activePersonId]);
  const personTotal = useMemo(() => activePerson ? calcPersonTotal(activePerson) : 0, [activePerson, calcPersonTotal]);
  const totalAssigned = useMemo(() => persons.reduce((sum, p) => sum + calcPersonTotal(p), 0), [persons, calcPersonTotal]);
  const allItemsAssigned = splitMode && totalAssigned >= total;

  // --- Payment lines helpers ---
  const totalLinesAmount = paymentLines.reduce((sum, l) => sum + (l.amount || 0), 0);
  const difference = remaining - totalLinesAmount;

  const addLine = () => {
    setPaymentLines(prev => [...prev, INITIAL_LINE(0)]);
  };

  const removeLine = (id: string) => {
    if (paymentLines.length <= 1) return;
    setPaymentLines(prev => prev.filter(l => l.id !== id));
  };

  const updateLine = (id: string, field: 'paymentMethodId' | 'amount' | 'receivedAmount', value: number) => {
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

  const areLinesValid = (): boolean => {
    if (paymentLines.length === 0) return false;
    const allHaveMethod = paymentLines.every(l => l.paymentMethodId > 0);
    const allHaveAmount = paymentLines.every(l => l.amount > 0);
    const matchesTotal = Math.abs(difference) < 0.01;
    return allHaveMethod && allHaveAmount && matchesTotal;
  };

  // Reset state when modal opens or order changes
  useEffect(() => {
    if (!isOpen) return;
    const initRemaining = Math.max(0, (paymentOrder?.total || 0) - paidAmount);
    setSplitMode(false);
    setPersons([{ id: generateId(), name: 'Persona 1', selections: {}, paid: false, paidAmount: 0 }]);
    setActivePersonId('');
    setPaidCounts({});
    setEditingPersonId('');
    setPaymentLines([INITIAL_LINE(initRemaining)]);
  }, [isOpen, paymentOrder.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (persons.length > 0 && !activePersonId) {
      setActivePersonId(persons[0].id);
    }
  }, [persons, activePersonId]);

  const handleConfirm = async () => {
    if (splitMode) {
      if (!allItemsAssigned) return;
      if (!areLinesValid()) return;
      const success = await onConfirm({ lines: paymentLines });
      if (success) {
        setPersons(prev => prev.map(p => ({
          ...p,
          paid: true,
          paidAmount: calcPersonTotal(p),
          selections: {}
        })));
        setPaidCounts(prev => {
          const next = { ...prev };
          persons.forEach(p => {
            Object.entries(p.selections).forEach(([key, qty]) => {
              if (qty > 0) next[key] = (next[key] || 0) + qty;
            });
          });
          return next;
        });
      }
    } else {
      if (remaining <= 0) return;
      if (!areLinesValid()) return;
      await onConfirm({ lines: paymentLines });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="FINALIZAR TRANSACCIÓN"
      onConfirm={handleConfirm}
      size="large"
      confirmText={isSubmitting ? '⏳ PROCESANDO...' : 'REGISTRAR PAGO'}
      confirmDisabled={
        isSubmitting ||
        !areLinesValid() ||
        (splitMode ? !allItemsAssigned : remaining <= 0)
      }
    >
      <div className="space-y-6 py-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Modo de pago</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSplitMode(false)}
              className={`h-9 px-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                !splitMode ? 'bg-primary text-white shadow-lg' : 'bg-muted/40 text-muted-foreground'
              }`}
            >
              Total
            </button>
            <button
              type="button"
              onClick={() => setSplitMode(true)}
              className={`h-9 px-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                splitMode ? 'bg-primary text-white shadow-lg' : 'bg-muted/40 text-muted-foreground'
              }`}
            >
              Individual
            </button>
          </div>
        </div>
        
        {/* Order Info Card */}
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
                    <div className="p-2 bg-white rounded-xl shadow-sm text-primary">
                      <UserIcon size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Cliente</p>
                      <p className="font-black text-xs uppercase truncate max-w-30">{paymentOrder.clientName || 'General'}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-primary">
                       <ClipboardIcon size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Servicio</p>
                      <p className="font-black text-xs uppercase truncate max-w-30">
                        {paymentOrder.orderType === 'DOMICILIO' ? '🏍️ Domicilio' : `🪑 Mesa ${paymentOrder.tableNumber}`}
                      </p>
                    </div>
                 </div>
              </div>

              <Separator className="bg-primary/10" />

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
           </div>
        </div>

        {splitMode && (
          <div className="bg-muted/20 rounded-3xl border border-muted/40 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pago individual por ítems</p>
            </div>

            {/* Person tabs */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {persons.map((person) => (
                <div key={person.id} className="flex items-center group">
                  <button
                    type="button"
                    onClick={() => { if (!person.paid) setActivePersonId(person.id); }}
                    className={`h-9 px-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                      person.id === activePersonId
                        ? 'bg-primary text-white shadow-lg'
                        : person.paid
                          ? 'bg-green-100 text-green-700 border border-green-300 cursor-default'
                          : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'
                    }`}
                  >
                    {editingPersonId === person.id ? (
                      <input
                        type="text"
                        value={person.name}
                        onChange={(e) => {
                          setPersons(prev => prev.map(p =>
                            p.id === person.id ? { ...p, name: e.target.value } : p
                          ));
                        }}
                        onBlur={() => setEditingPersonId('')}
                        onKeyDown={(e) => { if (e.key === 'Enter') setEditingPersonId(''); }}
                        className="w-20 bg-transparent outline-none text-[10px] font-black uppercase"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="cursor-default">{person.name}</span>
                    )}
                    {person.paid && <span>✓</span>}
                  </button>
                  {!person.paid && editingPersonId !== person.id && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setEditingPersonId(person.id); }}
                      className="ml-[-4px] opacity-0 group-hover:opacity-100 h-5 w-5 rounded-full bg-muted/30 text-muted-foreground hover:bg-primary/20 hover:text-primary text-[8px] font-black flex items-center justify-center transition-all z-10"
                      title="Editar nombre"
                    >
                      ✏
                    </button>
                  )}
                  {!person.paid && persons.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const hasItems = Object.values(person.selections).some(q => q > 0);
                        if (hasItems) return;
                        setPersons(prev => prev.filter(p => p.id !== person.id));
                        if (activePersonId === person.id) {
                          const remainingPersons = persons.filter(p => p.id !== person.id);
                          if (remainingPersons.length > 0) setActivePersonId(remainingPersons[0].id);
                        }
                      }}
                      className="ml-[-6px] h-5 w-5 rounded-full bg-muted/30 text-muted-foreground hover:bg-rose-100 hover:text-rose-600 text-[9px] font-black flex items-center justify-center transition-colors z-10"
                      title="Eliminar persona"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setPersons(prev => [...prev, {
                    id: generateId(),
                    name: `Persona ${prev.length + 1}`,
                    selections: {},
                    paid: false,
                    paidAmount: 0
                  }]);
                }}
                className="h-8 w-8 rounded-full bg-primary/10 text-primary font-black text-lg leading-none hover:bg-primary/20 transition-all flex items-center justify-center"
                title="Agregar persona"
              >
                +
              </button>
            </div>

            {/* Active person items */}
            {activePerson && (
              <>
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                  {activePerson.paid ? (
                    <div className="bg-green-50 rounded-2xl px-4 py-3 text-center">
                      <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">
                        ✓ Pagada — ${activePerson.paidAmount.toLocaleString('es-CO')}
                      </p>
                    </div>
                  ) : (
                    items.map((item, idx) => {
                      const key = `${item.menuItemId ?? item.id ?? idx}`;
                      const price = item.menuItemPrice || item.unitPrice || item.price || 0;
                      const qty = item.quantity || 1;
                      const selectedQty = activePerson.selections[key] || 0;
                      const remainQty = getRemainingQty(key, qty);
                      return (
                        <div key={key} className="flex items-center justify-between gap-4 bg-background/60 rounded-2xl px-4 py-2.5">
                          <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase truncate">{item.menuItemName || item.name || 'Producto'}</p>
                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Disponibles: {remainQty}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPersons(prev => prev.map(p =>
                                  p.id === activePersonId
                                    ? { ...p, selections: { ...p.selections, [key]: Math.max(0, (p.selections[key] || 0) - 1) } }
                                    : p
                                ));
                              }}
                              className="h-8 w-8 rounded-full bg-muted/40 text-muted-foreground font-black"
                            >
                              -
                            </button>
                            <div className="min-w-10 text-center">
                              <p className="text-[10px] font-black">{selectedQty}</p>
                            </div>
                            <button
                              type="button"
                              disabled={selectedQty >= remainQty || totalAssigned + price > total}
                              onClick={() => {
                                setPersons(prev => prev.map(p =>
                                  p.id === activePersonId
                                    ? { ...p, selections: { ...p.selections, [key]: Math.min(remainQty, (p.selections[key] || 0) + 1) } }
                                    : p
                                ));
                              }}
                              className={`h-8 w-8 rounded-full font-black ${
                                selectedQty >= remainQty || totalAssigned + price > total
                                  ? 'bg-muted/30 text-muted-foreground/40'
                                  : 'bg-primary text-white'
                              }`}
                            >
                              +
                            </button>
                            <div className="min-w-16 text-right">
                              <p className="text-[10px] font-black text-foreground/70">${(price * selectedQty).toLocaleString('es-CO')}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="flex items-center justify-between bg-primary/10 rounded-2xl px-5 py-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    Subtotal {activePerson.name}
                  </p>
                  <p className="text-lg font-black text-primary">${personTotal.toLocaleString('es-CO')}</p>
                </div>
              </>
            )}

            {/* Assignation summary */}
            <div className={`flex items-center justify-between rounded-2xl px-4 py-3 ${allItemsAssigned ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Total asignado</p>
              <div className="flex items-center gap-2">
                <p className={`text-sm font-black ${allItemsAssigned ? 'text-green-700' : 'text-amber-700'}`}>
                  ${totalAssigned.toLocaleString('es-CO')} / ${total.toLocaleString('es-CO')}
                </p>
                {allItemsAssigned ? (
                  <span className="text-green-600 text-[9px] font-black uppercase tracking-widest">✓ Completo</span>
                ) : (
                  <span className="text-amber-600 text-[9px] font-black uppercase tracking-widest">Pendiente</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Total Highlight */}
          <div className="bg-foreground p-5 sm:p-6 rounded-3xl sm:rounded-4xl text-background flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform duration-700">
             <CalculatorIcon size={80} />
           </div>
            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-1">Total pendiente</p>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter">${remaining.toLocaleString('es-CO')}</h2>
        </div>

        {/* Multi-line Payment Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
              Líneas de Pago ({paymentLines.length})
            </label>
            <button
              type="button"
              onClick={addLine}
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
                    {/* Method select */}
                    <div className="sm:col-span-5 space-y-1.5">
                      <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                        Medio de Pago *
                      </label>
                      <select
                        value={line.paymentMethodId || ''}
                        onChange={(e) => updateLine(line.id, 'paymentMethodId', Number(e.target.value))}
                        className="w-full h-12 px-4 bg-white/60 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl outline-none font-black text-xs uppercase tracking-tight transition-all appearance-none shadow-inner"
                      >
                        <option value="">Seleccione...</option>
                        {paymentMethods.map((method) => (
                          <option key={method.id} value={method.id}>
                            {method.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Amount input */}
                    <div className="sm:col-span-4 space-y-1.5">
                      <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                        Monto *
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-black opacity-30 text-sm">$</div>
                        <input
                          type="number"
                          value={line.amount || ''}
                          onChange={(e) => updateLine(line.id, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full h-12 pl-8 pr-4 bg-white/60 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl outline-none font-black text-lg tracking-tighter transition-all shadow-inner"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Placeholder for alignment + remove button */}
                    <div className="sm:col-span-3 flex items-end justify-end gap-2">
                      {paymentLines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(line.id)}
                          className="h-10 w-10 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 font-black text-sm flex items-center justify-center transition-all"
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
                      {/* Received amount */}
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                          Efectivo Recibido
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-black opacity-30 text-sm">$</div>
                          <input
                            type="number"
                            value={line.receivedAmount || ''}
                            onChange={(e) => updateLine(line.id, 'receivedAmount', parseFloat(e.target.value) || 0)}
                            className={`w-full h-12 pl-8 pr-4 bg-white/60 border-2 rounded-xl outline-none font-black text-lg tracking-tighter transition-all shadow-inner ${
                              line.receivedAmount > 0 && !lineIsValid
                                ? 'border-rose-200 text-rose-600 focus:border-rose-500 bg-rose-50/10'
                                : 'border-transparent focus:border-primary focus:bg-white'
                            }`}
                            placeholder="0"
                            min="0"
                          />
                          {lineIsValid && line.receivedAmount > 0 && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 animate-in zoom-in">
                              <CheckCircleIcon size={16} />
                            </div>
                          )}
                        </div>
                        {!lineIsValid && line.receivedAmount > 0 && (
                          <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest ml-1 animate-pulse italic">
                            ⚠️ Insuficiente
                          </p>
                        )}
                      </div>

                      {/* Change display */}
                      <div className="flex items-center justify-center bg-amber-50/50 rounded-2xl px-4 py-3 border border-amber-100/50">
                        <div className="flex items-center gap-2">
                          <HistoryIcon size={12} className={lineChange > 0 ? 'text-amber-500' : 'text-muted-foreground'} />
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Devuelta:</p>
                          <span className={`text-sm font-black tracking-tighter ${lineChange > 0 ? 'text-amber-600' : 'text-muted-foreground/40'}`}>
                            ${lineChange.toLocaleString('es-CO')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Transfer badge */}
                  {lineTransfer && line.paymentMethodId > 0 && (
                    <div className="bg-blue-50 border-2 border-blue-200 p-3 rounded-2xl flex items-center gap-3">
                      <div className="p-1.5 bg-white rounded-lg shadow-sm text-blue-600">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                          <line x1="22" y1="9" x2="12" y2="14"></line>
                          <line x1="2" y1="9" x2="12" y2="14"></line>
                        </svg>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-blue-700 uppercase tracking-widest">Transferencia</p>
                        <p className="text-[8px] font-medium text-blue-600/70 italic">Sin manejo de efectivo</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary bar */}
          <div className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
            Math.abs(difference) < 0.01
              ? 'bg-green-50 border-green-200'
              : difference > 0
                ? 'bg-amber-50 border-amber-200'
                : 'bg-rose-50 border-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              <WalletIcon size={14} className={
                Math.abs(difference) < 0.01 ? 'text-green-600' : difference > 0 ? 'text-amber-600' : 'text-rose-600'
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
              ${totalLinesAmount.toLocaleString('es-CO')} / ${remaining.toLocaleString('es-CO')}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
