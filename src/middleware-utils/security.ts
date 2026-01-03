import { NextRequest, NextResponse } from "next/server";

export function securityHeaders(_request: NextRequest) {
  const response = NextResponse.next();

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://fonts.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.mercadopago.com",
    "worker-src 'self' blob:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  // Security headers
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // HSTS (only in production)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
}

export function csrfProtection(request: NextRequest) {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    return null;
  }

  const pathname = request.nextUrl.pathname;

  // Rutas públicas que NO necesitan protección CSRF
  // Estas son APIs del e-commerce que se llaman desde el frontend sin autenticación
  const publicApiRoutes = [
    "/api/shipping", // Cálculo de envío
    "/api/checkout", // Proceso de checkout
    "/api/contact", // Formulario de contacto
    "/api/payments", // Webhooks de MercadoPago
    "/api/webhooks", // Webhooks externos
    "/api/products", // Catálogo de productos (público)
    "/api/categories", // Categorías (público)
    "/api/orders", // Creación de pedidos
    "/api/coupons", // Validación de cupones
    // "/api/search", // Removed: useSearch now calls /api/products directly
    "/api/auth", // Autenticación (NextAuth maneja su propio CSRF)
    "/api/ai-faq", // FAQ con IA
    "/api/live-chat", // Chat en vivo
    "/api/cms", // Contenido CMS público
    "/api/home", // Página de inicio
    "/api/health", // Health check
    "/api/ready", // Ready check
    "/api/analytics", // Analytics (tracking anónimo)
    "/api/upload", // Subida de imágenes por admin (protegido por AdminAuth)
  ];

  // Verificar si la ruta actual es una ruta pública
  const isPublicRoute = publicApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return null; // No aplicar CSRF a rutas públicas
  }

  const token =
    request.headers.get("x-csrf-token") ||
    request.cookies.get("csrf-token")?.value;

  const sessionToken = request.cookies.get("session-csrf")?.value;

  if (!token || !sessionToken || token !== sessionToken) {
    return NextResponse.json(
      { success: false, error: "CSRF token inválido" },
      { status: 403 }
    );
  }

  return null;
}

export function generateCSRFToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
