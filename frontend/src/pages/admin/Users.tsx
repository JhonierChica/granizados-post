import React, { useState, useEffect, ChangeEvent } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { UsersIcon, EditIcon, DeleteIcon, ToggleIcon, ShieldIcon, UserCircleIcon, CalendarIcon } from '../../components/common/Icons';
import { userService } from '../../services/userService';
import { profileService } from '../../services/profileService';
import { employeeService } from '../../services/employeeService';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import type { User, Profile, Employee } from '../../types';

interface UserFormData {
  username: string;
  fullName: string;
  password?: string;
  profileId: string;
  employeeId: string;
  active?: boolean;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    fullName: '',
    password: '',
    profileId: '',
    employeeId: '',
  });

  useEffect(() => {
    loadUsers();
    loadProfiles();
    loadAvailableEmployees();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      const data = await profileService.getActive();
      setProfiles(data);
    } catch (err) {
      console.error('Error al cargar perfiles:', err);
    }
  };

  const loadAvailableEmployees = async () => {
    try {
      const data = await employeeService.getEmployeesWithoutUser();
      setAvailableEmployees(data);
    } catch (err) {
      console.error('Error al cargar empleados:', err);
    }
  };

  const handleAdd = () => {
    if (profiles.length === 0) {
      alert('Debe crear perfiles primero en /admin/profiles');
      return;
    }
    if (availableEmployees.length === 0) {
      alert('No hay empleados disponibles sin usuario. Cree empleados primero en /admin/employees');
      return;
    }
    setEditingUser(null);
    setFormData({
      username: '',
      fullName: '',
      password: '',
      profileId: profiles[0]?.id.toString() || '',
      employeeId: '',
    });
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName || '',
      password: '',
      profileId: user.profile?.id.toString() || '',
      employeeId: '',
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    const action = currentStatus ? 'desactivar' : 'activar';
    if (window.confirm(`¿Está seguro de ${action} este usuario?`)) {
      try {
        await userService.updateUser(userId, { active: !currentStatus });
        loadUsers();
      } catch (err) {
        console.error(`Error al ${action} usuario:`, err);
      }
    }
  };

  const handleDelete = async (user: User) => {
    if (window.confirm(`¿Está seguro de eliminar al usuario ${user.username}?`)) {
      try {
        await userService.deleteUser(user.id);
        loadUsers();
      } catch (err) {
        console.error('Error al eliminar usuario:', err);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.username?.trim()) { alert('El nombre de usuario es obligatorio'); return; }
      if (!formData.profileId) { alert('Debe seleccionar un perfil'); return; }
      if (!editingUser) {
        if (!formData.password?.trim()) { alert('La contraseña es obligatoria'); return; }
        if (!formData.employeeId) { alert('Debe seleccionar un empleado'); return; }
      }

      const dataToSubmit: any = {
        username: formData.username.trim(),
        fullName: formData.fullName ? formData.fullName.trim() : '',
        profileId: parseInt(formData.profileId),
      };

      if (formData.password?.trim()) {
        dataToSubmit.password = formData.password.trim();
      }
      
      if (!editingUser) {
        dataToSubmit.employeeId = parseInt(formData.employeeId);
        dataToSubmit.active = true;
      }

      if (editingUser) {
        await userService.updateUser(editingUser.id, dataToSubmit);
      } else {
        await userService.createUser(dataToSubmit);
      }
      setShowModal(false);
      loadUsers();
      loadAvailableEmployees();
    } catch (err: any) {
      console.error('Error al guardar usuario:', err);
      alert(err.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'employeeId' && value) {
      const selectedEmployee = availableEmployees.find(emp => emp.id === parseInt(value));
      if (selectedEmployee) {
        const fullName = selectedEmployee.fullName || `${selectedEmployee.firstName} ${selectedEmployee.lastName}`;
        setFormData({
          ...formData,
          employeeId: value,
          fullName: fullName,
          username: selectedEmployee.email ? selectedEmployee.email.split('@')[0] : '',
        });
        return;
      }
    }
    
    setFormData({ ...formData, [name]: value });
  };

  if (loading) return <Loading type="card" message="Cargando usuarios..." />;

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        <PageHeader
          title="Control de Usuarios"
          subtitle="Gestiona las credenciales y el acceso del personal."
          icon={<UsersIcon size={22} />}
          iconColor="text-primary bg-primary/10"
          action={
            <Button onClick={handleAdd} size="lg" className="rounded-xl sm:rounded-2xl font-black h-11 sm:h-14 px-6 sm:px-8 shadow-lg shadow-primary/20 w-full sm:w-auto">
              + NUEVO USUARIO
            </Button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-2">
          {users.map((user) => {
            const isActive = !!user.active;
            return (
              <Card 
                key={user.id}
                className="group"
                title={
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 font-black">
                      <div className={`p-2 rounded-xl ${isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <UserCircleIcon size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg leading-tight uppercase">{user.username}</span>
                        <span className="text-[10px] text-muted-foreground tracking-widest">{user.fullName || 'SIN NOMBRE ASIGNADO'}</span>
                      </div>
                    </div>
                  </div>
                }
                actions={
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      className="p-2 hover:bg-primary/10 rounded-xl transition-all text-primary"
                      onClick={() => handleEdit(user)}
                      title="Editar"
                    >
                      <EditIcon size={18} />
                    </button>
                    <button 
                      className={`p-2 rounded-xl transition-all ${isActive ? 'hover:bg-amber-100 text-amber-600' : 'hover:bg-green-100 text-green-600'}`}
                      onClick={() => handleToggleStatus(user.id, isActive)}
                      title={isActive ? 'Desactivar' : 'Activar'}
                    >
                      <ToggleIcon size={18} />
                    </button>
                    <button 
                      className="p-2 hover:bg-destructive/10 rounded-xl transition-all text-destructive"
                      onClick={() => handleDelete(user)}
                      title="Eliminar"
                    >
                      <DeleteIcon size={18} />
                    </button>
                  </div>
                }
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Perfil de Seguridad</span>
                      <div className="flex items-center gap-2">
                        <ShieldIcon size={14} className="text-secondary" />
                        <span className="font-black text-sm text-foreground uppercase">{user.profile?.name || 'SIN PERFIL'}</span>
                      </div>
                    </div>
                    <Badge variant={isActive ? 'default' : 'destructive'} className="rounded-lg font-black text-[10px] px-3">
                      {isActive ? 'ACTIVO' : 'INACTIVO'}
                    </Badge>
                  </div>

                  <Separator className="bg-muted/50" />

                  <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5 bg-muted/30 px-3 py-1.5 rounded-lg border border-muted/50">
                      <CalendarIcon size={14} />
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                    </div>
                    <div className="font-black text-[10px] uppercase tracking-tighter">ID: #{user.id}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {users.length === 0 && (
          <div className="text-center py-20 bg-muted/20 rounded-4xl border-2 border-dashed border-muted">
            <UsersIcon size={64} className="mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">Sin usuarios</h3>
            <p className="text-muted-foreground font-medium mb-8">No hay registros de usuarios en el sistema.</p>
            <Button onClick={handleAdd} variant="primary" className="rounded-2xl px-10">Crear Primer Usuario</Button>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingUser ? 'MODIFICAR USUARIO' : 'NUEVO USUARIO'}
          onConfirm={handleSubmit}
          size="medium"
          confirmText={editingUser ? 'ACTUALIZAR' : 'GUARDAR'}
        >
          <div className="space-y-8 py-4">
            {!editingUser && (
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">
                  Vincular Empleado <span className="text-destructive">*</span>
                </label>
                <select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="w-full h-14 px-6 bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-background rounded-2xl outline-none transition-all font-bold text-base appearance-none shadow-inner"
                  required
                >
                  <option value="">Seleccione un empleado...</option>
                  {availableEmployees.map(employee => {
                     const fullName = employee.fullName || `${employee.firstName} ${employee.lastName}`;
                     return (
                        <option key={employee.id} value={employee.id}>
                           {fullName}
                        </option>
                     );
                  })}
                </select>
                <p className="text-[10px] text-muted-foreground/60 font-medium italic ml-1">Solo se muestran empleados que no poseen un usuario asignado aún.</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Username" name="username" value={formData.username} onChange={handleChange} required className="h-14 font-bold" />
              <Input label="Nombre Completo" name="fullName" value={formData.fullName} onChange={handleChange} disabled={!editingUser && !!formData.employeeId} required className="h-14 font-bold bg-muted/20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Password" type="password" name="password" value={formData.password || ''} onChange={handleChange} placeholder={editingUser ? '••••••••' : ''} required={!editingUser} className="h-14 font-bold" />
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">
                  Perfil de Seguridad <span className="text-destructive">*</span>
                </label>
                <select
                  name="profileId"
                  value={formData.profileId}
                  onChange={handleChange}
                  className="w-full h-14 px-6 bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-background rounded-2xl outline-none transition-all font-bold text-base appearance-none shadow-inner"
                  required
                >
                  <option value="">Seleccione perfil...</option>
                  {profiles.map(profile => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name} {profile.code ? `(${profile.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Users;