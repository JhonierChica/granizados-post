import React, { useState, useEffect, ChangeEvent } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { TableIcon, EditIcon, DeleteIcon, ToggleIcon, PlusIcon, MapIcon, UsersIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '../../components/common/Icons';
import { tableService } from '../../services/tableService';
import { TABLE_STATUS } from '../../utils/constants';
import type { Table } from '../../types';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';

interface FormData {
  tableNumber: string | number;
  capacity: string | number;
  location?: string;
  status: string;
}

const TablesList: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState<FormData>({
    tableNumber: '',
    capacity: '',
    status: TABLE_STATUS.AVAILABLE,
  });

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await tableService.getAllTables();
      setTables(data);
    } catch (err) {
      console.error('Error al cargar mesas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTable(null);
    setFormData({
      tableNumber: '',
      capacity: '',
      location: '',
      status: TABLE_STATUS.AVAILABLE,
    });
    setShowModal(true);
  };

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setFormData({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      location: table.location || '',
      status: table.status,
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (tableId: number, isActive: boolean) => {
    try {
      await tableService.updateTable(tableId, { isActive: !isActive } as Partial<Table>);
      loadTables();
    } catch (err) {
      console.error(`Error al cambiar estado de mesa:`, err);
    }
  };

  const handleDelete = async (table: Table) => {
    if (window.confirm(`¿Está seguro de eliminar la mesa ${table.tableNumber}?`)) {
      try {
        await tableService.deleteTable(table.id);
        loadTables();
      } catch (err) {
        console.error('Error al eliminar mesa:', err);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const dataToSave = {
        ...formData,
        tableNumber: Number(formData.tableNumber),
        capacity: Number(formData.capacity)
      };

      if (editingTable) {
        await tableService.updateTable(editingTable.id, dataToSave as Partial<Table>);
      } else {
        await tableService.createTable(dataToSave as Partial<Table>);
      }
      setShowModal(false);
      loadTables();
    } catch (err) {
      console.error('Error al guardar mesa:', err);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getStatusInfo = (tableStatus: string) => {
    switch (tableStatus) {
      case 'AVAILABLE':
        return { label: 'DISPONIBLE', emoji: '', class: 'bg-emerald-100 border-emerald-200 text-emerald-800' };
      case 'OCCUPIED':
        return { label: 'OCUPADA', emoji: '', class: 'bg-rose-100 border-rose-200 text-rose-800' };
      case 'RESERVED':
        return { label: 'RESERVADA', emoji: '', class: 'bg-amber-100 border-amber-200 text-amber-800' };
      default:
        return { label: 'FUERA DE SERVICIO', emoji: '', class: 'bg-muted border-muted-foreground/20 text-muted-foreground' };
    }
  };

  if (loading) return <Loading type="card" message="Gestionando mobiliario..." />;

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
        <PageHeader
          title="Gestión de Mesas"
          subtitle="Administración y control del inventario de mesas."
          icon={<TableIcon size={22} />}
          iconColor="text-primary bg-primary/10"
          action={
            <Button
              onClick={handleAdd}
              size="lg"
              className="rounded-xl sm:rounded-2xl font-black h-11 sm:h-14 px-6 sm:px-10 shadow-2xl shadow-primary/20 bg-primary text-white border-none group transition-all w-full sm:w-auto"
            >
              <PlusIcon size={18} className="mr-2 group-hover:rotate-90 transition-transform" />
              NUEVA MESA
            </Button>
          }
        />

        {/* Tables Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {tables.map((table) => {
            const statusInfo = getStatusInfo(table.status);
            return (
              <Card key={table.id} className="group overflow-hidden border-2 border-transparent hover:border-primary/10 transition-all duration-300">
                <div className="relative z-10 flex flex-col h-full space-y-6">
                  {/* Card Header */}
                  <div className="flex justify-between items-start">
                     <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-primary rounded-full" />
                           <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">ID: M-{table.id}</span>
                        </div>
                        <h3 className="text-2xl font-black tracking-tighter text-foreground">MESA {table.tableNumber}</h3>
                     </div>
                      <Badge className={`rounded-xl font-black text-[9px] uppercase tracking-wider px-3 py-1.5 flex items-center gap-2 shadow-sm border ${statusInfo.class}`}>
                         {statusInfo.label}
                      </Badge>
                  </div>

                  {/* Icon Representation */}
                  <div className="bg-muted/30 p-8 rounded-4xl flex items-center justify-center relative group-hover:bg-primary/5 transition-colors">
                     <TableIcon size={64} className="text-muted-foreground group-hover:text-primary transition-colors opacity-20" />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-black text-4xl text-primary/10 group-hover:text-primary/20 transition-all">{table.tableNumber}</span>
                     </div>
                  </div>

                  {/* Info Points */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40">Ubicación</span>
                        <div className="flex items-center gap-2 text-xs font-bold text-foreground/80">
                           <MapIcon size={14} className="text-secondary" />
                           {table.location || 'Salón Principal'}
                        </div>
                     </div>
                     <div className="space-y-1">
                        <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40">Capacidad</span>
                        <div className="flex items-center gap-2 text-xs font-bold text-foreground/80">
                           <UsersIcon size={14} className="text-secondary" />
                           {table.capacity} comensales
                        </div>
                     </div>
                  </div>

                  <Separator className="bg-muted/60 border-dashed" />

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button 
                      className="flex-1 flex items-center justify-center p-3 rounded-2xl bg-muted/40 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20" 
                      onClick={() => handleEdit(table)}
                      title="Editar"
                    >
                      <EditIcon size={20} />
                    </button>
                    <button 
                      className={`flex-1 flex items-center justify-center p-3 rounded-2xl transition-all border border-transparent
                        ${table.isActive 
                          ? 'bg-amber-100 text-amber-600 hover:bg-amber-200 border-amber-300' 
                          : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 border-emerald-300'
                        }
                      `}
                      onClick={() => handleToggleStatus(table.id, !!table.isActive)}
                      title={table.isActive ? 'Desactivar' : 'Activar'}
                    >
                      <ToggleIcon size={20} />
                    </button>
                    <button 
                      className="flex-1 flex items-center justify-center p-3 rounded-2xl bg-muted/40 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all border border-transparent hover:border-destructive/20" 
                      onClick={() => handleDelete(table)}
                      title="Eliminar"
                    >
                      <DeleteIcon size={20} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
          </div>

          {/* Empty State */}
          {tables.length === 0 && (
            <div className="text-center py-32 bg-muted/10 rounded-6xl border-2 border-dashed border-muted shadow-inner">
               <TableIcon size={64} className="mx-auto text-muted-foreground opacity-20 mb-6" />
               <h3 className="text-xl font-black uppercase tracking-tighter text-muted-foreground">No hay locales registrados</h3>
               <p className="text-muted-foreground font-medium italic mb-10">Define tu primera mesa para comenzar a operar.</p>
               <Button onClick={handleAdd} className="rounded-xl px-8 font-black bg-primary">CREAR PRIMERA MESA</Button>
            </div>
          )}

          {/* Create/Edit Modal */}
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={editingTable ? 'CONFIGURAR MESA' : 'REGISTRAR NUEVA MESA'}
            onConfirm={handleSubmit}
            size="medium"
          >
            <div className="space-y-8 py-2 animate-in slide-in-from-bottom-4 duration-300">
               <div className="bg-primary/5 p-6 rounded-4xl border border-primary/10 flex items-center gap-6">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-primary shadow-xl shadow-primary/10 transition-transform hover:scale-110">
                     <TableIcon size={40} />
                  </div>
                  <div className="space-y-1">
                     <h3 className="text-lg font-black tracking-tighter uppercase leading-none">Detalles Técnicos</h3>
                     <p className="text-[10px] text-muted-foreground font-medium italic">Define la capacidad y ubicación física de la unidad.</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Número Identificador *"
                    name="tableNumber"
                    type="number"
                    value={formData.tableNumber}
                    onChange={handleChange}
                    required
                    placeholder="Ej. 01"
                    className="h-14 font-black text-xl text-center"
                  />
                  <Input
                    label="Capacidad Adultos *"
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    required
                    placeholder="Pax"
                    className="h-14 font-black text-xl text-center"
                  />
               </div>
               
               <Input
                  label="Ubicación Específica"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleChange}
                  placeholder="Ej: Cancha central, Palco VIP..."
                  className="h-14 font-bold"
               />

               <div className="space-y-3">
                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Estado de Apertura</label>
                 <select
                   name="status"
                   value={formData.status}
                   onChange={handleChange}
                   className="w-full h-14 px-6 bg-muted/30 border-2 border-transparent focus:border-primary focus:bg-background rounded-2xl outline-none font-black text-sm uppercase tracking-tight appearance-none transition-all shadow-inner"
                   required
                 >
                   <option value={TABLE_STATUS.AVAILABLE}>DISPONIBLE PARA SERVICIO</option>
                   <option value={TABLE_STATUS.OCCUPIED}>ACTUALMENTE OCUPADA</option>
                   <option value={TABLE_STATUS.RESERVED}>RESERVADA PREVIAMENTE</option>
                 </select>
               </div>
            </div>
          </Modal>
      </div>
    </Layout>
  );
};

export default TablesList;