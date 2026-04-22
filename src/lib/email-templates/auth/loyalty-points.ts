import { generateEmailHtml } from "../base";

/**
 * Notificación de puntos de fidelidad — cuando el cliente llega a un umbral de beneficios.
 * Funciona para usuarios con cuenta (nombre real) y sin cuenta (nombre genérico).
 * Feature a futuro: sistema de puntos/fidelidad.
 */
export const getLoyaltyPointsEmail = (params: {
  name: string;
  points: number;
  benefit: string;
  loginUrl: string;
}): string => {
  return generateEmailHtml({
    customerName: params.name,
    orderId: "",
    title: "🎁 ¡Tenés un beneficio disponible!",
    color: "#f59e0b",
    message: `¡Felicitaciones! Con tus compras acumulaste <strong>${params.points} puntos</strong>.<br><br>
    Tu beneficio desbloqueado: <strong>${params.benefit}</strong><br><br>
    Ingresá a tu cuenta para canjearlo en tu próxima compra.`,
    orderUrl: params.loginUrl,
    customButtonText: "Ver Mis Beneficios",
  });
};
