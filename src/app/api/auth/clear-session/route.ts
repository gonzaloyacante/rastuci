import { NextResponse } from "next/server";

/**
 * Endpoint para limpiar cookies de sesión corruptas.
 * Útil cuando hay errores de JWT_SESSION_ERROR por tokens
 * encriptados con un NEXTAUTH_SECRET diferente.
 */
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Session cookies cleared",
  });

  // Lista de cookies de next-auth que deben ser eliminadas
  const cookiesToClear = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.callback-url",
    "next-auth.csrf-token",
  ];

  // Eliminar cada cookie con diferentes combinaciones de path
  for (const cookieName of cookiesToClear) {
    // Path raíz
    response.cookies.set(cookieName, "", {
      expires: new Date(0),
      path: "/",
    });
    // Path admin (por si hay cookies antiguas)
    response.cookies.set(cookieName, "", {
      expires: new Date(0),
      path: "/admin",
    });
  }

  return response;
}

export async function GET() {
  return POST();
}
