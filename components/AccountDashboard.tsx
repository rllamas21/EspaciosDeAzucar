import React, { useEffect, useState } from 'react';
import { User, Package, MapPin, Heart, LogOut, ChevronRight, User as UserIcon, Trash2, Plus, Minus, ArrowLeft, Loader2, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { Product, User as UserType, Address } from '../types';
import api from '../lib/api';

// --- CONFIGURACIÓN DE PROVINCIAS (Misma que en Checkout) ---
const ARGENTINE_PROVINCES = [
  "Buenos Aires", "Capital Federal (CABA)", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"
];

interface AccountDashboardProps {
  user: UserType;
  onLogout: () => void;
  t: (key: string) => string;
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product, color?: any, quantity?: number) => void;
  onAddressSave?: (address: Address) => void; // Legacy prop (opcional)
  onAddressDelete?: (id: string) => void;     // Legacy prop (opcional)
  onNavigate?: (view: 'home') => void;
}

type Tab = 'overview' | 'orders' | 'addresses' | 'wishlist';

// --- COMPONENTE INTERNO: ITEM DE WISHLIST ---
const WishlistItem: React.FC<{
  item: Product;
  onRemove: (id: string) => void;
  onAddToCart: (item: Product, quantity: number) => void;
  t: (key: string) => string;
}> = ({ item, onRemove, onAddToCart, t }) => {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex gap-4 p-4 border border-stone-100 bg-white hover:border-stone-200 transition-colors group relative rounded-sm">
       <button 
         onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
         className="absolute top-3 right-3 p-1.5 text-stone-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all z-10"
         title="Eliminar"
       >
          <Trash2 className="w-4 h-4" />
       </button>

       <div className="w-24 h-24 bg-stone-100 flex-shrink-0 overflow-hidden rounded-sm">
         <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
       </div>
       <div className="flex flex-col justify-between py-1 flex-1">
         <div>
           <p className="text-[10px] uppercase tracking-widest text-stone-400">{item.category}</p>
           <h4 className="font-serif text-lg text-stone-900 leading-tight pr-8">{item.name}</h4>
         </div>
         <div className="flex justify-between items-end gap-2">
            <span className="text-sm font-medium hidden md:block">${item.price.toLocaleString()}</span>
            <div className="flex items-center gap-3">
               <div className="flex items-center border border-stone-200 rounded-full h-7 px-1">
                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 hover:text-stone-900 text-stone-400"><Minus className="w-3 h-3" /></button>
                 <span className="text-xs font-medium w-5 text-center">{quantity}</span>
                 <button onClick={() => setQuantity(quantity + 1)} className="p-1 hover:text-stone-900 text-stone-400"><Plus className="w-3 h-3" /></button>
               </div>
               <button 
                 onClick={(e) => { e.stopPropagation(); onAddToCart(item, quantity); }}
                 className="bg-stone-900 text-white text-[10px] uppercase tracking-widest px-3 py-1.5 rounded hover:bg-stone-700 transition-colors"
               >
                 Agregar
               </button>
            </div>
         </div>
       </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const AccountDashboard: React.FC<AccountDashboardProps> = ({ 
  user, 
  onLogout, 
  t, 
  onRemoveFromWishlist, 
  onAddToCart,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  
  // Estados de Datos Reales
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Estados Formulario Dirección
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null); // Usamos any para manejar el form flexiblemente
  const [savingAddress, setSavingAddress] = useState(false);

  // --- EFECTOS DE CARGA ---
  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'addresses') fetchAddresses();
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data } = await api.get('/api/store/orders'); // Asegúrate que esta ruta exista
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const { data } = await api.get('/api/store/addresses');
      setAddresses(data || []);
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // --- HANDLERS DIRECCIONES ---
  const handleNewAddress = () => {
    setEditingAddress({
      alias: '', recipient_name: '', dni: '', phone: '',
      street: '', number: '', floor: '', apartment: '',
      city: '', zip_code: '', province: ''
    });
    setIsAddressFormOpen(true);
  };

  const handleEditAddress = (addr: Address) => {
  setEditingAddress({
    id: addr.id,
    alias: addr.alias,
    recipient_name: addr.recipient_name,
    dni: addr.dni || '',
    phone: addr.phone,
    street: addr.street,
    number: addr.number,
    floor_apt: addr.floor_apt || '', 
    city: addr.city,
    zip_code: addr.zip_code,
    province: addr.province,
    is_default: addr.is_default
  });
  setIsAddressFormOpen(true);
};

  const handleDeleteAddress = async (id: number) => {
    if(!confirm("¿Eliminar esta dirección?")) return;
    try {
      await api.delete(`/api/store/addresses/${id}`);
      fetchAddresses(); // Recargar lista
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      // CORRECCIÓN: Quitamos la lógica de unión.
      // editingAddress YA tiene el 'floor_apt' correcto que escribió el usuario (ej: "1B")
      const payload = {
        ...editingAddress,
        is_default: addresses.length === 0 ? true : editingAddress.is_default
      };

      // Si usas lógica de create/update:
      if (editingAddress.id) {
         await api.post('/api/store/addresses', payload); 
      } else {
         await api.post('/api/store/addresses', payload);
      }
      
      setIsAddressFormOpen(false);
      fetchAddresses();
    } catch (err) {
      console.error(err);
      alert("Error guardando dirección");
    } finally {
      setSavingAddress(false);
    }
  };

  // --- HELPERS VISUALES PEDIDOS ---
  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (paymentStatus === 'pending') return { label: 'Pendiente de Pago', classes: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock };
    if (paymentStatus === 'failed' || status === 'cancelled' || paymentStatus === 'rejected') return { label: 'Cancelado', classes: 'bg-red-50 text-red-700 border-red-100', icon: XCircle };
    if (status === 'shipped') return { label: 'En Camino', classes: 'bg-blue-50 text-blue-800 border-blue-100', icon: Package };
    if (status === 'delivered') return { label: 'Entregado', classes: 'bg-stone-100 text-stone-800 border-stone-200', icon: CheckCircle };
    if (paymentStatus === 'paid' || status === 'paid') return { label: 'Pagado / En Preparación', classes: 'bg-green-50 text-green-700 border-green-100', icon: CheckCircle };
    return { label: status, classes: 'bg-gray-100 text-gray-800', icon: AlertTriangle };
  };

  const renderAddressForm = () => {
    if (!editingAddress) return null;

    return (
      <div className="bg-white border border-stone-200 p-8 rounded-sm animate-in fade-in slide-in-from-bottom-2">
         <h3 className="font-serif text-2xl text-stone-900 mb-6">
           {editingAddress.id ? 'Editar Dirección' : 'Nueva Dirección'}
         </h3>
         <form onSubmit={handleSaveAddress} className="space-y-4 max-w-lg">
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Alias</label>
                 <input className="input-delicate" placeholder="Ej. Casa" value={editingAddress.alias} onChange={e => setEditingAddress({...editingAddress, alias: e.target.value})} />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Receptor</label>
                 <input className="input-delicate" required placeholder="Nombre Apellido" value={editingAddress.recipient_name} onChange={e => setEditingAddress({...editingAddress, recipient_name: e.target.value})} />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">DNI</label>
                 <input className="input-delicate" required placeholder="DNI Titular" value={editingAddress.dni} onChange={e => setEditingAddress({...editingAddress, dni: e.target.value})} />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Teléfono</label>
                 <input className="input-delicate" required type="tel" placeholder="Sin 0 ni 15" value={editingAddress.phone} onChange={e => setEditingAddress({...editingAddress, phone: e.target.value})} />
               </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
               <div className="col-span-2 space-y-1">
                 <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Calle</label>
                 <input className="input-delicate" required value={editingAddress.street} onChange={e => setEditingAddress({...editingAddress, street: e.target.value})} />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Altura</label>
                 <input className="input-delicate" required value={editingAddress.number} onChange={e => setEditingAddress({...editingAddress, number: e.target.value})} />
               </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
               <div className="flex gap-2">
<div className="space-y-1">
   <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Piso / Depto</label>
   <input 
      className="input-delicate" 
      placeholder="Ej: 1B" 
      value={editingAddress.floor_apt} 
      onChange={e => setEditingAddress({...editingAddress, floor_apt: e.target.value})} 
   />
</div>
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Ciudad</label>
                 <input className="input-delicate" required value={editingAddress.city} onChange={e => setEditingAddress({...editingAddress, city: e.target.value})} />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">CP</label>
                 <input className="input-delicate" required value={editingAddress.zip_code} onChange={e => setEditingAddress({...editingAddress, zip_code: e.target.value})} />
               </div>
            </div>

            <div className="space-y-1">
               <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Provincia</label>
               <select className="input-delicate bg-white" required value={editingAddress.province} onChange={e => setEditingAddress({...editingAddress, province: e.target.value})}>
                  <option value="" disabled>Seleccionar...</option>
                  {ARGENTINE_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
               </select>
            </div>
            
            <div className="flex items-center gap-4 pt-4 border-t border-stone-100 mt-4">
              <button type="submit" disabled={savingAddress} className="bg-stone-900 text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors rounded-sm">
                {savingAddress ? 'Guardando...' : 'Guardar Dirección'}
              </button>
              <button type="button" onClick={() => setIsAddressFormOpen(false)} className="text-stone-500 text-xs font-bold uppercase hover:text-stone-900 transition-colors">
                Cancelar
              </button>
            </div>
         </form>
         <style>{`.input-delicate { width: 100%; padding: 8px 12px; font-size: 14px; border: 1px solid #e7e5e4; border-radius: 4px; outline: none; transition: all 0.2s; } .input-delicate:focus { border-color: #a8a29e; box-shadow: 0 0 0 1px #a8a29e; }`}</style>
      </div>
    );
  };

  // --- RENDER TABS ---
  const renderTabContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-serif text-2xl text-stone-900 mb-6">{t('account_orders')}</h3>
            
            {loadingOrders ? (
               <div className="space-y-4">
                 {[1,2].map(i => <div key={i} className="h-40 bg-stone-100 rounded-sm animate-pulse" />)}
               </div>
            ) : orders.length === 0 ? (
               <div className="text-center py-16 bg-stone-50 border border-dashed border-stone-200 rounded-sm">
                  <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500">Aún no tienes pedidos registrados.</p>
                  <button onClick={() => onNavigate && onNavigate('home')} className="mt-4 text-xs font-bold uppercase underline">Ir a comprar</button>
               </div>
            ) : (
               <div className="space-y-6">
                 {orders.map((order) => {
                    const badge = getStatusBadge(order.status, order.payment_status);
                    const BadgeIcon = badge.icon;
                    return (
                      <div key={order.id} className="bg-white border border-stone-200 rounded-sm overflow-hidden hover:shadow-lg transition-all duration-300">
                         {/* Header Orden */}
                         <div className="bg-stone-50 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-stone-100">
                            <div>
                               <div className="flex items-center gap-3">
                                  <span className="font-serif text-lg text-stone-900">Pedido #{order.id}</span>
                                  <span className="text-xs text-stone-400 font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                               </div>
                            </div>
                            <div className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold border flex items-center gap-2 ${badge.classes}`}>
                               <BadgeIcon className="w-3 h-3" /> {badge.label}
                            </div>
                         </div>

                         {/* Items */}
                         <div className="p-6 flex flex-col gap-4">
                            {order.items.map((item: any, idx: number) => {
                               // Parseamos variantes (a veces vienen como string JSON, a veces obj)
                               let opts: any = {};
                               try { opts = typeof item.variant_options === 'string' ? JSON.parse(item.variant_options) : item.variant_options; } catch(e){}
                               const variantText = [opts.Color, opts.Talla, opts.Medida].filter(Boolean).join(' / ');

                               return (
                                 <div key={idx} className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-stone-100 rounded-sm flex items-center justify-center text-stone-300">
                                       {/* Si el backend enviara imagen, iría aquí. Por ahora icono genérico si falla. */}
                                       <Package className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                       <p className="text-sm font-medium text-stone-900">{item.product_name}</p>
                                       {variantText && <p className="text-xs text-stone-500">{variantText}</p>}
                                    </div>
                                    <div className="text-right">
                                       <p className="text-xs text-stone-400">x{item.quantity}</p>
                                       <p className="text-sm font-medium text-stone-900">${Number(item.unit_price).toLocaleString()}</p>
                                    </div>
                                 </div>
                               )
                            })}
                         </div>

                         {/* Footer Total */}
                         <div className="px-6 py-4 border-t border-stone-100 flex justify-between items-center bg-stone-50/30">
                            <span className="text-xs uppercase tracking-widest text-stone-500 font-bold">Total Pagado</span>
                            <span className="font-serif text-xl text-stone-900">${Number(order.total).toLocaleString()}</span>
                         </div>
                      </div>
                    );
                 })}
               </div>
            )}
          </div>
        );

      case 'addresses':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {isAddressFormOpen ? (
               renderAddressForm()
             ) : (
               <>
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif text-2xl text-stone-900">{t('account_addresses')}</h3>
                    <button onClick={handleNewAddress} className="text-xs uppercase tracking-widest text-stone-900 border-b border-stone-900 pb-0.5 hover:opacity-70 transition-opacity">
                      + Nueva Dirección
                    </button>
                 </div>
                 
                 {loadingAddresses ? (
                    <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-stone-400"/></div>
                 ) : addresses.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-stone-200 bg-stone-50">
                       <MapPin className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                       <p className="text-stone-500 text-sm">No tienes direcciones guardadas.</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {addresses.map((addr) => (
                        <div key={addr.id} className={`p-6 border ${addr.is_default ? 'border-stone-800 bg-stone-50' : 'border-stone-200 bg-white'} rounded-sm relative group transition-all hover:shadow-md`}>
                           {addr.is_default && (
                             <span className="absolute top-4 right-4 text-[9px] uppercase tracking-widest bg-stone-900 text-white px-2 py-1 rounded-sm">Default</span>
                           )}
                           
                           <div className="flex items-center gap-2 mb-3">
                              <MapPin className="w-4 h-4 text-stone-400" />
                              <h4 className="font-bold text-sm uppercase tracking-wide">{addr.alias}</h4>
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
                              <button onClick={() => handleDeleteAddress(addr.id)} className="text-xs font-bold uppercase text-stone-400 hover:text-red-600">Eliminar</button>
                           </div>
                        </div>
                      ))}
                    </div>
                 )}
               </>
             )}
          </div>
        );

      case 'wishlist':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h3 className="font-serif text-2xl text-stone-900 mb-6">{t('account_wishlist')}</h3>
             {user.wishlist.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {user.wishlist.map((item) => (
                   <WishlistItem 
                      key={item.id} 
                      item={item} 
                      onRemove={onRemoveFromWishlist} 
                      onAddToCart={(itm, qty) => onAddToCart(itm, undefined, qty)}
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

      default: // Overview
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-stone-900 text-white p-8 md:p-12 relative overflow-hidden rounded-sm shadow-xl">
              <div className="relative z-10">
                <h2 className="font-serif text-3xl md:text-4xl mb-4">Bienvenida de nuevo, {user.name?.split(' ')[0]}.</h2>
                <p className="text-stone-400 font-light max-w-lg leading-relaxed">
                  Tu espacio personal en Azúcar. Gestiona tus pedidos recientes, direcciones de entrega y tu lista de deseos desde aquí.
                </p>
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
          
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
             <div className="hidden md:block mb-2">
                 <button 
                   onClick={() => onNavigate && onNavigate('home')}
                   className="flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors text-xs font-bold uppercase tracking-widest mb-8 group"
                 >
                   <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                   Volver a la Tienda
                 </button>

                <div className="w-20 h-20 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 mb-4 shadow-sm">
                  <UserIcon className="w-8 h-8" strokeWidth={1} />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">Cuenta Cliente</p>
                <p className="font-serif text-xl text-stone-900">{user.name}</p>
             </div>

             <nav className="flex md:flex-col gap-1 md:gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 border-b md:border-b-0 border-stone-200">
               {[
                 { id: 'overview', label: t('account_overview'), icon: UserIcon },
                 { id: 'orders', label: t('account_orders'), icon: Package },
                 { id: 'addresses', label: t('account_addresses'), icon: MapPin },
                 { id: 'wishlist', label: t('account_wishlist'), icon: Heart },
               ].map((item) => (
                 <button
                   key={item.id}
                   onClick={() => setActiveTab(item.id as Tab)}
                   className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-sm whitespace-nowrap ${
                     activeTab === item.id 
                       ? 'bg-stone-900 text-white shadow-md transform scale-[1.02]' 
                       : 'text-stone-500 hover:bg-white hover:text-stone-900'
                   }`}
                 >
                   <item.icon className="w-4 h-4" />
                   {item.label}
                 </button>
               ))}
               
               <hr className="my-4 border-stone-200 hidden md:block" />
               
               <button
                 onClick={onLogout}
                 className="flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest text-stone-400 hover:text-red-700 hover:bg-red-50 transition-colors rounded-sm w-full text-left"
               >
                 <LogOut className="w-4 h-4" />
                 {t('account_logout')}
               </button>
             </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-h-[500px]">
            {renderTabContent()}
          </main>

        </div>
      </div>
    </div>
  );
};

export default AccountDashboard;