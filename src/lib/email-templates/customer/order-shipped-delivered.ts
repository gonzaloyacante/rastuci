import { generateEmailHtml, STATUS_COLORS, STATUS_MESSAGES } from "../base";

export const getOrderShippedEmail = (params: {
  customerName: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
}): string => {
  const { customerName, orderId, trackingNumber, carrier } = params;

  return generateEmailHtml({
    customerName,
    orderId,
    title: "📦 ¡Tu pedido está en camino!",
    color: STATUS_COLORS.in_transit,
    message: `Tu pedido ha sido enviado con <strong>${carrier}</strong>.<br><br>
      Código de seguimiento: <strong>${trackingNumber}</strong><br><br>
      Podés rastrear tu envío en el sitio de Correo Argentino haciendo clic en el botón de abajo.`,
    trackingCode: trackingNumber,
    trackingUrl: `https://www.correoargentino.com.ar/formularios/e-commerce`,
    orderUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com"}/orders/${orderId}`,
    customButtonText: "Rastrear Envío",
  });
};

export const getOrderDeliveredEmail = (params: {
  customerName: string;
  orderId: string;
}): string => {
  const { customerName, orderId } = params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com";

  return generateEmailHtml({
    customerName,
    orderId,
    title: STATUS_MESSAGES.DELIVERED.title,
    color: STATUS_COLORS.delivered,
    message: `${STATUS_MESSAGES.DELIVERED.message}<br><br>
    Tu opinión es muy importante para nosotros. ¿Podrías tomarte un momento para calificar tu compra?`,
    orderUrl: `${baseUrl}/reviews/rate/${orderId}`,
    customButtonText: "★ Calificar Compra",
  });
};
