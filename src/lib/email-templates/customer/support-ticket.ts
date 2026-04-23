import { generateEmailHtml } from "../base";

/**
 * Email de confirmación al abrir un reclamo/soporte.
 * El cliente recibe este email cuando envía un reclamo o ticket de soporte.
 */
export const getSupportTicketOpenedEmail = (params: {
  customerName: string;
  ticketId?: string;
  subject: string;
  orderId?: string;
}): string => {
  const { customerName, ticketId, subject, orderId } = params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com";

  return generateEmailHtml({
    customerName,
    orderId: orderId ?? "",
    title: "📩 Reclamo recibido",
    color: "#6366f1",
    message: `Recibimos tu consulta y uno de nuestros agentes te responderá a la brevedad.<br><br>
    <strong>Asunto:</strong> ${subject}<br>
    ${ticketId ? `<strong>Número de ticket:</strong> #${ticketId}<br>` : ""}
    <br>
    Normalmente respondemos en menos de 24 horas hábiles. Revisá tu bandeja de entrada (y spam) para no perderte la respuesta.`,
    orderUrl: `${baseUrl}/contact`,
    customButtonText: "Ver mis consultas",
  });
};

/**
 * Email al cliente confirmando que su reclamo fue resuelto.
 */
export const getSupportTicketResolvedEmail = (params: {
  customerName: string;
  ticketId?: string;
  resolution: string;
  orderId?: string;
}): string => {
  const { customerName, ticketId, resolution, orderId } = params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com";

  return generateEmailHtml({
    customerName,
    orderId: orderId ?? "",
    title: "✅ Consulta resuelta",
    color: "#10b981",
    message: `Tu consulta${ticketId ? ` #${ticketId}` : ""} fue resuelta.<br><br>
    <strong>Resolución:</strong> ${resolution}<br><br>
    Si el problema persiste o tenés alguna duda, no dudes en contactarnos nuevamente.`,
    orderUrl: `${baseUrl}/contact`,
    customButtonText: "Contactarnos",
  });
};
