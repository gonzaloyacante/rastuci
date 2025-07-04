import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Rutas públicas que cualquiera puede acceder
  const publicRoutes = ["/admin"]; // Solo la página de login de admin
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  // Si no hay sesión y la ruta no es pública, redirigir a login
  if (
    !session &&
    !isPublicRoute &&
    request.nextUrl.pathname.startsWith("/admin")
  ) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Si hay sesión pero el usuario no es admin, redirigir a homepage
  if (
    session &&
    !session.isAdmin &&
    request.nextUrl.pathname.startsWith("/admin") &&
    !isPublicRoute
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Si la ruta es /admin y el usuario ya está autenticado, redirigir al dashboard
  if (session && request.nextUrl.pathname === "/admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configurar el middleware para que se ejecute solo en las rutas especificadas
export const config = {
  matcher: ["/admin/:path*"],
};
