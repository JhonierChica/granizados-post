import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import EmployeeForm from '../../components/common/EmployeeForm';
import { EmployeeIcon, EditIcon, DeleteIcon, ToggleIcon, UserCircleIcon, BriefcaseIcon, PhoneIcon, WalletIcon } from '../../components/common/Icons';
import { employeeService } from '../../services/employeeService';
import { positionService } from '../../services/positionService';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import type { Employee, Position } from '../../types';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    loadEmployees();
    loadPositions();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAllEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('Error al cargar empleados:', err);
      setError('Error al cargar la lista de empleados');
    } finally {
      setLoading(false);
    }
  };

  const loadPositions = async () => {
    try {
      const data = await positionService.getActive();
      setPositions(data);
    } catch (err) {
      console.error('Error al cargar cargos:', err);
      setError('Error al cargar los cargos. Asegúrese de crear cargos primero.');
    }
  };

  const handleAdd = () => {
    if (positions.length === 0) {
      setError('Debe crear al menos un cargo antes de agregar empleados');
      return;
    }
    setError('');
    setSuccess('');
    setFormError('');
    setEditingEmployee(null);
    setShowForm(true);
  };

  const handleFormComplete = async (formData: any) => {
    try {
      setLoading(true);
      setFormError('');
      
      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee.id, formData);
        setSuccess('✅ Empleado actualizado exitosamente');
      } else {
        await employeeService.createEmployee(formData);
        setSuccess('✅ Empleado creado exitosamente');
      }
      
      setShowForm(false);
      setFormError('');
      setEditingEmployee(null);
      await loadEmployees();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      console.error('❌ Error completo:', err);
      const action = editingEmployee ? 'actualizar' : 'crear';
      let errorMessage = `Error al ${action} empleado`;
      if (err.response?.data?.fieldErrors) {
        const fieldErrors = err.response.data.fieldErrors;
        const errorList = Object.entries(fieldErrors)
          .map(([field, msg]) => `• ${field}: ${msg}`)
          .join('\n');
        errorMessage = `Errores de validación:\n${errorList}`;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setFormError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormError('');
    setShowForm(true);
  };

  const handleToggleStatus = async (employeeId: number, currentStatus: boolean) => {
    const action = currentStatus ? 'desactivar' : 'activar';
    if (window.confirm(`¿Está seguro de ${action} este empleado?`)) {
      try {
        await employeeService.updateEmployee(employeeId, { active: !currentStatus });
        setSuccess(`Empleado ${action === 'desactivar' ? 'desactivado' : 'activado'} exitosamente`);
        loadEmployees();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error(`Error al ${action} empleado:`, err);
        setError(`Error al ${action} empleado`);
      }
    }
  };

  const handleDelete = async (employee: Employee) => {
    const fullName = employee.fullName || `${employee.firstName} ${employee.lastName}`;
    if (window.confirm(`¿Está seguro de eliminar a ${fullName}? Esta acción también eliminará su usuario.`)) {
      try {
        await employeeService.deleteEmployee(employee.id);
        setSuccess('Empleado eliminado exitosamente');
        loadEmployees();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error('Error al eliminar empleado:', err);
        setError('Error al eliminar empleado');
      }
    }
  };

  if (loading && employees.length === 0) {
    return <Loading type="card" message="Cargando empleados..." />;
  }

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        <PageHeader
          title="Nómina de Empleados"
          subtitle="Administra el talento humano de La Bombonera."
          icon={<EmployeeIcon size={22} />}
          iconColor="text-primary bg-primary/10"
          action={
            <Button onClick={handleAdd} size="lg" className="rounded-xl sm:rounded-2xl font-black h-11 sm:h-14 px-6 sm:px-8 shadow-lg shadow-primary/20 w-full sm:w-auto">
              + NUEVO EMPLEADO
            </Button>
          }
        />

        {error && (
          <div className="bg-destructive/10 border-2 border-destructive/20 p-4 rounded-2xl text-destructive font-bold text-sm flex items-center gap-3">
            <span className="text-lg">⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border-2 border-green-200 p-4 rounded-2xl text-green-700 font-bold text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <span>{success}</span>
          </div>
        )}

        {positions.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-amber-50 rounded-3xl sm:rounded-4xl border-2 border-dashed border-amber-200">
            <div className="mb-4 text-amber-500">
              <BriefcaseIcon size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg sm:text-xl font-black uppercase text-amber-800 mb-2">Configuración Requerida</h3>
            <p className="text-amber-700/70 font-medium max-w-sm mx-auto text-sm">Debes crear al menos un cargo antes de registrar empleados.</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-muted/20 rounded-3xl sm:rounded-4xl border-2 border-dashed border-muted">
            <EmployeeIcon size={48} className="mx-auto mb-4 opacity-20" />
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight mb-2">Sin empleados</h3>
            <p className="text-muted-foreground font-medium mb-8 text-sm">No hay registros de personal en el sistema.</p>
            <Button onClick={handleAdd} variant="primary" className="rounded-2xl px-10">Crear Primer Empleado</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-2">
            {employees.map((employee) => {
              const fullName = employee.fullName || `${employee.firstName} ${employee.lastName}`;
              const isActive = !!(employee.active || employee.status);
              return (
                <Card 
                  key={employee.id}
                  className="group"
                  title={
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3 font-black">
                        <div className={`p-2 rounded-xl ${isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <UserCircleIcon size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-lg leading-tight uppercase line-clamp-1">{fullName}</span>
                          <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
                            {employee.documentNumber || employee.document || 'SIN DOC'}
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                  actions={
                    <div className="flex gap-2">
                      <button 
                         className="p-2 hover:bg-primary/10 rounded-xl transition-all text-primary"
                        onClick={() => handleEdit(employee)}
                        title="Editar"
                      >
                        <EditIcon size={18} />
                      </button>
                      <button 
                        className={`p-2 rounded-xl transition-all ${isActive ? 'hover:bg-amber-100 text-amber-600' : 'hover:bg-green-100 text-green-600'}`}
                        onClick={() => handleToggleStatus(employee.id, isActive)}
                        title={isActive ? 'Desactivar' : 'Activar'}
                      >
                        <ToggleIcon size={18} />
                      </button>
                      <button 
                        className="p-2 hover:bg-destructive/10 rounded-xl transition-all text-destructive"
                        onClick={() => handleDelete(employee)}
                        title="Eliminar"
                      >
                        <DeleteIcon size={18} />
                      </button>
                    </div>
                  }
                >
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Cargo</span>
                        <div className="flex items-center gap-1.5 font-bold text-xs uppercase text-foreground">
                          <BriefcaseIcon size={12} className="text-secondary" />
                          {employee.position?.name || 'N/A'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Estado</span>
                        <Badge variant={isActive ? 'default' : 'destructive'} className="rounded-lg font-black text-[9px] px-2 h-5">
                          {isActive ? 'ACTIVO' : 'INACTIVO'}
                        </Badge>
                      </div>
                    </div>

                    <Separator className="bg-muted/50" />

                    <div className="space-y-3">
                      {(employee.phone || employee.email) && (
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <PhoneIcon size={14} className="opacity-50" />
                          <span className="line-clamp-1">{employee.phone || employee.email}</span>
                        </div>
                      )}
                      
                      {employee.salary && (
                        <div className="flex items-center justify-between bg-muted/30 p-3 rounded-xl border border-muted/50">
                          <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            <WalletIcon size={14} className="text-primary" />
                            Salario
                          </div>
                          <span className="font-black text-sm text-primary">
                            ${employee.salary.toLocaleString('es-CO')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                       <span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase opacity-30">ID Empleado: #{employee.id}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingEmployee(null);
            setFormError('');
          }}
          title={editingEmployee ? 'MODIFICAR EMPLEADO' : 'NUEVO EMPLEADO'}
          size="extra-large"
          showActions={false}
        >
          <div className="max-h-[75vh] overflow-y-auto px-1">
            <EmployeeForm
              onComplete={handleFormComplete}
              onCancel={() => {
                setShowForm(false);
                setEditingEmployee(null);
                setFormError('');
              }}
              positions={positions}
              serverError={formError}
              initialData={editingEmployee}
            />
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Employees;