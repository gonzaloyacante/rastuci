import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { withAdminAuth } from "@/lib/adminAuth";
import { fail, ok } from "@/lib/apiResponse";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

/**
 * PATCH /api/admin/orders/[id]/mark-processed
 *
 * Marca un pedido como PROCESSED después de que el admin pagó el envío en MiCorreo
 *
 * Flujo:
 * 1. Admin ve pedido en estado PENDING_PAYMENT en el admin
 * 2. Admin hace clic en "Pagar envío en MiCorreo" (abre nueva pestaña)
 * 3. Admin paga el envío en la plataforma de MiCorreo
 * 4. Admin regresa y hace clic en "Marcar como pagado"
 * 5. Este endpoint cambia el estado a PROCESSED
 *
 * Estado: PENDING_PAYMENT → PROCESSED
 */
export const PATCH = withAdminAuth(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> => {
    try {
      const { id: orderId } = await params;

      // Buscar la orden
      const order = await prisma.orders.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          status: true,
          customerName: true,
          customerEmail: true,
          total: true,
        },
      });

      if (!order) {
        return fail("NOT_FOUND", "Pedido no encontrado", 404);
      }

      // Validar que el pedido esté en PENDING_PAYMENT
      if (order.status !== "PENDING_PAYMENT") {
        return fail(
          "BAD_REQUEST",
          `El pedido debe estar en estado PENDING_PAYMENT. Estado actual: ${order.status}`,
          400
        );
      }

      // Atomic update: only if still PENDING_PAYMENT (prevents TOCTOU race condition)
      const updatedOrder = await prisma.orders.update({
        where: { id: orderId, status: "PENDING_PAYMENT" },
        data: {
          status: "PROCESSED",
          updatedAt: new Date(),
        },
        include: {
          order_items: {
            include: {
              products: true,
            },
          },
        },
      });

      logger.info("[Admin] Order marked as PROCESSED", {
        orderId,
        customerName: order.customerName,
        total: order.total,
      });

      // Enviar email de envío si hay tracking number
      if (updatedOrder.caTrackingNumber) {
        try {
          const { sendEmail } = await import("@/lib/resend");
          const { getOrderShippedEmail } =
            await import("@/lib/email-templates");

          if (order.customerEmail) {
            const emailHtml = getOrderShippedEmail({
              customerName: order.customerName,
              orderId,
              trackingNumber: updatedOrder.caTrackingNumber,
              carrier: "Correo Argentino",
            });

            await sendEmail({
              to: order.customerEmail,
              subject: "📦 Tu pedido está en camino - Rastuci",
              html: emailHtml,
            });

            // Note: Push notifications disabled, email is sufficient
          }
        } catch (emailError) {
          logger.error("[Admin] Failed to send shipped email", { emailError });
        }
      }
      revalidatePath("/admin/orders");
      revalidatePath(`/admin/orders/${orderId}`);

      return ok({
        order: updatedOrder,
        message: "Pedido marcado como procesado exitosamente",
      });
    } catch (err) {
      logger.error("[Admin] Error marking order as processed", { error: err });
      return fail("INTERNAL_ERROR", "Error al actualizar el pedido", 500);
    }
  }
);
