import { generateEmailHtml } from "../base";

/**
 * Email al cliente cuando se detectó un nuevo intento de acceso a su cuenta.
 * Seguridad: se envía desde una IP/dispositivo desconocido.
 */
export const getNewLoginAlertEmail = (params: {
  name: string;
  ip?: string;
  device?: string;
  loginUrl: string;
}): string => {
  const { name, ip, device, loginUrl } = params;
  const details = [ip && `IP: ${ip}`, device && `Dispositivo: ${device}`]
    .filter(Boolean)
    .join("<br>");

  return generateEmailHtml({
    customerName: name,
    orderId: "",
    title: "🔒 Nuevo inicio de sesión detectado",
    color: "#6366f1",
    message: `Se detectó un inicio de sesión en tu cuenta desde un dispositivo o ubicación nueva.<br><br>
    ${details ? `${details}<br><br>` : ""}
    Si fuiste vos, podés ignorar este mensaje.<br><br>
    Si <strong>no fuiste vos</strong>, cambiá tu contraseña de inmediato.`,
    orderUrl: loginUrl,
    customButtonText: "Cambiar Contraseña",
  });
};
