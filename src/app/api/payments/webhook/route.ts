import { getPayment } from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

interface MercadoPagoPayment {
  id?: string | number;
  external_reference?: string;
  status?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // MercadoPago envía diferentes tipos de notificaciones
    if (body.type === "payment") {
      const paymentId = body.data.id;

      // Obtener información completa del pago
      const paymentInfo = await getPayment(paymentId);

      if (!paymentInfo) {
        logger.warn("[Payment webhook] Empty payment info for id", {
          data: paymentId,
        });
        return NextResponse.json({ received: true });
      }

      // Procesar según el estado del pago
      switch (paymentInfo.status) {
        case "approved":
          // Pago aprobado - actualizar orden
          await handleApprovedPayment(paymentInfo);
          break;

        case "rejected":
          // Pago rechazado - notificar al usuario
          await handleRejectedPayment(paymentInfo);
          break;

        case "pending":
          // Pago pendiente - esperar confirmación
          await handlePendingPayment(paymentInfo);
          break;

        case "cancelled":
          // Pago cancelado
          await handleCancelledPayment(paymentInfo);
          break;
      }

      // Log para debugging
      logger.info("Payment webhook processed:", {
        data: {
          id: paymentInfo.id,
          status: paymentInfo.status,
          external_reference: paymentInfo.external_reference,
        },
      });
    }

    // MercadoPago requiere respuesta 200 para confirmar recepción
    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Webhook error:", { error: error });

    // Aún así devolver 200 para evitar reenvíos
    return NextResponse.json({ received: true });
  }
}

async function handleApprovedPayment(payment: MercadoPagoPayment) {
  try {
    const orderId = payment.external_reference;

    if (orderId) {
      // Actualizar estado de la orden en la base de datos
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PROCESSED,
          mpPaymentId: payment.id?.toString() || "",
          mpStatus: payment.status || "",
        },
      });

      // Aquí puedes agregar lógica adicional:
      // - Enviar email de confirmación
      // - Actualizar stock
      // - Generar factura
      // - Notificar al vendedor
    }
  } catch (error) {
    logger.error("Error handling approved payment:", { error: error });
  }
}

async function handleRejectedPayment(payment: MercadoPagoPayment) {
  try {
    const orderId = payment.external_reference;

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PENDING,
          mpStatus: payment.status || "",
          mpPaymentId: payment.id?.toString() || "",
        },
      });
    }
  } catch (error) {
    logger.error("Error handling rejected payment:", { error: error });
  }
}

async function handlePendingPayment(payment: MercadoPagoPayment) {
  try {
    const orderId = payment.external_reference;

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PENDING,
          mpPaymentId: payment.id?.toString() || "",
          mpStatus: payment.status || "",
        },
      });
    }
  } catch (error) {
    logger.error("Error handling pending payment:", { error: error });
  }
}

async function handleCancelledPayment(payment: MercadoPagoPayment) {
  try {
    const orderId = payment.external_reference;

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PENDING,
          mpPaymentId: payment.id?.toString() || "",
          mpStatus: payment.status || "",
        },
      });
    }
  } catch (error) {
    logger.error("Error handling cancelled payment:", { error: error });
  }
}
