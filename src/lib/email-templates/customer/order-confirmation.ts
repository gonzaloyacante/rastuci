import {
  EMAIL_STYLES,
  escapeHtml,
  formatCurrency,
  generateEmailHtml,
} from "../base";

export const getOrderConfirmationEmail = (params: {
  customerName: string;
  orderId: string;
  total: number;
  subtotal?: number;
  discount?: number;
  shippingCost?: number;
  couponCode?: string;
  paymentMethod?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    color?: string;
    size?: string;
  }>;
}): string => {
  const {
    customerName,
    orderId,
    total,
    subtotal,
    discount,
    shippingCost,
    couponCode,
    paymentMethod,
    items,
  } = params;

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
      <strong>${escapeHtml(item.name)}</strong>${variantInfo ? `<br><span style="color: #666; font-size: 12px;">${variantInfo}</span>` : ""}<br>
      Cantidad: ${item.quantity} × ${formatCurrency(item.price)}
    </div>
  `;
    })
    .join("");

  const hasBreakdown =
    subtotal !== undefined &&
    (discount !== undefined || shippingCost !== undefined);

  const breakdownHtml = hasBreakdown
    ? `
    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin: 15px 0; border: 1px solid #e9ecef;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #555;">
        <tr>
          <td style="padding: 6px 0;">Subtotal</td>
          <td style="padding: 6px 0; text-align: right;">${formatCurrency(subtotal!)}</td>
        </tr>
        ${
          shippingCost !== undefined
            ? `<tr>
          <td style="padding: 6px 0;">Envío</td>
          <td style="padding: 6px 0; text-align: right;">${shippingCost === 0 ? "<span style='color:#16a34a;font-weight:bold;'>GRATIS</span>" : formatCurrency(shippingCost)}</td>
        </tr>`
            : ""
        }
        ${
          discount !== undefined && discount > 0
            ? `<tr>
          <td style="padding: 6px 0; color: #16a34a;">${couponCode ? `🏷️ Cupón (${escapeHtml(couponCode)})` : "Descuento"}</td>
          <td style="padding: 6px 0; text-align: right; color: #16a34a; font-weight: bold;">-${formatCurrency(discount)}</td>
        </tr>`
            : ""
        }
        <tr style="border-top: 2px solid #333;">
          <td style="padding: 10px 0 4px; font-weight: bold; color: #333; font-size: 16px;">Total</td>
          <td style="padding: 10px 0 4px; text-align: right; font-weight: bold; color: #333; font-size: 16px;">${formatCurrency(total)}</td>
        </tr>
      </table>
    </div>
    ${discount !== undefined && discount > 0 ? `<p style="color: #16a34a; font-weight: bold; text-align: center; font-size: 14px;">🎉 ¡Ahorraste ${formatCurrency(discount)} en este pedido!</p>` : ""}`
    : `<strong>Total: ${formatCurrency(total)}</strong>`;

  const paymentLabel: Record<string, string> = {
    mercadopago: "💳 MercadoPago",
    cash: "💵 Efectivo",
    transfer: "🏦 Transferencia Bancaria",
  };
  const paymentHtml = paymentMethod
    ? `<p style="font-size: 13px; color: #666; margin: 8px 0 0;">Método de pago: <strong>${paymentLabel[paymentMethod] ?? paymentMethod}</strong></p>`
    : "";

  return generateEmailHtml({
    customerName,
    orderId,
    title: "¡Gracias por tu compra!",
    color: "#ec4899",
    message: `Confirmamos que recibimos tu pago y tu pedido está siendo procesado.<br><br>
    ${paymentHtml}<br>
    ${breakdownHtml}<br><br>
    ${itemsHtml}`,
    orderUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com"}/orders/${orderId}`,
    customButtonText: "Ver Pedido",
  });
};
