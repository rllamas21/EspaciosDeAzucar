import axios from 'axios';

// =================================================================
// 🔑 CONFIGURACIÓN DE VARIABLES DE ENTORNO
// =================================================================

// 1. URL del Backend
// ⚠️ CAMBIO AQUÍ: Agregamos 'export' y renombramos a API_URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// 2. Store Public Key (Identificador de la tienda)
const STORE_PUBLIC_KEY = import.meta.env.VITE_STORE_PUBLIC_KEY;

// 3. Exportamos la Key de Mercado Pago
export const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY || '';

// Verificación de seguridad
if (!STORE_PUBLIC_KEY) {
  console.warn('⚠️ ADVERTENCIA: No se encontró VITE_STORE_PUBLIC_KEY en el archivo .env');
}

// =================================================================
// 🌐 CONFIGURACIÓN DE AXIOS
// =================================================================
const api = axios.create({
  baseURL: API_URL, 
  headers: {
    'Content-Type': 'application/json',
    'x-public-api-key': STORE_PUBLIC_KEY,
  },
});

// Interceptor: Inyectar Token de Cliente si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('yobel_customer_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;