import { OrderStatus } from "@prisma/client";
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

      // Cancel and Restore Stock
      await prisma.$transaction(async (tx) => {
        // 1. Update Status
        await tx.orders.update({
          where: { id: orderId },
          data: { status: ORDER_STATUS.CANCELLED as OrderStatus },
        });

        // 2. Restore Stock
        for (const item of order.order_items) {
          await tx.products.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      });

      logger.info(`[Admin] Cancelled order ${orderId} and restored stock`);

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
