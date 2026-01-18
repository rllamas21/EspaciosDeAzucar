import React, { useEffect } from 'react';
import { User, ArrowRight, Globe, MessageCircle, LogOut } from 'lucide-react';
import { Category, Language, User as UserType } from '../types';

interface MenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: Category | 'Todos') => void;
  availableCategories: string[]; // <-- NUEVA PROP PARA CATEGORÍAS REALES
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

  return (
    <>
      <div 
        className={`fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div className={`fixed inset-y-0 left-0 w-[85%] max-w-md h-[100dvh] bg-[#fafaf9] z-50 shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col pt-20 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col gap-12">
          
          {/* SECCIÓN USUARIO */}
          <div className="space-y-6">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
                   <User className="w-5 h-5 text-stone-500" strokeWidth={1.5} />
                </div>
                <div>
                   <span className="block text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                      {user ? 'Bienvenido' : 'Invitado'}
                   </span>
                   <h2 className="text-xl font-serif text-stone-900 leading-tight">
                      {user ? user.name : 'Mi Perfil'}
                   </h2>
                </div>
             </div>

             <div className="flex flex-col gap-2">
                {user ? (
                  <button 
                    onClick={() => { onClose(); onNavigate('account'); }}
                    className="w-full bg-stone-900 text-white py-3 px-4 text-xs font-bold uppercase tracking-widest flex items-center justify-between group"
                  >
                    <span>Mi Cuenta / Pedidos</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                ) : (
                  <button 
                    onClick={() => { onClose(); onLoginClick('login'); }}
                    className="w-full border border-stone-200 py-3 px-4 text-xs font-bold uppercase tracking-widest text-stone-900 hover:bg-stone-50 transition-colors"
                  >
                    Iniciar Sesión
                  </button>
                )}
             </div>
          </div>

          {/* SECCIÓN CATEGORÍAS DINÁMICAS */}
          <div className="space-y-6">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold border-b border-stone-100 pb-2">Catálogo</h3>
            
            <div className="flex flex-col gap-6">
              <button 
                onClick={() => { onSelectCategory('Todos'); onClose(); }}
                className="text-left font-serif text-2xl text-stone-500 hover:text-stone-900 transition-all flex items-center justify-between group"
              >
                {t('menu_view_all')}
              </button>

              {/* MAPEAMOS LAS CATEGORÍAS QUE VIENEN DE LA BASE DE DATOS */}
              {availableCategories.filter(cat => cat !== 'Todos').map((cat) => (
                <button 
                  key={cat}
                  onClick={() => { onSelectCategory(cat as any); onClose(); }}
                  className="text-left font-serif text-2xl text-stone-500 hover:text-stone-900 transition-all flex items-center justify-between group"
                >
                  {cat}
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </button>
              ))}

              <button 
                onClick={() => { onNavigate('collections'); onClose(); }}
                className="text-left font-serif text-2xl text-stone-500 hover:text-stone-900 transition-all"
              >
                Colecciones
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 bg-stone-100 border-t border-stone-200 space-y-8">
          <div className="flex flex-col gap-6">
            <a 
              href="https://wa.me/5411966515610" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-stone-800 hover:text-green-700 transition-colors group"
            >
              <div className="bg-white p-2 rounded-full shadow-sm group-hover:bg-green-50 transition-colors">
                <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <span className="font-bold text-[10px] uppercase tracking-widest">WhatsApp Directo</span>
            </a>

            <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.2em] text-stone-400 uppercase">
                <Globe className="w-3 h-3" />
                {(['ES', 'EN', 'PT'] as Language[]).map((lang, index) => (
                  <React.Fragment key={lang}>
                    <span 
                      onClick={() => setLanguage(lang)}
                      className={`cursor-pointer transition-colors ${language === lang ? 'text-stone-900 underline' : 'hover:text-stone-900'}`}
                    >
                      {lang}
                    </span>
                    {index < 2 && <span className="text-stone-300">|</span>}
                  </React.Fragment>
                ))}
            </div>
          </div>

          {user && (
            <button 
              onClick={onLogout} 
              className="flex items-center gap-2 text-stone-400 hover:text-red-600 transition-colors pt-4 border-t border-stone-200 w-full"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Cerrar Sesión</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default MenuSidebar;