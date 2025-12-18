
export const EMAIL_STYLES = {
  fontFamily: 'font-family: Arial, sans-serif;',
  body: 'margin: 0; padding: 0; background-color: #f4f4f4; width: 100%;',
  container: 'max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);',
  header: 'text-align: center; padding: 20px 0; border-bottom: 2px solid #eee;',
  logo: 'color: #333; margin: 0; font-size: 24px; font-weight: bold;',
  subhead: 'color: #666; margin: 5px 0 0 0;',
  content: 'padding: 20px 0;',
  statusBox: (color: string) => `background-color: ${color}; color: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;`,
  statusTitle: 'margin: 0; font-size: 20px; font-weight: bold;',
  text: 'font-size: 16px; color: #333; line-height: 1.6;',
  detailsBox: 'background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #e9ecef;',
  detailsTitle: 'margin: 0 0 10px 0; color: #333; font-size: 18px;',
  detailItem: 'margin: 8px 0; color: #555;',
  buttonContainer: 'text-align: center; margin: 30px 0;',
  button: (color: string) => `display: inline-block; background-color: ${color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 0 10px; font-weight: bold;`,
  footer: 'text-align: center; padding: 20px 0; border-top: 2px solid #eee; color: #888; font-size: 12px;',
  helpBox: 'background-color: #e9f7ff; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: left;',
  link: 'color: #007bff; text-decoration: none;'
};

export const STATUS_COLORS = {
  pending: '#f59e0b',       // Yellow
  in_transit: '#3b82f6',    // Blue
  out_for_delivery: '#10b981', // Emerald
  delivered: '#059669',     // Green
  delayed: '#dc2626',       // Red
  error: '#dc2626',         // Red
  processed: '#3b82f6',     // Blue (generic for internal processed)
};

export const STATUS_MESSAGES = {
  PENDING: {
    title: '📦 Tu pedido está siendo preparado',
    message: 'Hemos recibido tu pedido y estamos preparándolo.'
  },
  PROCESSED: {
    title: '✅ Tu pedido fue procesado',
    message: 'Hemos confirmado el pago de tu pedido y estamos generando el envío.'
  },
  DELIVERED: {
    title: '✅ ¡Tu pedido ha sido entregado!',
    message: '¡Que lo disfrutes! Gracias por elegir Rastuci.'
  }
};

export interface EmailTemplateProps {
  customerName: string;
  orderId: string;
  message: string;
  title: string;
  color: string;
  trackingCode?: string;
  trackingUrl?: string;
  orderUrl: string;
  estimatedDeliveryDate?: string;
}

export function generateEmailHtml({
  customerName,
  orderId,
  message,
  title,
  color,
  trackingCode,
  trackingUrl,
  orderUrl,
  estimatedDeliveryDate
}: EmailTemplateProps): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="${EMAIL_STYLES.fontFamily} ${EMAIL_STYLES.body}">
  <div style="${EMAIL_STYLES.container}">
    <div style="${EMAIL_STYLES.header}">
      <h1 style="${EMAIL_STYLES.logo}">Rastuci</h1>
      <p style="${EMAIL_STYLES.subhead}">Tu tienda de confianza</p>
    </div>

    <div style="${EMAIL_STYLES.statusBox(color)}">
      <h2 style="${EMAIL_STYLES.statusTitle}">${title}</h2>
    </div>

    <div style="${EMAIL_STYLES.content}">
      <p style="${EMAIL_STYLES.text}">Hola <strong>${customerName}</strong>,</p>
      
      <p style="${EMAIL_STYLES.text}">${message}</p>
      
      <div style="${EMAIL_STYLES.detailsBox}">
        <h3 style="${EMAIL_STYLES.detailsTitle}">Detalles del Pedido</h3>
        <p style="${EMAIL_STYLES.detailItem}"><strong>Número de Pedido:</strong> #${orderId}</p>
        ${trackingCode ? `<p style="${EMAIL_STYLES.detailItem}"><strong>Código de Seguimiento:</strong> ${trackingCode}</p>` : ''}
        ${estimatedDeliveryDate ? `<p style="${EMAIL_STYLES.detailItem}"><strong>Fecha Estimada:</strong> ${estimatedDeliveryDate}</p>` : ''}
      </div>

      <div style="${EMAIL_STYLES.buttonContainer}">
        ${trackingUrl ? `
        <a href="${trackingUrl}" style="${EMAIL_STYLES.button('#007bff')}">
          🔍 Rastrear Envío
        </a>
        ` : ''}
        <a href="${orderUrl}" style="${EMAIL_STYLES.button('#28a745')}">
          📋 Ver Pedido
        </a>
      </div>

      <div style="${EMAIL_STYLES.helpBox}">
        <h4 style="margin: 0 0 10px 0; color: #333;">¿Necesitas ayuda?</h4>
        <p style="margin: 0; color: #666; font-size: 14px;">
          Si tienes alguna pregunta, contáctanos:
        </p>
        <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
          📧 Email: <a href="mailto:soporte@rastuci.com" style="${EMAIL_STYLES.link}">soporte@rastuci.com</a><br>
          💬 WhatsApp: +54 9 11 1234-5678
        </p>
      </div>
    </div>

    <div style="${EMAIL_STYLES.footer}">
      <p style="margin: 0;">© ${new Date().getFullYear()} Rastuci. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>`;
}
