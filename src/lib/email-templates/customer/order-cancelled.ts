import { generateEmailHtml, STATUS_COLORS } from "../base";

export const getOrderCancelledEmail = (params: {
  customerName: string;
  orderId: string;
  reason?: "expired" | "admin_cancelled" | "payment_failed";
}): string => {
  const { customerName, orderId, reason = "expired" } = params;

  const messages: Record<
    string,
    { title: string; body: string; button: string }
  > = {
    expired: {
      title: "⏳ Tu reserva ha expirado",
      body: `El tiempo de reserva de tu pedido ha finalizado y los productos han vuelto a estar disponibles para otros clientes.<br><br>
      ¡No te preocupes! Si todavía los querés, es probable que aún haya stock.<br><br>
      Te invitamos a visitar la tienda y volver a pedirlos antes de que se agoten definitivamente.`,
      button: "🛍️ Volver a la Tienda",
    },
    admin_cancelled: {
      title: "❌ Pedido Cancelado",
      body: `Tu pedido fue cancelado. Si tenés dudas o creés que fue un error, por favor contactanos a través de nuestra página de contacto.<br><br>
      Lamentamos los inconvenientes causados.`,
      button: "📞 Contactarnos",
    },
    payment_failed: {
      title: "❌ Pago no procesado",
      body: `No pudimos procesar el pago de tu pedido. Esto puede deberse a fondos insuficientes, datos incorrectos u otro problema con tu método de pago.<br><br>
      Podés intentarlo nuevamente con otro método de pago.`,
      button: "🔄 Intentar Nuevamente",
    },
  };

  const content = messages[reason];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com";

  return generateEmailHtml({
    customerName,
    orderId,
    title: content.title,
    color: STATUS_COLORS.error,
    message: content.body,
    orderUrl: reason === "admin_cancelled" ? `${baseUrl}/contact` : baseUrl,
    customButtonText: content.button,
  });
};
