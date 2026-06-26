import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import { BriefcaseIcon, EditIcon, DeleteIcon, ToggleIcon, WalletIcon, HashIcon, AlignLeftIcon, ClipboardListIcon } from '../../components/common/Icons';
import { positionService } from '../../services/positionService';
import { DEPARTMENTS } from '../../utils/constants';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import type { Position } from '../../types';

interface PositionFormData {
  code: string;
  name: string;
  description: string;
  department: string;
  baseSalary: string;
  responsibilities: string;
}

const Positions: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [formData, setFormData] = useState<PositionFormData>({
    code: '',
    name: '',
    description: '',
    department: '',
    baseSalary: '',
    responsibilities: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      setLoading(true);
      const data = await positionService.getAll();
      setPositions(data);
    } catch (err) {
      setError('Error al cargar los cargos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPosition(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      department: '',
      baseSalary: '',
      responsibilities: '',
    });
    setError('');
    setShowModal(true);
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    setFormData({
      code: (position as any).code || '',
      name: position.name,
      description: (position as any).description || '',
      department: position.department,
      baseSalary: position.baseSalary?.toString() || '',
      responsibilities: (position as any).responsibilities || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleToggleStatus = async (positionId: number, currentStatus: boolean) => {
    const action = currentStatus ? 'desactivar' : 'activar';
    if (window.confirm(`¿Está seguro de ${action} este cargo?`)) {
      try {
        await positionService.update(positionId, { active: !currentStatus });
        loadPositions();
      } catch (err) {
        setError(`Error al ${action} el cargo`);
        console.error(err);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este cargo?')) {
      try {
        await positionService.delete(id);
        loadPositions();
      } catch (err) {
        setError('Error al eliminar el cargo. Puede tener empleados asociados.');
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const submitData = {
        ...formData,
        baseSalary: formData.baseSalary ? parseFloat(formData.baseSalary) : null,
      };

      if (editingPosition) {
        await positionService.update(editingPosition.id, submitData as Partial<Position>);
      } else {
        await positionService.create(submitData as Partial<Position>);
      }
      setShowModal(false);
      loadPositions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar el cargo');
      console.error(err);
    }
  };

  if (loading) return <Loading type="card" message="Cargando cargos laborales..." />;

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        <PageHeader
          title="Cargos y Posiciones"
          subtitle="Estructura organizacional y salarial."
          icon={<BriefcaseIcon size={22} />}
          iconColor="text-primary bg-primary/10"
          action={
            <Button onClick={handleCreate} size="lg" className="rounded-xl sm:rounded-2xl font-black h-11 sm:h-14 px-6 sm:px-8 shadow-lg shadow-primary/20 w-full sm:w-auto">
              + NUEVO CARGO
            </Button>
          }
        />

        {error && (
          <div className="bg-destructive/10 border-2 border-destructive/20 p-4 rounded-2xl text-destructive font-bold text-sm flex items-center gap-3">
            <span className="text-lg">⚠️</span> {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-2">
          {positions.map((position) => {
            const isActive = !!(position as any).active;
            return (
              <Card 
                key={position.id}
                className="group"
                title={
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 font-black">
                      <div className={`p-2 rounded-xl ${isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <HashIcon size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg tracking-tight uppercase">{(position as any).code || 'SN-COD'}</span>
                        <span className="text-[10px] text-muted-foreground tracking-[0.2em]">{position.name}</span>
                      </div>
                    </div>
                    <Badge variant={isActive ? 'default' : 'destructive'} className="rounded-lg font-black text-[9px] px-2 h-5">
                      {isActive ? 'ACTIVO' : 'INACTIVO'}
                    </Badge>
                  </div>
                }
                actions={
                  <div className="flex gap-2">
                    <button 
                      className="p-2 hover:bg-primary/10 rounded-xl transition-all text-primary"
                      onClick={() => handleEdit(position)}
                      title="Editar"
                    >
                      <EditIcon size={18} />
                    </button>
                    <button 
                      className={`p-2 rounded-xl transition-all ${isActive ? 'hover:bg-amber-100 text-amber-600' : 'hover:bg-green-100 text-green-600'}`}
                      onClick={() => handleToggleStatus(position.id, isActive)}
                      title={isActive ? 'Desactivar' : 'Activar'}
                    >
                      <ToggleIcon size={18} />
                    </button>
                    <button 
                      className="p-2 hover:bg-destructive/10 rounded-xl transition-all text-destructive"
                      onClick={() => handleDelete(position.id)}
                      title="Eliminar"
                    >
                      <DeleteIcon size={18} />
                    </button>
                  </div>
                }
              >
                <div className="space-y-6">
                  <div className="bg-muted/30 p-4 rounded-2xl min-h-16">
                    <div className="flex items-start gap-2 mb-1">
                      <AlignLeftIcon size={14} className="text-primary mt-0.5" />
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Descripción</span>
                    </div>
                    <p className="text-xs text-foreground/80 font-medium italic line-clamp-2">
                      {(position as any).description || 'Sin descripción.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Departamento</span>
                      <p className="font-bold uppercase text-foreground">{position.department}</p>
                    </div>
                    {position.baseSalary && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Salario Base</span>
                        <div className="flex items-center gap-1 font-black text-primary">
                          <WalletIcon size={12} />
                          ${position.baseSalary.toLocaleString('es-CO')}
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-muted/50" />

                  <div className="pt-2">
                    <span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase opacity-30">ID Registro: #{position.id}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {positions.length === 0 && (
          <div className="text-center py-24 bg-muted/20 rounded-6xl border-2 border-dashed border-muted shadow-inner">
            <BriefcaseIcon size={80} className="mx-auto mb-6 opacity-10" />
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-muted-foreground">Estructura Desocupada</h3>
            <p className="text-muted-foreground font-medium mb-10 max-w-sm mx-auto">Comienza definiendo los roles y cargos de tu restaurante para el control de nómina.</p>
            <Button onClick={handleCreate} variant="primary" className="rounded-2xl px-12 h-14 font-black tracking-widest shadow-xl shadow-primary/20 text-white">DEFINIR CARGO</Button>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingPosition ? 'MODIFICAR CARGO' : 'NUEVO CARGO LABORAL'}
          size="extra-large"
          showActions={false}
        >
          <form onSubmit={handleSubmit} className="space-y-8 py-4 max-h-[70vh] overflow-y-auto px-1 pr-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Código Interno *"
                name="code"
                value={formData.code}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="EJ. CHEF"
                required
                disabled={editingPosition !== null}
                className="h-14 font-black"
              />

              <Input
                label="Nombre del Cargo *"
                name="name"
                value={formData.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej. Chef Principal"
                required
                className="h-14 font-bold md:col-span-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Área o Departamento *</label>
                <select
                  value={formData.department}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, department: e.target.value })}
                  required
                  className="w-full h-14 px-6 bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-background rounded-2xl outline-none transition-all font-bold text-base appearance-none shadow-inner"
                >
                  <option value="">Seleccione...</option>
                  {Object.entries(DEPARTMENTS).map(([key, value]: [string, string]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Salario Base Mensual"
                type="number"
                name="baseSalary"
                value={formData.baseSalary}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, baseSalary: e.target.value })}
                placeholder="0"
                min="0"
                step="1000"
                className="h-14 font-black"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <AlignLeftIcon size={14} /> Descripción General
              </label>
              <textarea
                value={formData.description}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Breve descripción del alcance del cargo..."
                className="w-full min-h-20 p-4 bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-background rounded-2xl outline-none transition-all font-medium text-base shadow-inner resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <ClipboardListIcon size={14} /> Responsabilidades Clave
              </label>
              <textarea
                value={formData.responsibilities}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, responsibilities: e.target.value })}
                placeholder="Liste las funciones principales separadas por comas o líneas..."
                rows={4}
                className="w-full p-4 bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-background rounded-2xl outline-none transition-all font-medium text-base shadow-inner"
              />
            </div>

            <div className="flex justify-end gap-3 pt-10 sticky bottom-0 bg-background/80 backdrop-blur-sm">
              <Button type="button" variant="outline" className="rounded-xl px-8 font-black border-2" onClick={() => setShowModal(false)}>
                CANCELAR
              </Button>
              <Button type="submit" className="rounded-xl px-12 font-black shadow-lg shadow-primary/20">
                {editingPosition ? 'ACTUALIZAR DATOS' : 'CREAR CARGO'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Positions;