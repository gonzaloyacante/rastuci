import {
  EMAIL_STYLES,
  escapeHtml,
  formatCurrency,
  generateEmailHtml,
} from "../base";

/**
 * Notificación al admin cuando un cliente sube el comprobante de transferencia.
 * Requiere acción inmediata: aprobar o rechazar el pago.
 */
export const getTransferProofSubmittedEmail = (params: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  senderName: string;
  transactionId: string;
}): string => {
  const {
    orderId,
    customerName,
    customerEmail,
    total,
    senderName,
    transactionId,
  } = params;

  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com"}/admin/orders/${orderId}`;

  return generateEmailHtml({
    customerName: "Admin",
    orderId,
    title: "📄 Comprobante de Transferencia Subido",
    color: "#6366f1",
    message: `El cliente <strong>${escapeHtml(customerName)}</strong> subió el comprobante de pago para el pedido #${orderId.slice(0, 8)}.<br><br>
    <div style="${EMAIL_STYLES.detailsBox}">
      <p style="${EMAIL_STYLES.detailItem}"><strong>Cliente:</strong> ${escapeHtml(customerName)} (${escapeHtml(customerEmail)})</p>
      <p style="${EMAIL_STYLES.detailItem}"><strong>Monto:</strong> ${formatCurrency(total)}</p>
      <p style="${EMAIL_STYLES.detailItem}"><strong>Nombre del emisor:</strong> ${escapeHtml(senderName)}</p>
      <p style="${EMAIL_STYLES.detailItem}"><strong>ID de transacción:</strong> ${escapeHtml(transactionId)}</p>
    </div>
    <strong>Acción requerida:</strong> Verificá el comprobante y aprobá o rechazá el pago desde el panel.`,
    orderUrl: adminUrl,
    customButtonText: "✅ Revisar y Aprobar",
  });
};
