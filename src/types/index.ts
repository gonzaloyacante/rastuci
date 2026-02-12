// Tipos base de la base de datos
export interface Category {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null; // Allow null for compatibility
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    products: number;
  };
}

// Tipos serializados para el frontend
export interface SerializedCategory {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  salePrice?: number; // Precio con descuento
  stock: number;
  images: string[];
  onSale?: boolean;
  sizes?: string[];
  colors?: string[];
  features?: string[];
  rating?: number | null;
  reviewCount?: number;
  // Dimensiones para envío
  weight?: number | null; // Peso en gramos
  height?: number | null; // Alto en cm
  width?: number | null; // Ancho en cm
  length?: number | null; // Largo en cm
  categoryId: string;
  categories?: Category | null;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
  variants?: ProductVariant[];
  colorImages?: Record<string, string[]> | null;
  sizeGuide?: { size: string; measurements: string; ageRange?: string }[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  color: string;
  size: string;
  stock: number;
  sku?: string | null;
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  password?: string | null;
  isAdmin: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Core Order Fields
export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string | null;
  customerCity?: string | null;
  customerProvince?: string | null;
  customerPostalCode?: string | null;
  customerEmail?: string | null;
  total: number;
  status: OrderStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
  items?: OrderItem[];
  // Payment
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  mpPaymentId?: string | null;
  mpPreferenceId?: string | null;
  mpStatus?: string | null;
  // Shipping
  shippingMethod?: string | null;
  shippingCost?: number | null;
  shippingStreet?: string | null;
  shippingNumber?: string | null;
  shippingFloor?: string | null;
  shippingApartment?: string | null;
  shippingCity?: string | null;
  shippingProvince?: string | null;
  shippingPostalCode?: string | null;
  shippingLocality?: string | null;
  shippingProvinceCode?: string | null;
  shippingAgency?: string | null;
  estimatedDelivery?: Date | string | null;
  estimatedDeliveryMin?: string | null;
  estimatedDeliveryMax?: string | null;
  trackingNumber?: string | null;
  // Correo Argentino
  caTrackingNumber?: string | null;
  caShipmentId?: string | null;
  caExtOrderId?: string | null;
  caCustomerId?: string | null;
  caOrderNumber?: string | null;
  caImportStatus?: string | null;
  caImportError?: string | null;
}

// Tipos serializados para el frontend
export interface SerializedOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerEmail?: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: SerializedOrderItem[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  orderId: string;
  productId: string;
  size?: string;
  color?: string;
  product?: Product;
}

export interface SerializedOrderItem {
  id: string;
  quantity: number;
  price: number;
  orderId: string;
  productId: string;
  product: {
    id: string;
    name: string;
    category: {
      id: string;
      name: string;
    };
  };
}

export enum OrderStatus {
  PENDING = "PENDING", // Pedido creado, esperando pago del cliente
  PENDING_PAYMENT = "PENDING_PAYMENT", // Cliente pagó, admin debe pagar envío
  PROCESSED = "PROCESSED", // Envío pagado, listo para entregar
  DELIVERED = "DELIVERED", // Entregado al cliente
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
  onSale?: boolean;
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

export interface ProductReview {
  id: string;
  rating: number;
  comment?: string | null;
  customerName: string;
  createdAt: Date;
  productId: string;
}

export interface SerializedProductReview {
  id: string;
  rating: number;
  comment?: string | null;
  customerName: string;
  createdAt: string;
  productId: string;
}

// Interfaces utilitarias para Servicios (OrderService, Resend)
export interface OrderItemInput {
  productId: string;
  quantity: number | string;
  size?: string;
  color?: string;
}

export interface MercadoPagoPayer {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: {
    number?: string;
  };
}

export interface OrderEmailSummary {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  total: number;
}

export interface OrderEmailItem {
  name: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
}
