import { generateEmailHtml, STATUS_COLORS } from "../base";

/**
 * Email al cliente cuando su pedido está en revisión (comprobante de transferencia subido,
 * esperando aprobación del admin). Mantiene al cliente informado del estado intermedio.
 */
export const getOrderOnHoldEmail = (params: {
  customerName: string;
  orderId: string;
  reason: "transfer_proof_uploaded" | "payment_review";
}): string => {
  const { customerName, orderId, reason } = params;

  const content = {
    transfer_proof_uploaded: {
      message: `Recibimos tu comprobante de transferencia y estamos verificándolo.<br><br>
      Este proceso suele demorar menos de 24 horas hábiles. Te enviaremos un email en cuanto esté aprobado y tu pedido sea confirmado.<br><br>
      ¡Gracias por tu paciencia!`,
    },
    payment_review: {
      message: `Tu pedido está siendo revisado por nuestro equipo antes de ser procesado.<br><br>
      Te notificaremos en cuanto tengamos novedades. Si tenés alguna duda, no dudes en contactarnos.`,
    },
  };

  return generateEmailHtml({
    customerName,
    orderId,
    title: "⏳ Pedido en revisión",
    color: STATUS_COLORS.pending,
    message: content[reason].message,
    orderUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com"}/orders/${orderId}`,
    customButtonText: "Ver Estado del Pedido",
  });
};
