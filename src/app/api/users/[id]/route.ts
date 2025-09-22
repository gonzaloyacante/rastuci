import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ApiResponse } from "@/types";
import { logger, getRequestId } from "@/lib/logger";
import { ok, fail } from "@/lib/apiResponse";
import { normalizeApiError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";

interface SafeUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

// GET /api/users/[id] - Obtener usuario específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<SafeUser>>> {
  try {
    const requestId = getRequestId(request.headers);
    const rl = checkRateLimit(request, { key: makeKey("GET", "/api/users/[id]"), ...getPreset("publicRead") });
    if (!rl.ok) return fail("RATE_LIMITED", "Too many requests", 429, { requestId });
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return fail("NOT_FOUND", "Usuario no encontrado", 404, { requestId });
    }

    const safeUser = {
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      isAdmin: user.isAdmin,
    };

    return ok(safeUser);
  } catch (error) {
    const requestId = getRequestId(request.headers);
    logger.error("Error fetching user", { requestId, error: String(error) });
    const n = normalizeApiError(error, "INTERNAL_ERROR", "Error al obtener el usuario", 500);
    return fail(n.code as any, n.message, n.status, { requestId, ...(n.details as object) });
  }
}

// PATCH /api/users/[id] - Actualizar usuario
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<SafeUser>>> {
  try {
    const requestId = getRequestId(request.headers);
    const rl = checkRateLimit(request, { key: makeKey("PATCH", "/api/users/[id]"), ...getPreset("mutatingLow") });
    if (!rl.ok) return fail("RATE_LIMITED", "Too many requests", 429, { requestId });
    const { id } = await params;
    const body = await request.json();
    const { name, email, password, isAdmin } = body;

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return fail("NOT_FOUND", "Usuario no encontrado", 404, { requestId });
    }

    // Verificar si el email ya está en uso por otro usuario
    if (email && email !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email },
      });

      if (emailInUse) {
        return fail("CONFLICT", "El email ya está registrado", 400, { requestId });
      }
    }

    // Preparar datos de actualización
    const updateData: {
      name?: string;
      email?: string;
      password?: string;
      isAdmin?: boolean;
    } = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (isAdmin !== undefined) updateData.isAdmin = isAdmin;

    // Encriptar nueva contraseña si se proporciona
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Actualizar el usuario
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Retornar el usuario sin la contraseña
    const safeUser: SafeUser = {
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      isAdmin: user.isAdmin,
    };

    return ok(safeUser);
  } catch (error) {
    const requestId = getRequestId(request.headers);
    logger.error("Error updating user", { requestId, error: String(error) });
    const n = normalizeApiError(error, "INTERNAL_ERROR", "Error al actualizar el usuario", 500);
    return fail(n.code as any, n.message, n.status, { requestId, ...(n.details as object) });
  }
}

// DELETE /api/users/[id] - Eliminar usuario
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const requestId = getRequestId(request.headers);
    const rl = checkRateLimit(request, { key: makeKey("DELETE", "/api/users/[id]"), ...getPreset("mutatingLow") });
    if (!rl.ok) return fail("RATE_LIMITED", "Too many requests", 429, { requestId });
    const { id } = await params;

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return fail("NOT_FOUND", "Usuario no encontrado", 404, { requestId });
    }

    // Eliminar el usuario
    await prisma.user.delete({
      where: { id },
    });

    return ok(null);
  } catch (error) {
    const requestId = getRequestId(request.headers);
    logger.error("Error deleting user", { requestId, error: String(error) });
    const n = normalizeApiError(error, "INTERNAL_ERROR", "Error al eliminar el usuario", 500);
    return fail(n.code as any, n.message, n.status, { requestId, ...(n.details as object) });
  }
}
