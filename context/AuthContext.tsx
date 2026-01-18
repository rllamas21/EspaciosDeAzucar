import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Persistencia de Sesión con limpieza de errores
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('yobel_customer_token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Validamos token contra el backend
        const { data } = await api.get('/api/store/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        setUser(data.customer);
      } catch (error) {
        console.log("Sesión inválida");
        localStorage.removeItem('yobel_customer_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // 2. Login
  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/api/store/auth/login', { email, password });
      
      localStorage.setItem('yobel_customer_token', data.token);
      setUser(data.customer);
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || "Credenciales incorrectas" 
      };
    }
  };

  // 3. Register
  const register = async (userData: any) => {
    try {
      const { data } = await api.post('/api/store/auth/register', userData);
      
      localStorage.setItem('yobel_customer_token', data.token);
      setUser(data.customer);
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || "Error al registrarse" 
      };
    }
  };


  const logout = () => {

    localStorage.removeItem('yobel_customer_token');

    setUser(null);
    

  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};