import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email requerido" },
        { status: 400 }
      );
    }

    // Buscar usuario admin
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, isAdmin: true },
    });

    if (!user || !user.isAdmin || !user.email) {
      // Por seguridad, NO revelar si el email existe
      return NextResponse.json({
        success: true,
        message: "Si el email existe, recibirás instrucciones para recuperar tu contraseña",
      });
    }

    // Generar token único
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en la base de datos (usando tabla VerificationToken)
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires: expiresAt,
      },
    });

    // Enviar email con link de recuperación
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/admin/auth/reset-password?token=${token}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Recuperar Contraseña</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ec4899; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #ec4899; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
            .warning { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Recuperar Contraseña</h1>
            </div>
            <div class="content">
              <p>Hola ${user.name || "Administrador"},</p>
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta de administrador en Rastuci.</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">
                  Restablecer Contraseña
                </a>
              </div>
              
              <p>O copia y pega este enlace en tu navegador:</p>
              <p style="word-break: break-all; color: #666; font-size: 0.9em;">${resetUrl}</p>
              
              <div class="warning">
                <p><strong>⚠️ Importante:</strong></p>
                <ul>
                  <li>Este enlace expirará en 1 hora</li>
                  <li>Si no solicitaste este cambio, ignora este email</li>
                  <li>Tu contraseña no cambiará hasta que hagas clic en el enlace</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Rastuci - Panel de Administración</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: "🔐 Recuperar contraseña - Rastuci Admin",
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: "Si el email existe, recibirás instrucciones para recuperar tu contraseña",
    });
  } catch (error) {
    console.error("Error en forgot-password:", error);
    return NextResponse.json(
      { success: false, error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
