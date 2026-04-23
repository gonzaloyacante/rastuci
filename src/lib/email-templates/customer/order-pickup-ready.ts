import { generateEmailHtml, STATUS_COLORS } from "../base";

/**
 * Email al cliente cuando su pedido está listo para retirar en tienda (pickup).
 * Aplica a pedidos con shippingMethod === "pickup" que pasaron a PROCESSED.
 */
export const getOrderPickupReadyEmail = (params: {
  customerName: string;
  orderId: string;
  pickupAddress?: string;
  pickupHours?: string;
}): string => {
  const { customerName, orderId, pickupAddress, pickupHours } = params;

  const addressHtml = pickupAddress
    ? `📍 <strong>Dirección:</strong> ${pickupAddress}<br>`
    : "";
  const hoursHtml = pickupHours
    ? `🕐 <strong>Horario:</strong> ${pickupHours}<br>`
    : "";

  return generateEmailHtml({
    customerName,
    orderId,
    title: "🏪 ¡Tu pedido está listo para retirar!",
    color: STATUS_COLORS.out_for_delivery,
    message: `Tu pedido ya está listo. Podés pasar a retirarlo cuando quieras.<br><br>
    ${addressHtml}${hoursHtml}<br>
    Acordate de mencionar tu número de pedido al momento de retirarlo.`,
    orderUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com"}/orders/${orderId}`,
    customButtonText: "Ver Detalle del Pedido",
  });
};
