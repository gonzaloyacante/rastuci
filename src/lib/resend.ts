import { Resend } from "resend";
import { logger } from "./logger";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

/**
 * Envía un email usando Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = "Rastuci <pedidos@rastuci.com>",
}: SendEmailParams): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      logger.warn("[Email] RESEND_API_KEY not configured, skipping email");
      return false;
    }

    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      logger.error("[Email] Failed to send email", {
        error,
        to,
        subject,
      });
      return false;
    }

    logger.info("[Email] Email sent successfully", {
      id: data?.id,
      to,
      subject,
    });

    return true;
  } catch (error) {
    logger.error("[Email] Error sending email", {
      error,
      to,
      subject,
    });
    return false;
  }
}

/**
 * Templates de email
 */

export function getOrderConfirmationEmail(params: {
  customerName: string;
  orderId: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}): string {
  const { customerName, orderId, total, items } = params;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmación de Pedido</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ec4899; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .item { border-bottom: 1px solid #eee; padding: 10px 0; }
          .item:last-child { border-bottom: none; }
          .total { font-size: 1.2em; font-weight: bold; margin-top: 15px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Gracias por tu compra!</h1>
          </div>
          <div class="content">
            <p>Hola ${customerName},</p>
            <p>Confirmamos que recibimos tu pago y tu pedido está siendo procesado.</p>
            
            <div class="order-details">
              <h3>Detalles del Pedido #${orderId.slice(0, 8)}</h3>
              ${items
                .map(
                  (item) => `
                <div class="item">
                  <strong>${item.name}</strong><br>
                  Cantidad: ${item.quantity} × $${item.price.toFixed(2)}
                </div>
              `
                )
                .join("")}
              <div class="total">
                Total: $${total.toFixed(2)}
              </div>
            </div>
            
            <p><strong>Próximos pasos:</strong></p>
            <ol>
              <li>Prepararemos tu envío en las próximas 24-48 horas</li>
              <li>Recibirás un email con el número de tracking cuando el paquete sea despachado</li>
              <li>Podrás hacer seguimiento de tu pedido en nuestra web</li>
            </ol>
            
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Rastuci - Tienda Online</p>
            <p>Este es un email automático, por favor no respondas.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getOrderShippedEmail(params: {
  customerName: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
}): string {
  const { customerName, orderId, trackingNumber, carrier } = params;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Tu pedido está en camino</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .tracking-box { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; text-align: center; }
          .tracking-number { font-size: 1.5em; font-weight: bold; color: #ec4899; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Tu pedido está en camino</h1>
          </div>
          <div class="content">
            <p>Hola ${customerName},</p>
            <p>¡Buenas noticias! Tu pedido #${orderId.slice(0, 8)} ya fue despachado y está en camino.</p>
            
            <div class="tracking-box">
              <p><strong>Número de Tracking:</strong></p>
              <div class="tracking-number">${trackingNumber}</div>
              <p><strong>Transportista:</strong> ${carrier}</p>
            </div>
            
            <p>Puedes hacer seguimiento de tu envío en tiempo real usando el número de tracking.</p>
            <p>El tiempo estimado de entrega es de 3-7 días hábiles según tu ubicación.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Rastuci - Tienda Online</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getOrderDeliveredEmail(params: {
  customerName: string;
  orderId: string;
}): string {
  const { customerName, orderId } = params;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Pedido Entregado</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8b5cf6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Pedido Entregado</h1>
          </div>
          <div class="content">
            <p>Hola ${customerName},</p>
            <p>Confirmamos que tu pedido #${orderId.slice(0, 8)} ha sido entregado exitosamente.</p>
            <p>Esperamos que disfrutes tus productos. Si tienes algún problema o consulta, no dudes en contactarnos.</p>
            <p>¡Gracias por confiar en Rastuci!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Rastuci - Tienda Online</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getNewOrderNotificationEmail(params: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}): string {
  const { orderId, customerName, customerEmail, total, items } = params;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Nuevo Pedido Recibido</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .item { border-bottom: 1px solid #eee; padding: 10px 0; }
          .item:last-child { border-bottom: none; }
          .total { font-size: 1.2em; font-weight: bold; margin-top: 15px; color: #10b981; }
          .customer-info { background: #fef3c7; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #f59e0b; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
          .action-button { display: inline-block; padding: 12px 24px; background: #ec4899; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Nuevo Pedido Recibido</h1>
          </div>
          <div class="content">
            <p><strong>¡Tienes un nuevo pedido para procesar!</strong></p>
            
            <div class="customer-info">
              <h3 style="margin-top: 0;">Información del Cliente</h3>
              <p><strong>Nombre:</strong> ${customerName}</p>
              <p><strong>Email:</strong> ${customerEmail}</p>
            </div>
            
            <div class="order-details">
              <h3>Pedido #${orderId.slice(0, 8)}</h3>
              ${items
                .map(
                  (item) => `
                <div class="item">
                  <strong>${item.name}</strong><br>
                  Cantidad: ${item.quantity} × $${item.price.toFixed(2)}
                </div>
              `
                )
                .join("")}
              <div class="total">
                Total: $${total.toFixed(2)}
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://rastuci.com"}/admin/pedidos" class="action-button">
                Ver Pedido en el Panel
              </a>
            </div>
            
            <p><strong>Próximas acciones:</strong></p>
            <ol>
              <li>Revisar los detalles del pedido en el panel de administración</li>
              <li>Preparar los productos para el envío</li>
              <li>Generar la etiqueta de envío en MiCorreo</li>
              <li>Actualizar el estado del pedido</li>
            </ol>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Rastuci - Panel de Administración</p>
            <p>Este es un email automático del sistema.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
