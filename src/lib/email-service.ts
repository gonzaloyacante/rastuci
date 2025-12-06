import { sendTrackingUpdateEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export interface OrderStatusChangeInput {
  orderId: string;
  newStatus: string;
  oldStatus: string;
}

export async function handleOrderStatusChange(
  input: OrderStatusChangeInput
): Promise<void> {
  try {
    // Obtener detalles de la orden con tracking
    const order = await prisma.orders.findUnique({
      where: { id: input.orderId },
      select: {
        customerEmail: true,
        customerName: true,
        trackingNumber: true,
      },
    });

    if (!order) {
      return; // Silent return si no se encuentra la orden
    }

    // Enviar email solo si hay email del cliente
    if (order.customerEmail) {
      // Usar el nuevo servicio de email mejorado
      await sendTrackingUpdateEmail({
        to: order.customerEmail,
        customerName: order.customerName || "Cliente",
        orderId: input.orderId,
        trackingCode: order.trackingNumber || undefined,
        status: input.newStatus,
      });
    }
  } catch {
    // Error handling silencioso para no afectar la actualización del estado
  }
}
