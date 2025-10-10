import { sendOrderStatusEmail } from "@/lib/email";
import prisma from "@/lib/prisma";

export interface OrderStatusChangeInput {
  orderId: string;
  newStatus: string;
  oldStatus: string;
}

export async function handleOrderStatusChange(input: OrderStatusChangeInput): Promise<void> {
  try {
    // Obtener detalles de la orden
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      select: {
        customerEmail: true,
        customerName: true,
      },
    });

    if (!order) {
      console.warn(`Order ${input.orderId} not found for email notification`);
      return;
    }

    // Enviar email solo si hay email del cliente
    if (order.customerEmail) {
      await sendOrderStatusEmail({
        to: order.customerEmail,
        orderId: input.orderId,
        status: getStatusLabel(input.newStatus),
        customerName: order.customerName,
      });

      console.log(`Email sent for order ${input.orderId} status change: ${input.oldStatus} -> ${input.newStatus}`);
    }
  } catch (error) {
    console.error("Error sending order status email:", error);
    // No lanzamos error para que no afecte la actualización del estado
  }
}

function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    PROCESSED: "Procesado", 
    DELIVERED: "Entregado",
  };

  return statusLabels[status] || status;
}