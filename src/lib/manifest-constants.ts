import { MetadataRoute } from "next";

/**
 * Constantes estáticas del Web App Manifest (shortcuts y screenshots).
 * Extraídas de manifest.ts para reducir su complejidad ciclomática.
 */

export const MANIFEST_SHORTCUTS: MetadataRoute.Manifest["shortcuts"] = [
  {
    name: "Productos",
    short_name: "Productos",
    description: "Ver todos los productos",
    url: "/productos",
    icons: [{ src: "/icons/shortcut-products.png", sizes: "96x96" }],
  },
  {
    name: "Carrito",
    short_name: "Carrito",
    description: "Ver carrito de compras",
    url: "/carrito",
    icons: [{ src: "/icons/shortcut-cart.png", sizes: "96x96" }],
  },
  {
    name: "Favoritos",
    short_name: "Favoritos",
    description: "Ver productos favoritos",
    url: "/favoritos",
    icons: [{ src: "/icons/shortcut-wishlist.png", sizes: "96x96" }],
  },
  {
    name: "Mi Cuenta",
    short_name: "Cuenta",
    description: "Gestionar mi cuenta",
    url: "/cuenta",
    icons: [{ src: "/icons/shortcut-account.png", sizes: "96x96" }],
  },
];

export const MANIFEST_SCREENSHOTS: MetadataRoute.Manifest["screenshots"] = [
  {
    src: "/screenshots/desktop-home.png",
    sizes: "1280x720",
    type: "image/png",
    form_factor: "wide",
    label: "Página de inicio en escritorio",
  },
  {
    src: "/screenshots/mobile-home.png",
    sizes: "375x667",
    type: "image/png",
    form_factor: "narrow",
    label: "Página de inicio en móvil",
  },
  {
    src: "/screenshots/products.png",
    sizes: "375x667",
    type: "image/png",
    form_factor: "narrow",
    label: "Catálogo de productos",
  },
  {
    src: "/screenshots/product-detail.png",
    sizes: "375x667",
    type: "image/png",
    form_factor: "narrow",
    label: "Detalle de producto",
  },
];

export const MANIFEST_STATIC = {
  display: "standalone" as const,
  background_color: "#ffffff",
  theme_color: "#e91e63",
  orientation: "portrait-primary" as const,
  scope: "/",
  start_url: "/",
  lang: "es",
  categories: ["shopping", "lifestyle"],
  related_applications: [],
  prefer_related_applications: false,
  protocol_handlers: [{ protocol: "web+rastuci", url: "/share?url=%s" }],
} satisfies Partial<MetadataRoute.Manifest>;
