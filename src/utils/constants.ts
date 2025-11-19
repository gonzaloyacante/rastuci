/**
 * Constantes globales de la aplicación
 */

import type { ProvinceCode } from '@/lib/correo-argentino-service';

/**
 * Provincias argentinas con sus códigos oficiales
 * Basado en códigos de Correo Argentino
 */
export const PROVINCIAS: Array<{ code: ProvinceCode; name: string }> = [
  { code: 'A', name: 'Salta' },
  { code: 'B', name: 'Buenos Aires' },
  { code: 'C', name: 'Ciudad de Buenos Aires' },
  { code: 'D', name: 'San Luis' },
  { code: 'E', name: 'Entre Ríos' },
  { code: 'F', name: 'La Rioja' },
  { code: 'G', name: 'Santiago del Estero' },
  { code: 'H', name: 'Chaco' },
  { code: 'J', name: 'San Juan' },
  { code: 'K', name: 'Catamarca' },
  { code: 'L', name: 'La Pampa' },
  { code: 'M', name: 'Mendoza' },
  { code: 'N', name: 'Misiones' },
  { code: 'P', name: 'Formosa' },
  { code: 'Q', name: 'Neuquén' },
  { code: 'R', name: 'Río Negro' },
  { code: 'S', name: 'Santa Fe' },
  { code: 'T', name: 'Tucumán' },
  { code: 'U', name: 'Chubut' },
  { code: 'V', name: 'Tierra del Fuego' },
  { code: 'W', name: 'Corrientes' },
  { code: 'X', name: 'Córdoba' },
  { code: 'Y', name: 'Jujuy' },
  { code: 'Z', name: 'Santa Cruz' },
];

/**
 * Estados de órdenes
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

/**
 * Estados de pagos
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

/**
 * Métodos de envío
 */
export const SHIPPING_METHODS = {
  CORREO_ARGENTINO: 'correo-argentino',
  PICKUP: 'pickup',
} as const;

/**
 * Métodos de pago
 */
export const PAYMENT_METHODS = {
  MERCADOPAGO: 'mercadopago',
  CASH: 'cash',
  TRANSFER: 'transfer',
} as const;

/**
 * Roles de usuario
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

/**
 * Configuración de paginación por defecto
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Límites de archivos
 */
export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES_PER_PRODUCT: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

/**
 * Configuración de caché
 */
export const CACHE_DURATIONS = {
  PRODUCTS: 5 * 60, // 5 minutos
  CATEGORIES: 10 * 60, // 10 minutos
  SETTINGS: 30 * 60, // 30 minutos
} as const;
