import { formatCurrency } from "@/lib/utils";

/**
 * Escape HTML entities to prevent XSS in email templates.
 * User-supplied data (customerName, phone, address, product names) MUST be escaped.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export const EMAIL_STYLES = {
  fontFamily: "font-family: Arial, sans-serif;",
  body: "margin: 0; padding: 0; background-color: #f4f4f4; width: 100%;",
  container:
    "max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);",
  header: "text-align: center; padding: 20px 0; border-bottom: 2px solid #eee;",
  logo: "color: #333; margin: 0; font-size: 24px; font-weight: bold;",
  subhead: "color: #666; margin: 5px 0 0 0;",
  content: "padding: 20px 0;",
  statusBox: (color: string) =>
    `background-color: ${color}; color: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;`,
  statusTitle: "margin: 0; font-size: 20px; font-weight: bold;",
  text: "font-size: 16px; color: #333; line-height: 1.6;",
  detailsBox:
    "background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #e9ecef;",
  detailsTitle: "margin: 0 0 10px 0; color: #333; font-size: 18px;",
  detailItem: "margin: 8px 0; color: #555;",
  buttonContainer: "text-align: center; margin: 30px 0;",
  button: (color: string) =>
    `display: inline-block; background-color: ${color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 0 10px; font-weight: bold;`,
  footer:
    "text-align: center; padding: 20px 0; border-top: 2px solid #eee; color: #888; font-size: 12px;",
  helpBox:
    "background-color: #e9f7ff; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: left;",
  link: "color: #007bff; text-decoration: none;",
};

export const STATUS_COLORS = {
  pending: "#f59e0b", // Yellow
  in_transit: "#3b82f6", // Blue
  out_for_delivery: "#10b981", // Emerald
  delivered: "#059669", // Green
  delayed: "#dc2626", // Red
  error: "#dc2626", // Red
  processed: "#3b82f6", // Blue (generic for internal processed)
};

export const STATUS_MESSAGES = {
  PENDING: {
    title: "📦 Tu pedido está siendo preparado",
    message: "Hemos recibido tu pedido y estamos preparándolo.",
  },
  PROCESSED: {
    title: "✅ Tu pedido fue procesado",
    message:
      "Hemos confirmado el pago de tu pedido y estamos generando el envío.",
  },
  DELIVERED: {
    title: "✅ ¡Tu pedido ha sido entregado!",
    message: "¡Que lo disfrutes! Gracias por elegir Rastuci.",
  },
};

export interface EmailTemplateProps {
  customerName: string;
  orderId: string;
  message: string;
  title: string;
  color: string;
  trackingCode?: string;
  trackingUrl?: string;
  orderUrl: string;
  estimatedDeliveryDate?: string;
  customButtonText?: string;
}

export function generateEmailHtml({
  customerName,
  orderId,
  message,
  title,
  color,
  trackingCode,
  trackingUrl,
  orderUrl,
  estimatedDeliveryDate,
  customButtonText,
}: EmailTemplateProps): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="${EMAIL_STYLES.fontFamily} ${EMAIL_STYLES.body}">
  <div style="${EMAIL_STYLES.container}">
    <div style="${EMAIL_STYLES.header}">
      <h1 style="${EMAIL_STYLES.logo}">Rastuci</h1>
      <p style="${EMAIL_STYLES.subhead}">Tu tienda de confianza</p>
    </div>

    <div style="${EMAIL_STYLES.statusBox(color)}">
      <h2 style="${EMAIL_STYLES.statusTitle}">${title}</h2>
    </div>

    <div style="${EMAIL_STYLES.content}">
      <p style="${EMAIL_STYLES.text}">Hola <strong>${escapeHtml(customerName)}</strong>,</p>
      
      <p style="${EMAIL_STYLES.text}">${message}</p>
      
      <div style="${EMAIL_STYLES.detailsBox}">
        <h3 style="${EMAIL_STYLES.detailsTitle}">Detalles</h3>
        ${orderId ? `<p style="${EMAIL_STYLES.detailItem}"><strong>Número de Pedido:</strong> #${orderId}</p>` : ""}
        ${trackingCode ? `<p style="${EMAIL_STYLES.detailItem}"><strong>Código de Seguimiento:</strong> ${trackingCode}</p>` : ""}
        ${estimatedDeliveryDate ? `<p style="${EMAIL_STYLES.detailItem}"><strong>Fecha Estimada:</strong> ${estimatedDeliveryDate}</p>` : ""}
      </div>

      <div style="${EMAIL_STYLES.buttonContainer}">
        ${
          trackingUrl
            ? `
        <a href="${trackingUrl}" style="${EMAIL_STYLES.button("#007bff")}">
          🔍 Rastrear Envío
        </a>
        `
            : ""
        }
        <a href="${orderUrl}" style="${EMAIL_STYLES.button("#28a745")}">
          ${customButtonText || "📋 Ver Pedido"}
        </a>
      </div>

      <div style="${EMAIL_STYLES.helpBox}">
        <h4 style="margin: 0 0 10px 0; color: #333;">¿Necesitas ayuda?</h4>
        <p style="margin: 0; color: #666; font-size: 14px;">
          Si tienes alguna pregunta, contáctanos:
        </p>
        <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
          📧 Email: <a href="mailto:soporte@rastuci.com" style="${EMAIL_STYLES.link}">soporte@rastuci.com</a>
        </p>
      </div>
    </div>

    <div style="${EMAIL_STYLES.footer}">
      <p style="margin: 0;">© ${new Date().getFullYear()} Rastuci. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>`;
}

// =============================================================================
// SPECIFIC TEMPLATES
// =============================================================================

export const getWelcomeEmail = (params: {
  name: string;
  email: string;
  loginUrl: string;
}): string => {
  return generateEmailHtml({
    customerName: params.name,
    orderId: "", // Not an order
    title: "¡Bienvenido a Rastuci!",
    color: STATUS_COLORS.processed,
    message: `Nos alegra tenerte en nuestra comunidad.<br><br>
    Tu cuenta ha sido creada exitosamente.<br>
    Email: <strong>${params.email}</strong><br><br>
    Ahora puedes acceder a tu panel para ver tus compras y gestionar tu perfil.`,
    orderUrl: params.loginUrl,
    customButtonText: "Iniciar Sesión",
  });
};

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
    color: "#ec4899", // Pink branding
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
    color: "#f59e0b", // Yellow/Orange
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

  // Default values based on status
  // const statusConfig = STATUS_MESSAGES[status as keyof typeof STATUS_MESSAGES] || STATUS_MESSAGES.PROCESSED;
  // Using generic message if no specific status config matched, or the passed message

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
    trackingUrl: `https://www.correoargentino.com.ar/formularios/e-commerce`, // Generic CA URL or specific
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

export const getVacationReopeningEmail = (_params: {
  customerEmail: string;
}): string => {
  return generateEmailHtml({
    customerName: "Cliente",
    orderId: "",
    title: "¡Ya volvimos!",
    color: "#10b981", // Emerald Green
    message: `Nos alegra contarte que <strong>Rastuci</strong> está abierto nuevamente.<br><br>
    Ya podés visitar la tienda y finalizar tu compra. ¡Gracias por esperarnos!<br><br>
    Si tenías productos en mente, te recomendamos revisarlos pronto antes de que se agoten.`,
    orderUrl: process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com",
    customButtonText: "🛍️ Ir a la Tienda",
  });
};

export const getContactNotificationEmail = (params: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  responsePreference: string;
}): string => {
  const { name, email, phone, message, responsePreference } = params;
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com"}/admin/contacts`;
  const preferenceLabel: Record<string, string> = {
    EMAIL: "📧 Email",
    PHONE: "📞 Teléfono",
    WHATSAPP: "💬 WhatsApp",
  };

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Nuevo mensaje de contacto</title></head>
<body style="${EMAIL_STYLES.body}">
  <div style="${EMAIL_STYLES.container}">
    <div style="${EMAIL_STYLES.header}">
      <h1 style="${EMAIL_STYLES.logo}">Rastuci</h1>
      <p style="${EMAIL_STYLES.subhead}">Panel de Administración</p>
    </div>
    <div style="${EMAIL_STYLES.content}">
      <div style="background-color:#6366f1;color:white;padding:16px 20px;margin:20px 0;border-radius:8px;text-align:center;">
        <h2 style="margin:0;font-size:18px;font-weight:bold;">📬 Nuevo mensaje de contacto</h2>
      </div>
      <div style="${EMAIL_STYLES.detailsBox}">
        <h3 style="${EMAIL_STYLES.detailsTitle}">Datos del remitente</h3>
        <p style="${EMAIL_STYLES.detailItem}"><strong>Nombre:</strong> ${escapeHtml(name)}</p>
        <p style="${EMAIL_STYLES.detailItem}"><strong>Email:</strong> ${escapeHtml(email)}</p>
        ${phone ? `<p style="${EMAIL_STYLES.detailItem}"><strong>Teléfono:</strong> ${escapeHtml(phone)}</p>` : ""}
        <p style="${EMAIL_STYLES.detailItem}"><strong>Preferencia de respuesta:</strong> ${preferenceLabel[responsePreference] ?? responsePreference}</p>
      </div>
      <div style="${EMAIL_STYLES.detailsBox}">
        <h3 style="${EMAIL_STYLES.detailsTitle}">Mensaje</h3>
        <p style="font-size:15px;color:#333;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</p>
      </div>
      <div style="${EMAIL_STYLES.buttonContainer}">
        <a href="${adminUrl}" style="${EMAIL_STYLES.button("#6366f1")}">Ver en panel de admin</a>
      </div>
    </div>
    <div style="${EMAIL_STYLES.footer}">
      <p>Este es un email automático del sistema Rastuci. No responder a este correo.</p>
    </div>
  </div>
</body>
</html>`;
};
