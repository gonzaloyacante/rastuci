import { useDocumentTitle } from "@/hooks";

// Map of admin pages and their titles
const pageTitles = {
  "/admin": "Iniciar Sesi\u00f3n",
  "/admin/dashboard": "Dashboard",
  "/admin/productos": "Productos",
  "/admin/productos/nuevo": "Nuevo Producto",
  "/admin/productos/edit": "Editar Producto",
  "/admin/pedidos": "Pedidos",
  "/admin/pedidos/pendientes": "Pedidos Pendientes",
  "/admin/pedidos/[id]": "Detalle del Pedido",
  "/admin/categorias": "Categorías",
  "/admin/categorias/nueva": "Nueva Categoría",
  "/admin/categorias/[id]/editar": "Editar Categoría",
  "/admin/usuarios": "Usuarios",
  "/admin/usuarios/nuevo": "Nuevo Usuario",
  "/admin/usuarios/create": "Crear Usuario",
  "/admin/usuarios/edit": "Editar Usuario",
  "/admin/usuarios/[id]/editar": "Editar Usuario",
  "/admin/cms": "Gestión de Contenido",
  "/admin/home": "Página de Inicio",
  "/admin/logistica": "Logística",
  "/admin/tracking": "Seguimiento de Envíos",
  "/admin/shipping-analytics": "Analíticas de Envío",
  "/admin/sucursales-ca": "Sucursales Correo Argentino",
  "/admin/soporte": "Soporte",
  "/admin/contact": "Mensajes de Contacto",
  "/admin/metricas": "Métricas",
} as const;

/**
 * Use this helper to set admin page titles
 * @param page - The full page path (e.g., '/admin/productos')
 */
export function useAdminPageTitle(page: keyof typeof pageTitles) {
  const title = pageTitles[page];
  useDocumentTitle({ title, suffix: "Rastuci Admin" });
}
