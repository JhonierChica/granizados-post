import React, { useState, useEffect, ChangeEvent } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { PaymentIcon, EditIcon, DeleteIcon, ToggleIcon, WalletIcon, CheckCircleIcon, XCircleIcon } from '../../components/common/Icons';
import { paymentMethodService } from '../../services/paymentMethodService';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import type { PaymentMethod } from '../../types';

interface FormData {
  name: string;
  active: boolean;
}

const PaymentMethods: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    active: true,
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const data = await paymentMethodService.getAllPaymentMethods();
      setPaymentMethods(data);
    } catch (err) {
      console.error('Error al cargar métodos de pago:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingMethod(null);
    setFormData({
      name: '',
      active: true,
    });
    setShowModal(true);
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      active: !!(method.active || method.status || method.isActive),
    });
    setShowModal(true);
  };

  const handleDelete = async (method: PaymentMethod) => {
    if (window.confirm(`¿Está seguro de eliminar el método de pago ${method.name}?`)) {
      try {
        await paymentMethodService.deletePaymentMethod(method.id);
        loadPaymentMethods();
      } catch (err) {
        console.error('Error al eliminar método de pago:', err);
      }
    }
  };

  const handleToggleStatus = async (method: PaymentMethod) => {
    try {
      await paymentMethodService.togglePaymentMethodStatus(method.id);
      loadPaymentMethods();
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingMethod) {
        await paymentMethodService.updatePaymentMethod(editingMethod.id, formData);
      } else {
        await paymentMethodService.createPaymentMethod(formData);
      }
      setShowModal(false);
      loadPaymentMethods();
    } catch (err) {
      console.error('Error al guardar método de pago:', err);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  if (loading) return <Loading type="card" message="Cargando métodos de pago..." />;

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        <PageHeader
          title="Métodos de Pago"
          subtitle="Configura las opciones de recaudo para tus ventas."
          icon={<PaymentIcon size={22} />}
          iconColor="text-primary bg-primary/10"
          action={
            <Button onClick={handleAdd} size="lg" className="rounded-xl sm:rounded-2xl font-black h-11 sm:h-14 px-6 sm:px-8 shadow-lg shadow-primary/20 uppercase tracking-widest w-full sm:w-auto">
              + NUEVO MÉTODO
            </Button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-2">
          {paymentMethods.map((method) => {
            const isActive = !!(method.active || method.status || method.isActive);
            return (
              <Card 
                key={method.id}
                className="group border-r-4 border-r-primary/20 hover:border-r-primary transition-all"
                title={
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 font-black">
                      <div className={`p-2 rounded-xl ${isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <WalletIcon size={20} />
                      </div>
                      <span className="text-lg uppercase tracking-tight line-clamp-1">{method.name}</span>
                    </div>
                  </div>
                }
                actions={
                  <div className="flex gap-2">
                    <button
                      className="p-2 hover:bg-primary/10 rounded-xl transition-all text-primary"
                      onClick={() => handleEdit(method)}
                      title="Editar"
                    >
                      <EditIcon size={18} />
                    </button>
                    <button
                      className={`p-2 rounded-xl transition-all ${isActive ? 'hover:bg-amber-100 text-amber-600' : 'hover:bg-green-100 text-green-600'}`}
                      onClick={() => handleToggleStatus(method)}
                      title={isActive ? 'Desactivar' : 'Activar'}
                    >
                      <ToggleIcon size={18} />
                    </button>
                    <button
                      className="p-2 hover:bg-destructive/10 rounded-xl transition-all text-destructive"
                      onClick={() => handleDelete(method)}
                      title="Eliminar"
                    >
                      <DeleteIcon size={18} />
                    </button>
                  </div>
                }
              >
                <div className="space-y-6">
                  <div className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${isActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-muted/50 border-border text-muted-foreground'}`}>
                    {isActive ? <CheckCircleIcon size={20} /> : <XCircleIcon size={20} />}
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Estado Actual</span>
                      <span className="text-sm font-black uppercase tracking-tighter">{isActive ? 'Habilitado para cobro' : 'Inhabilitado'}</span>
                    </div>
                  </div>

                  <Separator className="bg-muted/50" />

                  <div className="flex items-center justify-between">
                    <Badge variant={isActive ? 'default' : 'destructive'} className="rounded-lg font-black text-[10px] px-3">
                      {isActive ? 'ACTIVO' : 'INACTIVO'}
                    </Badge>
                    <span className="text-[10px] font-black text-muted-foreground tracking-widest opacity-30">CÓDIGO: #{method.id}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {paymentMethods.length === 0 && (
          <div className="text-center py-24 bg-muted/20 rounded-6xl border-2 border-dashed border-muted shadow-inner">
            <PaymentIcon size={80} className="mx-auto mb-6 opacity-10" />
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-muted-foreground">Sin formas de pago</h3>
            <p className="text-muted-foreground font-medium mb-10 max-w-sm mx-auto">Debes configurar al menos una forma de pago para poder realizar cierres de caja y ventas.</p>
            <Button onClick={handleAdd} variant="primary" className="rounded-2xl px-12 h-14 font-black tracking-widest shadow-xl shadow-primary/20 text-white">NUEVO MÉTODO</Button>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingMethod ? 'MODIFICAR MÉTODO DE PAGO' : 'REGISTRAR MÉTODO DE PAGO'}
          onConfirm={handleSubmit}
          size="medium"
          confirmText={editingMethod ? 'ACTUALIZAR' : 'GUARDAR'}
        >
          <div className="space-y-8 py-6">
            <Input
              label="Nombre del Método de Pago *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Nequi, Datáfono, Efectivo..."
              className="h-16 font-black text-xl px-6 rounded-2xl border-2 focus:border-primary transition-all"
              required
            />

            <div className="flex h-16 items-center px-6 bg-muted/30 rounded-2xl border-2 border-transparent hover:border-muted/50 transition-all">
              <label className="flex items-center gap-4 cursor-pointer select-none w-full">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="w-6 h-6 rounded-lg border-2 border-muted text-primary focus:ring-primary transition-all cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-black text-foreground uppercase tracking-widest">Activo para el público</span>
                  <span className="text-[10px] text-muted-foreground font-medium">Permitir que este método aparezca en el checkout</span>
                </div>
              </label>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default PaymentMethods;