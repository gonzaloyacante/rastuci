import { EMAIL_STYLES, escapeHtml } from "../base";

export const getContactNotificationEmail = (params: {
  name: string;
  email?: string;
  phone?: string;
  message: string;
  responsePreference: string;
}): string => {
  const { name, email, phone, message, responsePreference } = params;
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com"}/admin/contact`;
  const preferenceLabel: Record<string, string> = {
    EMAIL: "📧 Email",
    PHONE: "📞 Teléfono",
    WHATSAPP: "💬 WhatsApp",
  };

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Nuevo mensaje de contacto</title></head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; width: 100%;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
    <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #eee;">
      <h1 style="color: #333; margin: 0; font-size: 24px; font-weight: bold;">Rastuci</h1>
      <p style="color: #666; margin: 5px 0 0 0;">Panel de Administración</p>
    </div>
    <div style="padding: 20px 0;">
      <div style="background-color:#6366f1;color:white;padding:16px 20px;margin:20px 0;border-radius:8px;text-align:center;">
        <h2 style="margin:0;font-size:18px;font-weight:bold;">📬 Nuevo mensaje de contacto</h2>
      </div>
      <div style="${EMAIL_STYLES.detailsBox}">
        <h3 style="${EMAIL_STYLES.detailsTitle}">Datos del remitente</h3>
        <p style="${EMAIL_STYLES.detailItem}"><strong>Nombre:</strong> ${escapeHtml(name)}</p>
        ${email ? `<p style="${EMAIL_STYLES.detailItem}"><strong>Email:</strong> ${escapeHtml(email)}</p>` : ""}
        ${phone ? `<p style="${EMAIL_STYLES.detailItem}"><strong>Teléfono:</strong> ${escapeHtml(phone)}</p>` : ""}
        <p style="${EMAIL_STYLES.detailItem}"><strong>Preferencia de respuesta:</strong> ${preferenceLabel[responsePreference] ?? responsePreference}</p>
      </div>
      <div style="${EMAIL_STYLES.detailsBox}">
        <h3 style="${EMAIL_STYLES.detailsTitle}">Mensaje</h3>
        <p style="font-size:15px;color:#333;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${adminUrl}" style="display:inline-block;background-color:#6366f1;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;">Ver en panel de admin</a>
      </div>
    </div>
    <div style="text-align: center; padding: 20px 0; border-top: 2px solid #eee; color: #888; font-size: 12px;">
      <p>Este es un email automático del sistema Rastuci. No responder a este correo.</p>
    </div>
  </div>
</body>
</html>`;
};
