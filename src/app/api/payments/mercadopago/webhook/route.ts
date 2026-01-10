import { ok } from "@/lib/apiResponse";
import { getRequestId, logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";
import { NextRequest, NextResponse } from "next/server";
// import { ORDER_STATUS } from "@/lib/constants";
// ...

import { mpWebhookService } from "@/services/notification-service";
import { orderService } from "@/services/order-service";
import { shipmentService } from "@/services/shipment-service";
import prisma from "@/lib/prisma"; // Needed for direct lookups if not fully moved yet

// Helper to notify admin/customer - could be moved to notification-service too
import { orders, order_items, products } from "@prisma/client";

type OrderWithItems = orders & {
  order_items: (order_items & {
    products: products;
  })[];
};

async function notifyParties(
  order: OrderWithItems,
  orderId: string,
  _mpPaymentId: string
) {
  try {
    if (!order?.customerEmail) return;

    // Dynamic import to avoid circular dep issues if any, keeping it safe
    const { emailService } = await import("@/lib/resend");
    const { getAdminEmail } = await import("@/lib/store-settings");

    const items = order.order_items.map((item) => ({
      name: item.products.name,
      quantity: item.quantity,
      price: item.price,
    }));

    // Customer Email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await emailService.sendOrderConfirmation(order as any, items);

    // Admin Email
    const adminEmail = await getAdminEmail();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await emailService.sendAdminNewOrderAlert(order as any, items, adminEmail);

    logger.info("[Webhook] Notifications sent", { orderId });
  } catch (e) {
    logger.error("[Webhook] Failed to send notifications", {
      orderId,
      error: e,
    });
  }
}

export async function POST(
  req: NextRequest,
  { params: _params }: { params: { mpPaymentId: string } }
) {
  const requestId = getRequestId(req.headers);

  try {
    // 1. Rate Limiting
    const rl = await checkRateLimit(req, {
      key: makeKey("POST", "/api/payments/mercadopago/webhook"),
      ...getPreset("publicReadHeavy"),
    });
    if (!rl.ok) {
      logger.warn("[MP webhook] rate-limited", { requestId });
      return ok({ ok: true });
    }

    // 2. Parse basic data
    const data = await req.json().catch(() => ({}));
    const topic =
      req.nextUrl.searchParams.get("type") ||
      req.nextUrl.searchParams.get("topic");
    const id =
      req.nextUrl.searchParams.get("data.id") ||
      (data && (data.data?.id || data.id));

    if (!id) {
      // Ping or invalid
      return ok({ ok: true });
    }

    // 3. Validate Signature (Optional/Recommended)
    const xSignature = req.headers.get("x-signature") || "";
    const xRequestId = req.headers.get("x-request-id") || "";
    const ts = req.headers.get("ts") || "";
    if (xSignature && xRequestId && ts) {
      if (!mpWebhookService.validateSignature(xSignature, xRequestId, id, ts)) {
        logger.warn("[MP webhook] Invalid signature", { requestId });
        return new NextResponse("Invalid signature", { status: 401 });
      }
    }

    if (topic && topic !== "payment") {
      // Only payments
      return ok({ ok: true });
    }

    // 4. Fetch Payment Details
    // Using simple retry loop here or inside service? Service has simple get.
    // Let's implement retry here as it was before, or move it to service.
    // Moving retry logic to service would be cleaner but let's keep it robust here for now or assume service handles it.
    // The service I wrote `getPayment` just does `this.payment.get`. I should have added retries there.
    // I will add a simple retry loop here.
    let payment;
    let retries = 3;
    while (retries > 0) {
      try {
        payment = await mpWebhookService.getPayment(id);
        break;
      } catch (e) {
        retries--;
        if (retries === 0) {
          logger.error("[MP webhook] Failed to fetch payment", {
            id,
            error: e,
          });
          return ok({ ok: true });
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    if (!payment) return ok({ ok: true });

    const mpPaymentId = String(payment.id);
    const mpStatus = payment.status;
    const mappedStatus = orderService.mapStatus(mpStatus || "");
    const metadata = payment.metadata || {};
    const preferenceId = metadata.preference_id || payment.order?.id;

    // 5. Update or Create Order
    let result;

    // A. Try by External Reference (ID)
    if (payment.external_reference) {
      result = await orderService.updateOrder(payment.external_reference, {
        mpPaymentId,
        mpStatus: mpStatus || "unknown",
        mappedStatus,
      });
    }

    // B. Try by Preference ID
    if (!result && preferenceId) {
      const existing = await prisma.orders.findFirst({
        where: { mpPreferenceId: preferenceId },
      });
      if (existing) {
        result = await orderService.updateOrder(existing.id, {
          mpPaymentId,
          mpStatus: mpStatus || "unknown",
          mappedStatus,
        });
      }
    }

    // C. Create from Metadata (Fallback)
    if (!result) {
      logger.info("[MP webhook] Creating order from metadata", { mpPaymentId });
      result = await orderService.createFromMetadata(
        mpPaymentId,
        mpStatus || "unknown",
        mappedStatus,
        preferenceId,
        metadata,
        payment.payer
      );
    }

    // 6. Post-Processing (Shipment & Notification)
    if (result && result.order) {
      const { order, shouldShip } = result;

      if (shouldShip) {
        // Create CA Shipment (async, don't block response)
        shipmentService.createCAShipment(order.id).catch((err) => {
          logger.error("[Webhook] Async shipment creation failed", {
            orderId: order.id,
            error: err,
          });
        });

        // Notify
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        notifyParties(order as any, order.id, mpPaymentId).catch((err) => {
          logger.error("[Webhook] Async notification failed", {
            orderId: order.id,
            error: err,
          });
        });
      }
    }

    return ok({ ok: true });
  } catch (error) {
    logger.error("[MP webhook] Global error", { error });
    return ok({ ok: true }); // Always return 200 to MP to avoid retries on logic errors
  }
}
