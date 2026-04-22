import {
  EMAIL_STYLES,
  escapeHtml,
  formatCurrency,
  generateEmailHtml,
} from "../base";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  mercadopago: "💳 MercadoPago",
  cash: "💵 Efectivo",
  transfer: "🏦 Transferencia Bancaria",
};

export const getNewOrderAdminEmail = (params: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  total: number;
  paymentMethod?: string;
  shippingMethod?: string;
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
    customerEmail,
    customerPhone,
    customerAddress,
    orderId,
    total,
    paymentMethod,
    shippingMethod,
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

  const customerDetails = [
    customerPhone && `📞 ${escapeHtml(customerPhone)}`,
    customerAddress && `📍 ${escapeHtml(customerAddress)}`,
  ]
    .filter(Boolean)
    .join("<br>");

  const paymentLabel = paymentMethod
    ? (PAYMENT_METHOD_LABELS[paymentMethod] ?? paymentMethod)
    : "No especificado";

  const shippingLabel =
    shippingMethod === "pickup"
      ? "🏪 Retiro en tienda"
      : "📦 Envío a domicilio";

  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com"}/admin/orders/${orderId}`;

  return generateEmailHtml({
    customerName: "Admin",
    orderId,
    title: "🔔 Nueva Venta",
    color: "#f59e0b",
    message: `¡Nueva venta realizada por <strong>${escapeHtml(customerName)}</strong>!<br>
    📧 ${escapeHtml(customerEmail)}<br>
    ${customerDetails ? `${customerDetails}<br>` : ""}
    <br>
    <div style="background-color: #fef3c7; border-radius: 8px; padding: 12px; margin: 12px 0; border: 1px solid #fcd34d;">
      <p style="margin: 0 0 6px;"><strong>💰 Total:</strong> ${formatCurrency(total)}</p>
      <p style="margin: 0 0 6px;"><strong>Pago:</strong> ${paymentLabel}</p>
      <p style="margin: 0;"><strong>Envío:</strong> ${shippingLabel}</p>
    </div>
    <br>
    ${itemsHtml}`,
    orderUrl: adminUrl,
    customButtonText: "Gestionar Pedido",
  });
};
