import { NextRequest, NextResponse } from "next/server";

import { withAdminAuth } from "@/lib/adminAuth";
import { fail, ok } from "@/lib/apiResponse";
import { getOrderConfirmationEmail } from "@/lib/email-templates";
import { logger } from "@/lib/logger";
import { sendEmail } from "@/lib/resend";

/**
 * GET /api/admin/test-email
 *
 * Endpoint de prueba para verificar la configuración de Resend.
 * Envía un email de prueba al destinatario especificado.
 *
 * Query params:
 * - to: email de destino (opcional, default: ADMIN_EMAIL)
 *
 * SOLO DISPONIBLE PARA ADMINS
 */
export const GET = withAdminAuth(
  async (request: NextRequest): Promise<NextResponse> => {
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      const adminEmail = process.env.ADMIN_EMAIL || "contacto@rastuci.com";
      const { searchParams } = new URL(request.url);
      const toEmail = searchParams.get("to") || adminEmail;
      const diagnostics = {
        resendConfigured: !!resendApiKey,
        resendKeyPrefix: resendApiKey ? "re_***" : "(no configurada)",
        adminEmail,
        targetEmail: toEmail,
        nodeEnv: process.env.NODE_ENV,
      };

      logger.info("[Test Email] Diagnostics", diagnostics);

      if (!resendApiKey) {
        return fail(
          "BAD_REQUEST",
          "RESEND_API_KEY no está configurada en las variables de entorno",
          400
        );
      }

      const testOrderId = `test_${Date.now()}`;
      const testItems = [
        { name: "Producto de Prueba 1", quantity: 2, price: 1500 },
        { name: "Producto de Prueba 2", quantity: 1, price: 2500 },
      ];

      const emailHtml = getOrderConfirmationEmail({
        customerName: "Usuario de Prueba",
        orderId: testOrderId,
        total: 5500,
        items: testItems,
      });

      logger.info("[Test Email] Sending test email", {
        to: toEmail,
        testOrderId,
      });

      const sent = await sendEmail({
        to: toEmail,
        subject: `🧪 Email de Prueba - Rastuci (${new Date().toLocaleTimeString("es-AR")})`,
        html: emailHtml,
      });

      if (sent) {
        logger.info("[Test Email] Email sent successfully", {
          to: toEmail,
          testOrderId,
        });
        return ok({
          success: true,
          message: `Email de prueba enviado exitosamente a ${toEmail}`,
          diagnostics,
          testOrderId,
        });
      } else {
        logger.error("[Test Email] Email send failed", {
          to: toEmail,
          testOrderId,
        });
        return fail(
          "INTERNAL_ERROR",
          "El email no se pudo enviar. Verifica los logs y la configuración de Resend.",
          500
        );
      }
    } catch (error) {
      logger.error("[Test Email] Error", { error });
      const msg =
        error instanceof Error
          ? error.message
          : "Error al enviar email de prueba";
      return fail("INTERNAL_ERROR", msg, 500);
    }
  }
);
