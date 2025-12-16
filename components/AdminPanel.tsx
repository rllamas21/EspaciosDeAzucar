
import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Plus, Search, Edit2, Trash2, X, ArrowLeft, Image as ImageIcon, ChevronLeft, ChevronRight, ChevronDown, Menu, User, TrendingUp, Palette, Ruler, FileText, Tag, Layers, Archive, Check, Upload, Eye, MapPin, Phone, Mail, Calendar, CreditCard, Settings, RefreshCw } from 'lucide-react';
import { Product, Order, OrderStatus, ColorOption } from '../types';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  onProductUpdate: (product: Product) => void;
  onProductDelete: (id: string) => void;
  onOrderStatusChange: (id: string, status: OrderStatus) => void;
  onLogout: () => void;
}

type AdminView = 'dashboard' | 'products' | 'orders';
type OrderFilter = 'all' | OrderStatus;

// --- UTILS ---
const normalizeText = (text: string) => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

// --- EXPANDED COLOR PALETTE ---
const PRESET_COLORS = [
  // Metales
  { name: 'Latón', hex: '#eab308' },
  { name: 'Oro', hex: '#ffd700' },
  { name: 'Oro Antiguo', hex: '#a16207' },
  { name: 'Cobre', hex: '#b87333' },
  { name: 'Bronce', hex: '#cd7f32' },
  { name: 'Plata', hex: '#c0c0c0' },
  { name: 'Plata Vieja', hex: '#9ca3af' },
  
  // Básicos
  { name: 'Negro', hex: '#000000' },
  { name: 'Negro Mate', hex: '#171717' },
  { name: 'Blanco', hex: '#ffffff' },
  { name: 'Gris', hex: '#6b7280' },
  { name: 'Antracita', hex: '#374151' },
  
  // Maderas / Naturales
  { name: 'Roble', hex: '#a16207' },
  { name: 'Nogal', hex: '#451a03' },
  { name: 'Beige', hex: '#d6d3d1' },
  { name: 'Arena', hex: '#e7e5e4' },
  { name: 'Crema', hex: '#fef3c7' },

  // Colores Vivos
  { name: 'Amarillo', hex: '#facc15' },
  { name: 'Amarillo Ocre', hex: '#b45309' },
  { name: 'Azul', hex: '#3b82f6' },
  { name: 'Azul Marino', hex: '#1e3a8a' },
  { name: 'Verde', hex: '#22c55e' },
  { name: 'Verde Oliva', hex: '#65a30d' },
  { name: 'Verde Bosque', hex: '#14532d' },
  { name: 'Rojo', hex: '#ef4444' },
  { name: 'Vino', hex: '#9f1239' },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'processing': return { label: 'Procesando', dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' };
    case 'shipped': return { label: 'Enviado', dot: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' };
    case 'delivered': return { label: 'Entregado', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' };
    default: return { label: status, dot: 'bg-stone-400', text: 'text-stone-600', bg: 'bg-stone-100' };
  }
};

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  products, 
  orders, 
  onProductUpdate, 
  onProductDelete, 
  onOrderStatusChange, 
  onLogout
}) => {
  const [view, setView] = useState<AdminView>('dashboard');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');

  // --- PAGINATION COMPONENT ---
  const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange,
    totalItems
  }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void, totalItems: number }) => (
    <div className="flex items-center justify-between px-4 py-3 border-t border-stone-200 bg-stone-50">
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-stone-500">
            Mostrando página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span> ({totalItems} resultados)
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-stone-300 bg-white text-sm font-medium text-stone-500 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Anterior</span>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-stone-300 bg-white text-sm font-medium text-stone-500 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Siguiente</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
      {/* Mobile Simple Pagination */}
      <div className="flex sm:hidden justify-between w-full">
         <button 
           onClick={() => onPageChange(Math.max(1, currentPage - 1))}
           disabled={currentPage === 1}
           className="relative inline-flex items-center px-4 py-2 border border-stone-300 text-xs font-medium rounded-md text-stone-700 bg-white hover:bg-stone-50 disabled:opacity-50"
         >
           Anterior
         </button>
         <button 
           onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
           disabled={currentPage === totalPages}
           className="ml-3 relative inline-flex items-center px-4 py-2 border border-stone-300 text-xs font-medium rounded-md text-stone-700 bg-white hover:bg-stone-50 disabled:opacity-50"
         >
           Siguiente
         </button>
      </div>
    </div>
  );

  // --- ORDER DETAIL MODAL ---
  const OrderDetailModal = () => {
    // Local state for the status select in the modal
    const [tempStatus, setTempStatus] = useState<OrderStatus>(viewingOrder?.status || 'processing');

    useEffect(() => {
        if (viewingOrder) setTempStatus(viewingOrder.status);
    }, [viewingOrder]);

    if (!viewingOrder) return null;
    const statusConfig = getStatusConfig(viewingOrder.status);

    const handleUpdateStatus = () => {
        onOrderStatusChange(viewingOrder.id, tempStatus);
        // Optional: show a small animation or toast here
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
          onClick={() => setViewingOrder(null)}
        />
        
        <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
           {/* Header */}
           <div className="sticky top-0 bg-white border-b border-stone-200 p-4 sm:p-6 z-10">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pr-8 sm:pr-0">
                <div className="space-y-1">
                   <div className="flex items-center gap-3 flex-wrap">
                     <h3 className="font-serif text-xl sm:text-2xl text-stone-900 break-all">
                       Pedido #{viewingOrder.id}
                     </h3>
                     <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit ${statusConfig.bg} ${statusConfig.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                        {statusConfig.label}
                     </div>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-stone-500">
                      <Calendar className="w-4 h-4" />
                      <span>{viewingOrder.date}</span>
                   </div>
                </div>
                
                <button 
                  onClick={() => setViewingOrder(null)} 
                  className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
           </div>

           {/* Content */}
           <div className="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              
              {/* Left Column: Details */}
              <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                 {/* Items List */}
                 <div>
                    <h4 className="text-xs uppercase tracking-widest text-stone-400 font-bold mb-4">Productos ({viewingOrder.items.length})</h4>
                    <div className="border border-stone-200 rounded-sm overflow-hidden">
                       <table className="w-full text-left text-sm">
                          <thead className="bg-stone-50 border-b border-stone-200">
                             <tr>
                                <th className="p-3 font-medium text-stone-500">Detalle</th>
                                <th className="p-3 font-medium text-stone-500 text-center hidden sm:table-cell">Cant.</th>
                                <th className="p-3 font-medium text-stone-500 text-right">Total</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                             {viewingOrder.items.map((item, idx) => (
                                <tr key={idx}>
                                   <td className="p-3">
                                      <div className="flex items-center gap-3">
                                         <div className="w-12 h-12 bg-stone-100 rounded-sm overflow-hidden flex-shrink-0">
                                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                                         </div>
                                         <div>
                                            <p className="font-medium text-stone-900 line-clamp-1">{item.name}</p>
                                            <p className="text-xs text-stone-500">
                                               {item.selectedColor?.name} {item.selectedSize && `• ${item.selectedSize}`}
                                               <span className="sm:hidden"> • x{item.quantity}</span>
                                            </p>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="p-3 text-center hidden sm:table-cell">{item.quantity}</td>
                                   <td className="p-3 text-right font-medium">${(item.price * item.quantity).toLocaleString()}</td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              </div>

              {/* Right Column: Management & Customer */}
              <div className="space-y-6">
                 
                 {/* 1. Order Management Card */}
                 <div className="bg-white p-6 border border-stone-200 rounded-sm shadow-sm">
                    <h4 className="text-xs uppercase tracking-widest text-stone-400 font-bold mb-4 flex items-center gap-2">
                       <Settings className="w-4 h-4" /> Gestión del Pedido
                    </h4>
                    <div className="space-y-3">
                       <label className="text-xs font-bold text-stone-700">Actualizar Estado</label>
                       <div className="flex gap-2">
                          <select 
                            value={tempStatus}
                            onChange={(e) => setTempStatus(e.target.value as OrderStatus)}
                            className="bg-stone-50 border border-stone-200 text-sm rounded-sm px-3 py-2 flex-1 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all"
                          >
                             <option value="processing">Procesando</option>
                             <option value="shipped">Enviado</option>
                             <option value="delivered">Entregado</option>
                          </select>
                          <button 
                            onClick={handleUpdateStatus}
                            className="bg-stone-900 text-white px-3 py-2 rounded-sm hover:bg-stone-700 transition-colors"
                            title="Guardar Estado"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                       </div>
                       <p className="text-[10px] text-stone-400">
                         El cliente recibirá una notificación al actualizar.
                       </p>
                    </div>
                 </div>

                 {/* 2. Customer Info */}
                 <div className="bg-white p-6 border border-stone-200 rounded-sm shadow-sm">
                    <h4 className="text-xs uppercase tracking-widest text-stone-400 font-bold mb-4 flex items-center gap-2">
                       <User className="w-4 h-4" /> Cliente
                    </h4>
                    <div className="space-y-3">
                       <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-serif text-lg">
                             {viewingOrder.customerName?.[0] || 'C'}
                          </div>
                          <div>
                             <p className="font-medium text-stone-900">{viewingOrder.customerName || 'Invitado'}</p>
                             <div className="flex flex-col gap-1 mt-1">
                                <span className="text-xs text-stone-500 flex items-center gap-1.5"><Mail className="w-3 h-3" /> cliente@email.com</span>
                                <span className="text-xs text-stone-500 flex items-center gap-1.5"><Phone className="w-3 h-3" /> +54 9 11 1234 5678</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* 3. Address */}
                 <div className="bg-white p-6 border border-stone-200 rounded-sm shadow-sm">
                    <h4 className="text-xs uppercase tracking-widest text-stone-400 font-bold mb-4 flex items-center gap-2">
                       <MapPin className="w-4 h-4" /> Envío
                    </h4>
                    <address className="not-italic text-sm text-stone-600 space-y-1 pl-6 border-l-2 border-stone-100">
                       <p className="font-medium text-stone-900">{viewingOrder.customerName}</p>
                       <p>Av. Libertador 1234, Piso 5</p>
                       <p>Buenos Aires, C1425</p>
                       <p>Argentina</p>
                    </address>
                 </div>

                 {/* 4. Financial Summary & Payment Info */}
                 <div className="bg-stone-900 text-white p-6 rounded-sm shadow-md">
                    {/* Payment Info relocated here */}
                    <div className="flex items-start gap-3 mb-6 pb-6 border-b border-stone-800">
                       <CreditCard className="w-5 h-5 text-stone-400 mt-1" />
                       <div>
                          <p className="text-sm font-medium text-stone-200">Pago vía Tarjeta</p>
                          <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-1">Procesado: {viewingOrder.date}</p>
                       </div>
                    </div>

                    <div className="space-y-2 mb-4">
                       <div className="flex justify-between text-sm text-stone-400">
                          <span>Subtotal</span>
                          <span>${viewingOrder.total.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between text-sm text-stone-400">
                          <span>Envío</span>
                          <span>$0.00</span>
                       </div>
                    </div>
                    <div className="border-t border-stone-800 pt-4 flex justify-between items-baseline">
                       <span className="font-medium">Total Pagado</span>
                       <span className="font-serif text-2xl">${viewingOrder.total.toLocaleString()}</span>
                    </div>
                 </div>
              </div>

           </div>
        </div>
      </div>
    );
  };

  // 1. DASHBOARD OVERVIEW
  const DashboardStats = () => {
    const totalSales = orders.reduce((acc, order) => acc + order.total, 0);
    const pendingOrders = orders.filter(o => o.status === 'processing').length;
    
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <h2 className="text-2xl font-sans font-bold text-stone-900 tracking-tight">Resumen General</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 border border-stone-200 rounded-sm shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Ventas Totales</span>
              <div className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                 <TrendingUp className="w-3 h-3" /> +12%
              </div>
            </div>
            <div className="mt-auto">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-sans text-stone-900 tabular-nums tracking-tight">
                  ${totalSales.toLocaleString()}
                </span>
                <span className="text-xs text-stone-400 font-medium">USD</span>
              </div>
              <p className="text-[10px] text-stone-400 mt-1">Ingresos brutos del mes</p>
            </div>
          </div>

          <div className="bg-white p-6 border border-stone-200 rounded-sm shadow-sm flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
               <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Pedidos Activos</span>
            </div>
            <div className="mt-auto">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-sans text-stone-900 tabular-nums tracking-tight">
                  {pendingOrders}
                </span>
                <span className="text-sm text-stone-500 font-medium">pendientes</span>
              </div>
              <p className="text-[10px] text-stone-400 mt-1">
                {pendingOrders > 0 ? 'Requieren despacho inmediato' : 'Todo al día'}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 border border-stone-200 rounded-sm shadow-sm flex flex-col justify-between h-32">
             <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Inventario</span>
             <div className="mt-auto">
               <div className="flex items-baseline gap-2">
                 <span className="text-3xl font-bold font-sans text-stone-900 tabular-nums tracking-tight">
                   {products.length}
                 </span>
                 <span className="text-sm text-stone-500 font-medium">SKUs</span>
               </div>
               <p className="text-[10px] text-stone-400 mt-1">Productos listados en tienda</p>
             </div>
          </div>
        </div>
      </div>
    );
  };

  // 2. PRODUCT EDITOR FORM
  const ProductEditor = () => {
    const [formData, setFormData] = useState<Product>(editingProduct ? {
      ...editingProduct,
      images: editingProduct.images && editingProduct.images.length > 0 ? editingProduct.images : [editingProduct.image],
      colors: editingProduct.colors || [],
      stock: editingProduct.stock || 0
    } : {
      id: `prod-${Date.now()}`,
      name: '',
      price: 0,
      stock: 0,
      category: 'Mobiliario Signature',
      image: '',
      images: [], 
      description: '',
      dimensions: '',
      materialDetails: '',
      careInstructions: '',
      sizes: [],
      colors: []
    });

    const [sizeInput, setSizeInput] = useState('');
    const [colorQuery, setColorQuery] = useState('');
    const [colorHex, setColorHex] = useState('#e5e5e5'); 
    const [showColorSuggestions, setShowColorSuggestions] = useState(false);
    const colorInputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (colorInputRef.current && !colorInputRef.current.contains(event.target as Node)) {
          setShowColorSuggestions(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
      const match = PRESET_COLORS.find(c => c.name.toLowerCase() === colorQuery.toLowerCase());
      if (match) {
        setColorHex(match.hex);
      }
    }, [colorQuery]);

    const handleChange = (field: keyof Product, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const fileUrl = URL.createObjectURL(e.target.files[0]);
        setFormData(prev => {
          const currentImages = prev.images || [];
          const newImages = [...currentImages, fileUrl];
          return {
            ...prev,
            images: newImages,
            image: newImages[0] 
          };
        });
        e.target.value = '';
      }
    };

    const handleRemoveImage = (index: number) => {
      setFormData(prev => {
        const newImages = (prev.images || []).filter((_, i) => i !== index);
        return {
          ...prev,
          images: newImages,
          image: newImages.length > 0 ? newImages[0] : '' 
        };
      });
    };

    const handleSetMainImage = (index: number) => {
       setFormData(prev => {
        const images = [...(prev.images || [])];
        const [selected] = images.splice(index, 1);
        images.unshift(selected);
        return {
          ...prev,
          images: images,
          image: images[0]
        };
      });
    };

    const handleAddColor = () => {
      if (!colorQuery.trim()) return;
      const match = PRESET_COLORS.find(c => c.name.toLowerCase() === colorQuery.trim().toLowerCase());
      const finalHex = match ? match.hex : colorHex;
      const newColor: ColorOption = { name: colorQuery, hex: finalHex };
      setFormData(prev => ({
        ...prev,
        colors: [...(prev.colors || []), newColor]
      }));
      setColorQuery('');
      setColorHex('#e5e5e5');
    };

    const handleSelectColorSuggestion = (preset: { name: string, hex: string }) => {
      setColorQuery(preset.name);
      setColorHex(preset.hex);
      setShowColorSuggestions(false);
    };

    const handleRemoveColor = (nameToRemove: string) => {
      setFormData(prev => ({
        ...prev,
        colors: (prev.colors || []).filter(c => c.name !== nameToRemove)
      }));
    };

    const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      onProductUpdate(formData);
      setEditingProduct(null);
      setIsCreating(false);
    };

    const handleClose = () => {
      setEditingProduct(null);
      setIsCreating(false);
    };

    const filteredColors = PRESET_COLORS.filter(c => 
      c.name.toLowerCase().includes(colorQuery.toLowerCase())
    );

    return (
      <div className="fixed inset-0 z-[100] bg-stone-100 flex flex-col overflow-hidden">
        {/* FIX: Increased z-index to 50 so content scrolls BEHIND this header */}
        <div className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0 z-50">
           <div className="flex items-center gap-4">
             <button onClick={handleClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500">
               <ArrowLeft className="w-5 h-5" />
             </button>
             <h2 className="font-serif text-xl text-stone-900 font-bold">
               {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
             </h2>
           </div>
           <button 
             onClick={handleSave}
             className="bg-stone-900 text-white px-6 py-2 rounded-sm text-sm font-medium hover:bg-stone-800 transition-colors shadow-sm"
           >
             Guardar
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
           <div className="max-w-7xl mx-auto space-y-8 pb-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                 
                 {/* COL 1: GALLERY */}
                 {/* FIX: Removed 'sticky top-6' on mobile, added 'lg:sticky lg:top-6' so it scrolls normally on mobile but sticks on desktop */}
                 <div className="lg:col-span-4 bg-white border border-stone-200 rounded-sm shadow-sm p-6 relative lg:sticky lg:top-6">
                    <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-4">
                       <h3 className="text-xs uppercase tracking-widest text-stone-500 font-bold">Galería</h3>
                       <span className="text-[10px] text-stone-400">{formData.images?.length || 0} Fotos</span>
                    </div>
                    
                    <div className="space-y-4">
                        {formData.images && formData.images.length > 0 ? (
                          <div className="h-64 w-full bg-stone-100 rounded-sm overflow-hidden relative group border border-stone-200">
                             <img src={formData.images[0]} alt="Principal" className="w-full h-full object-cover" />
                             <div className="absolute top-2 left-2 bg-stone-900 text-white text-[9px] font-bold px-2 py-1 uppercase rounded-sm z-10 pointer-events-none">
                               Portada
                             </div>
                             <button 
                                type="button" 
                                onClick={(e) => { e.stopPropagation(); handleRemoveImage(0); }} 
                                className="absolute top-2 right-2 bg-white/90 hover:bg-red-500 hover:text-white text-stone-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm z-20"
                             >
                                <X className="w-4 h-4" />
                             </button>
                          </div>
                        ) : (
                          <label className="h-64 w-full bg-stone-50 border-2 border-dashed border-stone-200 rounded-sm flex flex-col items-center justify-center text-stone-400 cursor-pointer hover:bg-stone-100 hover:border-stone-300 transition-all">
                             <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                             <Upload className="w-10 h-10 mb-3 text-stone-300" />
                             <span className="text-xs font-medium uppercase tracking-widest">Agrega la imagen principal</span>
                             <span className="text-[10px] text-stone-300 mt-1">Click para subir</span>
                          </label>
                        )}

                        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar h-14">
                            {formData.images?.slice(1).map((img, index) => (
                              <div key={index + 1} onClick={() => handleSetMainImage(index + 1)} className="relative aspect-square h-full border border-stone-200 cursor-pointer group rounded-sm overflow-hidden flex-shrink-0 hover:ring-1 hover:ring-stone-900">
                                 <img src={img} alt="" className="w-full h-full object-cover" />
                                 <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveImage(index + 1); }} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                              </div>
                            ))}
                            
                            {formData.images && formData.images.length > 0 && (
                              <label className="aspect-square h-full border border-stone-200 bg-stone-50 hover:bg-stone-100 cursor-pointer rounded-sm flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors flex-shrink-0">
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                <Upload className="w-4 h-4" />
                              </label>
                            )}
                        </div>
                    </div>
                 </div>

                 {/* COL 2: IDENTITY & VARIANTS */}
                 <div className="lg:col-span-8 bg-white border border-stone-200 rounded-sm shadow-sm p-6">
                       
                       <div className="flex items-center gap-2 mb-6 border-b border-stone-100 pb-4">
                         <Tag className="w-4 h-4 text-stone-400" />
                         <h3 className="text-xs uppercase tracking-widest text-stone-500 font-bold">Identidad del Producto</h3>
                       </div>

                       <div className="space-y-6">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Nombre</label>
                            <input 
                              type="text" 
                              value={formData.name} 
                              onChange={e => handleChange('name', e.target.value)}
                              className="w-full border border-stone-300 p-2 rounded-sm focus:border-stone-900 focus:outline-none text-sm text-stone-900"
                              placeholder="Nombre del Producto..."
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Precio ($)</label>
                                <input 
                                  type="number" 
                                  value={formData.price} 
                                  onChange={e => handleChange('price', Number(e.target.value))}
                                  className="w-full border border-stone-300 p-2 rounded-sm focus:border-stone-900 focus:outline-none text-sm"
                                />
                             </div>
                             <div>
                                 <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Stock (Uni.)</label>
                                 <input 
                                   type="number" 
                                   value={formData.stock || 0} 
                                   onChange={e => handleChange('stock', Number(e.target.value))}
                                   className="w-full border border-stone-300 p-2 rounded-sm focus:border-stone-900 focus:outline-none text-sm"
                                 />
                              </div>
                             <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Categoría</label>
                                <div className="relative">
                                  <select 
                                    value={formData.category} 
                                    onChange={e => handleChange('category', e.target.value)}
                                    className="w-full border border-stone-300 p-2 rounded-sm focus:border-stone-900 focus:outline-none bg-white appearance-none cursor-pointer text-sm"
                                  >
                                    <option value="Mobiliario Signature">Mobiliario Signature</option>
                                    <option value="Sistemas Arquitectónicos">Sistemas Arquitectónicos</option>
                                    <option value="Herrajes Joya">Herrajes Joya</option>
                                  </select>
                                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-stone-400 pointer-events-none" />
                                </div>
                             </div>
                          </div>

                          <hr className="border-stone-100 my-2" />
                          
                          <div className="flex items-center gap-2 mb-2">
                             <Palette className="w-4 h-4 text-stone-400" />
                             <h4 className="text-xs uppercase tracking-widest text-stone-500 font-bold">Configuración de Variantes</h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Tamaños Disponibles</label>
                                <div className="flex flex-wrap gap-2 mb-3 min-h-[38px]">
                                  {formData.sizes?.map(size => (
                                    <span key={size} className="bg-stone-50 border border-stone-200 text-stone-800 h-9 px-3 rounded-sm flex items-center gap-2 text-sm">
                                      {size}
                                      <button type="button" onClick={() => handleChange('sizes', formData.sizes?.filter(s => s !== size))}><X className="w-3 h-3 text-stone-400 hover:text-red-600" /></button>
                                    </span>
                                  ))}
                                  {(!formData.sizes || formData.sizes.length === 0) && <span className="text-xs text-stone-300 italic pt-1">Sin tamaños</span>}
                                </div>
                                <div className="flex gap-2">
                                  <input 
                                    type="text" 
                                    placeholder="Ej. 180cm" 
                                    value={sizeInput}
                                    onChange={e => setSizeInput(e.target.value)}
                                    className="flex-1 border border-stone-300 p-2 rounded-sm text-sm focus:outline-none focus:border-stone-900"
                                  />
                                  <button 
                                    onClick={() => {
                                      if (sizeInput) {
                                        handleChange('sizes', [...(formData.sizes || []), sizeInput]);
                                        setSizeInput('');
                                      }
                                    }}
                                    type="button"
                                    className="bg-stone-900 text-white hover:bg-stone-700 px-3 rounded-sm"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                            </div>

                            <div className="relative" ref={colorInputRef}>
                                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Acabados / Colores</label>
                                
                                <div className="flex flex-col gap-2 mb-3 min-h-[38px]">
                                  {formData.colors?.map((color, idx) => (
                                    <div key={idx} className="flex items-center justify-between border border-stone-200 bg-stone-50 h-9 px-3 rounded-sm w-full">
                                      <div className="flex items-center gap-3">
                                         <div className="w-4 h-4 rounded-full border border-stone-200 shadow-sm" style={{backgroundColor: color.hex}}></div>
                                         <span className="text-sm text-stone-700 font-medium">{color.name}</span>
                                      </div>
                                      <button 
                                         type="button" 
                                         onClick={() => handleRemoveColor(color.name)}
                                         className="text-stone-300 hover:text-red-500 ml-2"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                  {(!formData.colors || formData.colors.length === 0) && <span className="text-xs text-stone-300 italic pt-1">Sin acabados</span>}
                                </div>
                                
                                <div className="flex border border-stone-300 rounded-sm focus-within:border-stone-900 transition-colors bg-white">
                                  <input 
                                    type="text" 
                                    placeholder="Ej. Oro" 
                                    value={colorQuery}
                                    onChange={e => {
                                       setColorQuery(e.target.value);
                                       setShowColorSuggestions(true);
                                    }}
                                    onFocus={() => setShowColorSuggestions(true)}
                                    className="flex-1 p-2 text-sm focus:outline-none bg-transparent"
                                  />
                                  <button 
                                    onClick={handleAddColor}
                                    type="button"
                                    className="bg-stone-900 text-white px-3 hover:bg-stone-700 transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                                  
                                {showColorSuggestions && colorQuery && filteredColors.length > 0 && (
                                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-stone-200 rounded-sm shadow-xl max-h-48 overflow-y-auto z-[9999]">
                                     {filteredColors.map((preset, idx) => (
                                       <button
                                         key={idx}
                                         type="button"
                                         onClick={() => handleSelectColorSuggestion(preset)}
                                         className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-center gap-3 border-b border-stone-50 last:border-0 transition-colors"
                                       >
                                         <div className="w-3 h-3 rounded-full border border-stone-200 flex-shrink-0" style={{backgroundColor: preset.hex}}></div>
                                         <span className="text-stone-700 font-medium">{preset.name}</span>
                                       </button>
                                     ))}
                                  </div>
                                )}
                            </div>
                          </div>
                       </div>
                    </div>
              </div>

              {/* DETAILS CARD */}
              <div className="bg-white border border-stone-200 rounded-sm shadow-sm p-6">
                 <div className="flex items-center gap-2 mb-6 border-b border-stone-100 pb-4">
                   <FileText className="w-4 h-4 text-stone-400" />
                   <h3 className="text-xs uppercase tracking-widest text-stone-500 font-bold">Detalle y Especificaciones</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <div>
                       <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Descripción Comercial</label>
                       <textarea 
                         value={formData.description} 
                         onChange={e => handleChange('description', e.target.value)}
                         className="w-full border border-stone-300 p-4 rounded-sm focus:border-stone-900 focus:outline-none h-48 resize-none leading-relaxed text-sm text-stone-600"
                         placeholder="Escribe una descripción detallada que inspire..."
                       />
                    </div>

                    <div className="space-y-6">
                       <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Dimensiones</label>
                          <input 
                           type="text" 
                           value={formData.dimensions} 
                           onChange={e => handleChange('dimensions', e.target.value)}
                           className="w-full border-b border-stone-300 py-2 rounded-none focus:border-stone-900 focus:outline-none text-sm"
                           placeholder="Ej. H 210cm x Base 110cm"
                         />
                       </div>
                       <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Materiales y Construcción</label>
                          <input 
                           type="text" 
                           value={formData.materialDetails} 
                           onChange={e => handleChange('materialDetails', e.target.value)}
                           className="w-full border-b border-stone-300 py-2 rounded-none focus:border-stone-900 focus:outline-none text-sm"
                           placeholder="Ej. Puntas PE RealTouch"
                         />
                       </div>
                       <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Instrucciones de Cuidado</label>
                          <input 
                           type="text" 
                           value={formData.careInstructions} 
                           onChange={e => handleChange('careInstructions', e.target.value)}
                           className="w-full border-b border-stone-300 py-2 rounded-none focus:border-stone-900 focus:outline-none text-sm"
                           placeholder="Ej. Limpiar en seco..."
                         />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  };

  // 3. PRODUCTS LIST
  const ProductsTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const filteredProducts = products.filter(p => 
      normalizeText(p.name).includes(normalizeText(searchTerm)) ||
      normalizeText(p.category).includes(normalizeText(searchTerm))
    );

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset to page 1 if search changes results
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-sans font-bold text-stone-900 tracking-tight">Inventario</h2>
          <button 
             onClick={() => setIsCreating(true)}
             className="bg-stone-900 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-stone-800 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nuevo Producto
          </button>
        </div>

        <div className="bg-white border border-stone-200 rounded-sm shadow-sm overflow-hidden flex flex-col">
           <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre o categoría..." 
                  className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-sm text-sm focus:outline-none focus:border-stone-900"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <span className="text-xs text-stone-400 uppercase tracking-widest ml-auto hidden sm:block">{filteredProducts.length} Resultados</span>
           </div>

           {/* Fix: Overflow container for horizontal scrolling on mobile */}
           <div className="overflow-x-auto w-full">
             <table className="w-full text-left border-collapse min-w-[800px]">
               <thead>
                 <tr className="bg-stone-50 text-xs text-stone-500 uppercase tracking-widest border-b border-stone-200">
                   <th className="p-4 font-bold w-16">Img</th>
                   <th className="p-4 font-bold">Producto</th>
                   <th className="p-4 font-bold">Categoría</th>
                   <th className="p-4 font-bold text-right">Precio</th>
                   <th className="p-4 font-bold text-center">Stock</th>
                   <th className="p-4 font-bold text-right">Acciones</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-stone-100 text-sm">
                 {paginatedProducts.map(product => (
                   <tr key={product.id} className="hover:bg-stone-50 transition-colors group">
                     <td className="p-4">
                       <div className="w-10 h-10 bg-stone-100 rounded-sm overflow-hidden">
                         <img src={product.image} alt="" className="w-full h-full object-cover" />
                       </div>
                     </td>
                     <td className="p-4 font-medium text-stone-900">{product.name}</td>
                     <td className="p-4 text-stone-500">{product.category}</td>
                     <td className="p-4 text-right font-medium">${product.price.toLocaleString()}</td>
                     <td className="p-4 text-center">
                       <span className={`px-2 py-0.5 rounded text-xs font-medium ${product.stock && product.stock > 5 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                         {product.stock || 0}
                       </span>
                     </td>
                     <td className="p-4 text-right">
                       {/* Fix: Actions always visible, removed opacity classes */}
                       <div className="flex items-center justify-end gap-2">
                         <button 
                           onClick={() => setEditingProduct(product)}
                           className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded transition-colors"
                         >
                           <Edit2 className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={() => onProductDelete(product.id)}
                           className="p-1.5 text-stone-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           
           {/* Pagination Controls */}
           <Pagination 
             currentPage={currentPage}
             totalPages={totalPages}
             onPageChange={setCurrentPage}
             totalItems={filteredProducts.length}
           />
        </div>
      </div>
    );
  };

  // 4. ORDERS LIST
  const OrdersTable = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const filteredOrders = orders.filter(o => {
      if (orderFilter !== 'all' && o.status !== orderFilter) return false;
      const term = searchTerm.toLowerCase();
      return (
        o.id.toLowerCase().includes(term) ||
        (o.customerName && o.customerName.toLowerCase().includes(term))
      );
    });

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [orderFilter, searchTerm]);

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-sans font-bold text-stone-900 tracking-tight">Pedidos</h2>
          <div className="flex bg-white border border-stone-200 rounded-sm p-1 gap-1 overflow-x-auto max-w-[50%] md:max-w-none">
             {(['all', 'processing', 'shipped', 'delivered'] as const).map(filter => (
               <button
                 key={filter}
                 onClick={() => setOrderFilter(filter)}
                 className={`px-3 py-1.5 text-xs font-medium rounded-sm capitalize transition-colors whitespace-nowrap ${orderFilter === filter ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-50'}`}
               >
                 {filter === 'all' ? 'Todos' : getStatusConfig(filter).label}
               </button>
             ))}
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-sm shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex items-center">
             <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <input 
                  type="text" 
                  placeholder="Buscar orden o cliente..." 
                  className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-sm text-sm focus:outline-none focus:border-stone-900"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
          </div>
          
          {/* Fix: Overflow container for horizontal scrolling on mobile */}
          <div className="overflow-x-auto w-full">
             <table className="w-full text-left border-collapse min-w-[800px]">
               <thead>
                 <tr className="bg-stone-50 text-xs text-stone-500 uppercase tracking-widest border-b border-stone-200">
                   <th className="p-4 font-bold">Orden #</th>
                   <th className="p-4 font-bold">Cliente</th>
                   <th className="p-4 font-bold">Fecha</th>
                   <th className="p-4 font-bold text-center">Estado</th>
                   <th className="p-4 font-bold text-right">Total</th>
                   {/* Removed Actions Column Header */}
                 </tr>
               </thead>
               <tbody className="divide-y divide-stone-100 text-sm">
                 {paginatedOrders.map(order => {
                    const statusConfig = getStatusConfig(order.status);
                    return (
                      <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                        <td className="p-4">
                           {/* Clickable ID triggers Modal */}
                           <button 
                             onClick={() => setViewingOrder(order)}
                             className="font-mono font-medium text-stone-900 hover:text-blue-600 hover:underline underline-offset-4 decoration-blue-300 transition-colors"
                           >
                             {order.id}
                           </button>
                        </td>
                        <td className="p-4 font-medium text-stone-900">{order.customerName || 'Invitado'}</td>
                        <td className="p-4 text-stone-500">{order.date}</td>
                        <td className="p-4 text-center">
                           <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border border-transparent ${statusConfig.bg} ${statusConfig.text}`}>
                             <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                             {statusConfig.label}
                           </div>
                        </td>
                        <td className="p-4 text-right font-medium">${order.total.toLocaleString()}</td>
                        {/* Removed Actions Column Data */}
                      </tr>
                    );
                 })}
               </tbody>
             </table>
          </div>

          {/* Pagination Controls */}
          <Pagination 
             currentPage={currentPage}
             totalPages={totalPages}
             onPageChange={setCurrentPage}
             totalItems={filteredOrders.length}
           />
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-stone-50 text-stone-900 font-sans overflow-hidden">
      {/* Sidebar - FIXED LAYOUT: Top 16 (Header height) on Mobile to appear below header */}
      <aside className={`fixed left-0 bottom-0 top-16 lg:top-0 lg:relative z-[50] w-64 bg-stone-900 text-stone-400 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col`}>
         {/* Fix: Hide sidebar header on mobile since main header exists */}
         <div className="h-16 hidden lg:flex items-center px-6 border-b border-stone-800">
           <span className="font-serif text-white text-xl tracking-tight">Panel Admin</span>
         </div>
         
         <nav className="flex-1 p-4 space-y-2">
            <button 
              onClick={() => { setView('dashboard'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${view === 'dashboard' ? 'bg-stone-800 text-white' : 'hover:bg-stone-800 hover:text-white'}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
            <button 
              onClick={() => { setView('products'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${view === 'products' ? 'bg-stone-800 text-white' : 'hover:bg-stone-800 hover:text-white'}`}
            >
              <Layers className="w-5 h-5" />
              <span className="text-sm font-medium">Productos</span>
            </button>
            <button 
              onClick={() => { setView('orders'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${view === 'orders' ? 'bg-stone-800 text-white' : 'hover:bg-stone-800 hover:text-white'}`}
            >
              <Archive className="w-5 h-5" />
              <span className="text-sm font-medium">Pedidos</span>
              {orders.filter(o => o.status === 'processing').length > 0 && (
                <span className="ml-auto bg-amber-500 text-stone-900 text-[10px] font-bold px-1.5 rounded-full">
                  {orders.filter(o => o.status === 'processing').length}
                </span>
              )}
            </button>
         </nav>

         <div className="p-4 border-t border-stone-800">
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-sm text-stone-500 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-stone-50">
         {/* Top Header Mobile - Z-60 to stay ABOVE sidebar (Z-50) */}
         <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-6 lg:hidden sticky top-0 z-[60]">
            <button 
              onClick={() => setView('dashboard')}
              className="font-serif text-lg text-stone-900 hover:opacity-70 transition-opacity"
            >
              Panel Admin
            </button>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-stone-600">
               <Menu className="w-6 h-6" />
            </button>
         </header>

         {/* Scrollable View Area */}
         <div className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
               {view === 'dashboard' && <DashboardStats />}
               {view === 'products' && <ProductsTable />}
               {view === 'orders' && <OrdersTable />}
            </div>
         </div>
      </main>

      {/* Product Editor Modal */}
      {(editingProduct || isCreating) && <ProductEditor />}

      {/* Order Detail Modal */}
      {viewingOrder && <OrderDetailModal />}
      
      {/* Sidebar Overlay Mobile - Z-40 to be below sidebar but above content */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[40] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminPanel;
