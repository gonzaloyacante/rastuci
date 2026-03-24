import { NextRequest, NextResponse } from "next/server";

import { withAdminAuth } from "@/lib/adminAuth";
import { correoArgentinoService } from "@/lib/correo-argentino-service";
import { logger } from "@/lib/logger";

async function resolveCustomerId(): Promise<string | null> {
  const id =
    correoArgentinoService.getCustomerId() ||
    process.env.CORREO_ARGENTINO_CUSTOMER_ID;
  if (id) return id;
  await correoArgentinoService.authenticate();
  return (
    correoArgentinoService.getCustomerId() ||
    process.env.CORREO_ARGENTINO_CUSTOMER_ID ||
    null
  );
}

async function handleImport(request: NextRequest) {
  const body = await request.json();
  const { extOrderId, orderNumber, sender, recipient, shipping } = body;

  if (!extOrderId || !recipient || !shipping) {
    return NextResponse.json(
      { success: false, error: "Faltan datos requeridos para el envío" },
      { status: 400 }
    );
  }

  const customerId = await resolveCustomerId();
  if (!customerId) {
    return NextResponse.json(
      { success: false, error: "Error de configuración: Falta Customer ID" },
      { status: 500 }
    );
  }

  const result = await correoArgentinoService.importShipment({
    customerId,
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

  return NextResponse.json({ success: true, data: result.data });
}

export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    return await handleImport(request);
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
