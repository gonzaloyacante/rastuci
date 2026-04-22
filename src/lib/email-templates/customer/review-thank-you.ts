import { generateEmailHtml } from "../base";

/**
 * Email de agradecimiento cuando el cliente deja una review/calificación del producto.
 */
export const getReviewThankYouEmail = (params: {
  customerName: string;
  productName: string;
  orderId: string;
}): string => {
  const { customerName, productName, orderId } = params;

  return generateEmailHtml({
    customerName,
    orderId,
    title: "⭐ ¡Gracias por tu opinión!",
    color: "#f59e0b",
    message: `Tu calificación de <strong>${productName}</strong> fue publicada exitosamente.<br><br>
    Tu opinión ayuda a otros clientes a elegir mejor y nos ayuda a mejorar nuestros productos.<br><br>
    ¡Gracias por tomarte el tiempo!`,
    orderUrl: process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com",
    customButtonText: "🛍️ Seguir Comprando",
  });
};
