// ================================
// CATEGORÍAS
// ================================
export type Category =
  | 'Navidad'
  | 'Muebles'
  | 'Arquitectura';


// ================================
// IDIOMAS
// ================================
export type Language = 'ES' | 'EN' | 'PT';

// ================================
// OPCIONES DE COLOR
// ================================
export interface ColorOption {
  name: string;
  hex: string;
  image?: string;
  hoverImage?: string;
}

export interface FinishOption {
  name: string;        // Negro / Dorado
  hex?: string;        // opcional (para el circulito)
  image: string;       // imagen principal
  hoverImage?: string; // packshot / vista secundaria
}

// ================================
// PRODUCTO
// ================================
export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;

  // Imagen principal (card / fallback)
  image: string;

  // Galería (packshot + lifestyle)
  images?: string[];

  // Contenido
  description: string;
  dimensions: string;
  materialDetails: string;
  careInstructions: string;

  specs?: Record<string, string>;
  colors?: ColorOption[];
  sizes?: string[];
  stock?: number;
}

// ================================
// ITEM DE CARRITO
// ================================
export interface CartItem extends Product {
  quantity: number;
  selectedColor?: ColorOption;
  selectedSize?: string;
  cartItemId: string;
}

// ================================
// PAGOS
// ================================
export type PaymentMethod = 'credit_card' | 'bank_transfer';

// ================================
// ÓRDENES
// ================================
export type OrderStatus = 'processing' | 'shipped' | 'delivered';

export interface Order {
  id: string;
  customerName?: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: CartItem[];
}

// ================================
// DIRECCIONES
// ================================
export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  zip: string;
  isDefault: boolean;
}

// ================================
// USUARIO
// ================================
export interface User {
  name: string;
  email: string;
  role: 'client' | 'admin';
  orders: Order[];
  addresses: Address[];
  wishlist: Product[];
}
