import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { withAdminAuth } from "@/lib/adminAuth";
import { fail, ok } from "@/lib/apiResponse";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

/**
 * PATCH /api/admin/orders/[id]/mark-delivered
 *
 * Marca un pedido como DELIVERED después de que el cliente lo recibió
 *
 * Estado: PROCESSED → DELIVERED
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

      // Validar que el pedido esté en PROCESSED
      if (order.status !== "PROCESSED") {
        return fail(
          "BAD_REQUEST",
          `El pedido debe estar en estado PROCESSED. Estado actual: ${order.status}`,
          400
        );
      }

      // Atomic update: only if still PROCESSED (prevents TOCTOU race condition)
      const updatedOrder = await prisma.orders.update({
        where: { id: orderId, status: "PROCESSED" },
        data: {
          status: "DELIVERED",
          estimatedDelivery: new Date(), // Fecha de entrega
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

      logger.info("[Admin] Order marked as DELIVERED", {
        orderId,
        customerName: order.customerName,
        total: order.total,
      });

      // Enviar email de confirmación de entrega
      if (order.customerEmail) {
        try {
          const { sendEmail } = await import("@/lib/resend");
          const { getOrderDeliveredEmail } =
            await import("@/lib/email-templates");

          const emailHtml = getOrderDeliveredEmail({
            customerName: order.customerName,
            orderId,
          });

          await sendEmail({
            to: order.customerEmail,
            subject: "✅ Tu pedido fue entregado - Rastuci",
            html: emailHtml,
          });

          // Note: Push notifications disabled, email is sufficient
        } catch (emailError) {
          logger.error("[Admin] Failed to send delivered email", {
            emailError,
          });
        }
      }

      revalidatePath("/admin/orders");
      revalidatePath(`/admin/orders/${orderId}`);

      return ok({
        order: updatedOrder,
        message: "Pedido marcado como entregado exitosamente",
      });
    } catch (err) {
      logger.error("[Admin] Error marking order as delivered", { error: err });
      return fail("INTERNAL_ERROR", "Error al actualizar el pedido", 500);
    }
  }
);
