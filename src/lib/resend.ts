import { Resend } from "resend";
import { logger } from "./logger";
import {
  getNewOrderAdminEmail,
  getOrderConfirmationEmail,
  getWelcomeEmail,
  getLowStockAlertEmail,
  getBankTransferEmail,
} from "./email-templates";
import { getStoreSettings } from "./store-settings";
import { OrderEmailSummary, OrderEmailItem } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  type?: "SALES" | "SUPPORT" | "ADMIN" | "DEFAULT";
  from?: string; // Optional override
  replyTo?: string;
}

/**
 * Obtiene el remitente dinámicamente desde la BD
 */
async function getSender(type: "SALES" | "SUPPORT" | "ADMIN" | "DEFAULT") {
  try {
    const settings = await getStoreSettings();
    const name = settings.emails?.senderName || "Rastuci";

    // Si no hay emails configurados, usa fallbacks seguros
    const sales = settings.emails?.salesEmail || "pedidos@rastuci.com";
    const support = settings.emails?.supportEmail || "soporte@rastuci.com";
    const noReply = "no-reply@rastuci.com";

    switch (type) {
      case "SALES":
        return `${name} <${sales}>`;
      case "SUPPORT":
        return `${name} <${support}>`;
      case "ADMIN":
      case "DEFAULT":
      default:
        return `${name} <${noReply}>`;
    }
  } catch (error) {
    logger.error("Error fetching branding for email", { error });
    return "Rastuci <no-reply@rastuci.com>";
  }
}

/**
 * Servicio Unificado de Emails (Resend)
 */
export async function sendEmail({
  to,
  subject,
  html,
  type = "DEFAULT",
  from, // Allow manual override if needed
  replyTo,
}: SendEmailParams): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      logger.warn(
        "[Email] RESEND_API_KEY not configured, logging email instead",
        { to, subject }
      );
      return false;
    }

    // Determine 'from' address: Manual override > Dynamic Type > Default
    const sender = from || (await getSender(type));

    const { data, error } = await resend.emails.send({
      from: sender,
      to: Array.isArray(to) ? to : [to],
      replyTo: replyTo,
      subject,
      html,
    });

    if (error) {
      logger.error("[Email] Failed to send email", { error, to, subject });
      return false;
    }

    logger.info("[Email] Email sent successfully", {
      id: data?.id,
      to,
      subject,
    });
    return true;
  } catch (error) {
    logger.error("[Email] Critical error sending email", {
      error,
      to,
      subject,
    });
    return false;
  }
}

// =============================================================================
// HIGH LEVEL FUNCTIONS
// =============================================================================

export const emailService = {
  async sendWelcome(email: string, name: string) {
    return sendEmail({
      to: email,
      subject: "¡Bienvenido a Rastuci!",
      html: getWelcomeEmail({
        name,
        email,
        loginUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/admin`,
      }),
      type: "DEFAULT",
    });
  },

  // ... inside emailService

  async sendOrderConfirmation(
    order: OrderEmailSummary,
    items: OrderEmailItem[]
  ) {
    return sendEmail({
      to: order.customerEmail,
      subject: `Confirmación de Pedido #${order.id.slice(0, 8)}`,
      html: getOrderConfirmationEmail({
        customerName: order.customerName,
        orderId: order.id,
        total: order.total,
        items,
      }),
      type: "SALES",
    });
  },

  async sendAdminNewOrderAlert(
    order: OrderEmailSummary,
    items: OrderEmailItem[],
    adminEmail: string
  ) {
    return sendEmail({
      to: adminEmail,
      subject: `🔔 Nueva Venta #${order.id.slice(0, 8)} - $${order.total}`,
      html: getNewOrderAdminEmail({
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        customerAddress: order.customerAddress,
        orderId: order.id,
        total: order.total,
        items,
      }),
      type: "DEFAULT",
    });
  },

  async sendLowStockAlert(
    productName: string,
    currentStock: number,
    productId: string,
    adminEmail: string
  ) {
    return sendEmail({
      to: adminEmail,
      subject: `⚠️ Stock Bajo: ${productName}`,
      html: getLowStockAlertEmail({
        productName,
        currentStock,
        productId,
      }),
      type: "DEFAULT",
    });
  },

  async sendTrackingUpdate(params: {
    to: string;
    customerName: string;
    orderId: string;
    trackingCode: string;
    status: string;
    statusMessage?: string;
  }) {
    // Import dynamically to avoid circular deps if needed, but imported at top
    const { getTrackingUpdateEmail } = await import("./email-templates");
    return sendEmail({
      to: params.to,
      subject: `🚚 Actualización de Envío #${params.orderId.slice(0, 8)}`,
      html: getTrackingUpdateEmail({
        customerName: params.customerName,
        orderId: params.orderId,
        trackingCode: params.trackingCode,
        status: params.status,
        message: params.statusMessage,
      }),
      type: "DEFAULT",
    });
  },

  async sendBankTransferInstructions(order: {
    id: string;
    customerName: string;
    customerEmail: string;
    total: number;
    uploadToken?: string; // If we use a token for security, or just ID
  }) {
    const settings = await getStoreSettings();
    const bankDetails = {
      bankName: settings.payments?.bankName || "",
      cbu: settings.payments?.bankCbu || "",
      alias: settings.payments?.bankAlias || "",
      holder: settings.payments?.bankHolder || "",
    };

    const uploadUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://rastuci.com"}/orders/${order.id}/pay`;

    return sendEmail({
      to: order.customerEmail,
      subject: `⏳ Instrucciones de Transferencia - Pedido #${order.id.slice(0, 8)}`,
      html: getBankTransferEmail({
        customerName: order.customerName,
        orderId: order.id,
        total: order.total,
        bankDetails,
        uploadUrl,
      }),
      type: "SALES",
    });
  },
};
