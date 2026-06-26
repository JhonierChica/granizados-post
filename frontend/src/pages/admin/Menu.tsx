import React, { useState, useEffect, ChangeEvent } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { MenuIcon, EditIcon, DeleteIcon, ToggleIcon, UtensilsIcon, TagIcon, WalletIcon, InfoIcon, AlignLeftIcon } from '../../components/common/Icons';
import { menuService } from '../../services/menuService';
import { categoryService } from '../../services/categoryService';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import type { MenuItem, Category } from '../../types';

interface MenuFormData {
  name: string;
  description: string;
  price: string | number;
  categoryId: string | number;
  available: boolean;
}

const Menu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuFormData>({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    available: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [menuData, categoriesData] = await Promise.all([
        menuService.getAllMenuItems(),
        categoryService.getAllCategories(),
      ]);
      setMenuItems(menuData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      categoryId: categories[0]?.id || '',
      available: true,
    });
    setShowModal(true);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      categoryId: item.categoryId || '',
      available: item.available,
    });
    setShowModal(true);
  };

  const handleDelete = async (item: MenuItem) => {
    if (window.confirm(`¿Está seguro de eliminar ${item.name}?`)) {
      try {
        await menuService.deleteMenuItem(item.id);
        loadData();
      } catch (err) {
        console.error('Error al eliminar ítem:', err);
      }
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const action = item.available ? 'desactivar' : 'activar';
    if (window.confirm(`¿Está seguro de ${action} ${item.name}?`)) {
      try {
        await menuService.updateMenuItem(item.id, { ...item, available: !item.available });
        loadData();
      } catch (err) {
        console.error(`Error al ${action} ítem:`, err);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const dataToSave = {
        ...formData,
        price: Number(formData.price),
        categoryId: Number(formData.categoryId)
      };

      if (editingItem) {
        await menuService.updateMenuItem(editingItem.id, dataToSave as Partial<MenuItem>);
      } else {
        await menuService.createMenuItem(dataToSave as Partial<MenuItem>);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Error al guardar ítem:', err);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setFormData({
      ...formData,
      [target.name]: value,
    });
  };

  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return 'SIN CATEGORÍA';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name.toUpperCase() : 'DESCONOCIDA';
  };

  if (loading) return <Loading type="card" message="Cargando catálogo gastronómico..." />;

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        <PageHeader
          title="Carta y Menú"
          subtitle="Gestiona el menú de granizados y bebidas de La Bombonera."
          icon={<UtensilsIcon size={22} />}
          iconColor="text-primary bg-primary/10"
          action={
            <Button onClick={handleAdd} size="lg" className="rounded-xl sm:rounded-2xl font-black h-11 sm:h-14 px-6 sm:px-8 shadow-lg shadow-primary/20 uppercase tracking-widest w-full sm:w-auto">
              + AGREGAR PLATILLO
            </Button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-2">
          {menuItems.map((item) => (
            <Card 
              key={item.id}
              className="group overflow-hidden border-t-4 border-t-secondary/20 hover:border-t-secondary transition-all"
              title={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3 font-black">
                    <div className={`p-2 rounded-xl ${item.available ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      <UtensilsIcon size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg leading-tight uppercase line-clamp-1">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground tracking-widest">{getCategoryName(item.categoryId)}</span>
                    </div>
                  </div>
                </div>
              }
              actions={
                <div className="flex gap-2">
                  <button
                    className="p-2 hover:bg-primary/10 rounded-xl transition-all text-primary"
                    onClick={() => handleEdit(item)}
                    title="Editar"
                  >
                    <EditIcon size={18} />
                  </button>
                  <button
                    className={`p-2 rounded-xl transition-all ${item.available ? 'hover:bg-amber-100 text-amber-600' : 'hover:bg-green-100 text-green-600'}`}
                    onClick={() => handleToggleAvailability(item)}
                    title={item.available ? 'No disponible' : 'Disponible'}
                  >
                    <ToggleIcon size={18} />
                  </button>
                  <button
                    className="p-2 hover:bg-destructive/10 rounded-xl transition-all text-destructive"
                    onClick={() => handleDelete(item)}
                    title="Eliminar"
                  >
                    <DeleteIcon size={18} />
                  </button>
                </div>
              }
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-secondary/5 border border-secondary/10 p-4 rounded-2xl">
                   <div className="flex items-center gap-2 text-xs font-black text-secondary uppercase tracking-widest">
                     <WalletIcon size={16} />
                     Precio
                   </div>
                   <span className="text-2xl font-black text-secondary tracking-tighter">
                     ${(Number(item.price) || 0).toLocaleString('es-CO')}
                   </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <InfoIcon size={14} className="text-muted-foreground" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ingredientes / Notas</span>
                  </div>
                  <p className="text-xs text-foreground/70 font-medium leading-relaxed italic line-clamp-2 px-1">
                    {item.description || 'Sin descripción detallada del platillo.'}
                  </p>
                </div>

                <Separator className="bg-muted/50" />

                <div className="flex items-center justify-between">
                  <Badge variant={item.available ? 'default' : 'destructive'} className="rounded-lg font-black text-[10px] px-3 py-1">
                    {item.available ? 'DISPONIBLE' : 'AGOTADO'}
                  </Badge>
                  <span className="text-[10px] font-black text-muted-foreground tracking-widest opacity-30">ID: #{item.id}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {menuItems.length === 0 && (
          <div className="text-center py-24 bg-muted/20 rounded-6xl border-2 border-dashed border-muted shadow-inner">
            <MenuIcon size={80} className="mx-auto mb-6 opacity-10" />
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-muted-foreground">Menú no configurado</h3>
            <p className="text-muted-foreground font-medium mb-10 max-w-sm mx-auto">Aún no se han añadido productos a la carta. Inicia agregando tus mejores platillos.</p>
            <Button onClick={handleAdd} variant="primary" className="rounded-2xl px-12 h-14 font-black tracking-widest shadow-xl shadow-primary/20 text-white">AGREGAR ÍTEM</Button>
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingItem ? 'MODIFICAR ÍTEM DEL MENÚ' : 'NUEVO ÍTEM GASTRONÓMICO'}
          onConfirm={handleSubmit}
          size="large"
          confirmText={editingItem ? 'ACTUALIZAR' : 'GUARDAR'}
        >
          <div className="space-y-8 py-6 max-h-[70vh] overflow-y-auto px-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input
                label="Nombre del Platillo *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej. Hamburguesa Especial..."
                className="h-16 font-black text-xl px-6 rounded-2xl border-2 focus:border-primary transition-all"
                required
              />
              <Input
                label="Precio de Venta ($) *"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                className="h-16 font-black text-xl px-6 rounded-2xl border-2 focus:border-primary transition-all text-secondary"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                <AlignLeftIcon size={14} /> Descripción e Ingredientes
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e: any) => handleChange(e)}
                placeholder="Breve detalle de lo que incluye el platillo..."
                className="w-full min-h-25 p-6 bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-background rounded-2xl outline-none transition-all font-medium text-base shadow-inner resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <TagIcon size={14} /> Categoría *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full h-14 px-6 bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-background rounded-2xl outline-none transition-all font-bold text-sm appearance-none shadow-inner"
                  required
                >
                  <option value="">Seleccione categoría...</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex h-14 items-center px-6 bg-muted/30 rounded-2xl border-2 border-transparent hover:border-muted/50 transition-all">
                <label className="flex items-center gap-4 cursor-pointer select-none w-full">
                  <input
                    type="checkbox"
                    name="available"
                    checked={formData.available}
                    onChange={handleChange}
                    className="w-6 h-6 rounded-lg border-2 border-muted text-primary focus:ring-primary transition-all cursor-pointer"
                  />
                  <span className="text-xs font-black text-foreground uppercase tracking-widest">Disponible para venta</span>
                </label>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Menu;
