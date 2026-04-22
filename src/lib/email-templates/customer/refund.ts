import {
  EMAIL_STYLES,
  escapeHtml,
  formatCurrency,
  generateEmailHtml,
} from "../base";

/**
 * Email al cliente confirmando que se procesó un reembolso.
 * Se emite cuando el admin confirma la devolución del dinero.
 */
export const getRefundIssuedEmail = (params: {
  customerName: string;
  orderId: string;
  refundAmount: number;
  refundMethod: string;
  estimatedDays?: number;
}): string => {
  const {
    customerName,
    orderId,
    refundAmount,
    refundMethod,
    estimatedDays = 5,
  } = params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com";

  const refundMethodLabels: Record<string, string> = {
    mercadopago: "MercadoPago",
    transfer: "Transferencia bancaria",
    cash: "Efectivo",
  };
  const methodLabel = refundMethodLabels[refundMethod] ?? refundMethod;

  return generateEmailHtml({
    customerName,
    orderId,
    title: "💸 Reembolso procesado",
    color: "#10b981",
    message: `Se procesó un reembolso por tu pedido #${orderId.slice(0, 8)}.<br><br>
    <div style="${EMAIL_STYLES.detailsBox}">
      <p style="${EMAIL_STYLES.detailItem}"><strong>Monto reembolsado:</strong> ${formatCurrency(refundAmount)}</p>
      <p style="${EMAIL_STYLES.detailItem}"><strong>Método:</strong> ${methodLabel}</p>
      <p style="${EMAIL_STYLES.detailItem}"><strong>Tiempo estimado:</strong> ${estimatedDays} días hábiles</p>
    </div>
    Si no recibís el reembolso en el plazo indicado, no dudes en contactarnos.`,
    orderUrl: `${baseUrl}/orders/${orderId}`,
    customButtonText: "Ver Pedido",
  });
};

/**
 * Email al cliente notificando que su pedido fue devuelto al remitente
 * (por ejemplo, nadie lo recibió y Correo Argentino lo devolvió).
 */
export const getOrderReturnedEmail = (params: {
  customerName: string;
  orderId: string;
  trackingCode?: string;
}): string => {
  const { customerName, orderId, trackingCode } = params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com";

  return generateEmailHtml({
    customerName,
    orderId,
    title: "📦 Paquete devuelto",
    color: "#f59e0b",
    message: `Tu paquete fue devuelto al remitente porque no fue posible entregarlo.<br><br>
    ${trackingCode ? `Código de seguimiento: <strong>${trackingCode}</strong><br><br>` : ""}
    Por favor contactanos para coordinar una nueva entrega o un reembolso.`,
    orderUrl: `${baseUrl}/contact`,
    customButtonText: "📞 Contactarnos",
  });
};

/**
 * Email al admin notificando que se procesó un reembolso.
 */
export const getRefundAdminNotificationEmail = (params: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  refundAmount: number;
  refundMethod: string;
  adminName?: string;
}): string => {
  const {
    orderId,
    customerName,
    customerEmail,
    refundAmount,
    refundMethod,
    adminName,
  } = params;
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com"}/admin/orders/${orderId}`;

  return generateEmailHtml({
    customerName: "Admin",
    orderId,
    title: "💸 Reembolso registrado",
    color: "#6366f1",
    message: `Se registró un reembolso para el pedido #${orderId.slice(0, 8)}.<br><br>
    <div style="${EMAIL_STYLES.detailsBox}">
      <p style="${EMAIL_STYLES.detailItem}"><strong>Cliente:</strong> ${escapeHtml(customerName)} (${escapeHtml(customerEmail)})</p>
      <p style="${EMAIL_STYLES.detailItem}"><strong>Monto:</strong> ${formatCurrency(refundAmount)}</p>
      <p style="${EMAIL_STYLES.detailItem}"><strong>Método:</strong> ${escapeHtml(refundMethod)}</p>
      ${adminName ? `<p style="${EMAIL_STYLES.detailItem}"><strong>Procesado por:</strong> ${escapeHtml(adminName)}</p>` : ""}
    </div>`,
    orderUrl: adminUrl,
    customButtonText: "Ver Pedido",
  });
};
