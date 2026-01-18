import React, { useEffect } from 'react';
import { User, ArrowRight, Globe, MessageCircle, LogOut } from 'lucide-react';
import { Category, Language, User as UserType } from '../types';

interface MenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: Category | 'Todos') => void;
  availableCategories: string[];
  language: Language;
  setLanguage: (lang: Language) => void;
  onLoginClick: (mode: 'login' | 'register') => void;
  t: (key: string) => string;
  onNavigate: (view: 'home' | 'collections' | 'account') => void;
  user: UserType | null;
  onLogout: () => void;
  onShowMessage: (message: string) => void;
}

const MenuSidebar: React.FC<MenuSidebarProps> = ({ 
  isOpen, 
  onClose, 
  onSelectCategory,
  availableCategories, 
  language, 
  setLanguage, 
  onLoginClick,
  t,
  onNavigate,
  user,
  onLogout
}) => {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Función para manejar el scroll automático al catálogo
  const handleCategoryClick = (category: Category | 'Todos') => {
    onSelectCategory(category);
    onClose();
    
    // Esperamos un momento a que el sidebar empiece a cerrar para hacer el scroll
    setTimeout(() => {
      const catalogElement = document.getElementById('catalog');
      if (catalogElement) {
        catalogElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className={`fixed inset-y-0 left-0 w-[85%] max-w-md h-[100dvh] bg-[#fafaf9] z-50 shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col pt-20 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col gap-10">
          
          {/* SECCIÓN USUARIO: Estilo más suave y elegante */}
          <div className="space-y-6">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center">
                   <User className="w-5 h-5 text-stone-400" strokeWidth={1.5} />
                </div>
                <div>
                   <span className="block text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                      {user ? 'Bienvenido' : 'Invitado'}
                   </span>
                   <h2 className="text-lg font-serif text-stone-900 leading-tight">
                      {user ? user.name : 'Mi Perfil'}
                   </h2>
                </div>
             </div>

             <div className="flex flex-col gap-2">
                {user ? (
                  <button 
                    onClick={() => { onClose(); onNavigate('account'); }}
                    className="w-full bg-stone-100 border border-stone-200 text-stone-600 py-3 px-4 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-between group hover:bg-stone-200 transition-all"
                  >
                    <span>Gestionar mi Cuenta</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </button>
                ) : (
                  <button 
                    onClick={() => { onClose(); onLoginClick('login'); }}
                    className="w-full border border-stone-200 py-3 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-900 hover:bg-stone-50 transition-colors"
                  >
                    Iniciar Sesión
                  </button>
                )}
             </div>
          </div>

          {/* SECCIÓN CATEGORÍAS: Jerarquía de texto ajustada */}
          <div className="space-y-6">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold border-b border-stone-100 pb-2">Catálogo</h3>
            
            <div className="flex flex-col gap-5">
              {/* Inicio */}
              <button 
                onClick={() => { onNavigate('home'); onClose(); window.scrollTo({top:0, behavior:'smooth'}); }}
                className="text-left font-serif text-xl text-stone-500 hover:text-stone-900 transition-all"
              >
                {t('menu_home')}
              </button>

              {/* Todos */}
              <button 
                onClick={() => handleCategoryClick('Todos')}
                className="text-left font-serif text-xl text-stone-500 hover:text-stone-900 transition-all flex items-center justify-between group"
              >
                {t('menu_view_all')}
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-stone-300" />
              </button>

              {/* Categorías Dinámicas */}
              {availableCategories.filter(cat => cat !== 'Todos').map((cat) => (
                <button 
                  key={cat}
                  onClick={() => handleCategoryClick(cat as any)}
                  className="text-left font-serif text-xl text-stone-500 hover:text-stone-900 transition-all flex items-center justify-between group"
                >
                  {cat}
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-stone-300" />
                </button>
              ))}

              {/* Colecciones */}
              <button 
                onClick={() => { onNavigate('collections'); onClose(); }}
                className="text-left font-serif text-xl text-stone-500 hover:text-stone-900 transition-all"
              >
                Colecciones
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-8 bg-stone-100 border-t border-stone-200 space-y-8">
          <div className="flex flex-col gap-6">
            <a 
              href="https://wa.me/5411966515610" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-stone-800 hover:text-green-700 transition-colors group"
            >
              <div className="bg-white p-2 rounded-full shadow-sm group-hover:bg-green-50 transition-colors border border-stone-200">
                <MessageCircle className="w-4 h-4 text-stone-600" strokeWidth={1.5} />
              </div>
              <span className="font-bold text-[9px] uppercase tracking-[0.2em] text-stone-500">WhatsApp Directo</span>
            </a>

            <div className="flex items-center gap-3 text-[9px] font-bold tracking-[0.2em] text-stone-400 uppercase pl-1">
                <Globe className="w-3 h-3" />
                {(['ES', 'EN', 'PT'] as Language[]).map((lang, index) => (
                  <React.Fragment key={lang}>
                    <span 
                      onClick={() => setLanguage(lang)}
                      className={`cursor-pointer transition-colors ${language === lang ? 'text-stone-900 underline' : 'hover:text-stone-900'}`}
                    >
                      {lang}
                    </span>
                    {index < 2 && <span className="text-stone-300">/</span>}
                  </React.Fragment>
                ))}
            </div>
          </div>

          {user && (
            <button 
              onClick={onLogout} 
              className="flex items-center gap-2 text-stone-400 hover:text-red-600 transition-colors pt-4 border-t border-stone-200 w-full"
            >
              <LogOut className="w-3 h-3" />
              <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Cerrar Sesión</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default MenuSidebar;