import { getRequestId } from "@/lib/logger";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { logApiCall } from "@/lib/api-logger";
import {
  csrfProtection,
  applySecurityHeaders,
} from "@/middleware-utils/security";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Log all API requests
  if (pathname.startsWith("/api/")) {
    try {
      logApiCall({
        method: request.method,
        url: request.url,
        timestamp: new Date(),
        headers: Object.fromEntries(request.headers.entries()),
      });
    } catch {
      // Ignore logging errors
    }
  }

  // Create a nonce for CSP
  const nonce = Buffer.from(
    crypto.getRandomValues(new Uint8Array(16))
  ).toString("base64");

  // Set the nonce in the request headers so it can be accessed by Server Components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  // Apply CSRF protection to API routes
  if (pathname.startsWith("/api/")) {
    const csrfError = csrfProtection(request);
    if (csrfError) {
      return csrfError;
    }
  }

  // Ensure request-id exists and propagate to response
  const reqId = getRequestId(request.headers);

  // Get session token with error handling to prevent JWT decryption errors
  let session = null;
  try {
    session = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });
  } catch {
    // JWT decryption error - treat as no session (silent handling)
    session = null;
  }

  // Añadir cabeceras de diagnóstico para facilitar el debugging del bucle
  // de redirecciones en entornos de desarrollo. Estas cabeceras no exponen
  // datos sensibles, solo el estado de existencia/rol de la sesión.
  const debugAuthHeader = session ? "present" : "missing";

  // Rutas públicas que cualquiera puede acceder (página de login/admin landing)
  const publicRoutes = [
    "/admin",
    "/admin/auth/forgot-password",
    "/admin/auth/reset-password",
  ];
  const isPublicRoute = publicRoutes.includes(pathname);

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  // Si no hay sesión y la ruta no es pública, redirigir a login
  if (!session && !isPublicRoute && isAdminPage) {
    const res = NextResponse.redirect(new URL("/admin", request.url));
    res.headers.set("x-request-id", reqId);
    res.headers.set("x-auth-debug", debugAuthHeader);
    applySecurityHeaders(res, nonce);
    return res;
  }

  // Si hay sesión pero el usuario no es admin, redirigir a homepage
  if (session && !session.isAdmin && isAdminPage && !isPublicRoute) {
    const res = NextResponse.redirect(new URL("/", request.url));
    res.headers.set("x-request-id", reqId);
    res.headers.set("x-auth-debug", "not-admin");
    applySecurityHeaders(res, nonce);
    return res;
  }

  // Si la ruta es /admin y el usuario ya está autenticado, redirigir al dashboard
  if (session && pathname === "/admin") {
    const res = NextResponse.redirect(new URL("/admin/panel", request.url));
    res.headers.set("x-request-id", reqId);
    res.headers.set("x-auth-debug", debugAuthHeader);
    applySecurityHeaders(res, nonce);
    return res;
  }

  // Protección de API admin: requerir sesión de admin
  if (isAdminApi) {
    const isAdmin = Boolean(session?.isAdmin);

    if (!isAdmin) {
      const res = NextResponse.json(
        { success: false, code: "UNAUTHORIZED", error: "Unauthorized" },
        { status: 401 }
      );
      res.headers.set("x-request-id", reqId);
      applySecurityHeaders(res, nonce);
      return res;
    }
  }

  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  res.headers.set("x-request-id", reqId);
  applySecurityHeaders(res, nonce);
  return res;
}

// Next.js v16: proxy uses `proxyConfig` (not `config`)
// Match all routes for CSP nonce + security headers, admin auth, and API protection
export const proxyConfig = {
  matcher: [
    // Admin routes
    "/admin",
    "/admin/:path*",
    // API routes
    "/api/:path*",
    // Public pages (for CSP nonce & security headers)
    "/",
    "/products/:path*",
    "/cart",
    "/checkout/:path*",
    "/contact",
    "/favorites",
    "/legal/:path*",
  ],
};
