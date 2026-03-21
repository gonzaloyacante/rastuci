import {
  EMAIL_STYLES,
  escapeHtml,
  formatCurrency,
  generateEmailHtml,
  STATUS_COLORS,
  STATUS_MESSAGES,
} from "./base";

export const getOrderConfirmationEmail = (params: {
  customerName: string;
  orderId: string;
  total: number;
  subtotal?: number;
  discount?: number;
  shippingCost?: number;
  couponCode?: string;
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
      <strong>${item.name}</strong>${variantInfo ? `<br><span style="color: #666; font-size: 12px;">${variantInfo}</span>` : ""}<br>
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

  return generateEmailHtml({
    customerName,
    orderId,
    title: "¡Gracias por tu compra!",
    color: "#ec4899",
    message: `Confirmamos que recibimos tu pago y tu pedido está siendo procesado.<br><br>
    ${breakdownHtml}<br><br>
    ${itemsHtml}`,
    orderUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com"}/orders/${orderId}`,
    customButtonText: "Ver Pedido",
  });
};

export const getNewOrderAdminEmail = (params: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  total: number;
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
      <strong>${item.name}</strong>${variantInfo ? `<br><span style="color: #666; font-size: 12px;">${variantInfo}</span>` : ""}<br>
      Cantidad: ${item.quantity} × ${formatCurrency(item.price)}
    </div>
  `;
    })
    .join("");

  const customerDetails = [
    customerPhone && `📞 ${customerPhone}`,
    customerAddress && `📍 ${customerAddress}`,
  ]
    .filter(Boolean)
    .join("<br>");

  return generateEmailHtml({
    customerName: "Admin",
    orderId,
    title: "🔔 Nueva Venta",
    color: "#f59e0b",
    message: `¡Nueva venta realizada por <strong>${customerName}</strong> (${customerEmail})!<br>
    ${customerDetails ? `${customerDetails}<br><br>` : ""}
    <strong>Total: ${formatCurrency(total)}</strong><br><br>
    ${itemsHtml}`,
    orderUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com"}/admin/pedidos`,
    customButtonText: "Gestionar Pedido En Panel",
  });
};

export const getLowStockAlertEmail = (params: {
  productName: string;
  currentStock: number;
  productId: string;
}): string => {
  return generateEmailHtml({
    customerName: "Admin",
    orderId: "",
    title: "⚠️ Alerta de Stock Bajo",
    color: STATUS_COLORS.error,
    message: `El producto <strong>${params.productName}</strong> tiene pocas unidades.<br><br>
    <strong>Stock Actual: ${params.currentStock}</strong><br><br>
    Te recomendamos reponer inventario pronto o pausar la publicación.`,
    orderUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com"}/admin/products/${params.productId}`,
    customButtonText: "Ver Producto",
  });
};

export const getTrackingUpdateEmail = (params: {
  customerName: string;
  orderId: string;
  trackingCode: string;
  status: string;
  message?: string;
}): string => {
  const { customerName, orderId, trackingCode, message } = params;

  return generateEmailHtml({
    customerName,
    orderId,
    title: "🚚 Actualización de Envío",
    color: STATUS_COLORS.in_transit,
    message:
      message ||
      `Tu pedido está en camino.<br><br>
    Código de seguimiento: <strong>${trackingCode}</strong><br><br>
    Puedes seguir el estado de tu envío en la página del correo.`,
    trackingCode,
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
    message: `Tu pedido ha sido enviado con ${carrier}.<br><br>
      Código de seguimiento: <strong>${trackingNumber}</strong><br><br>
      Pronto recibirás tu compra.`,
    trackingCode: trackingNumber,
    trackingUrl: `https://www.correoargentino.com.ar/formularios/e-commerce`,
    orderUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com"}/orders/${orderId}`,
    customButtonText: "Rastrear Envío",
  });
};

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
    message: `Gracias por tu pedido. Para completarlo, por favor realiza una transferencia de <strong>${formatCurrency(total)}</strong> a la siguiente cuenta:<br><br>
    
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; text-align: left; font-family: monospace; color: #374151;">
      <strong>Banco:</strong> ${bankDetails.bankName || "Consultar"}<br>
      <strong>Titular:</strong> ${bankDetails.holder || "-"}<br>
      <strong>CBU:</strong> ${bankDetails.cbu || "No configurado"}<br>
      <strong>Alias:</strong> ${bankDetails.alias || "No configurado"}<br>
    </div>
    <br>
    Una vez realizada la transferencia, es <strong>obligatorio</strong> que subas el comprobante en el siguiente link para que podamos procesar tu pedido.`,
    orderUrl: uploadUrl,
    customButtonText: "📤 Subir Comprobante",
  });
};

export const getOrderCancelledEmail = (params: {
  customerName: string;
  orderId: string;
}): string => {
  const { customerName, orderId } = params;

  return generateEmailHtml({
    customerName,
    orderId,
    title: "⏳ Tu reserva ha expirado",
    color: STATUS_COLORS.error,
    message: `El tiempo de reserva de tu pedido ha finalizado, y los productos han vuelto a estar disponibles para otros clientes.<br><br>
    ¡No te preocupes! Si todavía los querés, es probable que aun haya stock.<br><br>
    Te invitamos a visitar la tienda y volver a pedirlos antes de que se agoten definitivamente.`,
    orderUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com"}/`,
    customButtonText: "🛍️ Volver a la Tienda",
  });
};

export const getPaymentReminderEmail = (params: {
  customerName: string;
  orderId: string;
  total: number;
  paymentUrl: string;
}): string => {
  const { customerName, orderId, total, paymentUrl } = params;

  return generateEmailHtml({
    customerName,
    orderId,
    title: "👀 ¡No dejes escapar tus favoritos!",
    color: STATUS_COLORS.pending,
    message: `Vimos que dejaste tu pedido pendiente y no queremos que te lo ganen de mano.<br><br>
    Tus productos siguen reservados para vos, pero <strong>el tiempo se está agotando</strong> y el stock es limitado.<br><br>
    👉 Total a pagar: <strong>${formatCurrency(total)}</strong><br><br>
    Hacé clic abajo para completar tu compra seguro y rápido.`,
    orderUrl: paymentUrl,
    customButtonText: "⚡ Completar Compra Ahora",
  });
};
