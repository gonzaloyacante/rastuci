import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAdminAuth } from "@/lib/adminAuth";
import { correoArgentinoService } from "@/lib/correo-argentino-service";
import { emailService } from "@/lib/resend";
import { logger } from "@/lib/logger";

export const POST = withAdminAuth(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const orderId = params.id;

      // 1. Fetch Order
      const order = await prisma.orders.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        return NextResponse.json(
          { success: false, error: "Pedido no encontrado" },
          { status: 404 }
        );
      }

      if (!order.caShipmentId && !order.caTrackingNumber) {
        return NextResponse.json(
          {
            success: false,
            error: "Este pedido no tiene un envío de Correo Argentino asociado",
          },
          { status: 400 }
        );
      }

      // 2. Query CA API
      // Preferimos usar el tracking number si existe, sino el shipmentId interno
      const idToQuery = order.caTrackingNumber || order.caShipmentId!;

      logger.info(
        `[SyncCA] Querying CA for order ${orderId} using ID ${idToQuery}`
      );

      const trackingResponse = await correoArgentinoService.getTracking({
        shippingId: idToQuery,
      });

      if (!trackingResponse.success || !trackingResponse.data) {
        return NextResponse.json(
          {
            success: false,
            error: "No se pudo obtener información de CA",
            details: trackingResponse.error,
          },
          { status: 500 }
        );
      }

      // 3. Process Response
      // CA response can be array or object
      const trackingData = Array.isArray(trackingResponse.data)
        ? trackingResponse.data[0]
        : "shippingId" in trackingResponse.data // Validating it matches TrackingInfo
          ? trackingResponse.data
          : null;

      if (!trackingData) {
        return NextResponse.json({
          success: true,
          message: "Consulta exitosa pero sin datos de tracking válidos",
        });
      }

      // 4. Check for updates
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates: any = {};
      let emailSent = false;

      // Detect new Tracking Number (if we queried by ID and got a CP...AR code)
      // Assuming trackingData.shippingId holds the official tracking number
      if (
        trackingData.shippingId &&
        trackingData.shippingId !== order.caTrackingNumber &&
        trackingData.shippingId.length > 10 // Basic heuristic for "Official Code" vs "Internal ID"
      ) {
        updates.caTrackingNumber = trackingData.shippingId;
        updates.trackingNumber = trackingData.shippingId; // Main tracking field
        logger.info(
          `[SyncCA] Found new tracking number: ${trackingData.shippingId}`
        );
      }

      // Detect Status Change (simple logic)
      // We update updatedAt to force UI refresh
      updates.updatedAt = new Date();

      // 5. Update Database if there are changes
      if (Object.keys(updates).length > 1) {
        // > 1 because updatedAt is always set
        await prisma.orders.update({
          where: { id: orderId },
          data: updates,
        });

        // 6. Send Email if NEW tracking number found
        if (updates.caTrackingNumber) {
          if (order.customerEmail) {
            await emailService.sendTrackingUpdate({
              to: order.customerEmail,
              customerName: order.customerName,
              orderId: order.id,
              trackingCode: updates.caTrackingNumber,
              status: "in-transit", // We assume it's moving if we got a code
              statusMessage:
                "¡Tu envío ha sido procesado por Correo Argentino!",
            });
            emailSent = true;
          }
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          trackingNumber: updates.caTrackingNumber || order.caTrackingNumber,
          emailSent,
        },
      });
    } catch (error) {
      logger.error("[SyncCA] Error syncing shipment", { error });
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  }
);
