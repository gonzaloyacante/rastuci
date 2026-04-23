import { generateEmailHtml } from "../base";

/**
 * Email de recordatorio de carrito abandonado — enviado cuando el cliente
 * agregó productos al carrito pero no completó la compra.
 */
export const getCartAbandonedEmail = (params: {
  customerName: string;
  items: Array<{ name: string; quantity: number }>;
  cartUrl: string;
  discountCode?: string;
}): string => {
  const { customerName, items, cartUrl, discountCode } = params;

  const itemsList = items
    .map((item) => `• ${item.name} (x${item.quantity})`)
    .join("<br>");

  const promoMsg = discountCode
    ? `<br><br>Como incentivo especial, usá el código <strong>${discountCode}</strong> para obtener un descuento en tu compra.`
    : "";

  return generateEmailHtml({
    customerName,
    orderId: "",
    title: "🛒 Olvidaste algo en tu carrito",
    color: "#f59e0b",
    message: `¡Todavía tenés productos esperándote!<br><br>
    ${itemsList}<br><br>
    El stock es limitado — no garantizamos disponibilidad si esperás demasiado.${promoMsg}`,
    orderUrl: cartUrl,
    customButtonText: "🛒 Retomar mi compra",
  });
};
