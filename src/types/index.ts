// Tipos base de la base de datos
export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  images: string[];
  categoryId: string;
  category?: Category;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  password?: string;
  isAdmin: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  orderId: string;
  productId: string;
  product?: Product;
}

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSED = "PROCESSED",
  DELIVERED = "DELIVERED",
}

// Tipos para formularios
export interface CheckoutFormData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  images?: FileList;
}

export interface CategoryFormData {
  name: string;
  description?: string;
}

// Tipos para el carrito de compras
export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// Tipos para respuestas de API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tipos para filtros y paginación
export interface ProductFilters {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
