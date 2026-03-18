import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { withAdminAuth } from "@/lib/adminAuth";
import { ORDER_STATUS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { emailService } from "@/lib/resend";

export const POST = withAdminAuth(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> => {
    try {
      const { id: orderId } = await params;

      const order = await prisma.orders.findUnique({
        where: { id: orderId },
        include: {
          order_items: {
            include: { products: { select: { name: true } } },
          },
        },
      });

      if (!order) {
        return NextResponse.json(
          { error: "Orden no encontrada" },
          { status: 404 }
        );
      }

      // Solo se puede aprobar desde estados que implican pago pendiente de verificación
      const approvableStatuses = [
        ORDER_STATUS.RESERVED,
        ORDER_STATUS.PENDING_PAYMENT,
        ORDER_STATUS.PAYMENT_REVIEW,
      ] as string[];

      if (!approvableStatuses.includes(order.status)) {
        return NextResponse.json(
          {
            error: `No se puede aprobar una orden en estado ${order.status}`,
          },
          { status: 409 }
        );
      }

      // Update Status to PROCESSED
      // Stock is ALREADY reserved (decremented on creation).
      // So we just update status.

      await prisma.orders.update({
        where: { id: orderId },
        data: { status: ORDER_STATUS.PROCESSED as OrderStatus },
      });

      logger.info(`[Admin] Approved transfer for order ${orderId}`);

      revalidatePath("/admin/orders");
      revalidatePath(`/admin/orders/${orderId}`);

      // Notificar al cliente que el pago fue recibido y la orden está procesada
      if (order.customerEmail) {
        emailService
          .sendOrderConfirmation(
            {
              id: order.id,
              customerName: order.customerName,
              customerEmail: order.customerEmail,
              customerPhone: order.customerPhone ?? undefined,
              customerAddress: order.customerAddress ?? undefined,
              total: Number(order.total),
            },
            order.order_items.map((item) => ({
              name: item.products?.name ?? "Producto",
              quantity: item.quantity,
              price: Number(item.price),
              color: item.color ?? undefined,
              size: item.size ?? undefined,
            }))
          )
          .catch((emailErr) =>
            logger.warn("[Admin] Failed to send payment confirmation email", {
              emailErr,
              orderId,
            })
          );
      }

      return NextResponse.json({
        success: true,
        message: "Pago aprobado. Orden lista para despachar.",
      });
    } catch (error) {
      logger.error("[Admin] Error approving transfer", { error });
      return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
  }
);
