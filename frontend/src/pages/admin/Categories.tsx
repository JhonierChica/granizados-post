import React, { useState, useEffect, ChangeEvent } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { CategoryIcon, EditIcon, DeleteIcon, ToggleIcon, LayersIcon, InfoIcon, CalendarIcon } from '../../components/common/Icons';
import { categoryService } from '../../services/categoryService';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import type { Category } from '../../types';

interface FormData {
  name: string;
  description: string;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      alert('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: (category as any).description || '',
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (categoryId: number, currentStatus: boolean) => {
    const action = currentStatus ? 'desactivar' : 'activar';
    if (window.confirm(`¿Está seguro de ${action} esta categoría?`)) {
      try {
        await categoryService.updateCategory(categoryId, { active: !currentStatus });
        loadCategories();
      } catch (error) {
        console.error(`Error al ${action} categoría:`, error);
        alert(`Error al ${action} categoría`);
      }
    }
  };

  const handleDelete = async (category: Category) => {
    if (window.confirm(`¿Está seguro de eliminar la categoría ${category.name}?`)) {
      try {
        await categoryService.deleteCategory(category.id);
        loadCategories();
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
        alert('Error al eliminar categoría');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      setShowModal(false);
      loadCategories();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      alert('Error al guardar categoría');
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) return <Loading type="card" message="Cargando categorías..." />;

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        <PageHeader
          title="Categorías"
          subtitle="Clasifica tus productos para una mejor organización."
          icon={<LayersIcon size={22} />}
          iconColor="text-primary bg-primary/10"
          action={
            <Button onClick={handleAdd} size="lg" className="w-full sm:w-auto">
              + NUEVA CATEGORIA
            </Button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-2">
          {categories.map((category) => {
            const isActive = category.status || category.active;
            return (
              <Card 
                key={category.id}
                className="group border-b-4 border-b-primary/20 hover:border-b-primary transition-all overflow-hidden"
                title={
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 font-black">
                      <div className={`p-2 rounded-xl ${isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <CategoryIcon size={20} />
                      </div>
                      <span className="text-lg uppercase tracking-tight">{category.name}</span>
                    </div>
                    <Badge variant={isActive ? 'default' : 'destructive'} className="rounded-lg font-black text-[10px] px-3">
                      {isActive ? 'ACTIVA' : 'INACTIVA'}
                    </Badge>
                  </div>
                }
                actions={
                  <div className="flex gap-2">
                    <button 
                      className="p-2 hover:bg-primary/10 rounded-xl transition-all text-primary"
                      onClick={() => handleEdit(category)}
                      title="Editar"
                    >
                      <EditIcon size={18} />
                    </button>
                    <button 
                      className={`p-2 rounded-xl transition-all ${isActive ? 'hover:bg-amber-500/10 text-amber-400 hover:text-amber-300' : 'hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300'}`}
                      onClick={() => handleToggleStatus(category.id, !!isActive)}
                      title={isActive ? 'Desactivar' : 'Activar'}
                    >
                      <ToggleIcon size={18} />
                    </button>
                    <button 
                      className="p-2 hover:bg-destructive/10 rounded-xl transition-all text-destructive"
                      onClick={() => handleDelete(category)}
                      title="Eliminar"
                    >
                      <DeleteIcon size={18} />
                    </button>
                  </div>
                }
              >
                <div className="space-y-6">
                  <div className="bg-muted/30 p-4 rounded-2xl min-h-20">
                    <div className="flex items-start gap-2 mb-1">
                      <InfoIcon size={14} className="text-primary mt-0.5" />
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Descripción</span>
                    </div>
                    <p className="text-xs text-foreground/80 font-medium leading-relaxed italic">
                      {(category as any).description || 'Sin descripción detallada.'}
                    </p>
                  </div>

                  <Separator className="bg-muted/50" />

                  <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5 bg-muted/30 px-3 py-1.5 rounded-lg">
                      <CalendarIcon size={14} />
                      {(category as any).createdAt ? new Date((category as any).createdAt).toLocaleDateString('es-ES') : 'N/A'}
                    </div>
                    <div className="font-black text-[10px] uppercase tracking-tighter opacity-40">ID: #{category.id}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-24 bg-muted/20 rounded-6xl border-2 border-dashed border-muted shadow-inner">
            <LayersIcon size={80} className="mx-auto mb-6 opacity-10" />
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-muted-foreground">El catálogo está vacío</h3>
            <p className="text-muted-foreground font-medium mb-10 max-w-sm mx-auto">Comienza creando tu primera categoría para organizar tu menú de forma profesional.</p>
            <Button onClick={handleAdd} variant="primary" size="lg">CREAR CATEGORIA</Button>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingCategory ? 'MODIFICAR CATEGORÍA' : 'NUEVA CATEGORÍA'}
          onConfirm={handleSubmit}
          size="medium"
          confirmText={editingCategory ? 'ACTUALIZAR' : 'GUARDAR'}
        >
          <div className="space-y-8 py-6">
            <div className="grid grid-cols-1 gap-8">
              <Input
                label="Nombre de Categoría"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej. Hamburguesas, Bebidas..."
                className="h-16 font-black text-xl px-6 rounded-2xl border-2 focus:border-primary transition-all"
                required
              />
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Descripcion Detallada</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e: any) => handleChange(e)}
                  placeholder="Detalles que ayuden a identificar los productos de esta categoria..."
                  className="w-full min-h-30 p-5 bg-muted/30 border border-border rounded-xl outline-none transition-all font-medium text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-ring focus:ring-2 focus:ring-ring/20 resize-none"
                  required
                />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Categories;