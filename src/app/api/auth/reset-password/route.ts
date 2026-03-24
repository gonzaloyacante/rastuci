import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";

function resetErr(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

async function validateResetToken(token: string) {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });
  if (!verificationToken) return { error: "Token inválido o expirado" };
  if (new Date() > verificationToken.expires) {
    await prisma.verificationToken.delete({ where: { token } });
    return { error: "El token ha expirado. Solicita uno nuevo" };
  }
  return { verificationToken };
}

async function updatePasswordAndCleanToken(
  userId: string,
  password: string,
  token: string
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
  await prisma.verificationToken.delete({ where: { token } });
}

function validatePasswordInput(
  token: unknown,
  password: unknown
): string | null {
  if (!token || !password) return "Token y contraseña requeridos";
  if (typeof password === "string" && password.length < 8)
    return "La contraseña debe tener al menos 8 caracteres";
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const rl = await checkRateLimit(req, {
      key: makeKey("POST", "/api/auth/reset-password"),
      ...getPreset("mutatingLow"),
    });
    if (!rl.ok) return resetErr("Demasiados intentos, intenta más tarde", 429);

    const { token, password } = await req.json();
    const inputError = validatePasswordInput(token, password);
    if (inputError) return resetErr(inputError);

    const tokenResult = await validateResetToken(token);
    if (tokenResult.error) return resetErr(tokenResult.error);

    const user = await prisma.user.findUnique({
      where: { email: tokenResult.verificationToken!.identifier },
      select: { id: true, email: true, isAdmin: true },
    });
    if (!user || !user.isAdmin) return resetErr("Usuario no encontrado", 404);

    await updatePasswordAndCleanToken(user.id, password, token);
    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    logger.error("Error en reset-password:", { error });
    return resetErr("Error al procesar la solicitud", 500);
  }
}
