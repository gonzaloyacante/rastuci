import { EMAIL_STYLES, escapeHtml, generateEmailHtml } from "./base";

export const getVacationReopeningEmail = (_params: {
  customerEmail: string;
}): string => {
  return generateEmailHtml({
    customerName: "Cliente",
    orderId: "",
    title: "¡Ya volvimos!",
    color: "#10b981",
    message: `Nos alegra contarte que <strong>Rastuci</strong> está abierto nuevamente.<br><br>
    Ya podés visitar la tienda y finalizar tu compra. ¡Gracias por esperarnos!<br><br>
    Si tenías productos en mente, te recomendamos revisarlos pronto antes de que se agoten.`,
    orderUrl: process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com",
    customButtonText: "🛍️ Ir a la Tienda",
  });
};

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
<body style="${EMAIL_STYLES.body}">
  <div style="${EMAIL_STYLES.container}">
    <div style="${EMAIL_STYLES.header}">
      <h1 style="${EMAIL_STYLES.logo}">Rastuci</h1>
      <p style="${EMAIL_STYLES.subhead}">Panel de Administración</p>
    </div>
    <div style="${EMAIL_STYLES.content}">
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
      <div style="${EMAIL_STYLES.buttonContainer}">
        <a href="${adminUrl}" style="${EMAIL_STYLES.button("#6366f1")}">Ver en panel de admin</a>
      </div>
    </div>
    <div style="${EMAIL_STYLES.footer}">
      <p>Este es un email automático del sistema Rastuci. No responder a este correo.</p>
    </div>
  </div>
</body>
</html>`;
};
