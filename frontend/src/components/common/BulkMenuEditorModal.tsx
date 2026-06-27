import React, { useState, useEffect, ChangeEvent } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { PlusIcon, DeleteIcon, TagIcon, AlignLeftIcon, ChevronDownIcon, ChevronRightIcon } from './Icons';
import { menuService } from '../../services/menuService';
import type { MenuItem, Category, ItemPresentation } from '../../types';

interface PresentationEntry {
  tempId: string;
  id?: number;
  name: string;
  price: string;
  available: boolean;
}

interface ItemEntry {
  tempId: string;
  id?: number;
  name: string;
  description: string;
  price: string;
  available: boolean;
  presentations: PresentationEntry[];
}

interface BulkMenuEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
  existingItems: MenuItem[];
  onSaved: () => void;
}

let tempIdCounter = 0;
const nextTempId = () => `item_${++tempIdCounter}`;
const nextPresId = () => `pres_${++tempIdCounter}`;

const emptyPresentation = (): PresentationEntry => ({
  tempId: nextPresId(),
  name: '',
  price: '',
  available: true,
});

const emptyEntry = (): ItemEntry => ({
  tempId: nextTempId(),
  name: '',
  description: '',
  price: '',
  available: true,
  presentations: [],
});

const BulkMenuEditorModal: React.FC<BulkMenuEditorModalProps> = ({
  isOpen,
  onClose,
  category,
  existingItems,
  onSaved,
}) => {
  const [entries, setEntries] = useState<ItemEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [expandedPres, setExpandedPres] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      if (existingItems.length > 0) {
        setEntries(
          existingItems.map((item) => ({
            tempId: nextTempId(),
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: String(item.price),
            available: item.available,
            presentations: (item.presentations || []).map((p) => ({
              tempId: nextPresId(),
              id: p.id,
              name: p.name,
              price: String(p.price),
              available: p.available,
            })),
          }))
        );
      } else {
        setEntries([emptyEntry()]);
      }
      setExpandedPres(new Set());
    }
  }, [isOpen, existingItems]);

  // ── Item handlers ──────────────────────────

  const handleItemChange = (tempId: string, field: keyof ItemEntry, value: any) => {
    setEntries((prev) =>
      prev.map((e) => (e.tempId === tempId ? { ...e, [field]: value } : e))
    );
  };

  const handleAddRow = () => {
    setEntries((prev) => [...prev, emptyEntry()]);
  };

  const handleRemoveRow = (tempId: string) => {
    setEntries((prev) => prev.filter((e) => e.tempId !== tempId));
  };

  // ── Presentation handlers ──────────────────

  const togglePresExpanded = (itemTempId: string) => {
    setExpandedPres((prev) => {
      const next = new Set(prev);
      if (next.has(itemTempId)) next.delete(itemTempId);
      else next.add(itemTempId);
      return next;
    });
  };

  const handleAddPresentation = (itemTempId: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.tempId === itemTempId
          ? { ...e, presentations: [...e.presentations, emptyPresentation()] }
          : e
      )
    );
  };

  const handlePresChange = (itemTempId: string, presTempId: string, field: keyof PresentationEntry, value: any) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.tempId === itemTempId
          ? {
              ...e,
              presentations: e.presentations.map((p) =>
                p.tempId === presTempId ? { ...p, [field]: value } : p
              ),
            }
          : e
      )
    );
  };

  const handleRemovePresentation = (itemTempId: string, presTempId: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.tempId === itemTempId
          ? { ...e, presentations: e.presentations.filter((p) => p.tempId !== presTempId) }
          : e
      )
    );
  };

  // ── Save ───────────────────────────────────

  const handleSave = async () => {
    const validEntries = entries.filter((e) => e.name.trim());
    if (validEntries.length === 0) return;

    setSaving(true);
    try {
      await menuService.bulkSave(
        validEntries.map((e) => ({
          id: e.id,
          name: e.name.trim(),
          description: e.description.trim(),
          price: Number(e.price) || 0,
          categoryId: category.id,
          available: e.available,
          presentations:
            e.presentations.length > 0
              ? e.presentations
                  .filter((p) => p.name.trim())
                  .map((p) => ({
                    id: p.id,
                    name: p.name.trim(),
                    price: Number(p.price) || 0,
                    available: p.available,
                  }))
              : undefined,
        }))
      );
      onSaved();
      onClose();
    } catch (err) {
      console.error('Error al guardar items:', err);
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`EDITAR: ${category.name.toUpperCase()}`}
      size="extra-large"
      showActions={false}
    >
      <div className="space-y-4 py-4">
        {/* Header con info */}
        <div className="flex items-center justify-between bg-secondary/5 border border-secondary/10 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <TagIcon size={20} className="text-secondary" />
            <div>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                Categoría
              </p>
              <p className="text-lg font-black text-secondary uppercase">
                {category.name}
              </p>
            </div>
          </div>
          <span className="text-sm font-black text-muted-foreground">
            {entries.length} ítem{entries.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Lista de items */}
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {entries.map((entry, index) => (
            <div
              key={entry.tempId}
              className="border border-muted/40 rounded-2xl p-4 bg-muted/10 space-y-3 relative"
            >
              {/* Header del item */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Ítem #{index + 1}
                  {entry.id ? (
                    <span className="text-primary ml-2">(ID: {entry.id})</span>
                  ) : (
                    <span className="text-emerald-600 ml-2">(NUEVO)</span>
                  )}
                </span>
                <button
                  onClick={() => handleRemoveRow(entry.tempId)}
                  className="p-1.5 hover:bg-destructive/10 rounded-xl transition-all text-destructive"
                  title="Eliminar ítem"
                >
                  <DeleteIcon size={16} />
                </button>
              </div>

              {/* Nombre + Descripción */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <Input
                    label="Nombre"
                    name="name"
                    value={entry.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleItemChange(entry.tempId, 'name', e.target.value)
                    }
                    placeholder="Ej. Ojo de Diablo"
                    className="h-12 font-bold rounded-xl border-2 focus:border-primary"
                  />
                </div>
                <div />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                  <AlignLeftIcon size={12} /> Descripción
                </label>
                <textarea
                  value={entry.description}
                  onChange={(e) =>
                    handleItemChange(entry.tempId, 'description', e.target.value)
                  }
                  placeholder="Breve descripción del producto..."
                  className="w-full min-h-16 p-3 bg-background border-2 border-muted/40 focus:border-primary rounded-xl outline-none transition-all font-medium text-sm resize-none"
                />
              </div>

              {/* Disponible */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={entry.available}
                  onChange={(e) =>
                    handleItemChange(entry.tempId, 'available', e.target.checked)
                  }
                  className="w-5 h-5 rounded-lg border-2 border-muted text-primary focus:ring-primary transition-all cursor-pointer"
                />
                <span className="text-xs font-black uppercase tracking-widest">
                  {entry.available ? 'DISPONIBLE' : 'NO DISPONIBLE'}
                </span>
              </label>

              {/* ── Presentaciones / Tallas ─────── */}
              <div className="border-t border-muted/30 pt-3">
                <button
                  type="button"
                  onClick={() => togglePresExpanded(entry.tempId)}
                  className="flex items-center gap-2 text-xs font-black text-secondary uppercase tracking-widest hover:text-primary transition-colors w-full text-left"
                >
                  {expandedPres.has(entry.tempId) ? (
                    <ChevronDownIcon size={14} />
                  ) : (
                    <ChevronRightIcon size={14} />
                  )}
                  Tallas / Presentaciones
                  {entry.presentations.length > 0 && (
                    <span className="ml-1 text-[10px] font-bold text-muted-foreground">
                      ({entry.presentations.length})
                    </span>
                  )}
                </button>

                {expandedPres.has(entry.tempId) && (
                  <div className="mt-3 space-y-2 pl-2 border-l-2 border-secondary/20">
                    {entry.presentations.length === 0 && (
                      <div className="text-xs text-muted-foreground italic py-2">
                        Sin presentaciones. Si el producto tiene tallas (8oz, 10oz, Mediano, Grande, etc.) agregalas abajo.
                      </div>
                    )}

                    {entry.presentations.map((pres, pIdx) => (
                      <div
                        key={pres.tempId}
                        className="flex items-start gap-2 bg-background p-3 rounded-xl border border-muted/40"
                      >
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-5 gap-2">
                          <div className="sm:col-span-3">
                            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                              Talla
                            </label>
                            <input
                              value={pres.name}
                              onChange={(e) =>
                                handlePresChange(entry.tempId, pres.tempId, 'name', e.target.value)
                              }
                              placeholder="Ej. 8 Oz, Mediano"
                              className="w-full h-10 px-3 bg-muted/20 border-2 border-transparent focus:border-primary rounded-xl outline-none font-bold text-sm transition-all"
                            />
                          </div>
                          <div className="sm:col-span-1">
                            <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                              Precio
                            </label>
                            <input
                              type="number"
                              value={pres.price}
                              onChange={(e) =>
                                handlePresChange(entry.tempId, pres.tempId, 'price', e.target.value)
                              }
                              placeholder="0"
                              className="w-full h-10 px-3 bg-muted/20 border-2 border-transparent focus:border-primary rounded-xl outline-none font-bold text-sm text-secondary transition-all"
                            />
                          </div>
                          <div className="sm:col-span-1 flex items-end pb-1">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={pres.available}
                                onChange={(e) =>
                                  handlePresChange(entry.tempId, pres.tempId, 'available', e.target.checked)
                                }
                                className="w-4 h-4 rounded border-2 border-muted text-primary focus:ring-primary transition-all cursor-pointer"
                              />
                              <span className="text-[9px] font-bold uppercase tracking-widest">
                                {pres.available ? 'DISP' : 'NO'}
                              </span>
                            </label>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemovePresentation(entry.tempId, pres.tempId)}
                          className="p-1.5 hover:bg-destructive/10 rounded-lg transition-all text-destructive mt-5 shrink-0"
                          title="Eliminar talla"
                        >
                          <DeleteIcon size={14} />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => handleAddPresentation(entry.tempId)}
                      className="flex items-center gap-1.5 text-[11px] font-black text-secondary hover:text-primary transition-colors uppercase tracking-widest py-1"
                    >
                      <PlusIcon size={14} /> AGREGAR TALLA
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={handleAddRow}
            variant="secondary"
            className="h-12 font-black rounded-xl flex items-center gap-2"
          >
            <PlusIcon size={18} /> AGREGAR OTRO ÍTEM
          </Button>

          <div className="flex-1" />

          <Button
            onClick={handleSave}
            variant="primary"
            disabled={saving || entries.filter((e) => e.name.trim()).length === 0}
            className={`h-12 font-black rounded-xl px-8 ${
              saving ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {saving ? 'GUARDANDO...' : 'GUARDAR TODOS'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BulkMenuEditorModal;
