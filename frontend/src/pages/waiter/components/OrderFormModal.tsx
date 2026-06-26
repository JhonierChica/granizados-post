import React, { ChangeEvent } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { UserPlusIcon, SearchIcon, MapPinIcon, UtensilsIcon, ShoppingCartIcon, TrashIcon, InfoIcon, WalletIcon, ChevronLeftIcon, FastForwardIcon } from '../../../components/common/Icons';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import type {
  Order,
  OrderItem,
  Table,
  MenuItem,
  Category,
  Client,
  ClientStep,
  OrderFormData,
} from '../../../types';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;

  editingOrder: Order | null;
  formData: OrderFormData;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;

  clientStep: ClientStep;
  setClientStep: (step: ClientStep) => void;
  existingClient: Client | null;
  searchingClient: boolean;
  orderType: string;
  setOrderType: (type: string) => void;
  searchExistingClient: () => void;
  createNewClientAndProceed: () => void;
  handleQuickOrder: () => void;

  availableTables: Table[];
  menuItems: MenuItem[];
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedItems: OrderItem[];
  getFilteredMenuItems: () => MenuItem[];
  handleAddItem: (id: number) => void;
  handleRemoveItem: (index: number) => void;
  handleQuantityChange: (index: number, qty: number | string) => void;
  getMenuItemName: (id: number) => string;
  getMenuItemPrice: (id: number) => number;
  calculateOrderTotal: (items: OrderItem[]) => number;
}

const OrderFormModal: React.FC<OrderFormModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  editingOrder,
  formData,
  handleChange,
  clientStep,
  setClientStep,
  existingClient,
  searchingClient,
  orderType,
  setOrderType,
  searchExistingClient,
  createNewClientAndProceed,
  handleQuickOrder,
  availableTables,
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedItems,
  getFilteredMenuItems,
  handleAddItem,
  handleRemoveItem,
  handleQuantityChange,
  getMenuItemName,
  getMenuItemPrice,
  calculateOrderTotal,
}) => {
  const showOrderForm = ((!editingOrder && clientStep === 'order' && existingClient) || editingOrder);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingOrder ? 'MODIFICAR COMANDA' : 'CREAR NUEVA COMANDA'}
      onConfirm={showOrderForm ? onConfirm : undefined}
      size="extra-large"
      confirmText={editingOrder ? 'ACTUALIZAR COMANDA' : 'GENERAR PEDIDO'}
    >
      <div className="py-2 animate-in fade-in zoom-in duration-300">

        {/* Step 1: Client Selection */}
        {!editingOrder && clientStep === 'selection' && (
          <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
            <div className="text-center space-y-1">
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-tighter text-foreground">Identificación del Cliente</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium italic px-4">¿Se trata de un cliente registrado o es un nuevo integrante?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">


              <button
                onClick={handleQuickOrder}
                className="group p-2 sm:p-4 bg-amber-50 border-2 border-transparent hover:border-amber-500 hover:bg-amber-100/50 rounded-2xl sm:rounded-3xl transition-all flex flex-col items-center gap-2 sm:gap-3 text-center"
              >
                <div className="p-2 sm:p-3 bg-white rounded-xl text-amber-600 shadow-sm group-hover:scale-110 transition-transform">
                  <FastForwardIcon size={20} />
                </div>
                <div>
                  <span className="block font-black text-sm sm:text-base uppercase tracking-tight text-amber-900">PEDIDO RÁPIDO</span>
                  <span className="text-[9px] text-amber-700/60 font-medium">Usa nombre del cliente</span>
                </div>
              </button>

              <div className="mt-4 max-w-lg mx-auto">
                <div className="bg-amber-50/60 border-2 border-amber-100 rounded-2xl p-3 sm:p-4 shadow-sm">
                  <Input
                    label="Nombre para pedido rápido"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    placeholder="Ej. Juan Pérez"
                    className="h-12 sm:h-14 text-center font-black tracking-widest bg-white/80 border-none focus:ring-4 focus:ring-amber-200/50"
                  />
                </div>
              </div>

              <button
                onClick={() => setClientStep('new')}
                className="group p-2 sm:p-4 bg-muted/30 border-2 border-transparent hover:border-primary hover:bg-primary/5 rounded-2xl sm:rounded-3xl transition-all flex flex-col items-center gap-2 sm:gap-3 text-center"
              >
                <div className="p-2 sm:p-3 bg-white rounded-xl text-primary shadow-sm group-hover:scale-110 transition-transform">
                  <UserPlusIcon size={20} />
                </div>
                <div>
                  <span className="block font-black text-sm sm:text-base uppercase tracking-tight">CLIENTE NUEVO</span>
                  <span className="text-[9px] text-muted-foreground font-medium">Registrar datos</span>
                </div>
              </button>
              
              <button
                onClick={() => setClientStep('existing')}
                className="group p-2 sm:p-4 bg-muted/30 border-2 border-transparent hover:border-secondary hover:bg-secondary/5 rounded-2xl sm:rounded-3xl transition-all flex flex-col items-center gap-2 sm:gap-3 text-center"
              >
                <div className="p-2 sm:p-3 bg-white rounded-xl text-secondary shadow-sm group-hover:scale-110 transition-transform">
                  <SearchIcon size={20} />
                </div>
                <div>
                  <span className="block font-black text-sm sm:text-base uppercase tracking-tight">CLIENTE EXISTENTE</span>
                  <span className="text-[9px] text-muted-foreground font-medium">Buscar por ID</span>
                </div>
              </button>
            </div>


          </div>
        )}

        {/* Step 2a: Search Existing Client */}
        {!editingOrder && clientStep === 'existing' && !existingClient && (
          <div className="space-y-6 sm:space-y-8 py-6 max-w-lg mx-auto text-center px-4 sm:px-0">
            <div className="bg-secondary/10 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto text-secondary">
              <SearchIcon size={28} />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-tighter">Búsqueda Rápida</h3>
              <p className="text-xs text-muted-foreground font-medium italic">Ingresa el documento para importar los datos.</p>
            </div>
            <Input
              label="Número de Identificación"
              name="clientIdentification"
              value={formData.clientIdentification}
              onChange={handleChange}
              required
              className="h-14 sm:h-16 text-center text-xl sm:text-2xl font-black tracking-widest bg-muted/30 rounded-2xl border-none focus:ring-4 focus:ring-secondary/10"
              placeholder="Ej. 1067..."
            />
            <div className="flex flex-col gap-3">
              <Button
                onClick={searchExistingClient}
                disabled={searchingClient || !formData.clientIdentification}
                variant="secondary"
                className="h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-secondary/20"
              >
                {searchingClient ? 'VERIFICANDO...' : 'BUSCAR CLIENTE'}
              </Button>
              <button onClick={() => setClientStep('selection')} className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors flex items-center justify-center gap-1 py-2">
                <ChevronLeftIcon size={14} /> Volver
              </button>
            </div>
          </div>
        )}

        {/* Step 2b: Order Type Selection */}
        {!editingOrder && clientStep === 'orderType' && existingClient && (
          <div className="space-y-3 sm:space-y-4 py-2 sm:py-4 overflow-hidden">
            <ClientBanner client={existingClient} />
            <div className="text-center space-y-1 px-4">
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-tighter text-foreground">Logística de Entrega</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium italic px-4">Selecciona el tipo de servicio para este pedido.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mx-auto px-4 sm:px-0">
              <button
                onClick={() => { setOrderType('ESTABLECIMIENTO'); setTimeout(() => setClientStep('order'), 100); }}
                className="group p-2 sm:p-4 bg-green-50 border-2 border-transparent hover:border-green-500 rounded-2xl transition-all flex flex-row sm:flex-col items-center gap-3 text-left sm:text-center"
              >
                <div className="p-2 sm:p-3 bg-white rounded-xl text-green-600 shadow-sm group-hover:scale-110 transition-transform">
                  <UtensilsIcon size={20} />
                </div>
                <div>
                  <span className="block font-black text-base sm:text-lg uppercase tracking-tight text-green-800">EN EL LOCAL</span>
                  <span className="text-[10px] text-green-700/60 font-medium italic">Servicio a la mesa 🪑</span>
                </div>
              </button>
              <button
                onClick={() => { setOrderType('DOMICILIO'); setTimeout(() => setClientStep('order'), 100); }}
                className="group p-2 sm:p-4 bg-blue-50 border-2 border-transparent hover:border-blue-500 rounded-2xl transition-all flex flex-row sm:flex-col items-center gap-3 text-left sm:text-center"
              >
                <div className="p-2 sm:p-3 bg-white rounded-xl text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                  <MapPinIcon size={20} />
                </div>
                <div>
                  <span className="block font-black text-base sm:text-lg uppercase tracking-tight text-blue-800">DOMICILIO</span>
                  <span className="text-[10px] text-blue-700/60 font-medium italic">Fuera del restaurante 🏍️</span>
                </div>
              </button>
            </div>
            <div className="text-center">
              <button onClick={() => { setClientStep('existing'); setOrderType(''); }} className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground flex items-center justify-center gap-1 mx-auto py-2">
                <ChevronLeftIcon size={14} /> Cambiar Cliente
              </button>
            </div>
          </div>
        )}

        {/* Step 2c: New Client Form */}
        {!editingOrder && clientStep === 'new' && (
          <div className="space-y-6 sm:space-y-8 py-2 sm:py-4 animate-in slide-in-from-right-4 duration-500 px-4 sm:px-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><UserPlusIcon size={18} /></div>
              <h3 className="text-xs font-black uppercase tracking-widest">Información del Nuevo Cliente</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-muted/20 p-5 sm:p-8 rounded-3xl sm:rounded-4xl border border-muted/50">
              <Input label="Nombre *" name="clientName" value={formData.clientName} onChange={handleChange} required placeholder="Nombre completo" className="h-12 sm:h-14 font-bold text-sm" />
              <Input label="Cédula / NIT *" name="clientIdentification" value={formData.clientIdentification} onChange={handleChange} required placeholder="Documento" className="h-12 sm:h-14 font-black tracking-widest text-sm" />
              <Input label="WhatsApp *" name="clientPhone" value={formData.clientPhone} onChange={handleChange} required placeholder="Número" className="h-12 sm:h-14 font-bold text-sm" />
              <Input label="Dirección" name="clientAddress" value={formData.clientAddress} onChange={handleChange} placeholder="Opcional para local" className="h-12 sm:h-14 font-bold text-sm" />
            </div>

            <div className="flex flex-col items-center gap-4 pt-2">
              <Button onClick={createNewClientAndProceed} className="w-full sm:w-auto h-14 px-12 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 bg-primary">
                CONTINUAR AL PEDIDO
              </Button>
              <button onClick={() => setClientStep('selection')} className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground flex items-center gap-1 py-2">
                <ChevronLeftIcon size={14} /> Cancelar Registro
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Order Details */}
        {showOrderForm ? (
          <div className="space-y-4 sm:space-y-5 py-2 animate-in fade-in duration-500">
            {existingClient && <ClientBanner client={existingClient} />}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
              {/* Left Column: Configuration */}
              <div className="lg:col-span-5 space-y-6 sm:space-y-8 px-4 sm:px-0">
                {/* Service Context & Table Selector Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`p-3 sm:p-4 rounded-2xl border-2 flex items-center gap-3 ${orderType === 'ESTABLECIMIENTO' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
                    <div className="p-2 bg-white rounded-xl shadow-sm shrink-0">
                      {orderType === 'ESTABLECIMIENTO' ? <UtensilsIcon size={18} /> : <MapPinIcon size={18} />}
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[8px] font-black uppercase tracking-widest opacity-60 italic truncate">Contexto</span>
                      <span className="text-xs sm:text-sm font-black uppercase tracking-tighter truncate block">{orderType === 'ESTABLECIMIENTO' ? 'En Salón' : 'Domicilio'}</span>
                    </div>
                  </div>

                  {orderType === 'ESTABLECIMIENTO' && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Mesa *</label>
                      <div className="relative">
                        <select
                          name="tableId"
                          value={formData.tableId}
                          onChange={handleChange}
                          className="w-full h-11 px-4 bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-background rounded-xl outline-none transition-all font-black text-xs appearance-none shadow-inner"
                          required
                          disabled={!!editingOrder}
                        >
                          <option value="">Mesa...</option>
                          {availableTables.map((table) => (
                            <option key={table.id} value={table.id}>
                              #{table.tableNumber} - {table.location}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                          <ChevronLeftIcon size={14} className="-rotate-90" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Category Filter */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Categorías</label>
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full h-11 px-4 bg-muted/50 border-2 border-transparent focus:border-secondary focus:bg-background rounded-xl outline-none transition-all font-black text-xs appearance-none shadow-inner"
                    >
                      <option value="">Seleccionar Categoría...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id.toString()}>
                          {cat.name.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                      <ChevronLeftIcon size={14} className="-rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Menu Items Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Productos</label>
                  <div className="bg-muted/10 p-2 rounded-2xl border border-muted/50 max-h-75 lg:max-h-[35vh] overflow-y-auto space-y-1.5 custom-scrollbar">
                    {selectedCategory ? (
                      getFilteredMenuItems().length > 0 ? (
                        getFilteredMenuItems().map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleAddItem(item.id)}
                            className="w-full flex items-center justify-between p-3 bg-white hover:bg-primary/5 border border-muted/60 hover:border-primary/30 rounded-xl transition-all group active:scale-[0.98]"
                          >
                            <div className="text-left flex-1 pr-2">
                              <p className="font-black text-[10px] uppercase text-foreground leading-tight truncate">{item.name}</p>
                              <p className="text-[8px] font-bold text-muted-foreground italic line-clamp-1">{item.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-primary text-[10px] sm:text-xs">${item.price.toLocaleString('es-CO')}</span>
                              <div className="p-1.5 bg-muted rounded-lg text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors">
                                <PlusIcon size={10} />
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="min-w-15 text-center px-2 py-1 bg-muted rounded-lg font-black text-xs text-muted-foreground italic uppercase">No hay productos</div>
                      )
                    ) : (
                      <div className="py-12 text-center space-y-3">
                        <FastForwardIcon size={24} className="mx-auto text-muted-foreground opacity-20" />
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic px-6">Selecciona una categoría</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="lg:col-span-7 space-y-4 px-4 sm:px-0">
                <div className="bg-background border-2 border-primary/20 rounded-3xl shadow-xl overflow-hidden flex flex-col h-full lg:max-h-[55vh]">
                  <div className="bg-primary p-3 sm:p-4 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md">
                        <ShoppingCartIcon size={16} />
                      </div>
                      <div>
                        <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-widest">Resumen</h4>
                        <p className="text-[8px] sm:text-[9px] font-medium opacity-70 italic">{selectedItems.length} items</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 rounded-lg backdrop-blur-md text-[8px] px-2 py-0">
                      PENDIENTE
                    </Badge>
                  </div>

                  <div className="p-2 sm:p-3 flex-1 space-y-2 overflow-y-auto max-h-62.5 lg:max-h-none custom-scrollbar bg-slate-50/30">
                    {selectedItems.length > 0 ? (
                      selectedItems.map((item, index) => {
                        const itemPrice = item.price || getMenuItemPrice(item.menuItemId);
                        const itemName = item.name || getMenuItemName(item.menuItemId);
                        const subtotal = itemPrice * item.quantity;
                        return (
                          <div key={index} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-muted/60 shadow-sm animate-in slide-in-from-right-4 duration-300">
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-[9px] uppercase text-foreground leading-tight truncate">{itemName}</p>
                              <p className="text-[8px] font-bold text-muted-foreground italic">${itemPrice.toLocaleString('es-CO')}</p>
                            </div>
                            <div className="flex items-center bg-muted/30 rounded-xl p-0.5 gap-1">
                              <button type="button" onClick={() => handleQuantityChange(index, Math.max(1, item.quantity - 1))} className="w-6 h-6 flex items-center justify-center bg-white rounded-lg shadow-sm text-primary font-black hover:bg-primary hover:text-white transition-all text-[10px]">-</button>
                              <span className="w-4 text-center font-black text-[10px]">{item.quantity}</span>
                              <button type="button" onClick={() => handleQuantityChange(index, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-lg shadow-sm text-primary font-black hover:bg-primary hover:text-white transition-all text-[10px]">+</button>
                            </div>
                            <div className="text-right min-w-15">
                              <p className="font-black text-secondary text-[10px]">${subtotal.toLocaleString('es-CO')}</p>
                            </div>
                            <button type="button" onClick={() => handleRemoveItem(index)} className="p-1 text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                              <TrashIcon size={12} />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 h-full opacity-20">
                        <ShoppingCartIcon size={40} className="text-muted-foreground" />
                        <p className="text-sm font-black uppercase tracking-tighter text-muted-foreground">Vacío</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-muted/10 border-t-2 border-dashed border-muted mt-auto space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-1 italic">
                          <InfoIcon size={10} /> Notas:
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          placeholder="Comentarios..."
                          className="w-full h-12 p-2 bg-white border-2 border-muted/50 rounded-xl outline-none transition-all font-medium text-[10px] shadow-sm resize-none focus:border-primary"
                        />
                      </div>

                      <div className="flex flex-col items-end pb-1">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">Total a Pagar</p>
                        <span className="text-2xl sm:text-3xl font-black tracking-tighter text-foreground">${calculateOrderTotal(selectedItems).toLocaleString('es-CO')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {!editingOrder && (
                  <button
                    onClick={() => { setClientStep('orderType'); setOrderType(''); }}
                    className="w-full flex items-center justify-center gap-2 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground group underline-offset-4 hover:underline"
                  >
                    <ChevronLeftIcon size={12} /> Cambiar Logística
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

// ===================== SUB-COMPONENTS =====================
const ClientBanner: React.FC<{ client: Client }> = ({ client }) => (
  <div className="bg-primary text-white p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl shadow-primary/10 flex flex-col sm:flex-row items-start sm:items-center justify-between animate-in slide-in-from-top-4 duration-500 overflow-hidden relative group gap-2">
    <div className="absolute top-0 right-0 p-3 opacity-10 rotate-12 group-hover:scale-125 transition-transform duration-700 hidden sm:block">
      <UserPlusIcon size={60} />
    </div>
    <div className="flex items-center gap-2 sm:gap-3 relative z-10">
      <div className="w-8 h-8 sm:w-11 sm:h-11 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-md shrink-0">
        <span className="text-base sm:text-lg font-black">{client.name.charAt(0).toUpperCase()}</span>
      </div>
      <div className="space-y-0.5">
        <span className="block text-[7px] sm:text-[9px] font-black uppercase tracking-[0.3em] opacity-70">Cliente:</span>
        <h4 className="text-xs sm:text-base font-black uppercase tracking-tight leading-none truncate max-w-40 sm:max-w-none">{client.name}</h4>
        <div className="flex items-center gap-2 mt-1 opacity-80">
          <span className="text-[7px] sm:text-[9px] font-bold flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded-md border border-white/20 uppercase">
            🆔 {client.identificationNumber || 'S/N'}
          </span>
        </div>
      </div>
    </div>
    <Badge variant="secondary" className="bg-white text-primary font-black text-[7px] sm:text-[9px] px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg border-none shadow-sm relative z-10 uppercase tracking-widest self-end sm:self-center">
      VERIFICADO
    </Badge>
  </div>
);

const PlusIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default OrderFormModal;
