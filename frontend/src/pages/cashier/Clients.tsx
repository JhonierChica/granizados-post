import React, { useState, useEffect, ChangeEvent } from 'react';
import { toast } from 'sonner';
import PageHeader from '../../components/common/PageHeader';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { ClientsIcon, EditIcon, DeleteIcon, PlusIcon, UserIcon, PhoneIcon, CreditCardIcon, MapPinIcon } from '../../components/common/Icons';
import { clientService } from '../../services/clientService';
import type { Client } from '../../types';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';

interface FormData {
  name: string;
  phone: string;
  identificationNumber: string;
  address: string;
}

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    identificationNumber: '',
    address: '',
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAllClients();
      setClients(data);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      toast.error('Error al cargar la lista de clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      phone: '',
      identificationNumber: '',
      address: '',
    });
    setShowModal(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      phone: client.phone || '',
      identificationNumber: client.identificationNumber || '',
      address: client.address || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (client: Client) => {
    if (window.confirm(`¿Está seguro de eliminar a ${client.name}?`)) {
      try {
        await clientService.deleteClient(client.id);
        toast.success(`Cliente ${client.name} eliminado`);
        loadClients();
      } catch (err) {
        console.error('Error al eliminar cliente:', err);
        toast.error('Error al eliminar el cliente');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const clientData = {
        name: formData.name,
        phone: formData.phone,
        identificationNumber: formData.identificationNumber,
        address: formData.address,
      };

      if (editingClient) {
        await clientService.updateClient(editingClient.id, clientData);
        toast.success('Cliente actualizado correctamente');
      } else {
        await clientService.createClient(clientData);
        toast.success('Cliente registrado con éxito');
      }
      setShowModal(false);
      loadClients();
    } catch (err: any) {
      console.error('Error al guardar cliente:', err);
      toast.error('Error al guardar los datos del cliente');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) return <Loading type="card" message="Sincronizando base de datos de clientes..." />;

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
        <PageHeader
          title="Directorio de Clientes"
          subtitle="Gestión de fidelización y datos de comensales."
          icon={<ClientsIcon size={22} />}
          iconColor="text-secondary bg-secondary/10"
          action={
            <Button
              onClick={handleAdd}
              size="lg"
              className="rounded-xl sm:rounded-2xl font-black h-11 sm:h-14 px-5 sm:px-10 shadow-xl shadow-secondary/20 bg-secondary text-white border-none group transition-all w-full sm:w-auto"
            >
              <PlusIcon size={18} className="mr-2 group-hover:rotate-90 transition-transform" />
              NUEVO CLIENTE
            </Button>
          }
        />

        {/* Clients Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {clients.map((client) => (
            <Card key={client.id} className="group overflow-hidden border-2 border-transparent hover:border-secondary/10 transition-all duration-300">
              <div className="relative z-10 flex flex-col h-full space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                   <div className="w-14 h-14 bg-secondary/5 rounded-2xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-500 shadow-inner">
                      <span className="text-2xl font-black">{client.name.charAt(0).toUpperCase()}</span>
                   </div>
                   <Badge variant="outline" className="text-[9px] font-black rounded-lg border-muted uppercase tracking-widest text-muted-foreground">
                      ID: C-{client.id}
                   </Badge>
                </div>

                <div className="space-y-1">
                   <h3 className="text-xl font-black tracking-tighter text-foreground uppercase truncate" title={client.name}>
                     {client.name}
                   </h3>
                   <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground italic">
                      <CreditCardIcon size={14} className="opacity-40" />
                      {client.identificationNumber || 'Sin Identificación'}
                   </div>
                </div>

                <Separator className="bg-muted/60 border-dashed" />

                {/* Contact Data */}
                <div className="space-y-4">
                   <div className="flex items-start gap-4">
                      <div className="p-2 bg-muted/30 rounded-xl text-muted-foreground">
                         <PhoneIcon size={16} />
                      </div>
                      <div className="space-y-0.5">
                         <span className="block text-[9px] font-black text-muted-foreground uppercase opacity-40 tracking-widest leading-none">WhatsApp / Cel</span>
                         <span className="text-xs font-black text-foreground/80">{client.phone || '--'}</span>
                      </div>
                   </div>
                   <div className="flex items-start gap-4">
                      <div className="p-2 bg-muted/30 rounded-xl text-muted-foreground">
                         <MapPinIcon size={16} />
                      </div>
                      <div className="space-y-0.5 max-w-40">
                         <span className="block text-[9px] font-black text-muted-foreground uppercase opacity-40 tracking-widest leading-none">Dirección habitual</span>
                         <span className="text-xs font-black text-foreground/80 truncate block">{client.address || 'No registrada'}</span>
                      </div>
                   </div>
                </div>

                <div className="flex gap-2 pt-4 mt-auto">
                  <button 
                    className="flex-1 flex items-center justify-center p-3 rounded-2xl bg-muted/40 text-muted-foreground hover:bg-secondary/10 hover:text-secondary transition-all border border-transparent hover:border-secondary/20" 
                    onClick={() => handleEdit(client)}
                    title="Editar"
                  >
                    <EditIcon size={20} />
                  </button>
                  <button 
                    className="flex-1 flex items-center justify-center p-3 rounded-2xl bg-muted/40 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all border border-transparent hover:border-destructive/20" 
                    onClick={() => handleDelete(client)}
                    title="Eliminar"
                  >
                    <DeleteIcon size={20} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {clients.length === 0 && (
          <div className="text-center py-32 bg-muted/10 rounded-6xl border-2 border-dashed border-muted shadow-inner">
             <UserIcon size={64} className="mx-auto text-muted-foreground opacity-20 mb-6" />
             <h3 className="text-xl font-black uppercase tracking-tighter text-muted-foreground">Sin base de datos de clientes</h3>
             <p className="text-muted-foreground font-medium italic mb-10">Comienza a registrar clientes para mejorar el servicio de domicilios.</p>
             <Button onClick={handleAdd} className="rounded-xl px-12 font-black bg-secondary">AÑADIR MI PRIMER CLIENTE</Button>
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingClient ? 'EDITAR CLIENTE' : 'NUEVO REGISTRO'}
          onConfirm={handleSubmit}
          size="medium"
        >
          <div className="space-y-8 py-2 animate-in slide-in-from-bottom-4 duration-300">
             <div className="bg-secondary/5 p-6 rounded-4xl border border-secondary/10 flex items-center gap-6">
                <div className="w-20 h-20 bg-secondary/10 rounded-3xl flex items-center justify-center text-secondary shadow-xl shadow-secondary/10">
                   <UserIcon size={40} />
                </div>
                <div className="space-y-1">
                   <h3 className="text-lg font-black tracking-tighter uppercase leading-none">Datos de Filtro</h3>
                   <p className="text-[10px] text-muted-foreground font-medium italic">Información clave para cobros y domicilios.</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nombre Completo *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ej. Juan Manuel"
                  className="h-14 font-bold"
                />
                <Input
                  label="Identificación (Doc / NIT)"
                  name="identificationNumber"
                  value={formData.identificationNumber}
                  onChange={handleChange}
                  placeholder="Ej. 1067..."
                  className="h-14 font-black tracking-widest"
                />
                <Input
                  label="Teléfono / Celular *"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="300..."
                  className="h-14 font-bold"
                />
                <Input
                  label="Dirección Residencial"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Calle ... # ..."
                  className="h-14 font-bold"
                />
             </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Clients;