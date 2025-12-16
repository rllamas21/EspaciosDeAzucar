
import React from 'react';
import { X, User, ArrowRight, Globe, MessageCircle } from 'lucide-react';
import { Category, Language, User as UserType } from '../types';

interface MenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: Category | 'Todos') => void;
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
  language, 
  setLanguage, 
  onLoginClick,
  t,
  onNavigate,
  user,
  onLogout,
  onShowMessage
}) => {
  // Categories mapping for display
  const categories: { id: Category | 'Todos'; label: string }[] = [
    { id: 'Todos', label: t('menu_view_all') },
    { id: 'Mobiliario Signature', label: t('menu_furniture') },
    { id: 'Sistemas Arquitectónicos', label: t('menu_arch') },
    { id: 'Herrajes Joya', label: t('menu_hardware') },
  ];

  const handleComingSoon = (section: 'projects' | 'philosophy' | 'services') => {
    // Creative Director Copywriting for "Coming Soon" states
    let message = "";
    switch(section) {
      case 'projects':
        message = "Estamos documentando nuestras últimas obras maestras.";
        break;
      case 'philosophy':
        message = "Redactando nuestro manifiesto de diseño.";
        break;
      case 'services':
        message = "La agenda del estudio se abrirá próximamente.";
        break;
    }
    onShowMessage(message);
    onClose();
  };

  return (
    <>
      {/* Backdrop - Z-index 40 */}
      <div 
        className={`fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Panel - Reduced pt-32 to pt-24 to pull content up */}
      <div className={`fixed inset-y-0 left-0 w-[85%] max-w-md bg-[#fafaf9] z-50 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col pt-24 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Scrollable Content - Reduced gap-10 to gap-8 for better density */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-8 flex flex-col gap-10">
          
          {/* Section A: User */}
          <div className="space-y-2">
             <span className="text-xs text-stone-400 font-medium tracking-wide">{user ? 'Bienvenido,' : t('menu_guest')}</span>
             <div className="flex items-center gap-3 text-lg font-serif text-stone-900">
               <User className="w-5 h-5" strokeWidth={1.5} />
               <div className="flex items-center gap-1">
                 {user ? (
                    <div className="flex flex-col items-start">
                      <button 
                        onClick={() => {
                          onClose();
                          onNavigate('account');
                        }}
                        className="hover:text-stone-600 transition-colors"
                      >
                        {user.name}
                      </button>
                    </div>
                 ) : (
                   <>
                     <button 
                        onClick={() => {
                          onClose(); 
                          onLoginClick('login');
                        }}
                        className="hover:text-stone-600 transition-colors"
                     >
                       Iniciar Sesión
                     </button>
                     <span className="text-stone-300 font-sans text-sm">/</span>
                     <button 
                        onClick={() => {
                          onClose(); 
                          onLoginClick('register');
                        }}
                        className="hover:text-stone-600 transition-colors"
                     >
                       Registrarse
                     </button>
                   </>
                 )}
               </div>
             </div>
             {user && (
                <button onClick={onLogout} className="text-xs text-stone-400 hover:text-red-700 underline mt-1">
                  Cerrar Sesión
                </button>
             )}
             <hr className="border-stone-200 mt-6" />
          </div>


          {/* Section B: Shop - Split into Categories (First) and Editorial (Second) */}
          <div className="space-y-10">
            
            {/* 1. Categories Block (Now First for Utility) */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-[0.2em] text-stone-400 font-medium">{t('menu_categories')}</h3>
              
              {/* Added explicit HOME link at the top of categories for better mobile UX */}
              {/* FIX: Changed style to match categories (text-stone-500 instead of text-stone-900 font-medium) */}
              <button 
                onClick={() => {
                  onNavigate('home');
                  onClose();
                }}
                className="text-left font-serif text-xl text-stone-500 hover:text-stone-900 transition-colors flex items-center justify-between group pl-2 mb-4"
              >
                {t('menu_home')}
                <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-stone-400" />
              </button>

              <div className="flex flex-col gap-4">
                {categories.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => {
                      onSelectCategory(cat.id);
                      onClose();
                    }}
                    className="text-left font-serif text-xl text-stone-500 hover:text-stone-900 transition-colors flex items-center justify-between group pl-2"
                  >
                    {cat.label}
                    {/* Subtle chevron for categories */}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-stone-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Editorial Block (Now Second for Inspiration) */}
            <div className="space-y-4">
               <h3 className="text-xs uppercase tracking-[0.2em] text-stone-400 font-medium">{t('menu_editorial')}</h3>
               <button 
                  onClick={() => {
                    onNavigate('collections');
                    onClose();
                  }}
                  className="text-left font-serif text-xl text-stone-500 hover:text-stone-900 transition-colors flex items-center justify-between group pl-2 w-full"
                >
                  {t('menu_explore_collections')}
                  <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-stone-400" />
                </button>
            </div>
            
          </div>

          <hr className="border-stone-200" />

          {/* Section C: Brand */}
          <div className="space-y-6">
            <h3 className="text-xs uppercase tracking-[0.2em] text-stone-400 font-medium">{t('menu_studio')}</h3>
            <div className="flex flex-col gap-3 text-stone-600 font-medium text-sm">
              <button onClick={() => handleComingSoon('projects')} className="text-left hover:text-stone-900 transition-colors">
                {t('menu_projects')}
              </button>
              <button onClick={() => handleComingSoon('philosophy')} className="text-left hover:text-stone-900 transition-colors">
                {t('menu_philosophy')}
              </button>
              <button onClick={() => handleComingSoon('services')} className="text-left hover:text-stone-900 transition-colors">
                {t('menu_services')}
              </button>
            </div>
          </div>
        </div>

        {/* Section D: Footer */}
        <div className="p-8 bg-stone-100 border-t border-stone-200 space-y-6">
          {/* WhatsApp Direct - Updated Message */}
          <button 
            onClick={() => {
              onShowMessage("Servicio disponible próximamente");
            }}
            className="flex items-center gap-3 text-stone-800 hover:text-stone-600 transition-colors w-full"
          >
            <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
            <span className="font-medium text-sm">WhatsApp Directo</span>
          </button>
          
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-stone-400 uppercase">
             <Globe className="w-3 h-3" />
             {(['ES', 'EN', 'PT'] as Language[]).map((lang, index) => (
               <React.Fragment key={lang}>
                 <span 
                   onClick={() => setLanguage(lang)}
                   className={`cursor-pointer transition-colors ${language === lang ? 'text-stone-900' : 'hover:text-stone-900'}`}
                 >
                   {lang}
                 </span>
                 {index < 2 && <span className="text-stone-300">|</span>}
               </React.Fragment>
             ))}
          </div>
        </div>

      </div>
    </>
  );
};

export default MenuSidebar;
