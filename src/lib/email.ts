/* Simple email helper using Resend REST API if RESEND_API_KEY is present.
 * Falls back to no-op when not configured. Never throws.
 */

export type OrderStatusEmailInput = {
  to?: string | null;
  orderId: string;
  status: string;
  customerName?: string | null;
};

export async function sendOrderStatusEmail(input: OrderStatusEmailInput): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || "no-reply@rastuci.local";

    if (!apiKey) return; // Not configured
    if (!input.to) return; // No recipient available

    const subject = `Actualización de estado del pedido ${input.orderId}`;
    const text = `Hola${input.customerName ? ` ${input.customerName}` : ""},\n\n` +
      `Tu pedido (${input.orderId}) ahora está en estado: ${input.status}.\n` +
      `Gracias por comprar en Rastuci.\n`;

    const html = `<p>Hola${input.customerName ? ` ${escapeHtml(input.customerName)}` : ""},</p>
<p>Tu pedido (<strong>${escapeHtml(input.orderId)}</strong>) ahora está en estado: <strong>${escapeHtml(input.status)}</strong>.</p>
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
      const body = await safeJson(res);
      console.warn("sendOrderStatusEmail: Resend responded with", res.status, body);
    }
  } catch (err) {
    console.warn("sendOrderStatusEmail: error", err);
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
