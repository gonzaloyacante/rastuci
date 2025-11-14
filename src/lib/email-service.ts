import { sendOrderStatusEmail, sendTrackingUpdateEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export interface OrderStatusChangeInput {
  orderId: string;
  newStatus: string;
  oldStatus: string;
}

export async function handleOrderStatusChange(input: OrderStatusChangeInput): Promise<void> {
  try {
    // Obtener detalles de la orden con tracking
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      select: {
        customerEmail: true,
        customerName: true,
        ocaTrackingNumber: true,
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
        customerName: order.customerName || 'Cliente',
        orderId: input.orderId,
        trackingCode: order.ocaTrackingNumber || undefined,
        status: input.newStatus,
      });

      // También mantener compatibilidad con el servicio anterior
      await sendOrderStatusEmail({
        to: order.customerEmail,
        orderId: input.orderId,
        status: getStatusLabel(input.newStatus),
        customerName: order.customerName,
        trackingCode: order.ocaTrackingNumber || undefined,
      });
    }
  } catch {
    // Error handling silencioso para no afectar la actualización del estado
  }
}

function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    PROCESSED: "Procesado", 
    DELIVERED: "Entregado",
    pending: "Pendiente",
    'in-transit': "En tránsito",
    delivered: "Entregado",
    delayed: "Retrasado",
    error: "Error",
  };

  return statusLabels[status] || status;
}