import { NextRequest, NextResponse } from "next/server";

import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";

/**
 * Endpoint para limpiar cookies de sesión corruptas.
 * Útil cuando hay errores de JWT_SESSION_ERROR por tokens
 * encriptados con un NEXTAUTH_SECRET diferente.
 */
export async function POST(req: NextRequest) {
  // Rate limiting: prevent abuse
  const rl = await checkRateLimit(req, {
    key: makeKey("POST", "/api/auth/clear-session"),
    ...getPreset("mutatingLow"),
  });
  if (!rl.ok) {
    return NextResponse.json(
      { success: false, error: "Demasiados intentos" },
      { status: 429 }
    );
  }

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

export async function GET(req: NextRequest) {
  return POST(req);
}
