import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { ORDER_STATUS } from "@/lib/constants";

// Fix for param typing in Next.js 15+ if needed, but sticking to standard pattern
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const body = await request.json();
    const { senderName, transactionId } = body;

    if (!senderName || !transactionId) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // 1. Fetch Order to validate status
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
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
        status: ORDER_STATUS.PAYMENT_REVIEW as any, // Cast if enum mismatch
        transferSenderName: senderName,
        transferTransactionId: transactionId,
        transferProofAt: new Date(),
      },
    });

    logger.info(`[Transfer] Proof submitted for ${orderId}`, {
      senderName,
      transactionId,
    });

    // TODO: Send Email to Admin? (New Transfer Proof Uploaded)

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    logger.error("[Transfer] Error confirming transfer", { error });
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
