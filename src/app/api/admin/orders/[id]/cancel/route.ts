import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { ORDER_STATUS } from "@/lib/constants";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = params.id;

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

    // Cancel and Restore Stock
    await prisma.$transaction(async (tx) => {
      // 1. Update Status
      await tx.orders.update({
        where: { id: orderId },
        data: { status: ORDER_STATUS.CANCELLED as any },
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
    logger.error("[Admin] Error cancelling order", { error });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
