import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logger } from "@/lib/logger";
import { getServerSession } from "next-auth/next";
import { NextRequest } from "next/server";

interface AdminAuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name?: string;
    isAdmin: boolean;
  };
  error?: string;
}

/**
 * Verifica si el usuario actual es administrador
 * Para usar en API Routes de admin
 */
export async function verifyAdminAuth(
  _request: NextRequest
): Promise<AdminAuthResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return {
        success: false,
        error: "No authenticated session found",
      };
    }

    if (!session.user) {
      return {
        success: false,
        error: "Invalid session user",
      };
    }

    if (!session.user.isAdmin) {
      return {
        success: false,
        error: "User is not an administrator",
      };
    }

    return {
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.name || undefined,
        isAdmin: session.user.isAdmin,
      },
    };
  } catch (error) {
    logger.error("Admin auth verification error", { error });
    return {
      success: false,
      error: "Authentication verification failed",
    };
  }
}

/**
 * Middleware wrapper para proteger rutas admin
 * Retorna error 401/403 si no es admin
 */
export function withAdminAuth<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    const authResult = await verifyAdminAuth(request);

    if (!authResult.success) {
      const status =
        authResult.error === "No authenticated session found" ? 401 : 403;

      return new Response(
        JSON.stringify({
          success: false,
          error: authResult.error,
          message:
            status === 401
              ? "Authentication required"
              : "Administrator privileges required",
        }),
        {
          status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return handler(request, ...args);
  };
}
