import { generateEmailHtml, STATUS_COLORS, STATUS_MESSAGES } from "./email-templates";

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

    if (!apiKey) return;
    if (!input.to) return;

    // Determine content based on status
    const isProcessed = input.status === 'PROCESSED';
    const statusInfo = isProcessed ? STATUS_MESSAGES.PROCESSED : STATUS_MESSAGES.PENDING;
    const color = isProcessed ? STATUS_COLORS.processed : STATUS_COLORS.pending;

    // Use specific message if available or fallback
    const message = `Tu pedido (${input.orderId}) ahora está en estado: ${input.status}.`;

    const subject = `${statusInfo.title} - Pedido #${input.orderId}`;
    const orderUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://rastuci.com'}/orders/${input.orderId}`;

    // Generate Text Version
    const text = `Hola${input.customerName ? ` ${input.customerName}` : ""},\n\n` +
      `${message}\n` +
      `${input.trackingCode ? `Código de seguimiento: ${input.trackingCode}\n` : ''}` +
      `Gracias por comprar en Rastuci.\n`;

    // Generate HTML Version
    const html = generateEmailHtml({
      customerName: input.customerName || 'Cliente',
      orderId: input.orderId,
      message,
      title: statusInfo.title,
      color,
      trackingCode: input.trackingCode,
      orderUrl
    });

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
    }
  } catch {
    // Silent error handling
  }
}

export async function sendTrackingUpdateEmail(input: TrackingUpdateEmailInput): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || "no-reply@rastuci.local";

    if (!apiKey) return;

    const statusMessages = {
      'pending': { ...STATUS_MESSAGES.PENDING, color: STATUS_COLORS.pending },
      'in-transit': { title: '🚚 Tu pedido está en camino', message: 'Tu pedido ha salido y está en camino.', color: STATUS_COLORS.in_transit },
      'out-for-delivery': { title: '🚛 Tu pedido está en reparto', message: 'Llega hoy. ¡Atento!', color: STATUS_COLORS.out_for_delivery },
      'delivered': { ...STATUS_MESSAGES.DELIVERED, color: STATUS_COLORS.delivered },
      'delayed': { title: '⏰ Retraso en tu envío', message: 'Detectamos una demora. Trabajamos en ello.', color: STATUS_COLORS.delayed },
      'error': { title: '❌ Problema con tu envío', message: 'Hubo un problema. Contáctanos.', color: STATUS_COLORS.error }
    };

    const statusInfo = statusMessages[input.status as keyof typeof statusMessages] || statusMessages['pending'];
    const message = input.statusMessage || statusInfo.message;

    const subject = `${statusInfo.title} - Pedido #${input.orderId}`;

    const trackingUrl = input.trackingCode
      ? `${process.env.NEXT_PUBLIC_BASE_URL || 'https://rastuci.com'}/tracking?code=${input.trackingCode}`
      : undefined;

    const orderUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://rastuci.com'}/orders/${input.orderId}`;

    const text = `Hola ${input.customerName},\n\n${message}\n\nDetalles:\nPedido: #${input.orderId}\n${input.trackingCode ? `Tracking: ${input.trackingCode}` : ''}\n\nSaludos,\nRastuci`;

    const html = generateEmailHtml({
      customerName: input.customerName,
      orderId: input.orderId,
      message,
      title: statusInfo.title,
      color: statusInfo.color,
      trackingCode: input.trackingCode,
      trackingUrl,
      orderUrl,
      estimatedDeliveryDate: input.estimatedDeliveryDate
    });

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