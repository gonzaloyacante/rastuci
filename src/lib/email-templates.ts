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
      <p style="${EMAIL_STYLES.text}">Hola <strong>${customerName}</strong>,</p>
      
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
  items: Array<{ name: string; quantity: number; price: number }>;
}): string => {
  const { customerName, orderId, total, items } = params;

  const itemsHtml = items
    .map(
      (item) => `
    <div style="${EMAIL_STYLES.detailItem}; border-bottom: 1px solid #eee; padding-bottom: 5px;">
      <strong>${item.name}</strong><br>
      Cantidad: ${item.quantity} × $${item.price.toFixed(2)}
    </div>
  `
    )
    .join("");

  return generateEmailHtml({
    customerName,
    orderId,
    title: "¡Gracias por tu compra!",
    color: "#ec4899", // Pink branding
    message: `Confirmamos que recibimos tu pago y tu pedido está siendo procesado.<br><br>
    <strong>Total: $${total.toFixed(2)}</strong><br><br>
    ${itemsHtml}`,
    orderUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://rastuci.com"}/orders/${orderId}`,
    customButtonText: "Ver Pedido",
  });
};

export const getNewOrderAdminEmail = (params: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}): string => {
  const { customerName, customerEmail, orderId, total, items } = params;

  const itemsHtml = items
    .map(
      (item) => `
    <div style="${EMAIL_STYLES.detailItem}; border-bottom: 1px solid #eee; padding-bottom: 5px;">
      <strong>${item.name}</strong><br>
      Cantidad: ${item.quantity} × $${item.price.toFixed(2)}
    </div>
  `
    )
    .join("");

  return generateEmailHtml({
    customerName: "Admin",
    orderId,
    title: "🔔 Nueva Venta",
    color: "#f59e0b", // Yellow/Orange
    message: `¡Nueva venta realizada por <strong>${customerName}</strong> (${customerEmail})!<br><br>
    <strong>Total: $${total.toFixed(2)}</strong><br><br>
    ${itemsHtml}`,
    orderUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://rastuci.com"}/admin/pedidos`,
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
    orderUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://rastuci.com"}/admin/products/${params.productId}`,
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
    orderUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://rastuci.com"}/orders/${orderId}`,
    customButtonText: "Rastrear Envío",
  });
};

export const getOrderDeliveredEmail = (params: {
  customerName: string;
  orderId: string;
}): string => {
  const { customerName, orderId } = params;

  return generateEmailHtml({
    customerName,
    orderId,
    title: STATUS_MESSAGES.DELIVERED.title,
    color: STATUS_COLORS.delivered,
    message: STATUS_MESSAGES.DELIVERED.message,
    orderUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://rastuci.com"}/orders/${orderId}`,
    customButtonText: "Ver mi Pedido",
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
    orderUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://rastuci.com"}/orders/${orderId}`,
    customButtonText: "Rastrear Envío",
  });
};
