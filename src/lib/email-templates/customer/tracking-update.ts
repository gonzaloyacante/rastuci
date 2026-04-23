import { generateEmailHtml, STATUS_COLORS } from "../base";

/**
 * Email de actualización de tracking — consciente del estado real del envío.
 * Delega a la plantilla de "entregado" cuando el estado lo indica.
 */
export const getTrackingUpdateEmail = (params: {
  customerName: string;
  orderId: string;
  trackingCode: string;
  status: string;
  message?: string;
}): string => {
  const { customerName, orderId, trackingCode, status, message } = params;

  const normalizedStatus = status.toUpperCase();

  // Si el paquete fue entregado, usar título y color especiales
  const isDelivered =
    normalizedStatus === "DELIVERED" ||
    normalizedStatus === "ENTREGADO" ||
    normalizedStatus.includes("ENTREGAD");

  if (isDelivered) {
    return generateEmailHtml({
      customerName,
      orderId,
      title: "✅ ¡Tu pedido fue entregado!",
      color: STATUS_COLORS.delivered,
      message:
        message ||
        `¡Que lo disfrutes! Tu pedido ha sido entregado exitosamente.<br><br>
        Código de seguimiento: <strong>${trackingCode}</strong><br><br>
        Tu opinión es muy importante para nosotros. ¿Podrías tomarte un momento para calificar tu compra?`,
      trackingCode,
      orderUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com"}/reviews/rate/${orderId}`,
      customButtonText: "★ Calificar Compra",
    });
  }

  const isOutForDelivery =
    normalizedStatus === "OUT_FOR_DELIVERY" ||
    normalizedStatus.includes("EN REPARTO") ||
    normalizedStatus.includes("REPARTO");

  if (isOutForDelivery) {
    return generateEmailHtml({
      customerName,
      orderId,
      title: "🏠 ¡Tu pedido está en reparto!",
      color: STATUS_COLORS.out_for_delivery,
      message:
        message ||
        `Tu pedido está siendo entregado hoy. Asegurate de estar disponible para recibirlo.<br><br>
        Código de seguimiento: <strong>${trackingCode}</strong>`,
      trackingCode,
      trackingUrl: `https://www.correoargentino.com.ar/formularios/e-commerce`,
      orderUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com"}/orders/${orderId}`,
      customButtonText: "Rastrear Envío",
    });
  }

  return generateEmailHtml({
    customerName,
    orderId,
    title: "🚚 Actualización de Envío",
    color: STATUS_COLORS.in_transit,
    message:
      message ||
      `Tu pedido está en camino.<br><br>
    Código de seguimiento: <strong>${trackingCode}</strong><br><br>
    Podés seguir el estado de tu envío en la página de Correo Argentino.`,
    trackingCode,
    trackingUrl: `https://www.correoargentino.com.ar/formularios/e-commerce`,
    orderUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com"}/orders/${orderId}`,
    customButtonText: "Rastrear Envío",
  });
};
