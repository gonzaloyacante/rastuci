import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ORDER_STATUS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    // [C-01] Require an authenticated session before processing transfer proof
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para confirmar una transferencia" },
        { status: 401 }
      );
    }
    const body = await request.json();
    const { senderName, transactionId } = body;

    if (!senderName || !transactionId) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // 1. Fetch Order to validate status AND ownership
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, customerEmail: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // Ensure the requesting user owns this order (or is admin)
    const isAdmin = session.user.isAdmin === true;
    if (!isAdmin && order.customerEmail !== session.user.email) {
      logger.warn("[Transfer] Unauthorized attempt to confirm transfer", {
        orderId,
        requestingUserEmail: session.user.email,
        orderCustomerEmail: order.customerEmail,
      });
      return NextResponse.json(
        { error: "No tienes permiso para modificar esta orden" },
        { status: 403 }
      );
    }

    if (order.status !== ORDER_STATUS.WAITING_TRANSFER_PROOF) {
      return NextResponse.json(
        { error: "La orden no está esperando comprobante" },
        { status: 400 }
      );
    }

    // 2. Update Order
    const updatedOrder = await prisma.orders.update({
      where: { id: orderId },
      data: {
        status: ORDER_STATUS.PAYMENT_REVIEW as OrderStatus,
        transferSenderName: senderName,
        transferTransactionId: transactionId,
        transferProofAt: new Date(),
      },
    });

    logger.info(`[Transfer] Proof submitted for ${orderId}`, {
      senderName,
      transactionId,
      userId: session.user.id,
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    logger.error("[Transfer] Error confirming transfer", { error });
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
