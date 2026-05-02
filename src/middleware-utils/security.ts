import { NextRequest, NextResponse } from "next/server";

export function applySecurityHeaders(response: NextResponse, nonce: string) {
  // Content Security Policy — nonce + strict-dynamic based
  // Build script-src allowing 'unsafe-eval' only in non-production (development) environments
  const scriptSrcList = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    "https://fonts.googleapis.com",
    "https://va.vercel-scripts.com",
    "https://www.googletagmanager.com",
  ];

  // React dev-mode uses eval() for some debugging features (callstack reconstruction).
  // To avoid breaking dev ergonomics, allow 'unsafe-eval' in development only.
  if (process.env.NODE_ENV !== "production") {
    scriptSrcList.push("'unsafe-eval'");
  }

  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrcList.join(" ")}`,
    // 'unsafe-inline' required for Next.js CSS-in-JS (styled-jsx, emotion, and inline style attributes).
    // Nonce-based styles would require custom Document config; tracked for future improvement.
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    "img-src 'self' data: https: blob: res.cloudinary.com images.unsplash.com placehold.co via.placeholder.com picsum.photos",
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' https://res.cloudinary.com https://api.mercadopago.com https://*.sentry.io https://*.google-analytics.com https://www.googletagmanager.com wss://localhost:* ws://localhost:*",
    "worker-src 'self' blob:",
    // MercadoPago uses redirect flow (not iframes), so frame-src 'none' is correct
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
  // Skip CSRF for GET, HEAD, OPTIONS (safe/idempotent methods)
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    return null;
  }

  const pathname = request.nextUrl.pathname;

  // Rutas externas/integrations: totalmente exentas de CSRF y validación de Origin.
  // Estas rutas usan su propio mecanismo de seguridad (firmas, NextAuth CSRF, etc.)
  const externalRoutes = [
    "/api/payments", // Webhooks de MercadoPago (signature-validated)
    "/api/webhooks", // Webhooks externos (firm-validated)
    "/api/auth", // Autenticación (NextAuth maneja su propio CSRF interno)
    "/api/mobile", // Clientes nativos (no browser, usan auth token propio)
  ];

  if (externalRoutes.some((route) => pathname.startsWith(route))) {
    return null;
  }

  // Todas las demás rutas API (públicas, autenticadas, admin) usan validación
  // Origin/Referer como protección CSRF stateless.
  // Para rutas autenticadas la seguridad adicional viene de:
  //   - Cookie de sesión HttpOnly + SameSite (middleware + withAdminAuth)
  //   - Validación de rol en cada handler
  // La validación de Origin es la capa CSRF; la autenticación es la capa de autorización.
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  if (origin) {
    try {
      const sourceUrl = new URL(origin);
      if (sourceUrl.host !== host) {
        return NextResponse.json(
          { success: false, error: "CSRF: Origin mismatch" },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "CSRF: Invalid Origin header" },
        { status: 403 }
      );
    }
  } else if (referer) {
    try {
      const sourceUrl = new URL(referer);
      if (sourceUrl.host !== host) {
        return NextResponse.json(
          { success: false, error: "CSRF: Referer mismatch" },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "CSRF: Invalid Referer header" },
        { status: 403 }
      );
    }
  } else {
    // Los browsers siempre envían Origin o Referer en peticiones fetch/xhr mutacionales.
    // Peticiones sin ninguno de los dos son sospechosas (no browser) o indican un bug.
    return NextResponse.json(
      { success: false, error: "CSRF: Missing Origin/Referer header" },
      { status: 403 }
    );
  }

  return null; // Pasó la validación de Origin/Referer
}

export function generateCSRFToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
