import React, { useState, useEffect, ChangeEvent } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import { TableIcon, MapIcon, UsersIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '../../components/common/Icons';
import { tableService } from '../../services/tableService';
import { TABLE_STATUS } from '../../utils/constants';
import type { Table } from '../../types';
import { Badge } from '../../components/ui/badge';

const WaiterTables: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [status, setStatus] = useState<string>(TABLE_STATUS.AVAILABLE);

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

  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setStatus(table.status);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!editingTable) return;

    try {
      await tableService.updateTable(editingTable.id, {
        tableNumber: editingTable.tableNumber,
        capacity: editingTable.capacity,
        location: editingTable.location,
        status: status,
      });
      setShowModal(false);
      loadTables();
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    }
  };

  const getStatusInfo = (tableStatus: string) => {
    switch (tableStatus) {
      case 'AVAILABLE':
        return { label: 'DISPONIBLE', emoji: '', class: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <CheckCircleIcon size={16} /> };
      case 'OCCUPIED':
        return { label: 'OCUPADA', emoji: '', class: 'bg-rose-50 text-rose-700 border-rose-100', icon: <XCircleIcon size={16} /> };
      case 'RESERVED':
        return { label: 'RESERVADA', emoji: '', class: 'bg-amber-50 text-amber-700 border-amber-100', icon: <ClockIcon size={16} /> };
      default:
        return { label: tableStatus, emoji: '', class: 'bg-muted text-muted-foreground border-muted', icon: <TableIcon size={16} /> };
    }
  };

  if (loading) return <Loading type="card" message="Actualizando plano de mesas..." />;

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tighter flex items-center gap-2 sm:gap-3 text-foreground">
              <div className="p-2 sm:p-3 bg-secondary/10 rounded-xl sm:rounded-2xl text-secondary shadow-inner">
                <MapIcon size={24} />
              </div>
              Mapa de Mesas
            </h1>
            <p className="text-xs sm:text-muted-foreground font-medium pl-1 flex items-center gap-2 opacity-70">
              Disponibilidad en tiempo real.
            </p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 bg-muted/20 p-1 sm:p-2 rounded-xl sm:rounded-2xl border border-muted/50 overflow-x-auto no-scrollbar shrink-0">
             <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-tight shrink-0">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> {tables.filter(t => t.status === 'AVAILABLE').length} Libres
             </div>
             <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 bg-rose-100 text-rose-800 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-tight shrink-0">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" /> {tables.filter(t => t.status === 'OCCUPIED').length} Ocupadas
             </div>
             <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 bg-amber-100 text-amber-800 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-tight shrink-0">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" /> {tables.filter(t => t.status === 'RESERVED').length} Reservas
             </div>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {tables.map((table) => {
            const statusInfo = getStatusInfo(table.status);
            return (
              <Card 
                key={table.id} 
                className="group relative overflow-hidden h-full border-2 border-transparent hover:border-secondary/20 transition-all duration-300 active:scale-[0.98] cursor-pointer p-5 sm:p-6"
                onClick={() => handleEdit(table)}
              >
                {/* Visual Status Indicator */}
                <div className={`absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 -mr-8 -mt-8 rotate-45 opacity-10 transition-transform group-hover:scale-150 duration-700 ${statusInfo.class}`} />
                
                <div className="space-y-4 sm:space-y-6 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60 italic">Ubicación: {table.location || 'Salón'}</p>
                      <h3 className="text-2xl sm:text-3xl font-black tracking-tighter text-foreground leading-none">MESA {table.tableNumber}</h3>
                    </div>
                    <Badge className={`rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[9px] uppercase tracking-wider px-2 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1.5 sm:gap-2 shadow-sm border-2 ${statusInfo.class}`}>
                      {statusInfo.icon} {statusInfo.label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 pt-1 sm:pt-2">
                    <div className="flex flex-col">
                       <span className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase opacity-40 italic">Capacidad</span>
                       <div className="flex items-center gap-1.5 sm:gap-2">
                          <UsersIcon size={14} className="text-secondary" />
                          <span className="font-black text-lg sm:text-xl tracking-tighter">{table.capacity}</span>
                       </div>
                    </div>
                    <div className="flex-1 h-0.5 bg-muted/60" />
                    <button className="p-2.5 sm:p-3 bg-muted/40 hover:bg-secondary hover:text-white rounded-xl sm:rounded-2xl transition-all shadow-sm border border-muted/50">
                       <TableIcon size={20} />
                    </button>
                  </div>
                </div>

                {/* Footer Message */}
                <div className="mt-6 pt-4 border-t border-dashed border-muted/60 text-center">
                   <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
                     Click para gestionar disponibilidad
                   </span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {tables.length === 0 && (
          <div className="text-center py-32 bg-muted/10 rounded-6xl border-2 border-dashed border-muted shadow-inner">
             <TableIcon size={64} className="mx-auto text-muted-foreground opacity-20 mb-6" />
             <h3 className="text-xl font-black uppercase tracking-tighter text-muted-foreground">Sin mesas registradas</h3>
             <p className="text-muted-foreground font-medium italic">Configura el salón desde el panel de administración.</p>
          </div>
        )}

        {/* Edit Status Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="ACTUALIZAR DISPONIBILIDAD"
          onConfirm={handleSubmit}
          size="small"
          confirmText="LISTO"
        >
          <div className="space-y-8 py-2 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-secondary/5 p-6 rounded-3xl border border-secondary/10 flex items-center gap-5">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl font-black text-secondary shadow-sm shadow-secondary/10">
                {editingTable?.tableNumber}
              </div>
              <div className="space-y-1">
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Identificador de Mesa</span>
                 <h4 className="text-xl font-black tracking-tighter uppercase whitespace-nowrap">SALÓN: {editingTable?.location || 'Principal'}</h4>
                 <Badge variant="outline" className="text-[9px] font-black rounded-lg border-muted uppercase tracking-wider px-2">Capacidad: {editingTable?.capacity} Pers.</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Cambiar estado operativo:</label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: TABLE_STATUS.AVAILABLE, label: 'MARCAR COMO DISPONIBLE', icon: <CheckCircleIcon size={24} />, class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                  { id: TABLE_STATUS.OCCUPIED, label: 'MARCAR COMO OCUPADA', icon: <XCircleIcon size={24} />, class: 'bg-rose-50 text-rose-700 border-rose-200' },
                  { id: TABLE_STATUS.RESERVED, label: 'MARCAR COMO RESERVADA', icon: <ClockIcon size={24} />, class: 'bg-amber-50 text-amber-700 border-amber-200' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setStatus(opt.id)}
                    className={`
                      w-full flex items-center gap-4 p-5 rounded-2xl border-2 font-black text-xs uppercase tracking-tight transition-all
                      ${status === opt.id ? `${opt.class} ring-4 ring-secondary/5` : 'bg-white border-muted/50 text-muted-foreground hover:bg-muted/5'}
                    `}
                  >
                    <span className="text-2xl leading-none">{opt.icon}</span>
                    <span className="flex-1">{opt.label}</span>
                    {status === opt.id && (
                      <div className="bg-white/50 p-1 rounded-full text-current">
                        <CheckCircleIcon size={18} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default WaiterTables;