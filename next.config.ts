import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Configuración de Turbopack (silencia advertencia de compatibilidad webpack en Next.js 16)
  turbopack: {},
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "react-hook-form",
      "zod",
      "react-hot-toast",
    ],
  },
  images: {
    loader: "custom",
    loaderFile: "./src/lib/cloudinaryLoader.ts",
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    qualities: [75, 80, 85, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Bundle analyzer removido para evitar errores de compilación
  // Optimizaciones de performance
  async rewrites() {
    return [
      // Rutas Admin (Español -> Inglés)
      { source: "/admin/categorias", destination: "/admin/categories" },
      {
        source: "/admin/categorias/nueva",
        destination: "/admin/categories/new",
      },
      {
        source: "/admin/categorias/:id/editar",
        destination: "/admin/categories/:id/edit",
      },
      {
        source: "/admin/categorias/:path*",
        destination: "/admin/categories/:path*",
      },

      { source: "/admin/configuracion", destination: "/admin/settings" },
      { source: "/admin/logistica", destination: "/admin/logistics" },
      { source: "/admin/metricas", destination: "/admin/metrics" },

      { source: "/admin/pedidos", destination: "/admin/orders" },
      {
        source: "/admin/pedidos/pendientes",
        destination: "/admin/orders/pending",
      },
      { source: "/admin/pedidos/:path*", destination: "/admin/orders/:path*" },

      { source: "/admin/productos", destination: "/admin/products" },
      { source: "/admin/productos/nuevo", destination: "/admin/products/new" },
      {
        source: "/admin/productos/:id/editar",
        destination: "/admin/products/:id/edit",
      },
      {
        source: "/admin/productos/:path*",
        destination: "/admin/products/:path*",
      },

      { source: "/admin/soporte", destination: "/admin/support" },
      { source: "/admin/sucursales-ca", destination: "/admin/branches-ca" },

      { source: "/admin/usuarios", destination: "/admin/users" },
      { source: "/admin/usuarios/nuevo", destination: "/admin/users/new" },
      {
        source: "/admin/usuarios/:id/editar",
        destination: "/admin/users/:id/edit",
      },
      { source: "/admin/usuarios/:path*", destination: "/admin/users/:path*" },

      // Rutas Públicas (Español -> Inglés)
      { source: "/carrito", destination: "/cart" },
      { source: "/contacto", destination: "/contact" },
      { source: "/favoritos", destination: "/favorites" },

      { source: "/legal/privacidad", destination: "/legal/privacy" },
      { source: "/legal/terminos", destination: "/legal/terms" },

      { source: "/productos", destination: "/products" },
      { source: "/productos/:path*", destination: "/products/:path*" },
    ];
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  // Evitar advertencia sobre lockfiles múltiples (inferred workspace root)
  outputFileTracingRoot: __dirname,
  // Headers de seguridad y cache
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: res.cloudinary.com images.unsplash.com placehold.co via.placeholder.com picsum.photos; font-src 'self' fonts.gstatic.com; connect-src 'self' res.cloudinary.com;",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source:
          "/(.*\\.(?:js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
