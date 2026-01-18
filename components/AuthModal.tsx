import React, { useState, useEffect } from 'react';
import { X, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'register';
  onLogin: () => void;
}

type AuthMode = 'login' | 'register';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode, onLogin }) => {
  const { login, register } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // 1. SOLUCIÓN SCROLL ATRÁS: Bloqueo de scroll del body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Resetear estados al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setLoading(false);
      setShowPassword(false);
      setError(null);
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setPhone('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const isLogin = mode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 2. SEGURIDAD: Validación básica de longitud antes de enviar al servidor
    if (!isLogin && password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      let result;
      if (isLogin) {
        result = await login(email.trim(), password);
      } else {
        result = await register({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim()
        });
      }

      if (result.success) {
        onLogin();
        onClose();
      } else {
        setError(result.error || "Credenciales incorrectas");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-lg shadow-2xl p-8 transform transition-all animate-in fade-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-300 hover:text-stone-900 transition-colors p-1"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-6">
          <header className="space-y-2">
            <h2 className="font-serif text-3xl text-stone-900 tracking-tight">
              {isLogin ? 'Bienvenido a Azúcar' : 'Crear Cuenta'}
            </h2>
            <p className="text-stone-400 text-xs uppercase tracking-[0.2em]">Donde la arquitectura encuentra el detalle</p>
          </header>
          
          {error && (
            <div className="bg-red-50 text-red-600 text-xs py-2.5 px-3 rounded border border-red-100 animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
             {!isLogin && (
               <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Nombre" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      autoComplete="given-name"
                      className="w-full border-b border-stone-200 py-3 text-sm text-stone-900 focus:outline-none focus:border-stone-900 transition-colors font-sans"
                    />
                    <input 
                      type="text" 
                      placeholder="Apellido" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      autoComplete="family-name"
                      className="w-full border-b border-stone-200 py-3 text-sm text-stone-900 focus:outline-none focus:border-stone-900 transition-colors font-sans"
                    />
                  </div>
                  <input 
                    type="tel" 
                    placeholder="Teléfono (Ej: +54...)" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    pattern="[0-9+ \-]*"
                    className="w-full border-b border-stone-200 py-3 text-sm text-stone-900 focus:outline-none focus:border-stone-900 transition-colors font-sans"
                  />
               </div>
             )}

             <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full border-b border-stone-200 py-3 text-sm text-stone-900 focus:outline-none focus:border-stone-900 transition-colors font-sans"
             />

             <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="w-full border-b border-stone-200 py-3 text-sm text-stone-900 focus:outline-none focus:border-stone-900 transition-colors font-sans pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-900 transition-colors p-2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
             </div>

             <div className="pt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-stone-900 text-white h-12 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all disabled:opacity-70 flex items-center justify-center"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isLogin ? 'Entrar' : 'Registrarse')}
                </button>
             </div>
          </form>

          <div className="pt-2 text-center">
            <button 
              onClick={() => {
                setMode(isLogin ? 'register' : 'login');
                setError(null);
              }}
              className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-900 border-b border-stone-100 hover:border-stone-900 transition-all pb-1"
            >
              {isLogin ? '¿No tienes cuenta? Crear una' : '¿Ya tienes cuenta? Iniciar Sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;