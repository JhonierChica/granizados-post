import React, { useState, ChangeEvent, FormEvent } from 'react';
import type { Position } from '../../types';
import Input from './Input';
import Button from './Button';
import { Separator } from '../ui/separator';
import { UserIcon, MailIcon, CreditCardIcon, BriefcaseIcon, PhoneIcon, MapPinIcon } from './Icons';

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  documentNumber: string;
  phone: string;
  address: string;
  positionId: string | number;
}

interface EmployeeFormProps {
  onComplete: (data: any) => void;
  onCancel: () => void;
  positions: Position[];
  serverError?: string | null;
  initialData?: any;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ 
  onComplete, 
  onCancel, 
  positions, 
  serverError, 
  initialData 
}) => {
  const [formData, setFormData] = useState<EmployeeFormData>(() => {
    if (initialData) {
      return {
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        documentNumber: initialData.documentNumber || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        positionId: initialData.position?.id || '',
      };
    }
    return {
      firstName: '',
      lastName: '',
      email: '',
      documentNumber: '',
      phone: '',
      address: '',
      positionId: '',
    };
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name as keyof EmployeeFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'Campo obligatorio';
    if (!formData.lastName.trim()) newErrors.lastName = 'Campo obligatorio';
    if (!formData.email.trim()) {
      newErrors.email = 'Campo obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email no válido';
    }
    if (!formData.positionId) newErrors.positionId = 'Debe seleccionar un cargo';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const dataToSubmit = {
      ...formData,
      positionId: typeof formData.positionId === 'string' ? parseInt(formData.positionId) : formData.positionId,
    };
    
    onComplete(dataToSubmit);
  };

  const selectedPosition = positions.find(p => p.id === (typeof formData.positionId === 'string' ? parseInt(formData.positionId) : formData.positionId));

  return (
    <form onSubmit={handleSubmit} className="space-y-10 py-4 animate-in fade-in duration-500">
      {serverError && (
        <div className="bg-destructive/10 border-2 border-destructive/20 p-5 rounded-2xl text-destructive font-black text-xs flex items-center gap-4">
          <div className="bg-destructive text-white p-1 rounded-full">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </div>
          <span className="whitespace-pre-line uppercase tracking-wider">{serverError}</span>
        </div>
      )}
      
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <UserIcon size={18} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Información Personal</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Nombres *"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Ej: Juan Carlos"
            className="h-14 font-bold"
            error={errors.firstName}
          />
          <Input
            label="Apellidos *"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Ej: Pérez García"
            className="h-14 font-bold"
            error={errors.lastName}
          />
          <Input
            label="Email Institucional *"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="juan.perez@laterraza.com"
            className="h-14 font-bold"
            error={errors.email}
          />
          <Input
            label="Número de Documento"
            name="documentNumber"
            value={formData.documentNumber}
            onChange={handleChange}
            placeholder="Ej: 1067..."
            className="h-14 font-bold"
          />
          <Input
            label="Teléfono de Contacto"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="310..."
            className="h-14 font-bold"
          />
          <Input
            label="Dirección de Residencia"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Barrio El Sinú..."
            className="h-14 font-bold"
          />
        </div>
      </div>

      <Separator className="bg-muted/50" />

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
            <BriefcaseIcon size={18} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Información Laboral</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-1">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">
              Asignar Cargo <span className="text-destructive">*</span>
            </label>
            <select
              name="positionId"
              value={formData.positionId}
              onChange={handleChange}
              className={`w-full h-14 px-6 bg-muted/50 border-2 rounded-2xl outline-none transition-all font-bold text-base appearance-none shadow-inner
                ${errors.positionId ? 'border-destructive/50 focus:border-destructive' : 'border-transparent focus:border-primary focus:bg-background'}
              `}
              required
            >
              <option value="">Seleccione cargo...</option>
              {positions.map(position => (
                <option key={position.id} value={position.id}>
                  {position.name} — {position.department}
                </option>
              ))}
            </select>
            {errors.positionId && <p className="text-[10px] text-destructive font-black uppercase mt-1 ml-1">{errors.positionId}</p>}
          </div>

          <div className="flex flex-col gap-6 lg:col-span-1">
            {selectedPosition ? (
              <div className="grid grid-cols-2 gap-4 animate-in zoom-in duration-300">
                <div className="bg-muted/30 p-4 rounded-2xl border border-muted-foreground/10 space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Sueldo Base</span>
                  <p className="font-black text-primary text-sm">${selectedPosition.baseSalary?.toLocaleString('es-CO') || '0'}</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-2xl border border-muted-foreground/10 space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Área</span>
                  <p className="font-black text-foreground text-[11px] uppercase truncate">{selectedPosition.department}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-6 border-2 border-dashed border-muted rounded-2xl text-muted-foreground/40 italic text-xs font-medium h-18">
                Seleccione un cargo para ver detalles
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-10 sticky bottom-0 bg-background/90 backdrop-blur-sm py-4 mt-auto border-t">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-2xl px-10 h-14 font-black tracking-widest border-2">
          CANCELAR
        </Button>
        <Button type="submit" variant="primary" className="rounded-2xl px-14 h-14 font-black tracking-widest shadow-xl shadow-primary/20">
          {initialData ? 'ACTUALIZAR REGISTRO' : 'CREAR EMPLEADO'}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;