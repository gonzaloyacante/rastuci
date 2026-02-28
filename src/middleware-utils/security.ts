import { NextRequest, NextResponse } from "next/server";

/**
 * Constant-time string comparison to prevent timing attacks
 */
function timingSafeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export function applySecurityHeaders(response: NextResponse, nonce: string) {
  // Content Security Policy — nonce-based for scripts
  const csp = [
    "default-src 'self'",
    // Nonce-based script-src. 'unsafe-eval' removed: not required by MercadoPago or Sentry at runtime.
    // Sentry SDK is purely build-time (source maps). Next.js hydration works with nonces.
    `script-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com https://va.vercel-scripts.com https://www.googletagmanager.com`,
    // 'unsafe-inline' required for Next.js CSS-in-JS (styled-jsx, emotion, and inline style attributes).
    // Nonce-based styles would require custom Document config; tracked for future improvement.
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    "img-src 'self' data: https: blob: res.cloudinary.com images.unsplash.com placehold.co via.placeholder.com picsum.photos",
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' https://api.mercadopago.com https://*.sentry.io https://*.google-analytics.com https://www.googletagmanager.com wss://localhost:* ws://localhost:*",
    "worker-src 'self' blob:",
    // MercadoPago checkout and 3D-secure may open in iframes — allow their domains only
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
  // ONLY read-only public APIs and external webhooks are exempt.
  // State-modifying admin routes (/api/upload, /api/settings, /api/admin)
  // MUST be CSRF-protected even though they have withAdminAuth.
  const publicApiRoutes = [
    "/api/shipping", // Cálculo de envío (público, read-only)
    "/api/checkout", // Proceso de checkout (guest, no session)
    "/api/contact", // Formulario de contacto (guest)
    "/api/payments", // Webhooks de MercadoPago (external, signature-validated)
    "/api/webhooks", // Webhooks externos (external)
    "/api/products", // Catálogo de productos (público, read-only)
    "/api/categories", // Categorías (público, read-only)
    "/api/orders", // Creación de pedidos (guest checkout flow)
    "/api/coupons", // Validación de cupones (guest)
    "/api/auth", // Autenticación (NextAuth maneja su propio CSRF)
    "/api/cms", // Contenido CMS público (read-only)
    "/api/home", // Página de inicio (read-only)
    "/api/health", // Health check (read-only)
    "/api/ready", // Ready check (read-only)
    "/api/reviews", // Reseñas (guest con orderId)
    "/api/search", // Búsqueda (público, read-only)
    // NOT exempt: /api/upload, /api/settings, /api/admin, /api/analytics
    // These modify state and require CSRF + admin auth
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

  if (!token || !sessionToken || !timingSafeStringEqual(token, sessionToken)) {
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
