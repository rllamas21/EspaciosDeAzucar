
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Search, Menu, X, User, ArrowRight } from 'lucide-react';
import { Language, User as UserType } from '../types';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenMenu: () => void;
  isMenuOpen: boolean;
  onSearch: (query: string) => void;
  onSearchSubmit: () => void; // New prop for scroll trigger
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  onNavigate: (view: 'home' | 'collections' | 'account') => void;
  user: UserType | null;
  onLoginClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  cartCount, 
  onOpenCart, 
  onOpenMenu, 
  isMenuOpen,
  onSearch,
  onSearchSubmit,
  language,
  setLanguage,
  t,
  onNavigate,
  user,
  onLoginClick
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-focus input when search opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleUserClick = () => {
    if (user) {
      onNavigate('account');
    } else {
      onLoginClick();
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(); // Trigger scroll logic in App
    // Optional: close search bar after submit if desired, but keeping it open shows context
    // setIsSearchOpen(false); 
  };

  return (
    // Z-index 60 ensures Navbar stays ABOVE the Menu Sidebar (Z-50) and Backdrop (Z-40)
    <nav className={`fixed top-0 left-0 w-full z-[60] transition-all duration-500 border-b ${scrolled || isSearchOpen || isMenuOpen ? 'bg-stone-50/95 backdrop-blur-md border-stone-200' : 'bg-transparent border-transparent'} ${isSearchOpen ? 'pb-0' : 'py-4 md:py-6'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`flex items-center justify-between transition-all duration-300 ${isSearchOpen ? 'h-16' : 'h-full'}`}>
          
          {/* Left: Mobile Menu / Brand */}
          <div className="flex items-center gap-6">
            <button 
              onClick={onOpenMenu}
              className="md:hidden text-stone-800 hover:text-stone-500 transition-colors z-50 relative"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {/* Toggle icon based on menu state */}
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            {/* Language Switcher (Desktop) */}
            <div className="hidden md:flex items-center text-[10px] font-medium tracking-widest text-stone-400">
               {(['ES', 'EN', 'PT'] as Language[]).map((lang, index) => (
                 <React.Fragment key={lang}>
                   <span 
                     onClick={() => setLanguage(lang)}
                     className={`cursor-pointer transition-colors ${language === lang ? 'text-stone-900' : 'hover:text-stone-900'}`}
                   >
                     {lang}
                   </span>
                   {index < 2 && <span className="mx-2 opacity-50">|</span>}
                 </React.Fragment>
               ))}
            </div>

            <button 
              onClick={() => onNavigate('collections')}
              className="hidden md:block text-xs uppercase tracking-[0.2em] font-medium text-stone-500 hover:text-stone-900 transition-colors ml-4"
            >
              {t('navbar_collections')}
            </button>
            {/* DIARIO link removed */}
          </div>

          {/* Center: Logo */}
          {/* CRITICAL UX FIX: Removed pointer-events-none from mobile. The logo MUST be clickable to return home. */}
          <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full md:w-auto pointer-events-auto transition-opacity duration-300 ${isSearchOpen ? 'opacity-0' : 'opacity-100'}`}>
            <button 
              onClick={() => onNavigate('home')}
              className={`font-serif text-stone-900 tracking-tight transition-all duration-500 hover:opacity-70 ${scrolled || isMenuOpen ? 'text-xl' : 'text-2xl md:text-3xl'}`}
            >
              Espacios de Azúcar
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4 md:gap-6">
            <button 
              onClick={() => {
                // Logic: Toggle search. If opening search, CLOSE menu.
                const nextState = !isSearchOpen;
                setIsSearchOpen(nextState);
                if (nextState) {
                  onSearch(''); 
                  if (isMenuOpen) {
                    onOpenMenu(); // This toggles the menu closed via the handleMenuToggle function in App.tsx
                  }
                }
              }}
              className={`transition-colors relative z-50 ${isSearchOpen ? 'text-stone-900' : 'text-stone-800 hover:text-stone-500'}`}
            >
              {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" strokeWidth={1.5} />}
            </button>

             {/* User Icon - Desktop Only usually, but good for accessibility to have here */}
             <button 
              onClick={handleUserClick}
              className="hidden md:block relative text-stone-800 hover:text-stone-500 transition-colors group z-50"
              aria-label={user ? "Mi Cuenta" : "Iniciar Sesión"}
            >
               <User className="w-5 h-5" strokeWidth={1.5} />
               {user && <span className="absolute -top-1 -right-1 w-2 h-2 bg-bronze-500 rounded-full"></span>}
            </button>

            <button 
              onClick={() => {
                setIsSearchOpen(false); // Force close search when opening cart
                onOpenCart();
              }}
              className="relative text-stone-800 hover:text-stone-500 transition-colors group z-50"
            >
              <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-bronze-500 text-[8px] text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar Dropdown */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isSearchOpen ? 'max-h-24 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
           <form onSubmit={handleManualSubmit} className="relative w-full">
             <input 
               ref={inputRef}
               type="text" 
               placeholder={t('search_placeholder')}
               className="w-full bg-transparent border-b border-stone-300 text-xl font-serif text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-900 py-3 pr-12"
               onChange={(e) => {
                 onSearch(e.target.value);
                 if (e.target.value) onNavigate('home');
               }}
             />
             <button 
               type="submit"
               className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-stone-900 transition-colors"
               title="Buscar"
             >
               <ArrowRight className="w-6 h-6" strokeWidth={1.5} />
             </button>
           </form>
           {/* Visual hint for user */}
           <p className="text-[10px] text-stone-400 mt-2 uppercase tracking-widest text-right">
             Presiona Enter o la flecha para ver resultados
           </p>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
