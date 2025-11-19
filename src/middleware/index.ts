import { getRequestId } from "@/lib/logger";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { csrfProtection, securityHeaders } from "./security";

export async function middleware(request: NextRequest) {
  // Apply security headers to all requests
  securityHeaders(request);

  // Apply CSRF protection to API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
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
    });
  } catch {
    // JWT decryption error - treat as no session (silent handling)
    session = null;
  }

  // Añadir cabeceras de diagnóstico para facilitar el debugging del bucle
  // de redirecciones en entornos de desarrollo. Estas cabeceras no exponen
  // datos sensibles, solo el estado de existencia/rol de la sesión.
  const debugAuthHeader = session ? "present" : "missing";

  const pathname = request.nextUrl.pathname;
  // Rutas públicas que cualquiera puede acceder (página de login/admin landing)
  const publicRoutes = ["/admin"];
  const isPublicRoute = publicRoutes.includes(pathname);

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  // Si no hay sesión y la ruta no es pública, redirigir a login
  if (!session && !isPublicRoute && isAdminPage) {
    const res = NextResponse.redirect(new URL("/admin", request.url));
    res.headers.set("x-request-id", reqId);
    res.headers.set("x-auth-debug", debugAuthHeader);
    return res;
  }

  // Si hay sesión pero el usuario no es admin, redirigir a homepage
  if (session && !session.isAdmin && isAdminPage && !isPublicRoute) {
    const res = NextResponse.redirect(new URL("/", request.url));
    res.headers.set("x-request-id", reqId);
    res.headers.set("x-auth-debug", "not-admin");
    return res;
  }

  // Si la ruta es /admin y el usuario ya está autenticado, redirigir al dashboard
  if (session && pathname === "/admin") {
    const res = NextResponse.redirect(new URL("/admin/dashboard", request.url));
    res.headers.set("x-request-id", reqId);
    res.headers.set("x-auth-debug", debugAuthHeader);
    return res;
  }

  // Protección de API admin: permitir si hay sesión admin o token válido
  if (isAdminApi) {
    const isAdmin = Boolean(session?.isAdmin);
    const headerToken = request.headers.get("x-admin-token");
    const envToken = process.env.ADMIN_API_TOKEN;
    const tokenOk = envToken && headerToken && headerToken === envToken;

    if (!isAdmin && !tokenOk) {
      const res = NextResponse.json(
        { success: false, code: "UNAUTHORIZED", error: "Unauthorized" },
        { status: 401 }
      );
      res.headers.set("x-request-id", reqId);
      return res;
    }
  }

  const res = NextResponse.next();
  res.headers.set("x-request-id", reqId);
  return res;
}

// Configurar el middleware para que se ejecute solo en las rutas especificadas
export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
