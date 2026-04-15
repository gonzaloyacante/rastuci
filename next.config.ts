import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración de Turbopack (silencia advertencia de compatibilidad webpack en Next.js 16)

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "react-hook-form",
      "@hookform/resolvers",
      "zod",
      "date-fns",
      "framer-motion",
      "recharts",
      "swr",
    ],
  },
  images: {
    loader: "custom",
    loaderFile: "./src/lib/cloudinaryLoader.ts",
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    qualities: [60, 75, 80, 85, 90],
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

      // -- Categorías
      { source: "/admin/panel", destination: "/admin/dashboard" },
      { source: "/admin/seguimiento", destination: "/admin/tracking" },
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

      // -- Configuración / Logística / Métricas
      { source: "/admin/configuracion", destination: "/admin/settings" },
      { source: "/admin/logistica", destination: "/admin/logistics" },
      { source: "/admin/metricas", destination: "/admin/metrics" },

      // -- Pedidos
      { source: "/admin/pedidos", destination: "/admin/orders" },
      {
        source: "/admin/pedidos/pendientes",
        destination: "/admin/orders/pending",
      },
      { source: "/admin/pedidos/:path*", destination: "/admin/orders/:path*" },

      // -- Productos
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

      // -- Legales (políticas / editor)
      { source: "/admin/legales", destination: "/admin/legal" },
      { source: "/admin/legales/:path*", destination: "/admin/legal/:path*" },

      // -- Soporte / Sucursales / Reseñas
      { source: "/admin/soporte", destination: "/admin/support" },
      { source: "/admin/sucursales-ca", destination: "/admin/branches-ca" },
      { source: "/admin/resenas", destination: "/admin/reviews" },
      { source: "/admin/resenas/:path*", destination: "/admin/reviews/:path*" },

      // -- Usuarios
      { source: "/admin/usuarios", destination: "/admin/users" },
      { source: "/admin/usuarios/nuevo", destination: "/admin/users/new" },
      {
        source: "/admin/usuarios/:id/editar",
        destination: "/admin/users/:id/edit",
      },
      { source: "/admin/usuarios/:path*", destination: "/admin/users/:path*" },

      // -- Otras utilidades (Analytics, CMS, Contacto, Shipping)
      { source: "/admin/analiticas", destination: "/admin/analytics" },
      { source: "/admin/gestion-contenidos", destination: "/admin/cms" },
      { source: "/admin/contacto", destination: "/admin/contact" },
      {
        source: "/admin/analiticas-envio",
        destination: "/admin/shipping-analytics",
      },

      // Rutas Públicas (Español -> Inglés)

      // -- Carrito / Favoritos / Contacto
      { source: "/carrito", destination: "/cart" },
      { source: "/contacto", destination: "/contact" },
      { source: "/favoritos", destination: "/favorites" },

      // -- Legales
      { source: "/legal/privacidad", destination: "/legal/privacy" },
      { source: "/legal/terminos", destination: "/legal/terms" },
      {
        source: "/legal/defensa-al-consumidor",
        destination: "/legal/consumer-defense",
      },
      {
        source: "/defensa-al-consumidor",
        destination: "/legal/consumer-defense",
      },

      // -- Productos
      { source: "/productos", destination: "/products" },
      { source: "/productos/:path*", destination: "/products/:path*" },

      // -- Checkout / Seguimiento / Pedidos
      { source: "/finalizar-compra", destination: "/checkout" },
      { source: "/finalizar-compra/:path*", destination: "/checkout/:path*" },
      { source: "/seguimiento", destination: "/tracking" },
      { source: "/pedidos", destination: "/orders" },
      { source: "/pedidos/:path*", destination: "/orders/:path*" },

      // -- Reviews / Wishlist / Offline (páginas públicas adicionales)
      { source: "/reseñas", destination: "/reviews" },
      { source: "/reseñas/valorar/:id", destination: "/reviews/rate/:id" },
      {
        source: "/lista-de-deseos/:token",
        destination: "/wishlist/shared/:token",
      },
    ];
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  // Evitar advertencia sobre lockfiles múltiples (inferred workspace root)
  outputFileTracingRoot: __dirname,
  // Cache headers only — security headers are applied dynamically via proxy.ts → applySecurityHeaders()
  async headers() {
    return [
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

const withBundleAnalyzer = (config: NextConfig) => {
  if (process.env.ANALYZE === "true") {
    try {
      const bundleAnalyzer = require("@next/bundle-analyzer");
      return bundleAnalyzer({ enabled: true })(config);
    } catch (e) {
      console.warn("Could not load @next/bundle-analyzer", e);
    }
  }
  return config;
};

export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "gonzaloyacante",

  project: "rastuci",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  // Disabled to reduce Vercel build time — standard source maps are sufficient
  widenClientFileUpload: false,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
