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

function authErr(
  message: string,
  field: "email" | "general" = "general",
  status = 401
): NextResponse<LoginResponse> {
  return NextResponse.json<LoginResponse>(
    { success: false, error: { field, message } },
    { status }
  );
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<LoginResponse>> {
  try {
    const rl = await checkRateLimit(request, {
      key: "auth:login",
      limit: 10,
      windowMs: 60_000,
    });
    if (!rl.ok) {
      return authErr(
        "Demasiados intentos. Intente nuevamente más tarde.",
        "general",
        429
      );
    }

    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErr = parsed.error.errors[0];
      const field = fieldErr?.path[0] === "email" ? "email" : "general";
      let message = fieldErr?.message ?? "Datos inválidos";
      if (message === "Required") message = "Faltan campos obligatorios";
      return authErr(message, field, 400);
    }

    const { email, password } = parsed.data;

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

    if (!user) return authErr("Email o contraseña incorrectos");
    if (!user.password)
      return authErr("La cuenta pertenece a un proveedor externo");

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return authErr("Email o contraseña incorrectos");
    if (!user.isAdmin) return authErr("Email o contraseña incorrectos");

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error en login validation:", { error: error });
    return authErr("Error interno del servidor", "general", 500);
  }
}
