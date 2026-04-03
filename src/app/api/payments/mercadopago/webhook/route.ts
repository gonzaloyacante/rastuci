// Helper to notify admin/customer - could be moved to notification-service too
import { orders, OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { ok } from "@/lib/apiResponse";
import { getRequestId, logger } from "@/lib/logger";
import prisma from "@/lib/prisma"; // Needed for direct lookups if not fully moved yet
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";
// import { ORDER_STATUS } from "@/lib/constants";
// ...
import { mpWebhookService } from "@/services/notification-service";
import { orderService } from "@/services/order-service";
import type { OrderMetadata } from "@/services/order-service.types";
import { shipmentService } from "@/services/shipment-service";

async function notifyParties(
  order: orders,
  orderId: string,
  _mpPaymentId: string
) {
  try {
    if (!order?.customerEmail) return;

    // Dynamic import to avoid circular dep issues if any, keeping it safe
    const { emailService } = await import("@/lib/resend");
    const { getAdminEmail } = await import("@/lib/store-settings");

    // Load order items from DB (order passed in may not include them)
    const orderWithItems = await prisma.orders.findUnique({
      where: { id: order.id },
      include: {
        order_items: {
          include: { products: true },
        },
      },
    });

    const items = (orderWithItems?.order_items ?? []).map((item) => ({
      name: item.products.name,
      quantity: item.quantity,
      price: Number(item.price),
      color: item.color ?? undefined,
      size: item.size ?? undefined,
    }));

    const orderSummary = {
      id: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail!,
      customerPhone: order.customerPhone ?? undefined,
      customerAddress: order.customerAddress ?? undefined,
      total: Number(order.total),
      subtotal: order.subtotal ? Number(order.subtotal) : undefined,
      discount: order.discount ? Number(order.discount) : undefined,
      shippingCost: order.shippingCost ? Number(order.shippingCost) : undefined,
    };

    // Customer Email
    await emailService.sendOrderConfirmation(orderSummary, items);

    // Admin Email
    const adminEmail = await getAdminEmail();
    await emailService.sendAdminNewOrderAlert(orderSummary, items, adminEmail);

    logger.info("[Webhook] Notifications sent", { orderId });
  } catch (e) {
    logger.error("[Webhook] Failed to send notifications", {
      orderId,
      error: e,
    });
  }
}

interface WebhookPaymentData {
  id: string;
  topic: string | null;
  xSignature: string;
  xRequestId: string;
  ts: string;
}

function extractWebhookPaymentData(
  req: NextRequest,
  data: Record<string, unknown>
): WebhookPaymentData | null {
  const topic =
    req.nextUrl.searchParams.get("type") ||
    req.nextUrl.searchParams.get("topic");
  const dataObj =
    typeof data?.data === "object" && data.data !== null
      ? (data.data as Record<string, unknown>)
      : null;
  const id =
    req.nextUrl.searchParams.get("data.id") ||
    (dataObj?.id as string | undefined) ||
    (data?.id as string | undefined);
  if (!id) return null;
  return {
    id,
    topic,
    xSignature: req.headers.get("x-signature") || "",
    xRequestId: req.headers.get("x-request-id") || "",
    ts: req.headers.get("ts") || "",
  };
}

async function fetchPaymentWithRetry(id: string) {
  let retries = 3;
  while (retries > 0) {
    try {
      return await mpWebhookService.getPayment(id);
    } catch (e) {
      retries--;
      if (retries === 0) {
        logger.error("[MP webhook] Failed to fetch payment", { id, error: e });
        return null;
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return null;
}

async function resolveOrderFromPayment(
  externalRef: string | undefined,
  preferenceId: string | undefined,
  mpPaymentId: string,
  mpStatus: string,
  mappedStatus: OrderStatus,
  metadata: Record<string, unknown>,
  payer: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: { number: string };
  }
) {
  if (externalRef) {
    const result = await orderService.updateOrder(externalRef, {
      mpPaymentId,
      mpStatus,
      mappedStatus,
    });
    if (result) return result;
  }
  if (preferenceId) {
    const existing = await prisma.orders.findFirst({
      where: { mpPreferenceId: preferenceId },
    });
    if (existing) {
      const result = await orderService.updateOrder(existing.id, {
        mpPaymentId,
        mpStatus,
        mappedStatus,
      });
      if (result) return result;
    }
  }
  logger.info("[MP webhook] Creating order from metadata", { mpPaymentId });
  return orderService.createFromMetadata(
    mpPaymentId,
    mpStatus,
    mappedStatus,
    preferenceId,
    metadata as unknown as OrderMetadata,
    payer
  );
}

async function handleShipmentAndNotification(
  orderId: string,
  order: orders,
  mpPaymentId: string
) {
  try {
    const shipmentCreated = await shipmentService.createCAShipment(orderId);
    if (!shipmentCreated) {
      logger.warn(
        "[Webhook] CA Shipment creation returned false (check logs)",
        { orderId }
      );
    }
  } catch (err) {
    logger.error("[Webhook] Shipment creation failed", { orderId, error: err });
  }
  try {
    await notifyParties(order, orderId, mpPaymentId);
  } catch (err) {
    logger.error("[Webhook] Notification failed", { orderId, error: err });
  }
}

function buildPayerFromPayment(
  payment: Awaited<ReturnType<typeof mpWebhookService.getPayment>>
) {
  return {
    first_name: payment?.payer?.first_name ?? undefined,
    last_name: payment?.payer?.last_name ?? undefined,
    email: payment?.payer?.email ?? undefined,
    phone: payment?.payer?.phone?.number
      ? { number: payment.payer.phone.number }
      : undefined,
  };
}

function validateWebhookHeaders(
  webhookData: WebhookPaymentData,
  requestId: string
): NextResponse | null {
  const { xSignature, xRequestId, ts, id } = webhookData;
  if (!xSignature || !xRequestId || !ts) {
    logger.warn("[MP webhook] Missing signature headers — rejected", {
      requestId,
      hasSignature: !!xSignature,
      hasRequestId: !!xRequestId,
      hasTs: !!ts,
    });
    return new NextResponse("Missing signature headers", { status: 401 });
  }
  if (!mpWebhookService.validateSignature(xSignature, xRequestId, id, ts)) {
    logger.warn("[MP webhook] Invalid signature", { requestId });
    return new NextResponse("Invalid signature", { status: 401 });
  }
  return null;
}

async function processPaymentWebhook(id: string, _mpPaymentId?: string) {
  const payment = await fetchPaymentWithRetry(id);
  if (!payment) return null;
  const mpPaymentId = String(payment.id);
  const mpStatus = payment.status || "unknown";
  const mappedStatus = orderService.mapStatus(mpStatus);
  const metadata = (payment.metadata || {}) as Record<string, unknown>;
  const preferenceId =
    (metadata.preference_id as string | undefined) ||
    (payment.order?.id as string | undefined);
  const payer = buildPayerFromPayment(payment);
  const result = await resolveOrderFromPayment(
    payment.external_reference || undefined,
    preferenceId,
    mpPaymentId,
    mpStatus,
    mappedStatus,
    metadata,
    payer
  );
  return { result, mpPaymentId };
}

async function finalizeOrder(
  result: Awaited<ReturnType<typeof resolveOrderFromPayment>>,
  mpPaymentId: string
) {
  if (!result?.order) return;
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${result.order.id}`);
  if (result.shouldShip) {
    await handleShipmentAndNotification(
      result.order.id,
      result.order,
      mpPaymentId
    );
  }
}

function isPaymentTopic(topic: string | null): boolean {
  return !topic || topic === "payment";
}

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req.headers);
  try {
    const rl = await checkRateLimit(req, {
      key: makeKey("POST", "/api/payments/mercadopago/webhook"),
      ...getPreset("mutatingLow"),
    });
    if (!rl.ok) {
      logger.warn("[MP webhook] rate-limited", { requestId });
      return new NextResponse("Too Many Requests", { status: 429 });
    }
    const data = (await req.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const webhookData = extractWebhookPaymentData(req, data);
    if (!webhookData) {
      logger.debug("[MP webhook] No payment data in webhook — ignored", {
        requestId,
      });
      return ok({ ok: true });
    }
    const headerErr = validateWebhookHeaders(webhookData, requestId);
    if (headerErr) return headerErr;
    if (!isPaymentTopic(webhookData.topic)) return ok({ ok: true });
    const processed = await processPaymentWebhook(webhookData.id);
    if (processed) await finalizeOrder(processed.result, processed.mpPaymentId);
    return ok({ ok: true });
  } catch (error) {
    logger.error("[MP webhook] Global error", { error });
    return ok({ ok: true });
  }
}
