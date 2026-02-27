import { OrderStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ORDER_STATUS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

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
    });

    if (!order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // Check logical flow
    // Can approve from Reserved? Or Payment_Review? yes.

    // Update Status to PROCESSED
    // Stock is ALREADY reserved (decremented on creation).
    // So we just update status.

    await prisma.orders.update({
      where: { id: orderId },
      data: { status: ORDER_STATUS.PROCESSED as OrderStatus },
    });

    logger.info(`[Admin] Approved transfer for order ${orderId}`);

    // TODO: Send Email "Payment Received"

    return NextResponse.json({
      success: true,
      message: "Pago aprobado. Orden lista para despachar.",
    });
  } catch (error) {
    logger.error("[Admin] Error approving transfer", { error });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
