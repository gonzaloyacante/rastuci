import {
  EMAIL_STYLES,
  escapeHtml,
  formatCurrency,
  generateEmailHtml,
  STATUS_COLORS,
} from "../base";

export const getBankTransferEmail = (params: {
  customerName: string;
  orderId: string;
  total: number;
  bankDetails: {
    bankName: string;
    cbu: string;
    alias: string;
    holder: string;
  };
  uploadUrl: string;
}): string => {
  const { customerName, orderId, total, bankDetails, uploadUrl } = params;

  return generateEmailHtml({
    customerName,
    orderId,
    title: "⏳ Instrucciones de Transferencia",
    color: STATUS_COLORS.pending,
    message: `Gracias por tu pedido. Para completarlo, por favor realizá una transferencia de <strong>${formatCurrency(total)}</strong> a la siguiente cuenta:<br><br>
    
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: left; font-family: monospace; color: #374151; border: 1px solid #d1d5db;">
      <p style="margin: 0 0 8px;"><strong>Banco:</strong> ${escapeHtml(bankDetails.bankName || "Consultar")}</p>
      <p style="margin: 0 0 8px;"><strong>Titular:</strong> ${escapeHtml(bankDetails.holder || "-")}</p>
      <p style="margin: 0 0 8px;"><strong>CBU:</strong> <span style="user-select:all;">${escapeHtml(bankDetails.cbu || "No configurado")}</span></p>
      <p style="margin: 0;"><strong>Alias:</strong> <span style="user-select:all;">${escapeHtml(bankDetails.alias || "No configurado")}</span></p>
    </div>
    <br>
    Una vez realizada la transferencia, es <strong>obligatorio</strong> que subas el comprobante en el siguiente link para que podamos procesar tu pedido.`,
    orderUrl: uploadUrl,
    customButtonText: "📤 Subir Comprobante",
  });
};

/**
 * Email enviado al cliente cuando su transferencia fue aprobada por el admin.
 */
export const getTransferApprovedEmail = (params: {
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
      return `<div style="${EMAIL_STYLES.detailItem}; border-bottom: 1px solid #eee; padding-bottom: 5px;">
        <strong>${escapeHtml(item.name)}</strong>${variantInfo ? `<br><span style="color:#666;font-size:12px;">${variantInfo}</span>` : ""}<br>
        Cantidad: ${item.quantity} × ${formatCurrency(item.price)}
      </div>`;
    })
    .join("");

  const isPickup = shippingMethod === "pickup";
  const nextStep = isPickup
    ? "Te avisaremos cuando tu pedido esté listo para retirar."
    : "Estamos preparando el envío. Recibirás el número de seguimiento cuando despachemos tu paquete.";

  return generateEmailHtml({
    customerName,
    orderId,
    title: "✅ ¡Transferencia aprobada!",
    color: "#10b981",
    message: `¡Buenas noticias! Tu transferencia bancaria fue verificada y tu pedido está confirmado.<br><br>
    ${nextStep}<br><br>
    <strong>Total abonado: ${formatCurrency(total)}</strong><br><br>
    ${itemsHtml}`,
    orderUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com"}/orders/${orderId}`,
    customButtonText: "Ver Mi Pedido",
  });
};

/**
 * Email enviado al cliente confirmando que el comprobante fue recibido y está en revisión.
 */
export const getTransferProofReceivedEmail = (params: {
  customerName: string;
  orderId: string;
}): string => {
  const { customerName, orderId } = params;

  return generateEmailHtml({
    customerName,
    orderId,
    title: "📄 Comprobante recibido",
    color: STATUS_COLORS.pending,
    message: `Recibimos tu comprobante de transferencia y lo estamos revisando.<br><br>
    Normalmente verificamos los comprobantes en menos de 24 horas hábiles. Te enviaremos un email en cuanto esté aprobado.<br><br>
    ¡Gracias por tu paciencia!`,
    orderUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com"}/orders/${orderId}`,
    customButtonText: "Ver Estado del Pedido",
  });
};
