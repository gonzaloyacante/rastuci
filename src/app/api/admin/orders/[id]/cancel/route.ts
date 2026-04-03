import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { withAdminAuth } from "@/lib/adminAuth";
import { ORDER_STATUS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

function cancelErr(
  message: string,
  status: number,
  extra?: Record<string, unknown>
) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

async function checkCancellable(orderId: string, force: boolean) {
  const order = await prisma.orders.findUnique({
    where: { id: orderId },
    include: { order_items: true },
  });
  if (!order) return { error: cancelErr("Orden no encontrada", 404) };
  if (order.status === ORDER_STATUS.CANCELLED)
    return { error: cancelErr("La orden ya está cancelada", 400) };
  if (order.status === ORDER_STATUS.DELIVERED)
    return {
      error: cancelErr("No se puede cancelar una orden ya entregada", 400),
    };
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
      return {
        error: cancelErr(
          "Esta orden fue pagada mediante MercadoPago. Debes procesar el reembolso manualmente desde el panel de MercadoPago antes de cancelarla. Para confirmar la cancelación (sin reembolso automático), envía { force: true }.",
          409,
          { requiresManualRefund: true, mpPaymentId: order.mpPaymentId }
        ),
      };
    }
    logger.warn(
      `[Admin] Force-cancelling PROCESSED order ${orderId} — manual MP refund required`,
      { orderId, mpPaymentId: order.mpPaymentId }
    );
  }
  return { order };
}

async function performCancellation(
  orderId: string,
  order: Awaited<ReturnType<typeof prisma.orders.findUnique>> & {
    order_items: {
      productId: string;
      quantity: number;
      color: string | null;
      size: string | null;
    }[];
  }
) {
  await prisma.$transaction(async (tx) => {
    // Atomic: only cancel if not already cancelled/delivered (prevents TOCTOU race condition)
    await tx.orders.update({
      where: {
        id: orderId,
        status: {
          notIn: [
            ORDER_STATUS.CANCELLED as OrderStatus,
            ORDER_STATUS.DELIVERED as OrderStatus,
          ],
        },
      },
      data: { status: ORDER_STATUS.CANCELLED as OrderStatus },
    });
    for (const item of order.order_items) {
      await tx.products.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
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
    if (order.couponId) {
      await tx.$executeRaw`UPDATE coupons SET "usageCount" = GREATEST("usageCount" - 1, 0) WHERE id = ${order.couponId}`;
    }
  });
}

export const POST = withAdminAuth(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id: orderId } = await params;
      const body = (await request.json().catch(() => ({}))) as {
        force?: boolean;
      };
      const force = body?.force === true;
      const check = await checkCancellable(orderId, force);
      if (check.error) return check.error;
      await performCancellation(orderId, check.order!);
      logger.info(`[Admin] Cancelled order ${orderId} and restored stock`);
      // Notify customer if they have an email
      if (check.order!.customerEmail) {
        const { emailService } = await import("@/lib/resend");
        emailService
          .sendOrderCancelled({
            id: orderId,
            customerName: check.order!.customerName,
            customerEmail: check.order!.customerEmail,
          })
          .catch((emailErr) =>
            logger.warn("[Admin] Failed to send cancellation email", {
              emailErr,
            })
          );
      }
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
