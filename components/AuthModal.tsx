
import React, { useState, useEffect } from 'react';
import { X, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'register';
  onLogin: () => void;
}

type AuthMode = 'login' | 'register';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode, onLogin }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Sync internal state with prop when modal opens/prop changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setLoading(false);
      setShowPassword(false); // Reset password visibility on open
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const isLogin = mode === 'login';

  const handleSubmit = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-lg shadow-2xl p-8 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center space-y-8">
          <h2 className="font-serif text-3xl text-stone-900 tracking-tight">
            {isLogin ? 'Bienvenido a Azúcar' : 'Crear Cuenta'}
          </h2>
          
          <div className="space-y-4">
             {!isLogin && (
               <div className="relative animate-in slide-in-from-top-2 duration-300">
                  <input 
                    type="text" 
                    placeholder="Nombre" 
                    className="w-full border-b border-stone-300 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors font-sans"
                  />
               </div>
             )}
             <div className="relative">
                <input 
                  type="email" 
                  placeholder="Email" 
                  defaultValue={isLogin ? "cliente@espaciosdeazucar.com" : ""}
                  className="w-full border-b border-stone-300 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors font-sans"
                />
             </div>
             <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  defaultValue={isLogin ? "password123" : ""}
                  className="w-full border-b border-stone-300 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors font-sans pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 transition-colors p-1"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={1.5} />
                  )}
                </button>
             </div>
          </div>

          <div className="space-y-3 pt-2">
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-stone-900 text-white h-12 rounded flex items-center justify-center font-medium hover:bg-stone-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isLogin ? 'Entrar' : 'Registrarse'
              )}
            </button>
            
            <button className="w-full bg-white border border-stone-200 text-stone-600 h-12 rounded flex items-center justify-center font-medium hover:bg-stone-50 transition-colors gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuar con Google
            </button>
          </div>

          <div className="pt-2 text-center space-y-4">
            <button 
              onClick={() => {
                setMode(isLogin ? 'register' : 'login');
                setShowPassword(false); // Reset password visibility when switching modes
              }}
              className="text-sm text-stone-500 hover:text-stone-900 border-b border-transparent hover:border-stone-900 transition-all pb-0.5"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
            </button>
            
            {/* Quick Admin Access for Demo */}
            {isLogin && (
              <div className="pt-4 border-t border-stone-100 mt-4 flex justify-center">
                 <button 
                   type="button"
                   onClick={() => {
                     // Programmatically set the input value for the demo
                     const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
                     if (emailInput) emailInput.value = 'admin@espaciosdeazucar.com';
                     handleSubmit();
                   }}
                   className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-300 hover:text-stone-800 transition-colors"
                 >
                   <ShieldCheck className="w-3 h-3" />
                   Acceso Demo Admin
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
