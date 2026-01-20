// types.ts

// 🟢 MEJORA: Cambiamos de union type a string.
export type Category = string; 

export type Language = 'ES' | 'EN' | 'PT';

export interface ColorOption {
  name: string;
  hex: string;
}

// Estructura para atributos universales
export interface DynamicAttribute {
  name: string;   
  values: string[]; 
}

// 🔥 DEFINICIÓN DE VARIANTE (SKU, Stock, Precio)
export interface Variant {
  id: number;
  price: number;
  stock: number;
  sku: string;
  // El backend envía: attributes: { "Color": "Beige", "Tamaño": "140x210" }
  attributes: Record<string, string>; 
  
  // 🔥 NUEVO: Soportar imágenes a nivel de variante
  image?: string;    // Foto principal de la variante
  images?: string[]; // Galería completa de la variante
}

export interface Product {
  id: string; 
  name: string;
  price: number; // Precio base (desde...)
  category: Category;
  image: string;     // URL principal (R2)
  images?: string[]; // Galería de URLs (R2)
  
  description: string; 
  dimensions?: string; 
  materialDetails?: string;
  careInstructions?: string;
  
  specs?: Record<string, string>;
  
  // Estos arrays sirven para pintar las bolitas y botones iniciales
  colors?: ColorOption[];
  sizes?: string[];
  
  stock?: number; // Stock total sumado

  // 🔥 LA DATA REAL DE INVENTARIO
  variants?: Variant[];
  allAttributes?: DynamicAttribute[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: ColorOption;
  selectedSize?: string;
  cartItemId: string; 
  selectedVariantId?: number; // ID clave para descontar stock
}

// --- TIPOS DE CUENTA ---

export type OrderStatus = 'processing' | 'shipped' | 'delivered';

export interface Order {
  id: string;
  customerName?: string; 
  date: string;
  total: number;
  status: OrderStatus;
  items: CartItem[];
}

export interface Address {
  id: number;          
  alias: string;       
  recipient_name: string; 
  street: string;
  number: string;     
  floor_apt?: string;   
  city: string;
  zip_code: string;    
  province: string;
  phone: string;
  dni?: string;
  is_default: boolean; 
}

export interface User {
  id?: number; 
  name: string;
  email: string;
  role: 'client' | 'admin';
  orders: Order[];
  addresses: Address[];
  wishlist: Product[];
}