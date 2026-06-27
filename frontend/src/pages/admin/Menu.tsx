import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import BulkMenuEditorModal from '../../components/common/BulkMenuEditorModal';
import {
  MenuIcon, EditIcon, DeleteIcon, ToggleIcon,
  UtensilsIcon, WalletIcon, InfoIcon, TagIcon,
  PlusIcon,
} from '../../components/common/Icons';
import { menuService } from '../../services/menuService';
import { categoryService } from '../../services/categoryService';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import type { MenuItem, Category } from '../../types';

const Menu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Bulk editor state
  const [bulkCategory, setBulkCategory] = useState<Category | null>(null);
  const [showBulkEditor, setShowBulkEditor] = useState(false);

  // Category picker state (for "add new" flow)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

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

  // ── Helpers ──────────────────────────────

  // ── Handlers ─────────────────────────────

  const handleAddNew = () => {
    // Mostrar selector de categoría primero
    setShowCategoryPicker(true);
  };

  const handlePickCategory = (category: Category) => {
    setShowCategoryPicker(false);
    setBulkCategory(category);
    setShowBulkEditor(true);
  };

  const handleEditCategory = (category: Category) => {
    setBulkCategory(category);
    setShowBulkEditor(true);
  };

  const handleBulkSaved = () => {
    loadData();
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
        await menuService.updateMenuItem(item.id, {
          ...item,
          available: !item.available,
        });
        loadData();
      } catch (err) {
        console.error(`Error al ${action} ítem:`, err);
      }
    }
  };

  // ── Render ───────────────────────────────

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
            <Button
              onClick={handleAddNew}
              size="lg"
              className="w-full sm:w-auto flex items-center gap-2"
            >
              <PlusIcon size={20} /> AGREGAR PLATILLOS
            </Button>
          }
        />

        {/* ─── Grupos por categoría ─────────────── */}
        {categories.length === 0 && (
          <div className="text-center py-24 bg-muted/20 rounded-6xl border-2 border-dashed border-muted shadow-inner">
            <TagIcon size={80} className="mx-auto mb-6 opacity-10" />
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-muted-foreground">
              Sin categorías
            </h3>
            <p className="text-muted-foreground font-medium mb-10 max-w-sm mx-auto">
              Primero creá categorías desde la sección de Categorías para poder agregar platillos.
            </p>
          </div>
        )}

        {categories.map((category) => {
          const items = menuItems.filter((i) => i.categoryId === category.id);
          return (
            <section key={category.id} className="space-y-4">
              {/* Header de la categoria */}
              <div className="flex items-center justify-between bg-card border border-border/50 rounded-2xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-secondary/10 rounded-xl">
                    <TagIcon size={20} className="text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                      {category.name}
                    </h2>
                    <p className="text-[11px] font-bold text-muted-foreground tracking-widest">
                      {items.length} ítem{items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleEditCategory(category)}
                  variant="secondary"
                  size="xs"
                  className="flex items-center gap-1.5"
                >
                  <EditIcon size={15} /> EDITAR
                </Button>
              </div>

              {/* Items de la categoría */}
              {items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {items.map((item) => (
                    <Card
                      key={item.id}
                      className="group overflow-hidden border-t-4 border-t-secondary/20 hover:border-t-secondary transition-all"
                      title={
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3 font-black">
                            <div
                              className={`p-2 rounded-xl ${
                                item.available
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              <UtensilsIcon size={20} />
                            </div>
                            <span className="text-lg leading-tight uppercase line-clamp-1">
                              {item.name}
                            </span>
                          </div>
                        </div>
                      }
                      actions={
                        <div className="flex gap-2">
                          <button
                            className={`p-2 rounded-xl transition-all ${
                              item.available
                                ? 'hover:bg-amber-500/10 text-amber-400 hover:text-amber-300'
                                : 'hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300'
                            }`}
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
                        {/* Precio: si tiene presentaciones muestra el rango, si no el precio único */}
                        <div className="flex items-center justify-between bg-secondary/5 border border-secondary/10 p-4 rounded-2xl">
                          <div className="flex items-center gap-2 text-xs font-black text-secondary uppercase tracking-widest">
                            <WalletIcon size={16} />
                            {item.presentations && item.presentations.length > 0 ? 'Desde' : 'Precio'}
                          </div>
                          <span className="text-2xl font-black text-secondary tracking-tighter">
                            {item.presentations && item.presentations.length > 0
                              ? `$${Math.min(...item.presentations.map(p => p.price)).toLocaleString('es-CO')}`
                              : `$${(Number(item.price) || 0).toLocaleString('es-CO')}`
                            }
                          </span>
                        </div>

                        {/* Lista de presentaciones si tiene */}
                        {item.presentations && item.presentations.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <TagIcon size={14} className="text-muted-foreground" />
                              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tallas / Presentaciones</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {item.presentations.map((p) => (
                                <Badge
                                  key={p.id}
                                  variant={p.available ? 'outline' : 'destructive'}
                                  className="rounded-lg font-bold text-[9px] px-2 py-0.5"
                                >
                                  {p.name.toUpperCase()} — ${p.price.toLocaleString('es-CO')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <InfoIcon size={14} className="text-muted-foreground" />
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                              Ingredientes / Notas
                            </span>
                          </div>
                          <p className="text-xs text-foreground/70 font-medium leading-relaxed italic line-clamp-2 px-1">
                            {item.description || 'Sin descripción detallada del platillo.'}
                          </p>
                        </div>

                        <Separator className="bg-muted/50" />

                        <div className="flex items-center justify-between">
                          <Badge
                            variant={item.available ? 'default' : 'destructive'}
                            className="rounded-lg font-black text-[10px] px-3 py-1"
                          >
                            {item.available ? 'DISPONIBLE' : 'AGOTADO'}
                          </Badge>
                          <span className="text-[10px] font-black text-muted-foreground tracking-widest opacity-30">
                            ID: #{item.id}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-muted/10 rounded-3xl border-2 border-dashed border-muted/30">
                  <MenuIcon size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground font-bold text-sm mb-4">
                    Esta categoría no tiene platillos aún
                  </p>
                  <Button
                    onClick={() => handleEditCategory(category)}
                    variant="primary"
                    size="sm"
                  >
                    <PlusIcon size={16} /> AGREGAR ITEMS
                  </Button>
                </div>
              )}
            </section>
          );
        })}

        {menuItems.length === 0 && categories.length > 0 && (
          <div className="text-center py-24 bg-muted/20 rounded-6xl border-2 border-dashed border-muted shadow-inner">
            <MenuIcon size={80} className="mx-auto mb-6 opacity-10" />
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-muted-foreground">
              Menú no configurado
            </h3>
            <p className="text-muted-foreground font-medium mb-10 max-w-sm mx-auto">
              Aún no se han añadido productos a la carta. Elegí una categoría para empezar.
            </p>
            <Button
              onClick={handleAddNew}
              variant="primary"
              size="lg"
            >
              AGREGAR ITEMS
            </Button>
          </div>
        )}

        {/* ─── Category Picker Modal ─────────────── */}
        <Modal
          isOpen={showCategoryPicker}
          onClose={() => setShowCategoryPicker(false)}
          title="SELECCIONAR CATEGORÍA"
          showActions={false}
          size="medium"
        >
          <div className="space-y-3 py-4">
            <p className="text-sm font-medium text-muted-foreground mb-4">
              Elegí a qué categoría querés agregar los nuevos platillos:
            </p>
            {categories.map((category) => {
              const count = menuItems.filter((i) => i.categoryId === category.id).length;
              return (
                <button
                  key={category.id}
                  onClick={() => handlePickCategory(category)}
                  className="w-full flex items-center justify-between p-4 bg-muted/10 hover:bg-primary/10 border-2 border-muted/30 hover:border-primary/30 rounded-2xl transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-xl group-hover:bg-secondary/20 transition-all">
                      <TagIcon size={18} className="text-secondary" />
                    </div>
                    <span className="font-black uppercase tracking-wide">
                      {category.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">
                    {count} ítem{count !== 1 ? 's' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </Modal>

        {/* ─── Bulk Editor Modal ─────────────── */}
        {bulkCategory && (
          <BulkMenuEditorModal
            isOpen={showBulkEditor}
            onClose={() => setShowBulkEditor(false)}
            category={bulkCategory}
            existingItems={menuItems.filter(
              (i) => i.categoryId === bulkCategory.id
            )}
            onSaved={handleBulkSaved}
          />
        )}
      </div>
    </Layout>
  );
};

export default Menu;
