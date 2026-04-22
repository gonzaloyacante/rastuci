import {
  EMAIL_STYLES,
  escapeHtml,
  formatCurrency,
  generateEmailHtml,
} from "../base";

/**
 * Email enviado al cliente cuando el admin confirma el pago de un pedido en efectivo
 * o cuando se aprueba manualmente un pedido.
 */
export const getOrderProcessedEmail = (params: {
  customerName: string;
  orderId: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    color?: string;
    size?: string;
  }>;
  shippingMethod?: string;
}): string => {
  const { customerName, orderId, total, items, shippingMethod } = params;

  const itemsHtml = items
    .map((item) => {
      const variantInfo = [
        item.color && `Color: ${item.color}`,
        item.size && `Talle: ${item.size}`,
      ]
        .filter(Boolean)
        .join(" | ");
      return `
    <div style="${EMAIL_STYLES.detailItem}; border-bottom: 1px solid #eee; padding-bottom: 5px;">
      <strong>${escapeHtml(item.name)}</strong>${variantInfo ? `<br><span style="color:#666;font-size:12px;">${variantInfo}</span>` : ""}<br>
      Cantidad: ${item.quantity} × ${formatCurrency(item.price)}
    </div>`;
    })
    .join("");

  const isPickup = shippingMethod === "pickup";
  const nextStepMsg = isPickup
    ? "Pronto te avisaremos cuando tu pedido esté listo para retirar."
    : "Estamos preparando tu envío. Recibirás un email con el número de seguimiento cuando despachemos tu pedido.";

  return generateEmailHtml({
    customerName,
    orderId,
    title: "✅ ¡Tu pago fue confirmado!",
    color: "#10b981",
    message: `Tu pago fue verificado y tu pedido está siendo preparado.<br><br>
    ${nextStepMsg}<br><br>
    <strong>Total abonado: ${formatCurrency(total)}</strong><br><br>
    ${itemsHtml}`,
    orderUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com"}/orders/${orderId}`,
    customButtonText: "Ver Mi Pedido",
  });
};
