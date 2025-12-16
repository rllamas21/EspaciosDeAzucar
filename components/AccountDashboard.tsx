
import React, { useState } from 'react';
import { User, Package, MapPin, Heart, LogOut, ChevronRight, User as UserIcon, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { Product, User as UserType, OrderStatus, Address } from '../types';

interface AccountDashboardProps {
  user: UserType;
  onLogout: () => void;
  t: (key: string) => string;
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product, color?: any, quantity?: number) => void;
  onAddressSave?: (address: Address) => void;
  onAddressDelete?: (id: string) => void;
  onNavigate?: (view: 'home') => void;
}

type Tab = 'overview' | 'orders' | 'addresses' | 'wishlist';

// Internal component to manage individual quantity state for wishlist items
const WishlistItem: React.FC<{
  item: Product;
  onRemove: (id: string) => void;
  onAddToCart: (item: Product, quantity: number) => void;
  t: (key: string) => string;
}> = ({ item, onRemove, onAddToCart, t }) => {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex gap-4 p-4 border border-stone-100 bg-white hover:border-stone-200 transition-colors group relative">
       {/* Trash Icon - Always Visible as requested */}
       <button 
         onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
         }}
         className="absolute top-3 right-3 p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all z-10"
         title={t('wishlist_remove')}
       >
          <Trash2 className="w-4 h-4" />
       </button>

       <div className="w-24 h-24 bg-stone-100 flex-shrink-0 overflow-hidden">
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
               {/* Quantity Control inside Wishlist */}
               <div className="flex items-center border border-stone-200 rounded-full h-7 px-1">
                 <button 
                   onClick={() => setQuantity(Math.max(1, quantity - 1))}
                   className="p-1 hover:text-stone-900 text-stone-400"
                 >
                   <Minus className="w-3 h-3" />
                 </button>
                 <span className="text-xs font-medium w-5 text-center">{quantity}</span>
                 <button 
                   onClick={() => setQuantity(quantity + 1)}
                   className="p-1 hover:text-stone-900 text-stone-400"
                 >
                   <Plus className="w-3 h-3" />
                 </button>
               </div>

               <button 
                 onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(item, quantity);
                 }}
                 className="bg-stone-900 text-white text-[10px] uppercase tracking-widest px-3 py-1.5 rounded hover:bg-stone-700 transition-colors"
               >
                 {t('wishlist_add_cart')}
               </button>
            </div>
         </div>
       </div>
    </div>
  );
};

const AccountDashboard: React.FC<AccountDashboardProps> = ({ 
  user, 
  onLogout, 
  t, 
  onRemoveFromWishlist, 
  onAddToCart,
  onAddressSave,
  onAddressDelete,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  
  // Address Editing State
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);

  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case 'processing': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'shipped': return 'bg-blue-50 text-blue-800 border-blue-100';
      case 'delivered': return 'bg-stone-100 text-stone-800 border-stone-200';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch(status) {
      case 'processing': return 'En Proceso';
      case 'shipped': return 'En Camino';
      case 'delivered': return 'Entregado';
      default: return status;
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsAddressFormOpen(true);
  };

  const handleNewAddress = () => {
    setEditingAddress({
      id: '',
      name: '',
      street: '',
      city: '',
      zip: '',
      isDefault: false
    });
    setIsAddressFormOpen(true);
  };

  const renderAddressForm = () => {
    if (!editingAddress) return null;

    return (
      <div className="bg-white border border-stone-200 p-8 rounded-sm animate-in fade-in slide-in-from-bottom-2">
         <h3 className="font-serif text-2xl text-stone-900 mb-6">
           {editingAddress.id ? 'Editar Dirección' : 'Nueva Dirección'}
         </h3>
         <form 
           onSubmit={(e) => {
             e.preventDefault();
             if(onAddressSave) {
               onAddressSave(editingAddress);
               setIsAddressFormOpen(false);
             }
           }}
           className="space-y-6 max-w-lg"
         >
            <div className="space-y-1">
               <label className="text-xs uppercase tracking-widest text-stone-500 font-medium">Nombre de Etiqueta</label>
               <input 
                 type="text" 
                 required
                 placeholder="Ej. Casa, Oficina"
                 value={editingAddress.name}
                 onChange={e => setEditingAddress({...editingAddress, name: e.target.value})}
                 className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-stone-900 transition-colors"
               />
            </div>
            <div className="space-y-1">
               <label className="text-xs uppercase tracking-widest text-stone-500 font-medium">Calle y Altura</label>
               <input 
                 type="text" 
                 required
                 placeholder="Ej. Av. Libertador 1234, 5B"
                 value={editingAddress.street}
                 onChange={e => setEditingAddress({...editingAddress, street: e.target.value})}
                 className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-stone-900 transition-colors"
               />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-stone-500 font-medium">Ciudad</label>
                  <input 
                    type="text" 
                    required
                    value={editingAddress.city}
                    onChange={e => setEditingAddress({...editingAddress, city: e.target.value})}
                    className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-stone-900 transition-colors"
                  />
               </div>
               <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest text-stone-500 font-medium">Código Postal</label>
                  <input 
                    type="text" 
                    required
                    value={editingAddress.zip}
                    onChange={e => setEditingAddress({...editingAddress, zip: e.target.value})}
                    className="w-full border-b border-stone-300 py-2 focus:outline-none focus:border-stone-900 transition-colors"
                  />
               </div>
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer">
               <input 
                 type="checkbox"
                 checked={editingAddress.isDefault}
                 onChange={e => setEditingAddress({...editingAddress, isDefault: e.target.checked})}
                 className="accent-stone-900 w-4 h-4"
               />
               <span className="text-sm text-stone-600">Establecer como predeterminada</span>
            </label>

            <div className="flex items-center gap-4 pt-4">
              <button 
                type="submit" 
                className="bg-stone-900 text-white px-6 py-3 text-sm font-medium hover:bg-stone-700 transition-colors rounded-sm"
              >
                Guardar Dirección
              </button>
              <button 
                type="button" 
                onClick={() => setIsAddressFormOpen(false)}
                className="text-stone-500 text-sm hover:text-stone-900 transition-colors"
              >
                Cancelar
              </button>
            </div>
         </form>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-serif text-2xl text-stone-900 mb-6">{t('account_orders')}</h3>
            {user.orders.map((order) => (
              <div key={order.id} className="bg-white border border-stone-200 p-6 rounded-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-stone-100 pb-4 mb-4 gap-4">
                  <div>
                    <span className="text-xs font-bold tracking-widest text-stone-400 uppercase block mb-1">Pedido #{order.id}</span>
                    <span className="text-sm text-stone-600">{order.date}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <span className="font-serif text-lg text-stone-900">${order.total.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-stone-100 overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                      </div>
                      <div>
                        <p className="font-serif text-stone-900">{item.name}</p>
                        <p className="text-xs text-stone-500">
                          {item.selectedColor?.name} {item.selectedSize && `• ${item.selectedSize}`} • Cantidad: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
                    <button 
                      onClick={handleNewAddress}
                      className="text-xs uppercase tracking-widest text-stone-900 border-b border-stone-900 pb-0.5 hover:opacity-70 transition-opacity"
                    >
                      + Nueva Dirección
                    </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {user.addresses.map((addr) => (
                     <div key={addr.id} className={`p-6 border ${addr.isDefault ? 'border-stone-800' : 'border-stone-200'} bg-white rounded-sm relative group`}>
                       {addr.isDefault && (
                         <span className="absolute top-4 right-4 text-[10px] uppercase tracking-widest text-stone-400 font-medium">Predeterminada</span>
                       )}
                       <h4 className="font-serif text-lg mb-2">{addr.name}</h4>
                       <div className="text-sm text-stone-600 space-y-1 font-light">
                         <p>{user.name}</p>
                         <p>{addr.street}</p>
                         <p>{addr.city}, {addr.zip}</p>
                       </div>
                       {/* REMOVED OPACITY CLASSES HERE TO KEEP BUTTONS VISIBLE */}
                       <div className="mt-6 flex gap-4">
                         <button 
                            onClick={() => handleEditAddress(addr)}
                            className="text-xs font-medium text-stone-900 hover:text-stone-600"
                         >
                           Editar
                         </button>
                         {!addr.isDefault && (
                           <button 
                              onClick={() => onAddressDelete && onAddressDelete(addr.id)}
                              className="text-xs font-medium text-stone-400 hover:text-red-700"
                           >
                              Eliminar
                           </button>
                         )}
                       </div>
                     </div>
                   ))}
                   {/* Empty State / Add New Card */}
                   <button 
                      onClick={handleNewAddress}
                      className="p-6 border border-dashed border-stone-200 rounded-sm flex flex-col items-center justify-center text-stone-400 hover:border-stone-400 hover:text-stone-600 transition-all min-h-[200px]"
                   >
                      <Plus className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs uppercase tracking-widest">Agregar Nueva</span>
                   </button>
                 </div>
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
            <div className="bg-stone-900 text-white p-8 md:p-12 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="font-serif text-3xl md:text-4xl mb-4">Bienvenida de nuevo, {user.name}.</h2>
                <p className="text-stone-400 font-light max-w-lg leading-relaxed">
                  Tu espacio personal en Azúcar. Gestiona tus proyectos arquitectónicos y sigue el estado de tus piezas signature desde aquí.
                </p>
              </div>
              <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div 
                 onClick={() => setActiveTab('orders')}
                 className="group cursor-pointer border border-stone-200 p-6 hover:border-stone-900 transition-colors bg-white"
               >
                 <Package className="w-6 h-6 text-stone-400 mb-4 group-hover:text-stone-900 transition-colors" strokeWidth={1.5} />
                 <h4 className="font-serif text-lg mb-1">{t('account_orders')}</h4>
                 <p className="text-sm text-stone-500">{user.orders.filter(o => o.status !== 'delivered').length} en proceso</p>
                 <div className="mt-4 flex justify-end">
                   <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-900 transition-colors" />
                 </div>
               </div>

               <div 
                 onClick={() => setActiveTab('addresses')}
                 className="group cursor-pointer border border-stone-200 p-6 hover:border-stone-900 transition-colors bg-white"
               >
                 <MapPin className="w-6 h-6 text-stone-400 mb-4 group-hover:text-stone-900 transition-colors" strokeWidth={1.5} />
                 <h4 className="font-serif text-lg mb-1">{t('account_addresses')}</h4>
                 <p className="text-sm text-stone-500">{user.addresses.length} guardadas</p>
                 <div className="mt-4 flex justify-end">
                   <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-900 transition-colors" />
                 </div>
               </div>

               <div 
                 onClick={() => setActiveTab('wishlist')}
                 className="group cursor-pointer border border-stone-200 p-6 hover:border-stone-900 transition-colors bg-white"
               >
                 <Heart className="w-6 h-6 text-stone-400 mb-4 group-hover:text-stone-900 transition-colors" strokeWidth={1.5} />
                 <h4 className="font-serif text-lg mb-1">{t('account_wishlist')}</h4>
                 <p className="text-sm text-stone-500">{user.wishlist.length} artículos</p>
                 <div className="mt-4 flex justify-end">
                   <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-900 transition-colors" />
                 </div>
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
                 {/* Back to Home Button - EXPLICIT EXIT */}
                 <button 
                   onClick={() => onNavigate && onNavigate('home')}
                   className="flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors text-sm font-medium mb-6 group"
                 >
                   <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                   Volver a la Tienda
                 </button>

                <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 mb-4">
                  <UserIcon className="w-8 h-8" strokeWidth={1} />
                </div>
                <p className="text-xs uppercase tracking-widest text-stone-400">Cuenta Cliente</p>
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
                   className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-md whitespace-nowrap ${
                     activeTab === item.id 
                       ? 'bg-stone-900 text-white' 
                       : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
                   }`}
                 >
                   <item.icon className="w-4 h-4" />
                   {item.label}
                 </button>
               ))}
               
               <hr className="my-4 border-stone-200 hidden md:block" />
               
               <button
                 onClick={onLogout}
                 className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-stone-500 hover:text-red-700 hover:bg-red-50 transition-colors rounded-md w-full text-left"
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
