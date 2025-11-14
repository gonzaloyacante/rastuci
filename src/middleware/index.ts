import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { securityHeaders, csrfProtection } from './security';
import { getRequestId } from "@/lib/logger";

export async function middleware(request: NextRequest) {
  // Apply security headers to all requests
  securityHeaders(request);
  
  // Apply CSRF protection to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const csrfError = csrfProtection(request);
    if (csrfError) {
      return csrfError;
    }
  }

  // Ensure request-id exists and propagate to response
  const reqId = getRequestId(request.headers);
  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

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
    return res;
  }

  // Si hay sesión pero el usuario no es admin, redirigir a homepage
  if (session && !session.isAdmin && isAdminPage && !isPublicRoute) {
    const res = NextResponse.redirect(new URL("/", request.url));
    res.headers.set("x-request-id", reqId);
    return res;
  }

  // Si la ruta es /admin y el usuario ya está autenticado, redirigir al dashboard
  if (session && pathname === "/admin") {
    const res = NextResponse.redirect(new URL("/admin/dashboard", request.url));
    res.headers.set("x-request-id", reqId);
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
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};