import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Configuración de Turbopack (silencia advertencia de compatibilidad webpack en Next.js 16)
  turbopack: {},
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "react-hook-form",
      "zod",
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
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' va.vercel-scripts.com https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' blob: data: https: res.cloudinary.com images.unsplash.com placehold.co via.placeholder.com picsum.photos",
              "font-src 'self' https://fonts.gstatic.com data:",
              "connect-src 'self' https://api.mercadopago.com https://*.sentry.io https://*.google-analytics.com https://www.googletagmanager.com wss://localhost:* ws://localhost:*",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
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
  widenClientFileUpload: true,

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
