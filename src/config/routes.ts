// Centralización de rutas admin.
// - Rutas de navegación (español) → para href en <Link> y <a> del panel admin.
// - Rutas internas (inglés) → para router.push(), redirects y lógica de negocio.
// Si una ruta cambia, solo hay que actualizar este archivo.

// ── Rutas de navegación (usuario) — español ──────────────────────────────────
// Estas son las URLs que el administrador ve. Next.js las reescribe a las rutas internas.

export const ADMIN_NAV = {
  ROOT: "/admin",
  DASHBOARD: "/admin/panel",

  // Catálogo
  PRODUCTS: "/admin/productos",
  PRODUCT_NEW: "/admin/productos/nuevo",
  PRODUCT_EDIT: (id: string) => `/admin/productos/${id}/editar`,

  CATEGORIES: "/admin/categorias",
  CATEGORY_NEW: "/admin/categorias/nueva",
  CATEGORY_EDIT: (id: string) => `/admin/categorias/${id}/editar`,

  // Operaciones
  ORDERS: "/admin/pedidos",
  ORDERS_PENDING: "/admin/pedidos/pendientes",
  ORDER_DETAIL: (id: string) => `/admin/pedidos/${id}`,

  TRACKING: "/admin/seguimiento",
  LOGISTICS: "/admin/logistica",
  SHIPPING_ANALYTICS: "/admin/analiticas-envio",
  BRANCHES_CA: "/admin/sucursales-ca",

  // Usuarios y contenido
  USERS: "/admin/usuarios",
  USER_NEW: "/admin/usuarios/nuevo",
  USER_EDIT: (id: string) => `/admin/usuarios/${id}/editar`,

  REVIEWS: "/admin/resenas",
  LEGAL: "/admin/legales",
  LEGAL_POLICY: (id: string) => `/admin/legales/${id}`,
  CONTACT: "/admin/contacto",
  HOME_CMS: "/admin/home",
  CMS: "/admin/gestion-contenidos",

  // Análisis y configuración
  ANALYTICS: "/admin/analiticas",
  METRICS: "/admin/metricas",
  SUPPORT: "/admin/soporte",
  SETTINGS: "/admin/configuracion",

  // Auth
  AUTH_SIGNIN: "/admin/auth/signin",
  AUTH_FORGOT_PASSWORD: "/admin/auth/forgot-password",
  AUTH_RESET_PASSWORD: "/admin/auth/reset-password",
} as const;

// ── Rutas internas — inglés ───────────────────────────────────────────────────
// Para uso en código: router.push(), redirect(), comparaciones de pathname.

export const ADMIN_ROUTES = {
  ROOT: "/admin",
  DASHBOARD: "/admin/dashboard",

  // Catálogo
  PRODUCTS: "/admin/products",
  PRODUCT_NEW: "/admin/products/new",
  PRODUCT_EDIT: (id: string) => `/admin/products/${id}/edit`,

  CATEGORIES: "/admin/categories",
  CATEGORY_NEW: "/admin/categories/new",
  CATEGORY_EDIT: (id: string) => `/admin/categories/${id}/edit`,

  // Operaciones
  ORDERS: "/admin/orders",
  ORDERS_PENDING: "/admin/orders/pending",
  ORDER_DETAIL: (id: string) => `/admin/orders/${id}`,

  TRACKING: "/admin/tracking",
  LOGISTICS: "/admin/logistics",
  SHIPPING_ANALYTICS: "/admin/shipping-analytics",
  BRANCHES_CA: "/admin/branches-ca",

  // Usuarios y contenido
  USERS: "/admin/users",
  USER_NEW: "/admin/users/new",
  USER_EDIT: (id: string) => `/admin/users/${id}/edit`,

  REVIEWS: "/admin/reviews",
  LEGAL: "/admin/legal",
  LEGAL_POLICY: (id: string) => `/admin/legal/${id}`,
  CONTACT: "/admin/contact",
  HOME_CMS: "/admin/home",
  CMS: "/admin/cms",

  // Análisis y configuración
  ANALYTICS: "/admin/analytics",
  METRICS: "/admin/metrics",
  SUPPORT: "/admin/support",
  SETTINGS: "/admin/settings",

  // Auth
  AUTH_SIGNIN: "/admin/auth/signin",
  AUTH_FORGOT_PASSWORD: "/admin/auth/forgot-password",
  AUTH_RESET_PASSWORD: "/admin/auth/reset-password",
} as const;
