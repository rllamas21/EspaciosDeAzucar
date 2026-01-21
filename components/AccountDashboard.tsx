import React, { useEffect, useState } from 'react';
import { Package, MapPin, Heart, LogOut, ChevronRight, User as UserIcon, Trash2, Plus, Minus, ArrowLeft, Loader2, CheckCircle, Clock, XCircle, ChevronLeft, Star, X, ZoomIn, AlertCircle } from 'lucide-react';
import { Product, User as UserType, Address } from '../types';
import api from '../lib/api';

const ARGENTINE_PROVINCES = [
  "Buenos Aires", "Capital Federal (CABA)", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"
];

interface AccountDashboardProps {
  user: UserType;
  onLogout: () => void;
  t: (key: string) => string;
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product, color?: any, quantity?: number, variantId?: number) => void;
  onNavigate?: (view: 'home') => void;
}

type Tab = 'overview' | 'orders' | 'addresses' | 'wishlist';

// --- MODAL DE IMAGEN (LIGHTBOX) ---
const ImageModal: React.FC<{
  isOpen: boolean;
  imageUrl: string | null;
  productName: string;
  onClose: () => void;
}> = ({ isOpen, imageUrl, productName, onClose }) => {
  if (!isOpen || !imageUrl) return null;
  
  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
      >
        <X className="w-8 h-8" />
      </button>
      
      <div 
        className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()} 
      >
        <img 
          src={imageUrl} 
          alt={productName} 
          className="max-w-full max-h-[80vh] object-contain rounded-sm shadow-2xl animate-in zoom-in-95 duration-300" 
        />
        <p className="mt-4 text-white/90 font-serif text-lg tracking-wide">{productName}</p>
      </div>
    </div>
  );
};

// --- MODAL DE CONFIRMACIÓN ---
const ConfirmModal: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white p-6 rounded-sm shadow-xl max-w-sm w-full border border-stone-100">
        <h3 className="font-serif text-xl mb-2 text-stone-900">{title}</h3>
        <p className="text-stone-500 text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-xs font-bold uppercase text-stone-500 hover:text-stone-900">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white text-xs font-bold uppercase hover:bg-red-700 rounded-sm shadow-sm">Eliminar</button>
        </div>
      </div>
    </div>
  );
};

// --- ITEM WISHLIST (MEJORADO CON STOCK) ---
const WishlistItem: React.FC<{
  item: any; // Usamos 'any' para aceptar la propiedad 'stock' que viene del backend nuevo
  onRemove: (id: string) => void;
  onAddToCart: (item: Product, quantity: number) => void;
  t: (key: string) => string;
}> = ({ item, onRemove, onAddToCart, t }) => {
  const [quantity, setQuantity] = useState(1);
  
  // Lógica de Stock: Si no viene el dato, asumimos 0 por seguridad
  const hasStock = (item.stock || 0) > 0;

  return (
    <div className="flex gap-4 p-4 border border-stone-100 bg-white hover:border-stone-200 transition-colors group relative rounded-sm">
       <button onClick={(e) => { e.stopPropagation(); onRemove(item.id); }} className="absolute top-3 right-3 p-1.5 text-stone-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all z-10" title="Eliminar">
          <Trash2 className="w-4 h-4" />
       </button>
       
       <div className="w-24 h-24 bg-stone-100 flex-shrink-0 overflow-hidden rounded-sm relative">
         {/* Imagen con efecto gris si no hay stock */}
         <img src={item.image} alt={item.name} className={`w-full h-full object-cover transition-transform group-hover:scale-105 duration-500 ${!hasStock ? 'opacity-50 grayscale' : ''}`} />
         
         {/* Etiqueta de Agotado */}
         {!hasStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <span className="text-[9px] font-bold uppercase tracking-widest bg-stone-900 text-white px-2 py-1 rounded-sm">Agotado</span>
            </div>
         )}
       </div>

       <div className="flex flex-col justify-between py-1 flex-1">
         <div>
           <p className="text-[10px] uppercase tracking-widest text-stone-400">{item.category}</p>
           <h4 className="font-serif text-lg text-stone-900 leading-tight pr-8">{item.name}</h4>
         </div>
         
         <div className="flex justify-between items-end gap-2">
            <span className="text-sm font-medium hidden md:block">${item.price.toLocaleString()}</span>
            
            {/* Solo mostramos el botón de agregar si hay stock */}
            {hasStock ? (
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                   <div className="flex items-center border border-stone-200 rounded-full h-7 px-1">
                     <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 hover:text-stone-900 text-stone-400"><Minus className="w-3 h-3" /></button>
                     <span className="text-xs font-medium w-5 text-center">{quantity}</span>
                     <button onClick={() => setQuantity(quantity + 1)} className="p-1 hover:text-stone-900 text-stone-400"><Plus className="w-3 h-3" /></button>
                   </div>
                   <button onClick={(e) => { e.stopPropagation(); onAddToCart(item, undefined, quantity, item.selectedVariantId);}} className="bg-stone-900 text-white text-[10px] uppercase tracking-widest px-3 py-1.5 rounded hover:bg-stone-700 transition-colors">
                     Agregar
                   </button>

                   
                </div>
            ) : (
                // Texto de alerta si no hay stock
                <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Sin Stock
                </span>
            )}
         </div>
       </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const AccountDashboard: React.FC<AccountDashboardProps> = ({ user, onLogout, t, onRemoveFromWishlist, onAddToCart, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  
  // Data States
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // NUEVO: Estado para Wishlist real
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Address Form States
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [savingAddress, setSavingAddress] = useState(false);

  // Delete Confirmation State
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

  // Image Viewer State
  const [viewingImage, setViewingImage] = useState<{ url: string, name: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ORDERS_PER_PAGE = 5;

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'addresses') fetchAddresses();
    if (activeTab === 'wishlist') fetchWishlist(); // <--- Cargar wishlist real al abrir tab
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data } = await api.get('/api/store/orders');
      setOrders(data.orders || []);
    } catch (err) { console.error(err); } finally { setLoadingOrders(false); }
  };

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const { data } = await api.get('/api/store/addresses');
      setAddresses(data || []);
    } catch (err) { console.error(err); } finally { setLoadingAddresses(false); }
  };

  // NUEVO: Función para cargar la wishlist de la BD
  const fetchWishlist = async () => {
    setLoadingWishlist(true);
    try {
      const { data } = await api.get('/api/store/wishlist');
      setWishlistItems(data || []);
    } catch (err) { console.error(err); } finally { setLoadingWishlist(false); }
  };

  // NUEVO: Función para borrar de la wishlist real
  const handleRemoveItemFromWishlist = async (productId: string) => {
    try {
        // 1. Borrar en backend
        await api.delete(`/api/store/wishlist/${productId}`);
        // 2. Actualizar estado local (optimista)
        setWishlistItems(prev => prev.filter(item => item.id !== productId));
        // 3. Notificar al padre para actualizar el contador del header
        onRemoveFromWishlist(productId);
    } catch (error) { console.error(error); }
  };

  // Address Handlers
  const handleNewAddress = () => {
    setEditingAddress({ alias: '', recipient_name: '', dni: '', phone: '', street: '', number: '', floor_apt: '', city: '', zip_code: '', province: '' });
    setIsAddressFormOpen(true);
  };

  const handleEditAddress = (addr: Address) => {
    setEditingAddress({ ...addr, floor_apt: addr.floor_apt || '' });
    setIsAddressFormOpen(true);
  };

  const confirmDeleteAddress = async () => {
    if (addressToDelete === null) return;
    try { 
      await api.delete(`/api/store/addresses/${addressToDelete}`); 
      fetchAddresses(); 
    } catch (err) { console.error(err); } 
    finally { setAddressToDelete(null); }
  };

  const handleSetDefault = async (addr: Address) => {
    try {
       await api.post('/api/store/addresses', { ...addr, is_default: true, floor_apt: addr.floor_apt });
       fetchAddresses();
    } catch (err) { console.error(err); }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const isFirst = addresses.length === 0;
      const payload = { ...editingAddress, is_default: isFirst ? true : editingAddress.is_default };
      await api.post('/api/store/addresses', payload);
      setIsAddressFormOpen(false);
      fetchAddresses();
    } catch (err) { alert("Error guardando dirección"); } finally { setSavingAddress(false); }
  };

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (paymentStatus === 'pending') return { label: 'Pendiente', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Clock };
    if (paymentStatus === 'failed' || status === 'cancelled') return { label: 'Cancelado', color: 'text-red-600 bg-red-50 border-red-100', icon: XCircle };
    if (status === 'shipped') return { label: 'En Camino', color: 'text-blue-600 bg-blue-50 border-blue-100', icon: Package };
    if (status === 'delivered') return { label: 'Entregado', color: 'text-stone-600 bg-stone-100 border-stone-200', icon: CheckCircle };
    return { label: 'En Preparación', color: 'text-green-700 bg-green-50 border-green-100', icon: CheckCircle };
  };

  const renderAddressForm = () => (
    <div className="bg-white border border-stone-200 p-8 rounded-sm animate-in fade-in slide-in-from-bottom-2">
      <h3 className="font-serif text-2xl text-stone-900 mb-6">{editingAddress.id ? 'Editar Dirección' : 'Nueva Dirección'}</h3>
      <form onSubmit={handleSaveAddress} className="space-y-4 max-w-lg">
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-1"><label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Alias</label><input className="input-delicate" placeholder="Ej. Casa" value={editingAddress.alias} onChange={e => setEditingAddress({...editingAddress, alias: e.target.value})} /></div>
           <div className="space-y-1"><label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Receptor</label><input className="input-delicate" required placeholder="Nombre Apellido" value={editingAddress.recipient_name} onChange={e => setEditingAddress({...editingAddress, recipient_name: e.target.value})} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-1"><label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">DNI</label><input className="input-delicate" required placeholder="DNI Titular" value={editingAddress.dni} onChange={e => setEditingAddress({...editingAddress, dni: e.target.value})} /></div>
           <div className="space-y-1"><label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Teléfono</label><input className="input-delicate" required type="tel" placeholder="Sin 0 ni 15" value={editingAddress.phone} onChange={e => setEditingAddress({...editingAddress, phone: e.target.value})} /></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
           <div className="col-span-2 space-y-1"><label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Calle</label><input className="input-delicate" required value={editingAddress.street} onChange={e => setEditingAddress({...editingAddress, street: e.target.value})} /></div>
           <div className="space-y-1"><label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Altura</label><input className="input-delicate" required value={editingAddress.number} onChange={e => setEditingAddress({...editingAddress, number: e.target.value})} /></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
           <div className="space-y-1"><label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Piso / Depto</label><input className="input-delicate" placeholder="Ej: 1B" value={editingAddress.floor_apt} onChange={e => setEditingAddress({...editingAddress, floor_apt: e.target.value})} /></div>
           <div className="space-y-1"><label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Ciudad</label><input className="input-delicate" required value={editingAddress.city} onChange={e => setEditingAddress({...editingAddress, city: e.target.value})} /></div>
           <div className="space-y-1"><label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">CP</label><input className="input-delicate" required value={editingAddress.zip_code} onChange={e => setEditingAddress({...editingAddress, zip_code: e.target.value})} /></div>
        </div>
        <div className="space-y-1"><label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Provincia</label><select className="input-delicate bg-white" required value={editingAddress.province} onChange={e => setEditingAddress({...editingAddress, province: e.target.value})}><option value="" disabled>Seleccionar...</option>{ARGENTINE_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
        <div className="flex items-center gap-4 pt-4 border-t border-stone-100 mt-4">
          <button type="submit" disabled={savingAddress} className="bg-stone-900 text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors rounded-sm">{savingAddress ? 'Guardando...' : 'Guardar Dirección'}</button>
          <button type="button" onClick={() => setIsAddressFormOpen(false)} className="text-stone-500 text-xs font-bold uppercase hover:text-stone-900 transition-colors">Cancelar</button>
        </div>
      </form>
      <style>{`.input-delicate { width: 100%; padding: 8px 12px; font-size: 14px; border: 1px solid #e7e5e4; border-radius: 4px; outline: none; transition: all 0.2s; } .input-delicate:focus { border-color: #a8a29e; box-shadow: 0 0 0 1px #a8a29e; }`}</style>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'orders':
        const indexOfLastOrder = currentPage * ORDERS_PER_PAGE;
        const indexOfFirstOrder = indexOfLastOrder - ORDERS_PER_PAGE;
        const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
        const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);

        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-serif text-2xl text-stone-900 mb-6">{t('account_orders')}</h3>
            {loadingOrders ? (
               <div className="space-y-4">{[1,2].map(i => <div key={i} className="h-40 bg-stone-100 rounded-sm animate-pulse" />)}</div>
            ) : orders.length === 0 ? (
               <div className="text-center py-16 bg-stone-50 border border-dashed border-stone-200 rounded-sm">
                  <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500">Aún no tienes pedidos registrados.</p>
                  <button onClick={() => onNavigate && onNavigate('home')} className="mt-4 text-xs font-bold uppercase underline">Ir a comprar</button>
               </div>
            ) : (
               <div className="space-y-6">
                 {currentOrders.map((order) => {
                    const badge = getStatusBadge(order.status, order.payment_status);
                    const BadgeIcon = badge.icon;
                    return (
                      <div key={order.id} className="bg-white border border-stone-200 rounded-sm hover:border-stone-300 transition-colors">
                         {/* Header Corregido */}
                         <div className="px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-stone-100">
                            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
                               <span className="font-bold text-sm text-stone-900">Pedido #{order.id}</span>
                               <span className="text-sm text-stone-400 font-light">{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border flex items-center gap-2 ${badge.color}`}>
                               <BadgeIcon className="w-3 h-3" /> {badge.label}
                            </div>
                         </div>

                         {/* Items con Lightbox */}
                         <div className="p-6 flex flex-col gap-4">
                            {order.items.map((item: any, idx: number) => {
                               let opts: any = {};
                               try { opts = typeof item.variant_options === 'string' ? JSON.parse(item.variant_options) : item.variant_options; } catch(e){}
                               const variantText = [opts.Color, opts.Talla, opts.Medida].filter(Boolean).join(' / ');
                               
                               return (
                                 <div key={idx} className="flex items-center gap-6">
                                    {/* Imagen Clickeable */}
                                    <div 
                                      className="w-20 h-20 bg-stone-50 border border-stone-100 rounded-sm flex items-center justify-center text-stone-300 flex-shrink-0 overflow-hidden cursor-zoom-in relative group"
                                      onClick={() => item.image && setViewingImage({ url: item.image, name: item.product_name })}
                                    >
                                       {item.image ? (
                                          <>
                                            <img src={item.image} alt={item.product_name} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                               <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                                            </div>
                                          </>
                                       ) : (
                                          <Package className="w-8 h-8" strokeWidth={1.5} />
                                       )}
                                    </div>

                                    <div className="flex-1">
                                       <div className="flex flex-col gap-1">
                                          <div className="flex items-baseline gap-2">
                                             <p className="font-serif text-lg text-stone-900">{item.product_name}</p>
                                             {item.quantity > 1 && <span className="text-xs font-bold text-stone-500 bg-stone-100 px-1.5 rounded-sm">x{item.quantity}</span>}
                                          </div>
                                          {variantText && <p className="text-sm text-stone-500">{variantText}</p>}
                                          
                                          <p className="text-sm text-stone-500 mt-1">
                                             1 und - <span className="font-bold text-stone-900">${Number(item.unit_price).toLocaleString()}</span>
                                          </p>
                                       </div>
                                    </div>
                                 </div>
                               )
                            })}
                         </div>

                         {/* Footer Total */}
                         <div className="px-6 py-4 bg-stone-50/50 flex justify-between items-center border-t border-stone-100">
                            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Total del Pedido</span>
                            <span className="font-bold text-sm text-stone-900">${Number(order.total).toLocaleString()}</span>
                         </div>
                      </div>
                    );
                 })}
                 
                 {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 pt-4">
                       <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-stone-200 rounded-full hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronLeft className="w-4 h-4" /></button>
                       <span className="text-sm font-medium text-stone-500">Página {currentPage} de {totalPages}</span>
                       <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-stone-200 rounded-full hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                 )}
               </div>
            )}
          </div>
        );

      case 'addresses':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {isAddressFormOpen ? renderAddressForm() : (
               <>
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif text-2xl text-stone-900">{t('account_addresses')}</h3>
                    <button onClick={handleNewAddress} className="text-xs uppercase tracking-widest text-stone-900 border-b border-stone-900 pb-0.5 hover:opacity-70 transition-opacity">+ Nueva Dirección</button>
                 </div>
                 {loadingAddresses ? <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-stone-400"/></div> : 
                 addresses.length === 0 ? <div className="text-center py-12 border border-dashed border-stone-200 bg-stone-50"><MapPin className="w-8 h-8 text-stone-300 mx-auto mb-2" /><p className="text-stone-500 text-sm">No tienes direcciones guardadas.</p></div> : 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {addresses.map((addr) => (
                     <div key={addr.id} className={`p-6 border ${addr.is_default ? 'border-stone-800 bg-stone-50' : 'border-stone-200 bg-white'} rounded-sm relative group transition-all hover:shadow-md`}>
                        {addr.is_default && <span className="absolute top-4 right-4 text-[9px] uppercase tracking-widest bg-stone-900 text-white px-2 py-1 rounded-sm">Principal</span>}
                        
                        <div className="flex justify-between items-start mb-3">
                           <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-stone-400" />
                              <h4 className="font-bold text-sm uppercase tracking-wide">{addr.alias}</h4>
                           </div>
                           {!addr.is_default && (
                              <button onClick={() => handleSetDefault(addr)} className="text-stone-300 hover:text-yellow-500 transition-colors" title="Marcar como Principal">
                                 <Star className="w-4 h-4" />
                              </button>
                           )}
                        </div>
                        
                        <div className="text-sm text-stone-600 space-y-1 mb-6 font-light pl-6 border-l-2 border-stone-100">
                           <p className="font-medium text-stone-900">{addr.recipient_name}</p>
                           <p>DNI: {addr.dni || '-'}</p>
                           <p>{addr.street} {addr.number} {addr.floor_apt ? `(${addr.floor_apt})` : ''}</p>
                           <p>{addr.city}, {addr.province}</p>
                           <p className="text-xs text-stone-400">{addr.zip_code} • {addr.phone}</p>
                        </div>
                        <div className="flex gap-4 pl-6">
                           <button onClick={() => handleEditAddress(addr)} className="text-xs font-bold uppercase text-stone-900 hover:text-stone-600">Editar</button>
                           <button onClick={() => setAddressToDelete(addr.id)} className="text-xs font-bold uppercase text-stone-400 hover:text-red-600">Eliminar</button>
                        </div>
                     </div>
                   ))}
                 </div>}
               </>
             )}
          </div>
        );

      case 'wishlist':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h3 className="font-serif text-2xl text-stone-900 mb-6">{t('account_wishlist')}</h3>
             {loadingWishlist ? (
               <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-stone-300" /></div>
             ) : wishlistItems.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {wishlistItems.map((item) => (
                   <WishlistItem 
                      key={item.id} 
                      item={item} 
                      onRemove={handleRemoveItemFromWishlist}                    
                      onAddToCart={(itm, qty) => onAddToCart(itm, undefined, qty, itm.selectedVariantId)}
                      t={t} 
                   />
                 ))}
               </div>
             ) : (
                <div className="text-center py-20 bg-stone-50 border border-stone-100 border-dashed">
                    <Heart className="w-8 h-8 mx-auto text-stone-300 mb-4" />
                    <p className="text-stone-500">Aún no has guardado piezas de inspiración.</p>
                </div>
             )}
          </div>
        );

      default:
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-stone-900 text-white p-8 md:p-12 relative overflow-hidden rounded-sm shadow-xl">
              <div className="relative z-10">
                <h2 className="font-serif text-3xl md:text-4xl mb-4">Bienvenida de nuevo, {user.name?.split(' ')[0]}.</h2>
                <p className="text-stone-400 font-light max-w-lg leading-relaxed">Tu espacio personal en Azúcar. Gestiona tus pedidos recientes, direcciones de entrega y tu lista de deseos desde aquí.</p>
              </div>
              <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div onClick={() => setActiveTab('orders')} className="group cursor-pointer border border-stone-200 p-8 hover:border-stone-900 transition-colors bg-white rounded-sm shadow-sm hover:shadow-md">
                  <Package className="w-8 h-8 text-stone-300 mb-4 group-hover:text-stone-900 transition-colors" strokeWidth={1.5} />
                  <h4 className="font-serif text-xl mb-1">{t('account_orders')}</h4>
                  <p className="text-sm text-stone-500 mb-4">Revisar estado y envíos</p>
                  <ChevronRight className="w-5 h-5 text-stone-300 group-hover:translate-x-1 transition-all" />
               </div>
               <div onClick={() => setActiveTab('addresses')} className="group cursor-pointer border border-stone-200 p-8 hover:border-stone-900 transition-colors bg-white rounded-sm shadow-sm hover:shadow-md">
                  <MapPin className="w-8 h-8 text-stone-300 mb-4 group-hover:text-stone-900 transition-colors" strokeWidth={1.5} />
                  <h4 className="font-serif text-xl mb-1">{t('account_addresses')}</h4>
                  <p className="text-sm text-stone-500 mb-4">Gestionar entregas</p>
                  <ChevronRight className="w-5 h-5 text-stone-300 group-hover:translate-x-1 transition-all" />
               </div>
               <div onClick={() => setActiveTab('wishlist')} className="group cursor-pointer border border-stone-200 p-8 hover:border-stone-900 transition-colors bg-white rounded-sm shadow-sm hover:shadow-md">
                  <Heart className="w-8 h-8 text-stone-300 mb-4 group-hover:text-stone-900 transition-colors" strokeWidth={1.5} />
                  <h4 className="font-serif text-xl mb-1">{t('account_wishlist')}</h4>
                  <p className="text-sm text-stone-500 mb-4">Tus favoritos guardados</p>
                  <ChevronRight className="w-5 h-5 text-stone-300 group-hover:translate-x-1 transition-all" />
               </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-24 md:pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12">
          <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
             <div className="hidden md:block mb-2">
                 <button onClick={() => onNavigate && onNavigate('home')} className="flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors text-xs font-bold uppercase tracking-widest mb-8 group">
                   <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Volver a la Tienda
                 </button>
                <div className="w-20 h-20 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 mb-4 shadow-sm"><UserIcon className="w-8 h-8" strokeWidth={1} /></div>
                <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">Cuenta Cliente</p>
                <p className="font-serif text-xl text-stone-900">{user.name}</p>
             </div>
             <nav className="flex md:flex-col gap-1 md:gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 border-b md:border-b-0 border-stone-200">
               {[{ id: 'overview', label: t('account_overview'), icon: UserIcon }, { id: 'orders', label: t('account_orders'), icon: Package }, { id: 'addresses', label: t('account_addresses'), icon: MapPin }, { id: 'wishlist', label: t('account_wishlist'), icon: Heart }].map((item) => (
                 <button key={item.id} onClick={() => setActiveTab(item.id as Tab)} className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-sm whitespace-nowrap ${activeTab === item.id ? 'bg-stone-900 text-white shadow-md transform scale-[1.02]' : 'text-stone-500 hover:bg-white hover:text-stone-900'}`}><item.icon className="w-4 h-4" />{item.label}</button>
               ))}
               <hr className="my-4 border-stone-200 hidden md:block" />
               <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest text-stone-400 hover:text-red-700 hover:bg-red-50 transition-colors rounded-sm w-full text-left"><LogOut className="w-4 h-4" />{t('account_logout')}</button>
             </nav>
          </aside>
          <main className="flex-1 min-h-[500px]">
             {renderTabContent()}
          </main>
        </div>
      </div>

      {/* Modal de Confirmación Global */}
      <ConfirmModal 
        isOpen={addressToDelete !== null}
        title="Eliminar Dirección"
        message="¿Estás seguro que deseas eliminar esta dirección? Esta acción no se puede deshacer."
        onConfirm={confirmDeleteAddress}
        onCancel={() => setAddressToDelete(null)}
      />

      {/* LIGHTBOX (VISOR DE IMAGEN) */}
      <ImageModal 
        isOpen={viewingImage !== null} 
        imageUrl={viewingImage?.url || null}
        productName={viewingImage?.name || ''}
        onClose={() => setViewingImage(null)}
      />
    </div>
  );
};

export default AccountDashboard;