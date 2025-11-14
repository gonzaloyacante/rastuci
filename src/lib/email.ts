/* Enhanced email helper using Resend REST API if RESEND_API_KEY is present.
 * Falls back to no-op when not configured. Never throws.
 */

export type OrderStatusEmailInput = {
  to?: string | null;
  orderId: string;
  status: string;
  customerName?: string | null;
  trackingCode?: string;
};

export type TrackingUpdateEmailInput = {
  to: string;
  customerName: string;
  orderId: string;
  trackingCode?: string;
  status: string;
  statusMessage?: string;
  estimatedDeliveryDate?: string;
};

export async function sendOrderStatusEmail(input: OrderStatusEmailInput): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || "no-reply@rastuci.local";

    if (!apiKey) {
      return; // Not configured
    }
    if (!input.to) {
      return; // No recipient available
    }

    const subject = `Actualización de estado del pedido ${input.orderId}`;
    const text = `Hola${input.customerName ? ` ${input.customerName}` : ""},\n\n` +
      `Tu pedido (${input.orderId}) ahora está en estado: ${input.status}.\n` +
      `${input.trackingCode ? `Código de seguimiento: ${input.trackingCode}\n` : ''}` +
      `Gracias por comprar en Rastuci.\n`;

    const html = `<p>Hola${input.customerName ? ` ${escapeHtml(input.customerName)}` : ""},</p>
<p>Tu pedido (<strong>${escapeHtml(input.orderId)}</strong>) ahora está en estado: <strong>${escapeHtml(input.status)}</strong>.</p>
${input.trackingCode ? `<p>Código de seguimiento: <strong>${escapeHtml(input.trackingCode)}</strong></p>` : ''}
<p>Gracias por comprar en Rastuci.</p>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject,
        text,
        html,
      }),
    });

    if (!res.ok) {
      await safeJson(res);
      // Silent logging - no console warnings
    }
  } catch {
    // Silent error handling
  }
}

export async function sendTrackingUpdateEmail(input: TrackingUpdateEmailInput): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || "no-reply@rastuci.local";

    if (!apiKey) {
      return; // Not configured
    }

    const statusMessages = {
      'pending': {
        title: '📦 Tu pedido está siendo preparado',
        message: 'Hemos recibido tu pedido y estamos preparándolo para el envío.',
        color: '#f59e0b'
      },
      'in-transit': {
        title: '🚚 Tu pedido está en camino',
        message: 'Tu pedido ha salido de nuestras instalaciones y está en camino hacia tu dirección.',
        color: '#3b82f6'
      },
      'out-for-delivery': {
        title: '🚛 Tu pedido está en reparto',
        message: 'Tu pedido está siendo entregado hoy. Mantente atento a tu dirección.',
        color: '#10b981'
      },
      'delivered': {
        title: '✅ ¡Tu pedido ha sido entregado!',
        message: 'Tu pedido ha sido entregado exitosamente. ¡Esperamos que disfrutes tu compra!',
        color: '#059669'
      },
      'delayed': {
        title: '⏰ Retraso en tu envío',
        message: 'Hemos detectado un retraso en tu envío. Estamos trabajando para solucionarlo lo antes posible.',
        color: '#dc2626'
      },
      'error': {
        title: '❌ Problema con tu envío',
        message: 'Ha ocurrido un problema con tu envío. Por favor, contacta con nuestro servicio al cliente.',
        color: '#dc2626'
      }
    };

    const statusInfo = statusMessages[input.status as keyof typeof statusMessages] || statusMessages['pending'];
    const message = input.statusMessage || statusInfo.message;

    const subject = `${statusInfo.title} - Pedido #${input.orderId}`;
    
    const trackingUrl = input.trackingCode 
      ? `${process.env.NEXT_PUBLIC_BASE_URL || 'https://rastuci.com'}/tracking?code=${input.trackingCode}`
      : '';
    
    const orderUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://rastuci.com'}/orders/${input.orderId}`;

    const text = `
Hola ${input.customerName},

${message}

Detalles del Pedido:
- Número de Pedido: #${input.orderId}
${input.trackingCode ? `- Código de Seguimiento: ${input.trackingCode}` : ''}
${input.estimatedDeliveryDate ? `- Fecha Estimada de Entrega: ${input.estimatedDeliveryDate}` : ''}

${trackingUrl ? `Puedes rastrear tu envío en: ${trackingUrl}` : ''}

¿Necesitas ayuda?
Email: soporte@rastuci.com
Teléfono: +54 11 1234-5678
WhatsApp: +54 9 11 1234-5678

Saludos,
Equipo Rastuci

---
Este es un email automático, por favor no responder a esta dirección.
`;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Actualización de Envío - Rastuci</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
    <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #eee;">
      <h1 style="color: #333; margin: 0; font-size: 24px;">Rastuci</h1>
      <p style="color: #666; margin: 5px 0 0 0;">Tu tienda de confianza</p>
    </div>

    <div style="background-color: ${statusInfo.color}; color: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
      <h2 style="margin: 0; font-size: 20px;">${statusInfo.title}</h2>
    </div>

    <div style="padding: 20px 0;">
      <p style="font-size: 16px; color: #333;">Hola <strong>${escapeHtml(input.customerName)}</strong>,</p>
      
      <p style="font-size: 16px; color: #333;">${escapeHtml(message)}</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #333;">Detalles del Pedido:</h3>
        <p style="margin: 5px 0; color: #666;"><strong>Número de Pedido:</strong> #${escapeHtml(input.orderId)}</p>
        ${input.trackingCode ? `<p style="margin: 5px 0; color: #666;"><strong>Código de Seguimiento:</strong> ${escapeHtml(input.trackingCode)}</p>` : ''}
        ${input.estimatedDeliveryDate ? `<p style="margin: 5px 0; color: #666;"><strong>Fecha Estimada de Entrega:</strong> ${escapeHtml(input.estimatedDeliveryDate)}</p>` : ''}
      </div>

      <div style="text-align: center; margin: 30px 0;">
        ${trackingUrl ? `
        <a href="${escapeHtml(trackingUrl)}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 0 10px; font-weight: bold;">
          🔍 Rastrear Envío
        </a>
        ` : ''}
        <a href="${escapeHtml(orderUrl)}" style="display: inline-block; background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 0 10px; font-weight: bold;">
          📋 Ver Pedido
        </a>
      </div>

      <div style="background-color: #e9f7ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #333;">¿Necesitas ayuda?</h4>
        <p style="margin: 0; color: #666;">
          Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos:
        </p>
        <p style="margin: 10px 0 0 0; color: #666;">
          📧 Email: <a href="mailto:soporte@rastuci.com" style="color: #007bff;">soporte@rastuci.com</a><br>
          📞 Teléfono: +54 11 1234-5678<br>
          💬 WhatsApp: +54 9 11 1234-5678
        </p>
      </div>
    </div>

    <div style="text-align: center; padding: 20px 0; border-top: 2px solid #eee; color: #666; font-size: 12px;">
      <p style="margin: 0;">© ${new Date().getFullYear()} Rastuci. Todos los derechos reservados.</p>
      <p style="margin: 5px 0 0 0;">Este es un email automático, por favor no responder a esta dirección.</p>
    </div>
  </div>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject,
        text,
        html,
      }),
    });

    if (!res.ok) {
      await safeJson(res);
      // Silent logging - no console warnings
    }
  } catch {
    // Silent error handling
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function safeJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    try {
      return await res.text();
    } catch {
      return null;
    }
  }
}