
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import SizeModal from './components/SizeModal';
import MenuSidebar from './components/MenuSidebar';
import AuthModal from './components/AuthModal';
import CheckoutModal from './components/CheckoutModal'; 
import CollectionsGrid from './components/CollectionsGrid';
import AccountDashboard from './components/AccountDashboard';
import ProductDetailModal from './components/ProductDetailModal';
import InfoPage from './components/InfoPage'; 
import AdminPanel from './components/AdminPanel'; // Import Admin Panel
import { PRODUCTS as INITIAL_PRODUCTS } from './constants'; // Renamed
import { CartItem, Product, Category, ColorOption, Language, User, Address, Order } from './types';
import { ArrowDown, Check, Info } from 'lucide-react';

// --- MOCK DATA ---
const MOCK_CLIENT_USER: User = {
  name: 'Leonardo',
  email: 'cliente@espaciosdeazucar.com',
  role: 'client',
  addresses: [
    { id: 'addr1', name: 'Apartamento Centro', street: 'Av. Alvear 1890, Piso 4', city: 'Buenos Aires', zip: 'C1014', isDefault: true },
  ],
  orders: [],
  wishlist: [] 
};

const MOCK_ADMIN_USER: User = {
  name: 'Dueño',
  email: 'admin@espaciosdeazucar.com',
  role: 'admin',
  addresses: [],
  orders: [],
  wishlist: []
};

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  ES: {
    navbar_collections: 'Colecciones',
    navbar_journal: 'Diario',
    search_placeholder: 'Buscar productos (ej. Mesa, Lámpara)...',
    cart_title: 'Tu Selección',
    cart_empty: 'Vacío',
    cart_empty_sub: 'Tu espacio espera',
    payment_method: 'Método de Pago',
    card: 'Tarjeta',
    transfer: 'Transferencia',
    save_10: 'AHORRA 10%',
    discount: 'Descuento Transferencia (10%)',
    shipping: 'Envío',
    free: 'Gratuito',
    total: 'Total',
    checkout: 'Finalizar Compra',
    menu_guest: 'Hola, Invitado',
    menu_login: 'Iniciar Sesión / Registrarse',
    menu_home: 'Inicio',
    menu_editorial: 'Editorial',
    menu_categories: 'Categorías',
    menu_explore_collections: 'Explorar Colecciones',
    menu_view_all: 'Ver Todo',
    menu_furniture: 'Mobiliario Signature',
    menu_arch: 'Arquitectura',
    menu_hardware: 'Herrajes Joya',
    menu_studio: 'El Estudio',
    menu_projects: 'Proyectos Destacados',
    menu_philosophy: 'Nuestra Filosofía',
    menu_services: 'Servicios de Interiorismo',
    login_toast: 'Función de Login próximamente',
    hero_title_1: 'Arquitectura',
    hero_title_2: 'y', 
    hero_title_3: 'Suavidad',
    hero_subtitle: 'Un diálogo curado entre sistemas arquitectónicos de alto rendimiento e interiores suaves e orgánicos.',
    footer_shipping: 'Envíos',
    footer_returns: 'Devoluciones',
    toast_added: 'agregado',
    toast_cart: 'Carrito Actualizado',
    toast_info: 'Información',
    no_results_title: 'No se encontraron resultados',
    no_results_text: 'Intenta buscar otro producto o cambia la categoría.',
    toast_welcome: 'Bienvenida',
    toast_welcome_sub: 'Acceso concedido al portal',
    account_wishlist: 'Lista de Deseos',
    account_overview: 'Resumen',
    account_orders: 'Pedidos',
    account_addresses: 'Direcciones',
    account_logout: 'Cerrar Sesión',
    wishlist_removed: 'Eliminado de la lista de deseos',
    wishlist_added: 'Guardado en lista de deseos',
    wishlist_remove: 'Eliminar',
    wishlist_add_cart: 'Agregar al Carrito',
    wishlist_login_required: 'Inicia sesión para guardar favoritos',
    cart_remove: 'Quitar del carrito'
  },
  EN: {
    navbar_collections: 'Collections',
    navbar_journal: 'Journal',
    search_placeholder: 'Search products (e.g. Table, Lamp)...',
    cart_title: 'Your Selection',
    cart_empty: 'Empty',
    cart_empty_sub: 'Your space awaits',
    payment_method: 'Payment Method',
    card: 'Card',
    transfer: 'Transfer',
    save_10: 'SAVE 10%',
    discount: 'Transfer Discount (10%)',
    shipping: 'Shipping',
    free: 'Free',
    total: 'Total',
    checkout: 'Checkout',
    menu_guest: 'Hello, Guest',
    menu_login: 'Login / Register',
    menu_home: 'Home',
    menu_editorial: 'Editorial',
    menu_categories: 'Categories',
    menu_explore_collections: 'Explore Collections',
    menu_view_all: 'View All',
    menu_furniture: 'Signature Furniture',
    menu_arch: 'Architecture',
    menu_hardware: 'Jewelry Hardware',
    menu_studio: 'The Studio',
    menu_projects: 'Featured Projects',
    menu_philosophy: 'Our Philosophy',
    menu_services: 'Interior Design Services',
    login_toast: 'Login feature coming soon',
    hero_title_1: 'Architecture',
    hero_title_2: 'and',
    hero_title_3: 'Softness',
    hero_subtitle: 'A curated dialogue between high-performance architectural systems and soft, organic interiors.',
    footer_shipping: 'Shipping',
    footer_returns: 'Returns',
    toast_added: 'added',
    toast_cart: 'Cart Updated',
    toast_info: 'Info',
    no_results_title: 'No results found',
    no_results_text: 'Try searching for another product or change the category.',
    toast_welcome: 'Welcome',
    toast_welcome_sub: 'Access granted to portal',
    account_wishlist: 'Wishlist',
    account_overview: 'Overview',
    account_orders: 'Orders',
    account_addresses: 'Addresses',
    account_logout: 'Logout',
    wishlist_removed: 'Removed from wishlist',
    wishlist_added: 'Saved to wishlist',
    wishlist_remove: 'Remove',
    wishlist_add_cart: 'Add to Cart',
    wishlist_login_required: 'Login to save favorites',
    cart_remove: 'Remove from cart'
  },
  PT: {
    navbar_collections: 'Coleções',
    navbar_journal: 'Diário',
    search_placeholder: 'Procurar produtos (ex. Mesa, Lâmpada)...',
    cart_title: 'Sua Seleção',
    cart_empty: 'Vazio',
    cart_empty_sub: 'Seu espaço aguarda',
    payment_method: 'Método de Pagamento',
    card: 'Cartão',
    transfer: 'Transferência',
    save_10: 'ECONOMIZE 10%',
    discount: 'Desconto Transferência (10%)',
    shipping: 'Envio',
    free: 'Gratuito',
    total: 'Total',
    checkout: 'Finalizar Compra',
    menu_guest: 'Olá, Visitante',
    menu_login: 'Login / Registrar',
    menu_home: 'Início',
    menu_editorial: 'Editorial',
    menu_categories: 'Categorias',
    menu_explore_collections: 'Explorar Coleções',
    menu_view_all: 'Ver Tudo',
    menu_furniture: 'Mobiliario Signature',
    menu_arch: 'Arquitetura',
    menu_hardware: 'Ferragens Joia',
    menu_studio: 'O Estúdio',
    menu_projects: 'Projetos em Destaque',
    menu_philosophy: 'Nossa Filosofia',
    menu_services: 'Serviços de Interiores',
    login_toast: 'Recurso de login em breve',
    hero_title_1: 'Arquitetura',
    hero_title_2: 'e',
    hero_title_3: 'Suavidade',
    hero_subtitle: 'Um diálogo curado entre sistemas arquitetônicos de alto desempenho e interiores suaves e orgânicos.',
    footer_shipping: 'Envios',
    footer_returns: 'Devoluções',
    toast_added: 'adicionado',
    toast_cart: 'Carrinho Atualizado',
    toast_info: 'Informação',
    no_results_title: 'Nenhum resultado encontrado',
    no_results_text: 'Tente procurar outro produto ou mude a categoria.',
    toast_welcome: 'Bem-vindo',
    toast_welcome_sub: 'Acesso concedido ao portal',
    account_wishlist: 'Lista de Desejos',
    account_overview: 'Resumo',
    account_orders: 'Pedidos',
    account_addresses: 'Endereços',
    account_logout: 'Sair',
    wishlist_removed: 'Removido da lista de desejos',
    wishlist_added: 'Salvo na lista de desejos',
    wishlist_remove: 'Remover',
    wishlist_add_cart: 'Adicionar ao Carrinho',
    wishlist_login_required: 'Faça login para salvar favoritos',
    cart_remove: 'Remover do carrinho'
  }
};

type ViewState = 'home' | 'collections' | 'account' | 'shipping' | 'returns' | 'admin';

const PaymentIcons = () => (
  <div className="flex items-center justify-center gap-4 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
    <div className="h-6 w-10 bg-stone-200 rounded flex items-center justify-center" title="Visa">
       <span className="font-bold text-[10px] italic text-stone-600">VISA</span>
    </div>
    <div className="h-6 w-10 bg-stone-200 rounded flex items-center justify-center relative overflow-hidden" title="Mastercard">
       <div className="w-3 h-3 bg-stone-400 rounded-full -mr-1"></div>
       <div className="w-3 h-3 bg-stone-500 rounded-full -ml-1"></div>
    </div>
    <div className="h-6 w-10 bg-stone-200 rounded flex items-center justify-center" title="Amex">
       <span className="font-bold text-[8px] text-stone-600 tracking-tighter">AMEX</span>
    </div>
     <div className="h-6 w-10 bg-stone-200 rounded flex items-center justify-center gap-0.5" title="MercadoPago">
        <span className="text-[8px] font-bold text-stone-600">MP</span>
        <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // STATE LIFTING: Products & Orders are now state to allow Admin edits
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [allOrders, setAllOrders] = useState<Order[]>([
    {
      id: 'ORD-25-001',
      customerName: 'Leonardo',
      date: '14 Feb 2025',
      status: 'processing',
      total: 1250,
      items: [{ ...INITIAL_PRODUCTS[0], quantity: 1, cartItemId: 'hist1' }]
    },
    {
      id: 'ORD-24-892',
      customerName: 'Maria G.',
      date: '20 Dic 2024',
      status: 'delivered',
      total: 540,
      items: [{ ...INITIAL_PRODUCTS[6], quantity: 2, cartItemId: 'hist2' }]
    }
  ]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); 
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<Language>('ES');
  const [toast, setToast] = useState<{message: string, title?: string, visible: boolean}>({ message: '', visible: false });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sizeModal, setSizeModal] = useState<{
    isOpen: boolean;
    product: Product | null;
    selectedColor: ColorOption | null;
  }>({
    isOpen: false,
    product: null,
    selectedColor: null,
  });

  const t = (key: string) => TRANSLATIONS[language][key] || key;

  useEffect(() => {
    if (isMenuOpen || isCartOpen || isAuthModalOpen || selectedProduct || isCheckoutOpen || view === 'admin') {
      document.body.style.overflow = view === 'admin' ? '' : 'hidden'; // Allow scroll in admin
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen, isCartOpen, isAuthModalOpen, selectedProduct, isCheckoutOpen, view]);

  const showToast = (message: string, title?: string) => {
    setToast({ message, title, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const handleLogin = () => {
    // SIMULATED LOGIN LOGIC
    // If email contains "admin", log in as owner. Otherwise, client.
    const inputEmail = (document.querySelector('input[type="email"]') as HTMLInputElement)?.value || "";
    
    if (inputEmail.includes('admin')) {
      setUser(MOCK_ADMIN_USER);
      setIsAuthModalOpen(false);
      setView('admin'); // Redirect straight to admin
      showToast("Bienvenido al Panel de Control", "Administrador");
    } else {
      setUser({ ...MOCK_CLIENT_USER, orders: allOrders.filter(o => o.customerName === 'Leonardo') });
      setIsAuthModalOpen(false);
      setView('account');
      showToast(t('toast_welcome_sub'), t('toast_welcome'));
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
    showToast('Has cerrado sesión correctamente', t('toast_info'));
  };

  // ADMIN ACTIONS
  const handleProductUpdate = (updatedProduct: Product) => {
    setProducts(prev => {
      const exists = prev.find(p => p.id === updatedProduct.id);
      if (exists) {
        return prev.map(p => p.id === updatedProduct.id ? updatedProduct : p);
      }
      return [updatedProduct, ...prev]; // Add new
    });
    showToast("Catálogo actualizado", "Admin");
  };

  const handleProductDelete = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast("Producto eliminado", "Admin");
  };

  const handleOrderStatusChange = (orderId: string, newStatus: any) => {
    setAllOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    showToast(`Orden #${orderId} actualizada a ${newStatus}`, "Admin");
  };

  const handleCheckoutComplete = () => {
    // Create new order
    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-4)}`,
      customerName: user?.name || 'Invitado',
      date: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'processing',
      total: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
      items: [...cart]
    };
    setAllOrders(prev => [newOrder, ...prev]);
    // Also update client user state if logged in
    if (user && user.role === 'client') {
       setUser(prev => prev ? { ...prev, orders: [newOrder, ...prev.orders] } : null);
    }
    setCart([]);
  };

  // ... (Address, Wishlist, Cart handlers remain same as before, omitted for brevity but assumed present)
   // Address Handlers
  const handleAddressSave = (address: Address) => {
    if (!user) return;
    let updatedAddresses = [...user.addresses];
    if (address.id) {
       updatedAddresses = updatedAddresses.map(a => a.id === address.id ? address : a);
       showToast("Dirección actualizada", t('toast_info'));
    } else {
       const newAddress = { ...address, id: `addr-${Date.now()}` };
       if (updatedAddresses.length === 0) newAddress.isDefault = true;
       updatedAddresses.push(newAddress);
       showToast("Nueva dirección guardada", t('toast_info'));
    }
    if (address.isDefault) {
      updatedAddresses = updatedAddresses.map(a => 
        a.id === (address.id || updatedAddresses[updatedAddresses.length-1].id) ? a : { ...a, isDefault: false }
      );
    }
    setUser({ ...user, addresses: updatedAddresses });
  };

  const handleAddressDelete = (id: string) => {
    if (!user) return;
    const updatedAddresses = user.addresses.filter(a => a.id !== id);
    setUser({ ...user, addresses: updatedAddresses });
    showToast("Dirección eliminada", t('toast_info'));
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

  const commitAddToCart = (product: Product, color?: ColorOption, size?: string, quantity: number = 1) => {
    const colorId = color ? `-${color.name}` : '';
    const sizeId = size ? `-${size}` : '';
    const cartItemId = `${product.id}${colorId}${sizeId}`;

    setCart(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, quantity, selectedColor: color, selectedSize: size, cartItemId }];
    });
    const variantInfo = [color?.name, size].filter(Boolean).join(' • ');
    showToast(`${product.name} ${variantInfo ? `(${variantInfo})` : ''} ${t('toast_added')}`, t('toast_cart'));
  };

  const handleToggleWishlist = (product: Product) => {
    if (!user) {
      setAuthMode('login'); setIsAuthModalOpen(true); showToast(t('wishlist_login_required'), t('toast_info')); return;
    }
    const exists = user.wishlist.find(item => item.id === product.id);
    if (exists) {
       setUser({ ...user, wishlist: user.wishlist.filter(item => item.id !== product.id) });
       showToast(t('wishlist_removed'), t('toast_info'));
    } else {
       setUser({ ...user, wishlist: [...user.wishlist, product] });
       showToast(t('wishlist_added'), t('toast_info'));
    }
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(item => item.quantity > 0));
  };

  const removeFromCart = (cartItemId: string) => { setCart(prev => prev.filter(item => item.cartItemId !== cartItemId)); };
  
  const handleRemoveFromWishlist = (productId: string) => {
    if (user) {
      setUser({ ...user, wishlist: user.wishlist.filter(item => item.id !== productId) });
      showToast(t('wishlist_removed'), t('toast_info'));
    }
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(prev => !prev);
  };

  const handleCategorySelect = (category: Category | 'Todos') => {
    setActiveCategory(category);
    setSearchQuery('');
    setView('home');
    setIsMenuOpen(false);
    setTimeout(() => {
      const catalog = document.getElementById('catalog');
      if (catalog) {
        const yOffset = -10; 
        const y = catalog.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({top: y, behavior: 'smooth'});
      }
    }, 100);
  };


  const handleSearchSubmit = () => {
    setView('home');
    setTimeout(() => {
      const catalog = document.getElementById('catalog');
      if (catalog) {
        const yOffset = -30; 
        const y = catalog.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({top: y, behavior: 'smooth'});
      }
    }, 100);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const filteredProducts = products.filter(p => { // Use STATE products
    const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryLabel = (cat: string) => {
  switch (cat) {
    case 'Todos':
      return 'Ver Todo';
    case 'Navidad':
      return 'Navidad';
    case 'Muebles':
      return 'Muebles';
    case 'Arquitectura':
      return 'Arquitectura';
    default:
      return cat;
  }
};


  const handleNavigate = (newView: ViewState) => {
    setView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderMainContent = () => {
    // 0. ADMIN PANEL
    if (view === 'admin' && user?.role === 'admin') {
      return (
        <AdminPanel 
          products={products}
          orders={allOrders}
          onProductUpdate={handleProductUpdate}
          onProductDelete={handleProductDelete}
          onOrderStatusChange={handleOrderStatusChange}
          onLogout={handleLogout}
        />
      );
    }

    if (view === 'account' && user) {
      return (
        <AccountDashboard 
          user={user} 
          onLogout={handleLogout} 
          t={t} 
          onRemoveFromWishlist={handleRemoveFromWishlist}
          onAddToCart={(p, c, q) => handleAddToCartRequest(p, c, undefined, q)}
          onAddressSave={handleAddressSave}
          onAddressDelete={handleAddressDelete}
          onNavigate={(v) => { if (v === 'home') handleNavigate('home'); }}
        />
      );
    }

    if (view === 'shipping') { return <InfoPage type="shipping" onBack={() => setView('home')} t={t} />; }
    if (view === 'returns') { return <InfoPage type="returns" onBack={() => setView('home')} t={t} />; }
    if (view === 'collections') { return <CollectionsGrid />; }

    // HOME
    return (
      <>
        {/* Hero Section */}
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden animate-in fade-in duration-1000">
          <div className="absolute inset-0 bg-stone-200">
             <img 
               src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2400&auto=format&fit=crop" 
               alt="Interior Mood" 
               className="w-full h-full object-cover opacity-80 mix-blend-multiply grayscale-[0.2]" 
             />
             <div className="absolute inset-0 bg-stone-100/30"></div>
          </div>
          
          <div className="relative z-10 text-center max-w-4xl px-6">
            <span className="block text-xs md:text-sm font-medium tracking-[0.3em] uppercase text-stone-900 mb-6">
              Est. 2025 &mdash; Buenos Aires
            </span>
            <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl text-stone-900 mb-8 leading-[1.1] md:leading-[0.9]">
              {t('hero_title_1')} <br className="md:hidden" />
              <span className="italic mx-2 md:mx-4">{t('hero_title_2')}</span>
              {t('hero_title_3')}
            </h2>
            <p className="max-w-md mx-auto text-stone-700 mb-12 text-sm md:text-base leading-relaxed">
              {t('hero_subtitle')}
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
                className="animate-bounce p-3 border border-stone-800 rounded-full hover:bg-stone-900 hover:text-white transition-colors"
              >
                <ArrowDown className="w-5 h-5" strokeWidth={1} />
              </button>
            </div>
          </div>
        </section>

        {/* Catalog Section */}
        <section id="catalog" className="py-24 md:py-32 px-4 md:px-6 max-w-[1600px] mx-auto min-h-[80vh]">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-16 md:mb-20">
            {['Todos', 'Navidad', 'Muebles', 'Arquitectura'].map((cat) => (

              <button
                key={cat}
                onClick={() => { setActiveCategory(cat as Category | 'Todos'); setSearchQuery(''); }}
                className={`text-sm uppercase tracking-widest transition-all duration-300 pb-1 border-b ${
                  activeCategory === cat ? 'border-stone-900 text-stone-900 font-medium' : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
              >
                {getCategoryLabel(cat)}
              </button>
            ))}
          </div>

          {/* GRID UPDATE: Changed from lg:grid-cols-3 to lg:grid-cols-4 for tighter layout */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 xl:gap-x-8 xl:gap-y-12">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAdd={(p, c) => handleAddToCartRequest(p, c)}
                  isWishlisted={user ? user.wishlist.some(i => i.id === product.id) : false}
                  onToggleWishlist={() => handleToggleWishlist(product)}
                  onOpenDetails={() => setSelectedProduct(product)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-stone-400">
                <p className="font-serif text-xl mb-2">{t('no_results_title')}</p>
                <p className="text-sm">{t('no_results_text')}</p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-stone-900 text-stone-50 py-32 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
             <div className="flex-1 space-y-8 order-2 md:order-1">
               <div className="border-l border-stone-700 pl-6">
                  <h3 className="font-serif text-4xl md:text-5xl mb-6">El Detalle Técnico</h3>
                  <p className="text-stone-400 font-light leading-relaxed max-w-lg text-lg">
                    En Espacios de Azúcar, creemos que una manilla no es solo funcionalidad—es el apretón de manos de un edificio. Nuestra colección de herrajes está fresada con precisión en acero inoxidable y latón macizo, diseñada para proporcionar una experiencia táctil y pesada que fundamenta la ligereza de nuestros textiles.
                  </p>
               </div>
             </div>
             <div className="flex-1 w-full order-1 md:order-2">
               <div className="relative aspect-square md:aspect-[4/3] bg-stone-800 p-2 border border-stone-700">
                  <img src="https://images.unsplash.com/photo-1615873968403-89e068629265?q=80&w=1200&auto=format&fit=crop" alt="Detail" className="object-cover w-full h-full opacity-80" />
               </div>
             </div>
          </div>
        </section>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans selection:bg-stone-200 selection:text-stone-900">
      {/* Hide Navbar in Admin View */}
      {view !== 'admin' && (
        <Navbar 
          cartCount={cartCount} 
          onOpenCart={() => setIsCartOpen(true)} 
          onOpenMenu={handleMenuToggle}
          isMenuOpen={isMenuOpen}
          onSearch={(q) => setSearchQuery(q)}
          onSearchSubmit={handleSearchSubmit}
          language={language}
          setLanguage={setLanguage}
          t={t}
          onNavigate={(v) => { if (v === 'home' || v === 'collections' || v === 'account') handleNavigate(v); }}
          user={user}
          onLoginClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
        />
      )}
      
      {view !== 'admin' && (
        <CartDrawer 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          t={t}
          onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
        />
      )}

      {view !== 'admin' && (
        <MenuSidebar
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onSelectCategory={handleCategorySelect}
          language={language}
          setLanguage={setLanguage}
          onLoginClick={(mode) => { setAuthMode(mode); setIsAuthModalOpen(true); }}
          t={t}
          onNavigate={(v) => { if (v === 'home' || v === 'collections' || v === 'account') handleNavigate(v); }}
          user={user}
          onLogout={handleLogout}
          onShowMessage={(msg) => showToast(msg, t('toast_info'))}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authMode}
          onLogin={handleLogin}
        />
      )}

      {isCheckoutOpen && (
        <CheckoutModal 
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onReturnToShop={() => { setIsCheckoutOpen(false); setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          total={cartTotal}
          onClearCart={handleCheckoutComplete} // Use new handler
        />
      )}

      {sizeModal.isOpen && (
        <SizeModal 
          isOpen={sizeModal.isOpen}
          onClose={() => setSizeModal(prev => ({ ...prev, isOpen: false }))}
          product={sizeModal.product}
          preSelectedColor={sizeModal.selectedColor}
          onConfirm={confirmSizeSelection}
        />
      )}
      
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCartRequest}
        />
      )}

      {/* TOAST */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out transform ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
        <div className="bg-white text-stone-900 pl-4 pr-6 py-3 rounded-full shadow-2xl border border-stone-100 flex items-center gap-4 min-w-[280px]">
          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
             {toast.title === 'Admin' ? <Info className="w-4 h-4 text-stone-900" /> : <Check className="w-4 h-4 text-stone-900" />}
          </div>
          <div className="flex flex-col">
            {toast.title && <span className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">{toast.title}</span>}
            <span className="text-sm font-medium leading-none">{toast.message}</span>
          </div>
        </div>
      </div>

      <main>
        {renderMainContent()}

        {/* Hide Footer in Admin View */}
        {view !== 'admin' && (
          <footer className="bg-stone-100 py-20 px-6 border-t border-stone-200">
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
              <p className="text-[10px] text-stone-400 pt-4">&copy; 2025 Espacios de Azúcar. Desarrollado por Pegüa Devs.</p>
            </div>
          </footer>
        )}
      </main>
    </div>
  );
};

export default App;
