import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { withAdminAuth } from "@/lib/adminAuth";
import { ORDER_STATUS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

export const POST = withAdminAuth(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id: orderId } = await params;

      // Leer body para flag opcional `force`
      const body = (await request.json().catch(() => ({}))) as {
        force?: boolean;
      };
      const force = body?.force === true;

      const order = await prisma.orders.findUnique({
        where: { id: orderId },
        include: { order_items: true },
      });

      if (!order) {
        return NextResponse.json(
          { error: "Orden no encontrada" },
          { status: 404 }
        );
      }

      if (order.status === ORDER_STATUS.CANCELLED) {
        return NextResponse.json(
          { error: "La orden ya está cancelada" },
          { status: 400 }
        );
      }

      if (order.status === ORDER_STATUS.DELIVERED) {
        return NextResponse.json(
          { error: "No se puede cancelar una orden ya entregada" },
          { status: 400 }
        );
      }

      // Guardia financiera: órdenes PROCESSED (pagadas vía MP) requieren reembolso manual.
      // Sin `force: true`, se bloquea para evitar cancelaciones sin reembolso al cliente.
      if (
        order.mpPaymentId &&
        (order.status === ORDER_STATUS.PROCESSED ||
          order.status === ORDER_STATUS.PAYMENT_REVIEW)
      ) {
        if (!force) {
          logger.warn(
            `[Admin] Attempted to cancel PROCESSED order ${orderId} without force flag`,
            { orderId, mpPaymentId: order.mpPaymentId, status: order.status }
          );
          return NextResponse.json(
            {
              error:
                "Esta orden fue pagada mediante MercadoPago. Debes procesar el reembolso manualmente desde el panel de MercadoPago antes de cancelarla. Para confirmar la cancelación (sin reembolso automático), envía { force: true }.",
              requiresManualRefund: true,
              mpPaymentId: order.mpPaymentId,
            },
            { status: 409 }
          );
        }
        logger.warn(
          `[Admin] Force-cancelling PROCESSED order ${orderId} — manual MP refund required`,
          { orderId, mpPaymentId: order.mpPaymentId }
        );
      }

      // Cancel and Restore Stock
      await prisma.$transaction(async (tx) => {
        // 1. Update Status
        await tx.orders.update({
          where: { id: orderId },
          data: { status: ORDER_STATUS.CANCELLED as OrderStatus },
        });

        // 2. Restore Stock (products + variants)
        for (const item of order.order_items) {
          await tx.products.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
          // Restore variant stock if the item had a specific variant
          if (item.color && item.size) {
            await tx.product_variants.updateMany({
              where: {
                productId: item.productId,
                color: item.color,
                size: item.size,
              },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      });

      logger.info(`[Admin] Cancelled order ${orderId} and restored stock`);
      revalidatePath("/admin/orders");
      revalidatePath(`/admin/orders/${orderId}`);

      return NextResponse.json({
        success: true,
        message: "Orden cancelada y stock restaurado",
      });
    } catch (error) {
      logger.error("[Admin] Error cancelling order", { error: String(error) });
      return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
  }
);
