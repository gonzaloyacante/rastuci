import {
  EMAIL_STYLES,
  escapeHtml,
  formatCurrency,
  generateEmailHtml,
} from "../base";

/**
 * Email al admin con nueva consulta/reclamo recibido desde el panel de soporte.
 */
export const getSupportTicketAdminEmail = (params: {
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  orderId?: string;
  ticketId?: string;
}): string => {
  const { customerName, customerEmail, subject, message, orderId, ticketId } =
    params;
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com"}/admin/support`;

  return generateEmailHtml({
    customerName: "Admin",
    orderId: orderId ?? "",
    title: "🆘 Nuevo Reclamo / Consulta",
    color: "#ef4444",
    message: `Nueva consulta recibida.<br><br>
    <div style="${EMAIL_STYLES.detailsBox}">
      <p style="${EMAIL_STYLES.detailItem}"><strong>Cliente:</strong> ${escapeHtml(customerName)}</p>
      <p style="${EMAIL_STYLES.detailItem}"><strong>Email:</strong> ${escapeHtml(customerEmail)}</p>
      ${orderId ? `<p style="${EMAIL_STYLES.detailItem}"><strong>Pedido:</strong> #${orderId.slice(0, 8)}</p>` : ""}
      ${ticketId ? `<p style="${EMAIL_STYLES.detailItem}"><strong>Ticket:</strong> #${ticketId}</p>` : ""}
      <p style="${EMAIL_STYLES.detailItem}"><strong>Asunto:</strong> ${escapeHtml(subject)}</p>
    </div>
    <div style="${EMAIL_STYLES.detailsBox}">
      <p style="font-size:15px;color:#333;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</p>
    </div>`,
    orderUrl: adminUrl,
    customButtonText: "Ver en Panel Admin",
  });
};

/**
 * Email al admin notificando una cancelación de pedido (manual o automática).
 */
export const getOrderCancelledAdminEmail = (params: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  reason: string;
}): string => {
  const { orderId, customerName, customerEmail, total, reason } = params;
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com"}/admin/orders/${orderId}`;

  return generateEmailHtml({
    customerName: "Admin",
    orderId,
    title: "❌ Pedido Cancelado",
    color: "#ef4444",
    message: `El pedido #${orderId.slice(0, 8)} fue cancelado automáticamente.<br><br>
    <div style="${EMAIL_STYLES.detailsBox}">
      <p style="${EMAIL_STYLES.detailItem}"><strong>Cliente:</strong> ${escapeHtml(customerName)} (${escapeHtml(customerEmail)})</p>
      <p style="${EMAIL_STYLES.detailItem}"><strong>Total:</strong> ${formatCurrency(total)}</p>
      <p style="${EMAIL_STYLES.detailItem}"><strong>Motivo:</strong> ${escapeHtml(reason)}</p>
    </div>
    El stock fue restaurado automáticamente.`,
    orderUrl: adminUrl,
    customButtonText: "Ver Pedido",
  });
};
