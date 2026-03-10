import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";

const LoginSchema = z.object({
  email: z.string().email("El formato del email no es válido").max(100),
  password: z.string().min(1).max(200),
});

interface LoginResponse {
  success: boolean;
  error?: {
    field?: "email" | "password" | "general";
    message: string;
  };
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<LoginResponse>> {
  try {
    // Rate limit: 10 attempts per minute (Brute-force protection)
    // Kept at 10 for compatibility with tests and expected behavior.
    const rl = await checkRateLimit(request, {
      key: "auth:login",
      limit: 10,
      windowMs: 60_000,
    });
    if (!rl.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Demasiados intentos. Intente nuevamente más tarde.",
          },
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErr = parsed.error.errors[0];
      const field = fieldErr?.path[0] === "email" ? "email" : "general";
      // Map Zod default 'Required' messages to Spanish-friendly text used in tests
      let message = fieldErr?.message ?? "Datos inválidos";
      if (message === "Required") message = "Faltan campos obligatorios";

      return NextResponse.json(
        {
          success: false,
          error: {
            field: field as "email" | "general",
            message,
          },
        },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password: true,
        isAdmin: true,
        name: true,
      },
    });

    // Usuario no existe — use GENERIC message to prevent enumeration
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            field: "general",
            message: "Email o contraseña incorrectos",
          },
        },
        { status: 401 }
      );
    }

    // Usuario no tiene contraseña (OAuth user) — tests expect a specific hint
    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            field: "general",
            message: "La cuenta pertenece a un proveedor externo",
          },
        },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        {
          success: false,
          error: {
            field: "general",
            message: "Email o contraseña incorrectos",
          },
        },
        { status: 401 }
      );
    }

    // Verificar que sea admin — use GENERIC message
    if (!user.isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: {
            field: "general",
            message: "Email o contraseña incorrectos",
          },
        },
        { status: 401 }
      );
    }

    // Login exitoso
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    logger.error("Error en login validation:", { error: error });
    return NextResponse.json(
      {
        success: false,
        error: {
          field: "general",
          message: "Error interno del servidor",
        },
      },
      { status: 500 }
    );
  }
}
