/**
 * Constantes compartidas de la aplicación
 *
 * Este archivo es la ÚNICA fuente de verdad para constantes globales.
 * NO dupliques estas constantes en otros archivos.
 */

// ============================================================================
// DÍAS DE LA SEMANA
// ============================================================================

export const WEEKDAY_NAMES_SHORT = {
  monday: "Lun",
  tuesday: "Mar",
  wednesday: "Mié",
  thursday: "Jue",
  friday: "Vie",
  saturday: "Sáb",
  sunday: "Dom",
} as const;

export const WEEKDAY_NAMES_FULL = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
} as const;

export type WeekdayKey = keyof typeof WEEKDAY_NAMES_SHORT;

// ============================================================================
// PROVINCIAS DE ARGENTINA (Códigos de Correo Argentino)
// ============================================================================

/**
 * Códigos de provincia para Correo Argentino
 * Basado en la documentación oficial de MiCorreo API
 */
export type ProvinceCode =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

/**
 * Array de provincias con código y nombre
 * Útil para selects y dropdowns
 */
export const PROVINCIAS: Array<{ code: ProvinceCode; name: string }> = [
  { code: "A", name: "Salta" },
  { code: "B", name: "Buenos Aires" },
  { code: "C", name: "Ciudad Autónoma de Buenos Aires" },
  { code: "D", name: "San Luis" },
  { code: "E", name: "Entre Ríos" },
  { code: "F", name: "La Rioja" },
  { code: "G", name: "Santiago del Estero" },
  { code: "H", name: "Chaco" },
  { code: "J", name: "San Juan" },
  { code: "K", name: "Catamarca" },
  { code: "L", name: "La Pampa" },
  { code: "M", name: "Mendoza" },
  { code: "N", name: "Misiones" },
  { code: "P", name: "Formosa" },
  { code: "Q", name: "Neuquén" },
  { code: "R", name: "Río Negro" },
  { code: "S", name: "Santa Fe" },
  { code: "T", name: "Tucumán" },
  { code: "U", name: "Chubut" },
  { code: "V", name: "Tierra del Fuego" },
  { code: "W", name: "Corrientes" },
  { code: "X", name: "Córdoba" },
  { code: "Y", name: "Jujuy" },
  { code: "Z", name: "Santa Cruz" },
];

/**
 * Mapeo de código de provincia a nombre completo
 * Útil para mostrar nombres desde códigos
 */
export const PROVINCE_CODE_MAP: Record<ProvinceCode, string> = {
  A: "Salta",
  B: "Buenos Aires",
  C: "Ciudad Autónoma de Buenos Aires",
  D: "San Luis",
  E: "Entre Ríos",
  F: "La Rioja",
  G: "Santiago del Estero",
  H: "Chaco",
  J: "San Juan",
  K: "Catamarca",
  L: "La Pampa",
  M: "Mendoza",
  N: "Misiones",
  P: "Formosa",
  Q: "Neuquén",
  R: "Río Negro",
  S: "Santa Fe",
  T: "Tucumán",
  U: "Chubut",
  V: "Tierra del Fuego",
  W: "Corrientes",
  X: "Córdoba",
  Y: "Jujuy",
  Z: "Santa Cruz",
};

/**
 * Lista simple de nombres de provincias (sin códigos)
 * Para compatibilidad con código que solo necesita nombres
 */
export const ARGENTINA_PROVINCES = PROVINCIAS.map((p) => p.name);

export type ArgentinaProvince = (typeof ARGENTINA_PROVINCES)[number];

// ============================================================================
// ESTADOS Y CONFIGURACIONES
// ============================================================================

export const ORDER_STATUS = {
  PENDING: "PENDING",
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PROCESSED: "PROCESSED",
  DELIVERED: "DELIVERED",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export const SHIPPING_METHODS = {
  CORREO_ARGENTINO: "correo-argentino",
  PICKUP: "pickup",
} as const;

export const PAYMENT_METHODS = {
  MERCADOPAGO: "mercadopago",
  CASH: "cash",
  TRANSFER: "transfer",
} as const;

export const SHIPPING_COSTS = {
  standard: 1500,
  express: 2500,
  pickup: 0,
} as const;

export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const;

// ============================================================================
// CONFIGURACIONES DE LÍMITES
// ============================================================================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES_PER_PRODUCT: 10,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
} as const;

export const CACHE_DURATIONS = {
  PRODUCTS: 5 * 60, // 5 minutos
  CATEGORIES: 10 * 60, // 10 minutos
  SETTINGS: 30 * 60, // 30 minutos
} as const;

// ============================================================================
// OPCIONES DE ORDENAMIENTO (Productos)
// ============================================================================

/**
 * Opciones de ordenamiento para listados de productos
 * Iconos: usar lucide-react al renderizar
 * - relevance: Sparkles
 * - price-asc: ArrowUpNarrowWide
 * - price-desc: ArrowDownWideNarrow
 * - createdAt-desc: Clock
 * - rating-desc: Star
 * - name-asc: ArrowDownAZ
 * - name-desc: ArrowUpZA
 */
export const SORT_OPTIONS = [
  { id: "relevance", label: "Relevancia", icon: "Sparkles" },
  {
    id: "price-asc",
    label: "Precio: menor a mayor",
    icon: "ArrowUpNarrowWide",
  },
  {
    id: "price-desc",
    label: "Precio: mayor a menor",
    icon: "ArrowDownWideNarrow",
  },
  { id: "createdAt-desc", label: "Más recientes", icon: "Clock" },
  { id: "rating-desc", label: "Mejor calificados", icon: "Star" },
  { id: "name-asc", label: "A-Z", icon: "ArrowDownAZ" },
  { id: "name-desc", label: "Z-A", icon: "ArrowUpZA" },
] as const;

export type SortOptionId = (typeof SORT_OPTIONS)[number]["id"];

export const PLACEHOLDER_IMAGE =
  "https://placehold.co/600x600/f3f4f6/9ca3af?text=Imagen+No+Disponible";
