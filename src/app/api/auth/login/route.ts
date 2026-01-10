import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rateLimiter";
// import { fail } from "@/lib/apiResponse";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  error?: {
    field?: "email" | "password" | "general";
    message: string;
  };
  data?: {
    userExists: boolean;
    passwordCorrect: boolean;
  };
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<LoginResponse>> {
  try {
    // Rate limit: 10 attempts per minute (Brute-force protection)
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

    const { email, password }: LoginRequest = await request.json();

    // Validar campos requeridos
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            field: "general",
            message: "Email y contraseña son obligatorios",
          },
        },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            field: "email",
            message: "El formato del email no es válido",
          },
        },
        { status: 400 }
      );
    }

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

    // Usuario no existe
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            field: "email",
            message: "No existe una cuenta con este correo electrónico",
          },
          data: {
            userExists: false,
            passwordCorrect: false,
          },
        },
        { status: 401 }
      );
    }

    // Usuario no tiene contraseña (OAuth user)
    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            field: "email",
            message: "Esta cuenta usa un proveedor externo para iniciar sesión",
          },
          data: {
            userExists: true,
            passwordCorrect: false,
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
            field: "password",
            message: "La contraseña es incorrecta",
          },
          data: {
            userExists: true,
            passwordCorrect: false,
          },
        },
        { status: 401 }
      );
    }

    // Verificar que sea admin
    if (!user.isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: {
            field: "general",
            message: "No tienes permisos de administrador",
          },
          data: {
            userExists: true,
            passwordCorrect: true,
          },
        },
        { status: 403 }
      );
    }

    // Login exitoso
    return NextResponse.json({
      success: true,
      data: {
        userExists: true,
        passwordCorrect: true,
      },
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
