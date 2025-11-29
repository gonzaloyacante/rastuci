// Admin page titles mapping
export const ADMIN_PAGE_TITLES = {
  // Main sections
  dashboard: "Dashboard",
  login: "Iniciar Sesión",

  // Products
  products: "Productos",
  "products-new": "Nuevo Producto",
  "products-edit": "Editar Producto",

  // Orders
  orders: "Pedidos",
  "orders-pending": "Pedidos Pendientes",
  "orders-detail": "Detalle del Pedido",

  // Categories
  categories: "Categorías",
  "categories-new": "Nueva Categoría",
  "categories-edit": "Editar Categoría",

  // Users
  users: "Usuarios",
  "users-new": "Nuevo Usuario",
  "users-edit": "Editar Usuario",

  // CMS & Content
  cms: "Gestión de Contenido",
  home: "Página de Inicio",

  // Logistics & Shipping
  logistics: "Logística",
  tracking: "Seguimiento de Envíos",
  "shipping-analytics": "Analíticas de Envío",
  "sucursales-ca": "Sucursales Correo Argentino",

  // Support & Contact
  support: "Soporte",
  contact: "Mensajes de Contacto",

  // Analytics & Metrics
  metrics: "Métricas",

  // Error pages
  notFound: "Página No Encontrada",
} as const;

// Type for admin page keys
export type AdminPageKey = keyof typeof ADMIN_PAGE_TITLES;

// Helper function to get title by key
export function getAdminTitle(key: AdminPageKey): string {
  return ADMIN_PAGE_TITLES[key];
}

// Route to title mapping for dynamic title resolution
export const ADMIN_ROUTE_TITLES: Record<string, string> = {
  "/admin": ADMIN_PAGE_TITLES.dashboard,
  "/admin/dashboard": ADMIN_PAGE_TITLES.dashboard,
  "/admin/productos": ADMIN_PAGE_TITLES.products,
  "/admin/productos/nuevo": ADMIN_PAGE_TITLES["products-new"],
  "/admin/pedidos": ADMIN_PAGE_TITLES.orders,
  "/admin/pedidos/pendientes": ADMIN_PAGE_TITLES["orders-pending"],
  "/admin/categorias": ADMIN_PAGE_TITLES.categories,
  "/admin/categorias/nueva": ADMIN_PAGE_TITLES["categories-new"],
  "/admin/usuarios": ADMIN_PAGE_TITLES.users,
  "/admin/usuarios/nuevo": ADMIN_PAGE_TITLES["users-new"],
  "/admin/cms": ADMIN_PAGE_TITLES.cms,
  "/admin/home": ADMIN_PAGE_TITLES.home,
  "/admin/logistica": ADMIN_PAGE_TITLES.logistics,
  "/admin/tracking": ADMIN_PAGE_TITLES.tracking,
  "/admin/shipping-analytics": ADMIN_PAGE_TITLES["shipping-analytics"],
  "/admin/sucursales-ca": ADMIN_PAGE_TITLES["sucursales-ca"],
  "/admin/soporte": ADMIN_PAGE_TITLES.support,
  "/admin/contact": ADMIN_PAGE_TITLES.contact,
  "/admin/metricas": ADMIN_PAGE_TITLES.metrics,
};
