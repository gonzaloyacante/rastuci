import { formatCurrency, generateEmailHtml, STATUS_COLORS } from "../base";

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
