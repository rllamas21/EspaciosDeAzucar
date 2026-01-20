import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import SizeModal from './components/SizeModal';
import MenuSidebar from './components/MenuSidebar';
import AuthModal from './components/AuthModal';
import AccountDashboard from './components/AccountDashboard';
import InfoPage from './components/InfoPage';
import ProductDetailModal from './components/ProductDetailModal'; 
import CheckoutPage from './pages/CheckoutPage'; 
import api from './lib/api';
import { useAuth } from './context/AuthContext';
import { CartItem, Product, Category, ColorOption, Language } from './types';
import { ArrowDown, Check, Loader2, Info } from 'lucide-react';

// --- COMPONENTE DE ÍCONOS DE PAGO ---
const PaymentIcons = () => (
  <div className="flex items-center justify-center gap-4 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
    <div className="h-6 w-10 bg-stone-200 rounded flex items-center justify-center" title="Visa"><span className="font-bold text-[10px] italic text-stone-600">VISA</span></div>
    <div className="h-6 w-10 bg-stone-200 rounded flex items-center justify-center relative overflow-hidden" title="Mastercard"><div className="w-3 h-3 bg-stone-400 rounded-full -mr-1"></div><div className="w-3 h-3 bg-stone-500 rounded-full -ml-1"></div></div>
    <div className="h-6 w-10 bg-stone-200 rounded flex items-center justify-center" title="Amex"><span className="font-bold text-[8px] text-stone-600 tracking-tighter">AMEX</span></div>
     <div className="h-6 w-10 bg-stone-200 rounded flex items-center justify-center gap-0.5" title="MercadoPago"><span className="text-[8px] font-bold text-stone-600">MP</span><div className="w-1 h-1 bg-blue-400 rounded-full"></div></div>
  </div>
);

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  ES: {
    navbar_collections: 'Colecciones',
    search_placeholder: 'Buscar productos...',
    cart_title: 'Tu Selección',
    cart_empty: 'Tu carrito está vacío',
    cart_empty_sub: 'Explora nuestro catálogo',
    payment_method: 'Método de Pago',
    total: 'Total',
    checkout: 'Finalizar Compra',
    menu_login: 'Iniciar Sesión / Registrarse',
    menu_guest: 'Invitado',
    menu_home: 'Inicio',
    menu_categories: 'Categorías',
    menu_editorial: 'Editorial',
    menu_explore_collections: 'Explorar Colecciones',
    menu_furniture: 'Mobiliario',
    menu_arch: 'Sistemas',
    menu_hardware: 'Herrajes',
    menu_studio: 'Estudio',
    menu_projects: 'Proyectos',
    menu_philosophy: 'Filosofía',
    menu_services: 'Servicios',
    menu_view_all: 'Ver Todo',
    footer_shipping: 'Envíos',
    footer_returns: 'Devoluciones',
    toast_added: 'agregado',
    toast_cart: 'Carrito Actualizado',
    toast_info: 'Información',
    no_results_title: 'Catálogo en preparación',
    no_results_text: 'Estamos organizando nuestros productos. Pronto encontrarás aquí nuestro catalogo.',
    toast_welcome: 'Bienvenida',
    toast_welcome_sub: 'Acceso concedido',
    wishlist_login_required: 'Inicia sesión para guardar',
    wishlist_added: 'Guardado en favoritos',
    wishlist_removed: 'Eliminado de favoritos',
    account_overview: 'Resumen de Cuenta',
    account_orders: 'Mis Pedidos',
    account_addresses: 'Mis Direcciones',
    account_wishlist: 'Lista de Deseos',
    account_logout: 'Cerrar Sesión',
    account_welcome: 'Bienvenida de nuevo',
    account_dashboard_desc: 'Tu espacio personal en Azúcar. Gestiona tus proyectos arquitectónicos y sigue el estado de tus piezas signature desde aquí.',
    account_no_orders: 'No tienes pedidos en curso.',
    account_no_addresses: 'No hay direcciones guardadas.',
    account_no_wishlist: 'Tu lista de deseos está vacía.'
  },
  EN: { 
    navbar_collections: 'Collections', 
    search_placeholder: 'Search...', 
    cart_title: 'Your Selection', 
    cart_empty: 'Empty', 
    cart_empty_sub: 'Explore', 
    payment_method: 'Payment', 
    total: 'Total', 
    checkout: 'Checkout', 
    menu_login: 'Login/Register', 
    menu_guest: 'Guest',
    menu_home: 'Home', 
    menu_categories: 'Categories',
    menu_editorial: 'Editorial',
    menu_explore_collections: 'Explore Collections', 
    menu_furniture: 'Furniture',
    menu_arch: 'Systems',
    menu_hardware: 'Hardware',
    menu_studio: 'Studio',
    menu_projects: 'Projects',
    menu_philosophy: 'Philosophy',
    menu_services: 'Services',
    menu_view_all: 'View All', 
    footer_shipping: 'Shipping', 
    footer_returns: 'Returns', 
    toast_added: 'added', 
    toast_cart: 'Updated', 
    toast_info: 'Info', 
    no_results_title: 'Catalog prep', 
    no_results_text: 'Coming soon.', 
    toast_welcome: 'Welcome', 
    toast_welcome_sub: 'Access granted', 
    wishlist_login_required: 'Login required', 
    wishlist_added: 'Saved', 
    wishlist_removed: 'Removed',
    account_overview: 'Account Overview',
    account_orders: 'My Orders',
    account_addresses: 'My Addresses',
    account_wishlist: 'Wishlist',
    account_logout: 'Log Out',
    account_welcome: 'Welcome back',
    account_dashboard_desc: 'Your personal space at Azúcar. Manage your architectural projects and track your signature pieces from here.',
    account_no_orders: 'No active orders.',
    account_no_addresses: 'No saved addresses.',
    account_no_wishlist: 'Your wishlist is empty.'
  },
  PT: { 
    navbar_collections: 'Coleções', 
    search_placeholder: 'Procurar...', 
    cart_title: 'Sua Seleção', 
    cart_empty: 'Vazio', 
    cart_empty_sub: 'Explore', 
    payment_method: 'Pagamento', 
    total: 'Total', 
    checkout: 'Finalizar', 
    menu_login: 'Login/Registrar', 
    menu_guest: 'Convidado',
    menu_home: 'Início', 
    menu_categories: 'Categorias',
    menu_editorial: 'Editorial',
    menu_explore_collections: 'Explorar Coleções',
    menu_furniture: 'Mobiliário',
    menu_arch: 'Sistemas',
    menu_hardware: 'Ferragens',
    menu_studio: 'Estúdio',
    menu_projects: 'Projetos',
    menu_philosophy: 'Filosofia',
    menu_services: 'Serviços',
    menu_view_all: 'Ver Tudo', 
    footer_shipping: 'Envios', 
    footer_returns: 'Devoluções', 
    toast_added: 'adicionado', 
    toast_cart: 'Atualizado', 
    toast_info: 'Informação', 
    no_results_title: 'Catálogo prep', 
    no_results_text: 'Em breve.', 
    toast_welcome: 'Bem-vindo', 
    toast_welcome_sub: 'Acesso concedido', 
    wishlist_login_required: 'Login necessário', 
    wishlist_added: 'Salvo', 
    wishlist_removed: 'Removido',
    account_overview: 'Resumo da Conta',
    account_orders: 'Meus Pedidos',
    account_addresses: 'Meus Endereços',
    account_wishlist: 'Lista de Desejos',
    account_logout: 'Sair',
    account_welcome: 'Bem-vindo de volta',
    account_dashboard_desc: 'Seu espaço pessoal na Azúcar. Gerencie seus projetos arquitetônicos e acompanhe suas peças signature aqui.',
    account_no_orders: 'Sem pedidos ativos.',
    account_no_addresses: 'Sem endereços salvos.',
    account_no_wishlist: 'Sua lista de desejos está vazia.'
  }
};

type ViewState = 'home' | 'account' | 'shipping' | 'returns' | 'checkout' | 'checkout_return'; 

const CheckoutReturn: React.FC<{
  orderId: number | null;
  onGoHome: () => void;
}> = ({ orderId, onGoHome }) => {
  const [countdown, setCountdown] = useState(6);
  const [loading, setLoading] = useState(true);

  // 1. LÓGICA DE ESTADO INICIAL (LA VERDAD DE LA URL)
  // Esto decide qué mostrar en el milisegundo 0. Sin spinners dobles.
  const [uiStatus, setUiStatus] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const mpStatus = params.get('status') || params.get('collection_status');

    if (mpStatus === 'approved') return 'approved'; // Muestra Verde ya
    if (mpStatus === 'failure' || mpStatus === 'rejected') return 'failed'; // Muestra Rojo ya
    return 'pending'; // Solo muestra spinner si MP dice pending o null
  });

  const [uiReason, setUiReason] = useState<string | null>(null);

  // 2. VERIFICACIÓN DE SEGURIDAD (BACKEND)
  // Aunque ya mostremos verde/rojo, le preguntamos a TU base de datos para confirmar stock
  useEffect(() => {
    if (!orderId) return;

    let intervalId: ReturnType<typeof setInterval>;

    const checkStatus = async () => {
      try {
        const { data } = await api.get(`/api/store/checkout/order-status?orderId=${orderId}`);
        
        // Lo que dice tu base de datos
        const dbStatus = data?.ui?.status; 
        const dbReason = data?.ui?.reason;

        // REGLA DE ORO: Solo cambiamos la pantalla si el backend reporta un problema GRAVE
        // o si confirma la transacción final.
        
        if (dbStatus === 'exception') {
             // Caso crítico: Pagó (URL approved) pero no hay stock (Backend exception)
             // Aquí cambiamos de Verde a Rojo/Alerta.
             setUiStatus('exception');
             setUiReason(dbReason);
             setLoading(false);
             clearInterval(intervalId);
        } 
        else if (dbStatus === 'approved') {
             // Confirmación total. Sigue verde.
             setLoading(false);
             clearInterval(intervalId);
        }
        else if (dbStatus === 'failed' && uiStatus !== 'failed') {
             // Si el backend se dio cuenta que falló y la URL decía otra cosa (raro), corregimos.
             setUiStatus('failed');
             setLoading(false);
             clearInterval(intervalId);
        }

      } catch (e) {
        console.error("Error polling backend:", e);
      }
    };

    checkStatus();
    intervalId = setInterval(checkStatus, 3000);
    return () => clearInterval(intervalId);
  }, [orderId, uiStatus]);

  // 3. CUENTA REGRESIVA
  useEffect(() => {
    // Si hay error, excepción o sigue pendiente real, NO bajamos contador
    if (uiStatus === 'exception' || uiStatus === 'failed' || uiStatus === 'pending') return;
    
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [uiStatus]);

  useEffect(() => {
    if (countdown <= 0) onGoHome();
  }, [countdown, onGoHome]);

  // --- RENDERIZADO ---
  const isGreen = uiStatus === 'approved';
  const isRed = uiStatus === 'exception' || uiStatus === 'failed' || uiStatus === 'expired';

  let title = 'Procesando pago...';
  let desc = 'Estamos conectando con el procesador de pagos...';

  if (uiStatus === 'approved') {
    title = '¡Pago confirmado!';
    desc = 'Tu pago fue exitoso. Te enviamos el detalle por correo.';
  } else if (uiStatus === 'failed') {
    title = 'Pago rechazado';
    desc = 'El procesador de pagos rechazó la transacción. Intenta con otro medio.';
  } else if (uiStatus === 'expired') {
    title = 'Tiempo agotado';
    desc = 'La sesión de pago expiró.';
  } else if (uiStatus === 'exception') {
    title = 'Atención: Problema de Stock';
    if (uiReason === 'paid_no_stock_refund') {
       desc = 'Tu pago entró tarde y el producto se agotó. Te contactaremos para el reembolso inmediato.';
    } else {
       desc = 'Hubo una inconsistencia técnica con el stock. Tu dinero está seguro. Contacta soporte.';
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-lg shadow-xl max-w-md w-full text-center border border-stone-100">
        
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300 ${
            isGreen ? 'bg-green-100' : isRed ? 'bg-red-100' : 'bg-stone-100'
        }`}>
          {uiStatus === 'pending' ? (
             <Loader2 className="w-10 h-10 animate-spin text-stone-500" />
          ) : isGreen ? (
             <Check className="w-10 h-10 text-green-600" />
          ) : (
             <Info className="w-10 h-10 text-red-600" />
          )}
        </div>

        <h2 className="font-serif text-3xl text-stone-900 mb-2">{title}</h2>

        {orderId && <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Orden #{orderId}</p>}

        <p className={`text-sm leading-relaxed mb-6 ${isRed ? 'text-stone-800 font-medium' : 'text-stone-500'}`}>
           {desc}
        </p>

        {uiStatus === 'exception' ? (
           <button onClick={() => window.open('https://wa.me/XXXXXXXX', '_blank')} className="w-full bg-red-600 text-white py-4 rounded font-bold uppercase tracking-widest hover:bg-red-700 transition-colors mb-3">
             Contactar Soporte
           </button>
        ) : (
           <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-6">
              {uiStatus === 'pending' ? 'Verificando...' : `Redirigiendo en ${countdown}s...`}
           </div>
        )}

        <button onClick={onGoHome} className="w-full bg-stone-900 text-white py-4 rounded font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors">
          {isRed || uiStatus === 'failed' ? 'Volver e intentar de nuevo' : 'Ir a la tienda ahora'}
        </button>

      </div>
    </div>
  );
};



const App: React.FC = () => {
  const { user, logout, loading: authLoading } = useAuth(); 
  const [view, setView] = useState<ViewState>('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); 
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isStoreSuspended, setIsStoreSuspended] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');  
  const [language, setLanguage] = useState<Language>('ES');
  const t = (key: string) => TRANSLATIONS[language][key] || key;
  const [toast, setToast] = useState<{message: string, title?: string, visible: boolean}>({ message: '', visible: false });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [initialModalColor, setInitialModalColor] = useState<ColorOption | undefined>(undefined);
  const [sizeModal, setSizeModal] = useState<{ isOpen: boolean; product: Product | null; selectedColor: ColorOption | null; }>({ isOpen: false, product: null, selectedColor: null });
  const [localWishlist, setLocalWishlist] = useState<Product[]>([]);
  const [returnStatus, setReturnStatus] = useState<string | null>(null);
  const [lastOrderId, setLastOrderId] = useState<number | null>(null);


useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const orderIdParam = params.get('orderId');

  if (orderIdParam) {
    const parsed = Number(orderIdParam);
    if (!Number.isNaN(parsed)) setLastOrderId(parsed);

    setView('checkout_return');

    // limpia querystring pero deja la ruta
    window.history.replaceState({}, '', '/checkout/return');
  }
}, []);




  

 // --- SINCRONIZACIÓN DE CARRITO CON BACKEND (Persistencia F5) ---
  useEffect(() => {
    if (authLoading) return;

    const syncCart = async () => {
      if (user) {
        try {
          const { data } = await api.get('/api/store/cart');
          
          if (data && data.items) {
            // 🎨 MAPA MAESTRO DE COLORES (Sincronizado con Backend)
            // Si agregas un color nuevo en el futuro, agrégalo aquí también.
            const COLOR_MAP: Record<string, string> = {
              'negro': '#000000', 'black': '#000000',
              'blanco': '#FFFFFF', 'white': '#FFFFFF',
              'rojo': '#EF4444', 'red': '#EF4444',
              'azul': '#3B82F6', 'blue': '#3B82F6',
              'verde': '#10B981', 'green': '#10B981',
              'amarillo': '#F59E0B', 'yellow': '#F59E0B',
              'gris': '#6B7280', 'grey': '#6B7280',
              'beige': '#F5F5DC',
              'rosa': '#EC4899', 'pink': '#EC4899',
              'marron': '#78350F', 'brown': '#78350F',
              'naranja': '#F97316', 'orange': '#F97316',
              'violeta': '#8B5CF6', 'purple': '#8B5CF6',
              'celeste': '#60A5FA',
              'turquesa': '#14B8A6',
              'fucsia': '#D946EF',
              'dorado': '#FCD34D',
              'plateado': '#9CA3AF',
              'carbón': '#1F2937', 'carbon': '#1F2937',
              'azul marino': '#1E3A8A', 'navy': '#1E3A8A',
              'gris piedra': '#A8A29E', 'stone': '#A8A29E',
              'crema': '#FFFDD0',
              'verde oliva': '#808000',
              'bordó': '#800000',
              'lila': '#C8A2C8'
            };

            const savedItems = data.items.map((item: any) => {
              // Recuperamos el nombre del color (puede venir como 'Color' o 'color')
              const colorName = item.fixed_variant_options?.Color || item.fixed_variant_options?.color;
              
              // Reconstruimos el objeto visual del color
              let colorObj = undefined;
              
              if (colorName) {
                 const key = colorName.toLowerCase().trim();
                 colorObj = { 
                    name: colorName, 
                    // Si el color no existe en el mapa, usamos un gris claro (#E5E7EB) para que no se rompa
                    hex: COLOR_MAP[key] || '#E5E7EB' 
                 };
              }

              return {
  id: String(item.product_id ?? item.fixed_product_id ?? item.productId), // ✅ PRODUCT ID
  cartItemId: String(item.id), // ✅ DB cart row id
  selectedVariantId: Number(item.variant_id), // ✅ VARIANT ID

  name: item.fixed_product_name,
  price: parseFloat(item.unit_price_snapshot),
  quantity: item.quantity,
  image: item.fixed_image_snapshot || '',
  selectedColor: colorObj,
  selectedSize: item.fixed_variant_options?.Talla
    || item.fixed_variant_options?.Medida
    || item.fixed_variant_options?.size
    || item.fixed_variant_options?.Size
};

            });

            setCart(savedItems);
          }
        } catch (err) {
          console.error("Error sincronizando carrito:", err);
        }
      } else {
        setCart([]);
      }
    };

    syncCart();
  }, [user, authLoading]);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/store/products');
        
        const mappedProducts: Product[] = data.products.map((p: any) => ({
          id: String(p.id),
          name: p.name,
          price: p.price,
          category: p.category,
          image: p.image,
          description: p.description || '',      
          variants: p.variants || [],      
          images: p.images || [p.image],  
          colors: p.colors || [],
          sizes: p.sizes || [],
          allAttributes: p.allAttributes
        }));
        setProducts(mappedProducts);
        setIsStoreSuspended(false); 

      } catch (error: any) {
        console.error("Error cargando catálogo:", error);
        if (error.response && error.response.status === 403) {
           setIsStoreSuspended(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  // --- HANDLERS (FUNCIONES DE LA APP) ---

  const showToast = (message: string, title?: string) => { 
    setToast({ message, title, visible: true }); 
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000); 
  };

  const handleAuthSuccess = () => { 
    setIsAuthModalOpen(false); 
    showToast(t('toast_welcome_sub'), t('toast_welcome')); 
  };

  const handleLogout = () => { 
    logout(); 
    setLocalWishlist([]); 
    setView('home'); 
    showToast('Has cerrado sesión correctamente', t('toast_info')); 
  };

  const handleCheckoutComplete = () => { 
    setCart([]); 
    showToast("Pedido realizado con éxito", "Éxito"); 
  };

  const handleAddToCartRequest = (product: Product, color?: ColorOption, size?: string, quantity = 1) => { 
    if (size) { 
      commitAddToCart(product, color, size, quantity); 
    } else if (product.sizes && product.sizes.length > 0) { 
      setSizeModal({ isOpen: true, product, selectedColor: color || null }); 
    } else { 
      commitAddToCart(product, color, undefined, quantity); 
    } 
  };

  const confirmSizeSelection = (size: string) => { 
    if (sizeModal.product) { 
      commitAddToCart(sizeModal.product, sizeModal.selectedColor || undefined, size, 1); 
      setSizeModal({ isOpen: false, product: null, selectedColor: null }); 
    } 
  };

  const handleToggleWishlist = (product: Product) => { 
    if (!user) { 
      setAuthMode('login'); 
      setIsAuthModalOpen(true); 
      showToast(t('wishlist_login_required'), t('toast_info')); 
      return; 
    } 
    const exists = localWishlist.find(item => item.id === product.id); 
    if (exists) { 
      setLocalWishlist(prev => prev.filter(item => item.id !== product.id)); 
      showToast(t('wishlist_removed'), t('toast_info')); 
    } else { 
      setLocalWishlist(prev => [...prev, product]); 
      showToast(t('wishlist_added'), t('toast_info')); 
    } 
  };


  const commitAddToCart = async (product: Product, color?: ColorOption, size?: string, quantity: number = 1) => {
    const foundVariant = product.variants?.find((v: any) => {
      const matchColor = color ? v.attributes?.Color === color.name : true;
      const matchSize = size ? (v.attributes?.Talla === size || v.attributes?.Medida === size) : true;
      return matchColor && matchSize;
    });

    let realDbId: string | null = null;

    if (user && foundVariant) {
      try { 

         const { data } = await api.post('/api/store/cart/items', { variantId: foundVariant.id, quantity }); 
         if (data && data.item) {
             realDbId = String(data.item.id);
         }
      } 
      catch (err) { console.error("Error DB", err); }
    }

    const variantImage = foundVariant?.image;

    setCart(prev => {

      const cartItemId = realDbId 
          ? String(realDbId) 
          : (foundVariant ? String(foundVariant.id) : `${product.id}-${color?.name || ''}`);
      
      const existing = prev.find(item => String(item.cartItemId) === cartItemId);
      
      if (existing) {
        return prev.map(item => String(item.cartItemId) === cartItemId ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, image: variantImage || product.image, quantity, selectedColor: color, selectedSize: size, cartItemId, selectedVariantId: foundVariant?.id }];

    });
    showToast(`${product.name} ${t('toast_added')}`, t('toast_cart'));
  };


  const handleRemoveItem = async (cartItemId: string) => {
    setCart(prev => prev.filter(i => i.cartItemId !== cartItemId));

    if (user) {
      try {
     
        await api.delete(`/api/store/cart/items/${cartItemId}`);
        showToast("Producto eliminado", t('toast_info'));
      } catch (err) {
        console.error("Error eliminando item de DB:", err);
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  const dynamicCategories = ['Todos', ...new Set(products.map(p => p.category))];

  // 1. Evitar parpadeo: Si está cargando
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-stone-50 text-stone-400">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="mt-4 text-[10px] uppercase tracking-[0.3em]">Cargando...</p>
      </div>
    );
  }

  // --- BLOQUEO DE SEGURIDAD: PANTALLA DE MANTENIMIENTO ---
  if (isStoreSuspended) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white p-10 rounded-lg shadow-xl border border-stone-100 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl text-stone-900 mb-4">Tienda en Pausa</h1>
          <p className="text-stone-500 leading-relaxed mb-8">
            Estamos realizando ajustes en nuestro catálogo. <br className="hidden md:block"/>
            Por favor, vuelve a intentarlo en unos minutos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans selection:bg-stone-200 selection:text-stone-900 flex flex-col">
      
      {/* 1. NAVBAR: Solo se muestra si NO estamos en checkout */}
      {view !== 'checkout' && view !== 'checkout_return' && (
        <Navbar 
          cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} 
          onOpenCart={() => setIsCartOpen(true)} 
          onOpenMenu={() => setIsMenuOpen(true)} 
          isMenuOpen={isMenuOpen} 
          onSearch={setSearchQuery} 
          onSearchSubmit={() => {}} 
          language={language} 
          setLanguage={setLanguage} 
          t={t} 
          onNavigate={(v) => { if (v === 'home' || v === 'collections' || v === 'account') { setView(v as ViewState); window.scrollTo({top:0, behavior:'smooth'}); }}} 
          user={user ? { ...user, role: 'client', wishlist: localWishlist, addresses: [], orders: [] } : null} 
          onLoginClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }} 
        />
      )}
      
      {/* 2. DRAWER DEL CARRITO (Queda afuera de la condición del Navbar) */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        onUpdateQuantity={(id, d) => {
  setCart(prev => {
    const next = prev
      .map(i => i.cartItemId === id ? { ...i, quantity: Math.max(0, i.quantity + d) } : i)
      .filter(i => i.quantity > 0);

    const updated = next.find(i => i.cartItemId === id);
    if (user) {
      if (updated) {
        api.put(`/api/store/cart/items/${id}`, { quantity: updated.quantity }).catch(console.error);
      } else {
        api.delete(`/api/store/cart/items/${id}`).catch(console.error);
      }
    }
    return next;
  });
}}

        
        onRemoveItem={handleRemoveItem} 
        
        t={t} 

        onCheckout={() => { 
          if (user) {
             setIsCartOpen(false); 
             setView('checkout'); 
             window.scrollTo(0,0);
          } else {
             setIsCartOpen(false);
             setAuthMode('login');
             setIsAuthModalOpen(true);
             showToast("Inicia sesión para finalizar compra", "Cuenta Requerida");
          }
        }} 
      />

      {/* 3. SIDEBAR MENU */}
      <MenuSidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onSelectCategory={(c) => { setActiveCategory(c); setView('home'); setIsMenuOpen(false); }} 
        availableCategories={dynamicCategories} 
        language={language} 
        setLanguage={setLanguage} 
        onLoginClick={(mode) => { setAuthMode(mode); setIsAuthModalOpen(true); }} 
        t={t} 
        onNavigate={(v) => { setView(v as ViewState); setIsMenuOpen(false); }} 
        user={user ? { ...user, role: 'client', wishlist: localWishlist, addresses: [], orders: [] } : null} 
        onLogout={handleLogout} 
        onShowMessage={(msg) => showToast(msg, t('toast_info'))} 
      />

      {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialMode={authMode} onLogin={handleAuthSuccess} />}
      {sizeModal.isOpen && <SizeModal isOpen={sizeModal.isOpen} onClose={() => setSizeModal(prev => ({ ...prev, isOpen: false }))} product={sizeModal.product} preSelectedColor={sizeModal.selectedColor} onConfirm={confirmSizeSelection} />}
      {selectedProduct && ( <ProductDetailModal product={selectedProduct} initialColor={initialModalColor} onClose={() => {setSelectedProduct(null); setInitialModalColor(undefined);}} onAddToCart={handleAddToCartRequest}/>)}

      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out transform ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
        <div className="bg-white text-stone-900 pl-4 pr-6 py-3 rounded-full shadow-2xl border border-stone-100 flex items-center gap-4 min-w-[280px]">
          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0"><Check className="w-4 h-4 text-stone-900" /></div>
          <span className="text-sm font-medium leading-none">{toast.message}</span>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-grow">
     {view === 'account' && user ? (
  <AccountDashboard 
    user={{ ...user, role: 'client', wishlist: localWishlist, addresses: [], orders: [] }} 
    onLogout={handleLogout} 
    t={t} 
    onRemoveFromWishlist={() => {}} 
    onAddToCart={handleAddToCartRequest} 
    onAddressSave={() => {}} 
    onAddressDelete={() => {}} 
    onNavigate={(v) => setView(v as ViewState)} 
  />
) : view === 'shipping' ? (
  <InfoPage type="shipping" onBack={() => setView('home')} t={t} />
) : view === 'returns' ? (
  <InfoPage type="returns" onBack={() => setView('home')} t={t} />
) : view === 'checkout' ? (
  <CheckoutPage 
    cart={cart}
    total={cart.reduce((a, c) => a + c.price * c.quantity, 0)}
    onReturnToShop={() => setView('home')}
  />
) : view === 'checkout_return' ? (
  <CheckoutReturn
  orderId={lastOrderId}
  onGoHome={() => { setView('home'); }}
/>

) : (
  // HOME / CATÁLOGO
  <>


             <section className="relative h-screen w-full flex items-center justify-center overflow-hidden animate-in fade-in duration-1000">
                <div className="absolute inset-0 bg-stone-200">
                   <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2400&auto=format&fit=crop" alt="Interior Mood" className="w-full h-full object-cover opacity-80 mix-blend-multiply grayscale-[0.2]" />
                   <div className="absolute inset-0 bg-stone-100/30"></div>
                </div>
                <div className="relative z-10 text-center max-w-4xl px-6">
                   <span className="block text-xs md:text-sm font-medium tracking-[0.3em] uppercase text-stone-900 mb-6">Est. 2025 &mdash; Buenos Aires</span>
                   <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl text-stone-900 mb-8 leading-[1.1] md:leading-[0.9]">Arquitectura <br className="md:hidden" /><span className="italic mx-2 md:mx-4">y</span> Suavidad</h2>
                   <p className="max-w-md mx-auto text-stone-800 mb-12 text-sm md:text-base leading-relaxed font-light">Donde la ingeniería arquitectónica encuentra la calidez de los interiores orgánicos.</p>
                   <div className="flex justify-center">
                     <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="animate-bounce p-3 border border-stone-800 rounded-full hover:bg-stone-900 hover:text-white transition-colors"><ArrowDown className="w-5 h-5" strokeWidth={1} /></button>
                   </div>
                </div>
             </section>

             <section id="catalog" className="py-24 px-4 max-w-[1600px] mx-auto min-h-[50vh]">
               {!loading && products.length > 0 && (
                 <div className="flex flex-wrap justify-center gap-6 mb-16">
                   {dynamicCategories.map((cat) => (
                     <button key={cat} onClick={() => setActiveCategory(cat as any)} className={`text-sm uppercase tracking-widest border-b pb-1 transition-colors ${activeCategory === cat ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'}`}>{cat}</button>
                   ))}
                 </div>
               )}
               
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                 {filteredProducts.length > 0 ? (
                   filteredProducts.map(p => (
                     <ProductCard key={p.id} product={p} onAdd={handleAddToCartRequest} isWishlisted={localWishlist.some(i => i.id === p.id)} onToggleWishlist={() => handleToggleWishlist(p)} onOpenDetails={(product, color) => { setSelectedProduct(product); setInitialModalColor(color);}} />
                   ))
                 ) : (
                   <div className="col-span-full flex flex-col items-center justify-center text-center py-48 px-4 border-2 border-dashed border-stone-200 rounded-lg bg-stone-50/50">
                     <div className="w-16 h-16 mb-6 text-stone-300"><Info strokeWidth={1} className="w-full h-full" /></div>
                     <h3 className="font-serif text-2xl text-stone-900 mb-3">{t('no_results_title')}</h3>
                     <p className="text-stone-500 max-w-md mx-auto mb-8">{t('no_results_text')}</p>
                   </div>
                 )}
               </div>
             </section>

             <section className="bg-stone-900 text-stone-50 py-32 px-6">
               <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
                  <div className="flex-1 space-y-8 order-2 md:order-1">
                    <div className="border-l border-stone-700 pl-6">
                       <h3 className="font-serif text-4xl md:text-5xl mb-6">El Detalle Técnico</h3>
                       <p className="text-stone-400 font-light leading-relaxed max-w-lg text-lg">En Espacios de Azúcar, creemos que una manilla no es solo funcionalidad—es el apretón de manos de un edificio. Nuestra colección de herrajes está fresada con precisión.</p>
                    </div>
                  </div>
                  <div className="flex-1 w-full order-1 md:order-2">
                    <div className="relative aspect-square md:aspect-[4/3] bg-stone-800 p-2 border border-stone-700"><img src="https://images.unsplash.com/photo-1615873968403-89e068629265?q=80&w=1200&auto=format&fit=crop" alt="Detail" className="object-cover w-full h-full opacity-80" /></div>
                  </div>
               </div>
             </section>
          </>
        )}
      </main>

      {/* FOOTER */}
      {view !== 'account' && view !== 'checkout' && (
        <footer className="bg-stone-100 py-20 px-6 border-t border-stone-200 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center space-y-8">
            <h4 className="font-serif text-2xl text-stone-900">Espacios de Azúcar</h4>
            <div className="flex gap-8 text-xs uppercase tracking-widest text-stone-500">
              <button onClick={() => { setView('shipping'); window.scrollTo(0,0); }} className="hover:text-stone-900 transition-colors">{t('footer_shipping')}</button>
              <button onClick={() => { setView('returns'); window.scrollTo(0,0); }} className="hover:text-stone-900 transition-colors">{t('footer_returns')}</button>
            </div>
            <div className="pt-4">
              <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-3">Métodos de Pago Aceptados</p>
              <PaymentIcons />
            </div>
            <p className="text-[10px] text-stone-400 pt-4">&copy; 2025 Espacios de Azúcar. Desarrollado por <a href="https://yobelai.com" target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 transition-colors">Yobel.AI</a>.</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;