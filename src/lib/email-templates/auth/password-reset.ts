import { generateEmailHtml } from "../base";

/**
 * Email de restablecimiento de contraseña.
 * Para usuarios con cuenta registrada.
 */
export const getPasswordResetEmail = (params: {
  name: string;
  resetUrl: string;
  expiresInMinutes?: number;
}): string => {
  const { name, resetUrl, expiresInMinutes = 60 } = params;

  return generateEmailHtml({
    customerName: name,
    orderId: "",
    title: "🔐 Restablecer contraseña",
    color: "#6366f1",
    message: `Recibimos una solicitud para restablecer la contraseña de tu cuenta.<br><br>
    Hacé clic en el botón de abajo para crear una nueva contraseña. Este enlace expira en <strong>${expiresInMinutes} minutos</strong>.<br><br>
    Si no solicitaste esto, podés ignorar este email. Tu contraseña no cambiará.`,
    orderUrl: resetUrl,
    customButtonText: "Restablecer Contraseña",
  });
};
