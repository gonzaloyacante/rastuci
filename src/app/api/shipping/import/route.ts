import { correoArgentinoService } from "@/lib/correo-argentino-service";
import { logger } from "@/lib/logger";
import { NextResponse, NextRequest } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";

export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { extOrderId, orderNumber, sender, recipient, shipping } = body;

    if (!extOrderId || !recipient || !shipping) {
      return NextResponse.json(
        { success: false, error: "Faltan datos requeridos para el envío" },
        { status: 400 }
      );
    }

    // Obtener customerId
    const customerId =
      correoArgentinoService.getCustomerId() ||
      process.env.CORREO_ARGENTINO_CUSTOMER_ID;

    if (!customerId) {
      await correoArgentinoService.authenticate();
    }

    const finalCustomerId =
      customerId ||
      correoArgentinoService.getCustomerId() ||
      process.env.CORREO_ARGENTINO_CUSTOMER_ID;

    if (!finalCustomerId) {
      return NextResponse.json(
        { success: false, error: "Error de configuración: Falta Customer ID" },
        { status: 500 }
      );
    }

    const result = await correoArgentinoService.importShipment({
      customerId: finalCustomerId,
      extOrderId,
      orderNumber,
      sender,
      recipient,
      shipping,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error?.message || "Error al importar envío",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    logger.error("Error importing shipment:", { error });
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Error importando envío",
      },
      { status: 500 }
    );
  }
});
