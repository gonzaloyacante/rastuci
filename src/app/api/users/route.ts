import { ApiErrorCode, fail, ok } from "@/lib/apiResponse";
import { normalizeApiError } from "@/lib/errors";
import { getRequestId, logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";
import { ApiResponse } from "@/types";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

interface SafeUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

// PATCH /api/users - Actualizar password/isAdmin por email (para recuperar acceso admin)
export async function PATCH(
  request: NextRequest
): Promise<NextResponse<ApiResponse<SafeUser>>> {
  try {
    const requestId = getRequestId(request.headers);
    const rl = checkRateLimit(request, {
      key: makeKey("PATCH", "/api/users"),
      ...getPreset("mutatingLow"),
    });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many requests", 429, { requestId });
    }

    const body = await request.json();
    const email = (body.email || "").trim();
    const password = body.password as string | undefined;
    const isAdmin = body.isAdmin as boolean | undefined;

    if (!email) {
      return fail("BAD_REQUEST", "Email es requerido", 400, { requestId });
    }
    if (!password || password.length < 6) {
      return fail(
        "BAD_REQUEST",
        "La contraseña debe tener al menos 6 caracteres",
        400,
        { requestId }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Intentar actualizar si existe, si no crear
    const existing = await prisma.user.findUnique({ where: { email } });
    const user = existing
      ? await prisma.user.update({
          where: { email },
          data: {
            password: hashedPassword,
            ...(typeof isAdmin === "boolean" ? { isAdmin } : {}),
          },
        })
      : await prisma.user.create({
          data: {
            email,
            name: body.name || "",
            password: hashedPassword,
            isAdmin: !!isAdmin,
          },
        });

    const safeUser: SafeUser = {
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      isAdmin: user.isAdmin,
    };

    return ok(safeUser);
  } catch (error) {
    const requestId = getRequestId(request.headers);
    logger.error("Error updating user via PATCH", {
      requestId,
      error: String(error),
    });
    const n = normalizeApiError(
      error,
      "INTERNAL_ERROR",
      "Error al actualizar el usuario",
      500
    );
    return fail(n.code as ApiErrorCode, n.message, n.status, {
      requestId,
      ...(n.details as object),
    });
  }
}

// GET /api/users - Obtener todos los usuarios
type UsersPage = {
  data: SafeUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<UsersPage>>> {
  try {
    const requestId = getRequestId(request.headers);
    const rl = checkRateLimit(request, {
      key: makeKey("GET", "/api/users"),
      ...getPreset("publicRead"),
    });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many requests", 429, { requestId });
    }
    const { searchParams } = new URL(request.url);
    const pageRaw = Number(searchParams.get("page")) || 1;
    const limitRaw = Number(searchParams.get("limit")) || 20;
    const search = (searchParams.get("search") || "").trim().slice(0, 100);
    const page = Math.max(1, Math.min(1000, pageRaw));
    const limit = Math.max(1, Math.min(50, limitRaw));

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    const offset = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { name: "asc" },
        skip: offset,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const safeUsers: SafeUser[] = users.map((user) => ({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      isAdmin: user.isAdmin,
    }));

    const totalPages = Math.ceil(total / limit);
    return ok({
      data: safeUsers,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    const requestId = getRequestId(request.headers);
    logger.error("Error fetching users", { requestId, error: String(error) });
    const n = normalizeApiError(
      error,
      "INTERNAL_ERROR",
      "Error al obtener los usuarios",
      500
    );
    return fail(n.code as ApiErrorCode, n.message, n.status, {
      requestId,
      ...(n.details as object),
    });
  }
}

// POST /api/users - Crear nuevo usuario
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<SafeUser>>> {
  try {
    const requestId = getRequestId(request.headers);
    const rl = checkRateLimit(request, {
      key: makeKey("POST", "/api/users"),
      ...getPreset("mutatingLow"),
    });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many requests", 429, { requestId });
    }
    const body = await request.json();
    const { name, email, password, isAdmin } = body;

    // Validaciones
    if (!name || !email || !password) {
      return fail("BAD_REQUEST", "Todos los campos son requeridos", 400, {
        requestId,
      });
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return fail("CONFLICT", "El email ya está registrado", 400, {
        requestId,
      });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isAdmin: isAdmin || false,
      },
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
    logger.error("Error creating user", { requestId, error: String(error) });
    const n = normalizeApiError(
      error,
      "INTERNAL_ERROR",
      "Error al crear el usuario",
      500
    );
    return fail(n.code as ApiErrorCode, n.message, n.status, {
      requestId,
      ...(n.details as object),
    });
  }
}
