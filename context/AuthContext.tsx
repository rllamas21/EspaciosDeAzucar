import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';

// Definimos la estructura del Usuario
interface User {
  id: number;
  name: string;
  email: string;
  // Agregamos campos opcionales que podrían venir
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
  // Iniciamos loading en true para que no "parpadee" el login al dar F5
  const [loading, setLoading] = useState(true);

  // 1. Verificar sesión al cargar la página (Persistencia F5) 🔄
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('yobel_customer_token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Configuramos el header temporalmente para esta petición
        // (Aunque idealmente esto debe estar en el interceptor de axios)
        const { data } = await api.get('/api/store/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        setUser(data.customer);
      } catch (error) {
        console.log("Sesión expirada o token inválido");
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
      
      // Guardamos en disco y en memoria
      localStorage.setItem('yobel_customer_token', data.token);
      setUser(data.customer);
      
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
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
      console.error("Register error:", error);
      return { 
        success: false, 
        error: error.response?.data?.error || "Error al registrarse" 
      };
    }
  };

  // 4. Logout
  const logout = () => {
    localStorage.removeItem('yobel_customer_token');
    setUser(null);
    // Redirigir al login de la tienda
    window.location.href = '/store/login'; 
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