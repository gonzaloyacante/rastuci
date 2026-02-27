import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: prevent brute force on reset tokens
    const rl = await checkRateLimit(req, {
      key: makeKey("POST", "/api/auth/reset-password"),
      ...getPreset("mutatingLow"),
    });
    if (!rl.ok) {
      return NextResponse.json(
        { success: false, error: "Demasiados intentos, intenta más tarde" },
        { status: 429 }
      );
    }

    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: "Token y contraseña requeridos" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "La contraseña debe tener al menos 8 caracteres",
        },
        { status: 400 }
      );
    }

    // Buscar token válido
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { success: false, error: "Token inválido o expirado" },
        { status: 400 }
      );
    }

    // Verificar que no esté expirado
    if (new Date() > verificationToken.expires) {
      // Eliminar token expirado
      await prisma.verificationToken.delete({
        where: { token },
      });

      return NextResponse.json(
        { success: false, error: "El token ha expirado. Solicita uno nuevo" },
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
      select: { id: true, email: true, isAdmin: true },
    });

    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Eliminar token usado
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    logger.error("Error en reset-password:", { error });
    return NextResponse.json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
