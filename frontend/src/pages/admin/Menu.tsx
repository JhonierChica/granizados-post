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
              <PlusIcon size={20} /> AGREGAR ITEMS
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
              Primero creá categorías desde la sección de Categorías para poder agregar los items del menu.
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`
                        relative bg-card rounded-2xl border border-border/60 overflow-hidden
                        hover:border-secondary/40 hover:shadow-lg hover:shadow-secondary/5
                        transition-all duration-200 group
                        ${item.available ? 'border-l-4 border-l-secondary/30' : 'border-l-4 border-l-muted opacity-60'}
                      `}
                    >
                      {/* Header compacto */}
                      <div className="p-3 pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className={`shrink-0 p-1.5 rounded-lg ${item.available ? 'bg-secondary/10 text-secondary' : 'bg-muted text-muted-foreground'}`}>
                              <UtensilsIcon size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-[11px] font-black uppercase tracking-tight truncate leading-tight">{item.name}</h4>
                              <p className="text-[10px] font-black text-secondary tracking-tight">${item.presentations && item.presentations.length > 0
                                ? Math.min(...item.presentations.map(p => p.price)).toLocaleString('es-CO')
                                : (Number(item.price) || 0).toLocaleString('es-CO')}</p>
                            </div>
                          </div>
                          {/* Acciones compactas */}
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => handleToggleAvailability(item)}
                              className={`p-1.5 rounded-lg transition-all ${item.available ? 'hover:bg-amber-500/10 text-amber-400' : 'hover:bg-emerald-500/10 text-emerald-400'}`}
                              title={item.available ? 'Desactivar' : 'Activar'}
                            >
                              <ToggleIcon size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-1.5 hover:bg-destructive/10 rounded-lg transition-all text-destructive/60 hover:text-destructive"
                              title="Eliminar"
                            >
                              <DeleteIcon size={13} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Presentaciones compactas */}
                      {item.presentations && item.presentations.length > 0 && (
                        <div className="px-3 pb-2">
                          <div className="flex flex-wrap gap-1">
                            {item.presentations.slice(0, 3).map((p) => (
                              <span
                                key={p.id}
                                className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${p.available ? 'bg-secondary/10 text-secondary' : 'bg-muted text-muted-foreground/50'}`}
                              >
                                {p.name.toUpperCase()}
                              </span>
                            ))}
                            {item.presentations.length > 3 && (
                              <span className="text-[8px] font-bold text-muted-foreground/50">+{item.presentations.length - 3}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer con estado */}
                      <div className="px-3 pb-2 flex items-center justify-between">
                        <Badge
                          variant={item.available ? 'default' : 'destructive'}
                          className="text-[8px] font-black px-2 py-0.5 rounded-md"
                        >
                          {item.available ? 'DISPONIBLE' : 'AGOTADO'}
                        </Badge>
                        <span className="text-[8px] font-black text-muted-foreground/30">#{item.id}</span>
                      </div>
                    </div>
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
