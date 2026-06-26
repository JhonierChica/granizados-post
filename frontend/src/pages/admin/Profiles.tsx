import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { ProfileIcon, EditIcon, ToggleIcon, DeleteIcon, ShieldIcon, BriefcaseIcon } from '../../components/common/Icons';
import { profileService } from '../../services/profileService';
import { permissionService } from '../../services/permissionService';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import type { Profile, Permission } from '../../types';

interface ConfirmDialogState {
  isOpen: boolean;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  onConfirm: (() => void) | null;
}

interface ProfileFormData {
  name: string;
  permissionIds: number[];
}

const Profiles: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    permissionIds: [],
  });
  const [error, setError] = useState('');
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    onConfirm: null
  });

  useEffect(() => {
    loadProfiles();
    loadPermissions();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await profileService.getAll();
      setProfiles(data);
    } catch (err) {
      setError('Error al cargar los perfiles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const data = await permissionService.getActive();
      setPermissions(data);
      
      const grouped = data.reduce((acc: Record<string, Permission[]>, permission: Permission) => {
        const moduleName = permission.module || 'OTROS';
        if (!acc[moduleName]) {
          acc[moduleName] = [];
        }
        acc[moduleName].push(permission);
        return acc;
      }, {});
      setGroupedPermissions(grouped);
    } catch (err) {
      console.error('Error al cargar permisos:', err);
    }
  };

  const handleCreate = () => {
    setEditingProfile(null);
    setFormData({
      name: '',
      permissionIds: [],
    });
    setError('');
    setShowModal(true);
  };

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      permissionIds: profile.permissions?.map((p: Permission) => p.id) || [],
    });
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    setConfirmDialog({
      isOpen: true,
      type: 'danger',
      title: '¿Eliminar Perfil?',
      message: 'Esta acción eliminará permanentemente el perfil y no se puede deshacer. ¿Desea continuar?',
      onConfirm: async () => {
        try {
          await profileService.delete(id);
          loadProfiles();
        } catch (err) {
          setError('Error al eliminar el perfil');
          console.error(err);
        }
      }
    });
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const action = currentStatus ? 'desactivar' : 'activar';
    setConfirmDialog({
      isOpen: true,
      type: 'warning',
      title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} Perfil?`,
      message: `¿Está seguro de que desea ${action} este perfil?`,
      onConfirm: async () => {
        try {
          await profileService.toggleStatus(id);
          loadProfiles();
        } catch (err) {
          setError(`Error al ${action} el perfil`);
          console.error(err);
        }
      }
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingProfile) {
        await profileService.update(editingProfile.id, formData);
      } else {
        await profileService.create(formData);
      }
      setShowModal(false);
      loadProfiles();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar el perfil');
      console.error(err);
    }
  };

  const handlePermissionToggle = (permissionId: number) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter(id => id !== permissionId)
        : [...prev.permissionIds, permissionId]
    }));
  };

  const handleSelectAllModule = (module: string) => {
    const modulePermissionIds = groupedPermissions[module].map((p: Permission) => p.id);
    const allSelected = modulePermissionIds.every((id: number) => formData.permissionIds.includes(id));
    
    if (allSelected) {
      setFormData(prev => ({
        ...prev,
        permissionIds: prev.permissionIds.filter((id: number) => !modulePermissionIds.includes(id))
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissionIds: [...new Set([...prev.permissionIds, ...modulePermissionIds])]
      }));
    }
  };

  if (loading) return <Loading type="card" message="Cargando perfiles..." />;

  const filteredProfiles = profiles.filter((profile: Profile) => {
    if (filterStatus === 'active') return profile.active;
    if (filterStatus === 'inactive') return !profile.active;
    return true;
  });

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        <PageHeader
          title="Gestión de Perfiles"
          subtitle="Control de acceso y seguridad del sistema."
          icon={<ShieldIcon size={22} />}
          iconColor="text-primary bg-primary/10"
          action={
            <Button onClick={handleCreate} size="lg" className="rounded-xl sm:rounded-2xl font-black h-11 sm:h-14 px-6 sm:px-8 shadow-lg shadow-primary/20 w-full sm:w-auto">
              + NUEVO PERFIL
            </Button>
          }
        />

        {error && (
          <div className="bg-destructive/10 border-2 border-destructive/20 p-4 rounded-2xl text-destructive font-bold text-sm flex items-center gap-3">
            <span className="text-lg">⚠️</span> {error}
          </div>
        )}

        <div className="flex gap-1 sm:gap-2 p-1 bg-muted rounded-xl sm:rounded-2xl overflow-x-auto no-scrollbar">
          <button
            className={`px-4 sm:px-6 py-2 rounded-lg sm:rounded-xl text-xs font-black transition-all whitespace-nowrap ${filterStatus === 'all' ? 'bg-background shadow-md' : 'text-muted-foreground hover:bg-background/50'}`}
            onClick={() => setFilterStatus('all')}
          >
            TODOS ({profiles.length})
          </button>
          <button
            className={`px-4 sm:px-6 py-2 rounded-lg sm:rounded-xl text-xs font-black transition-all whitespace-nowrap ${filterStatus === 'active' ? 'bg-background shadow-md text-primary' : 'text-muted-foreground hover:bg-background/50'}`}
            onClick={() => setFilterStatus('active')}
          >
            ACTIVOS ({profiles.filter((p: Profile) => p.active).length})
          </button>
          <button
            className={`px-4 sm:px-6 py-2 rounded-lg sm:rounded-xl text-xs font-black transition-all whitespace-nowrap ${filterStatus === 'inactive' ? 'bg-background shadow-md text-destructive' : 'text-muted-foreground hover:bg-background/50'}`}
            onClick={() => setFilterStatus('inactive')}
          >
            INACTIVOS ({profiles.filter((p: Profile) => !p.active).length})
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProfiles.map((profile) => (
            <Card 
              key={profile.id}
              className="group"
              title={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3 font-black">
                    <div className={`p-2 rounded-xl ${profile.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      <BriefcaseIcon size={20} />
                    </div>
                    {profile.name}
                  </div>
                  <Badge variant={profile.active ? 'default' : 'destructive'} className="rounded-lg px-3 py-1 font-black text-[10px] uppercase">
                    {profile.active ? 'ACTIVO' : 'INACTIVO'}
                  </Badge>
                </div>
              }
              actions={
                <div className="flex gap-2">
                  <button 
                    className="p-2 hover:bg-primary/10 rounded-xl transition-all text-primary"
                    onClick={() => handleEdit(profile)}
                    title="Editar"
                  >
                    <EditIcon size={18} />
                  </button>
                  <button 
                    className={`p-2 rounded-xl transition-all ${profile.active ? 'hover:bg-amber-100 text-amber-600' : 'hover:bg-green-100 text-green-600'}`}
                    onClick={() => handleToggleStatus(profile.id, !!profile.active)}
                    title={profile.active ? 'Desactivar' : 'Activar'}
                  >
                    <ToggleIcon size={18} />
                  </button>
                  <button 
                    className="p-2 hover:bg-destructive/10 rounded-xl transition-all text-destructive"
                    onClick={() => handleDelete(profile.id)}
                    title="Eliminar"
                  >
                    <DeleteIcon size={18} />
                  </button>
                </div>
              }
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-black text-muted-foreground uppercase tracking-widest">
                  <span>Permisos Asociados</span>
                  <span className="bg-muted px-2 py-1 rounded-md">{profile.permissions?.length || 0}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 min-h-14">
                  {profile.permissions?.slice(0, 4).map(permission => (
                    <Badge key={permission.id} variant="secondary" className="rounded-md font-bold text-[10px] bg-muted/50">
                      {permission.name}
                    </Badge>
                  ))}
                  {profile.permissions && profile.permissions.length > 4 && (
                    <Badge variant="secondary" className="rounded-md font-bold text-[10px]">
                      +{profile.permissions.length - 4} más
                    </Badge>
                  )}
                  {(!profile.permissions || profile.permissions.length === 0) && (
                    <p className="text-xs italic text-muted-foreground">Sin permisos asignados</p>
                  )}
                </div>

                <div className="pt-4 border-t border-dashed">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">ID Perfil: #{profile.id}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="text-center py-20 bg-muted/20 rounded-4xl border-2 border-dashed border-muted">
            <div className="mb-6 opacity-20">
              <ShieldIcon size={80} className="mx-auto" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">No se encontraron perfiles</h3>
            <p className="text-muted-foreground font-medium mb-8">Parece que no hay perfiles registrados en esta categoría.</p>
            {filterStatus === 'all' && (
              <Button onClick={handleCreate} size="lg" className="rounded-2xl px-10">Crear Primer Perfil</Button>
            )}
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingProfile ? 'MODIFICAR PERFIL' : 'NUEVO PERFIL'}
          size="extra-large"
          showActions={false}
        >
          <form onSubmit={handleSubmit} className="space-y-8 max-h-[70vh] overflow-y-auto px-1 pr-4">
            <div className="bg-primary/5 p-6 rounded-3xl border-2 border-primary/10 flex items-start gap-4">
              <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                <ShieldIcon size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-primary uppercase tracking-widest">Información de Seguridad</p>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  Defina un nombre corto y descriptivo (máx. 12 caracteres). <br/>
                  Ejemplo: <span className="font-bold text-foreground">MESERO, CAJERO, ADMIN</span>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
              <Input
                label="Nombre del Perfil *"
                name="name"
                value={formData.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value.toUpperCase();
                  if (value.length <= 12) {
                    setFormData({ ...formData, name: value });
                  }
                }}
                placeholder="EJ. ADMINISTRADOR"
                className="h-14 font-black transition-all"
                required
              />
              <div className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-6">
                Caracteres: <span className={formData.name.length === 12 ? 'text-destructive' : 'text-primary'}>{formData.name.length}</span>/12
              </div>
            </div>

            <Separator className="my-8" />

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black tracking-tight uppercase">Permisos del Sistema</h4>
                  <p className="text-xs text-muted-foreground font-medium">Asigne capacidades específicas a este perfil.</p>
                </div>
                <Badge className="rounded-md font-black">{formData.permissionIds.length} SELECCIONADOS</Badge>
              </div>
              
              <div className="space-y-8 pt-4">
                {Object.keys(groupedPermissions).map(module => (
                  <div key={module} className="bg-muted/30 p-6 rounded-4xl border border-muted/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        {module}
                      </h5>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        className="text-[10px] font-black uppercase tracking-widest hover:bg-background h-8 px-4 border border-muted/50 rounded-lg"
                        onClick={() => handleSelectAllModule(module)}
                      >
                        {groupedPermissions[module].every(p => formData.permissionIds.includes(p.id))
                          ? 'QUITAR TODOS'
                          : 'MARCAR TODOS'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {groupedPermissions[module].map(permission => (
                        <label 
                          key={permission.id} 
                          className={`flex items-start gap-4 p-4 rounded-2xl transition-all cursor-pointer border-2
                            ${formData.permissionIds.includes(permission.id) 
                              ? 'bg-background border-primary shadow-sm' 
                              : 'bg-muted/20 border-transparent hover:border-muted/50'}
                          `}
                        >
                          <div className="pt-1">
                            <input
                              type="checkbox"
                              className="w-5 h-5 rounded-md border-2 border-muted checked:bg-primary transition-all cursor-pointer"
                              checked={formData.permissionIds.includes(permission.id)}
                              onChange={() => handlePermissionToggle(permission.id)}
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-black uppercase tracking-tight">{permission.name}</p>
                            <p className="text-[10px] text-muted-foreground line-clamp-1 italic">{permission.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-8 pb-4 sticky bottom-0 bg-background/80 backdrop-blur-md mt-12">
              <Button type="button" variant="outline" className="rounded-xl px-8 font-black border-2" onClick={() => setShowModal(false)}>
                CANCELAR
              </Button>
              <Button type="submit" className="rounded-xl px-12 font-black shadow-lg shadow-primary/20">
                {editingProfile ? 'ACTUALIZAR' : 'GUARDAR' } PERFIL
              </Button>
            </div>
          </form>
        </Modal>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => confirmDialog.onConfirm && confirmDialog.onConfirm()}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText={confirmDialog.type === 'danger' ? 'ELIMINAR' : 'PROCEDER'}
        cancelText="DESCARTAR"
      />
    </Layout>
  );
};

export default Profiles;