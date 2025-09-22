import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";
import { logger, getRequestId } from "@/lib/logger";
import { ok } from "@/lib/apiResponse";

// Mercado Pago sends POST for notifications (may also retry). Keep idempotent.
export async function POST(req: NextRequest) {
  const requestId = getRequestId(req.headers);
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    logger.error("MP webhook missing access token", { requestId });
    return ok({ ok: true });
  }
  try {
    // Rate-limit webhook bursts per IP to protect server. If limited, ACK 200 to avoid retries.
    const rl = checkRateLimit(req, { key: makeKey("POST", "/api/payments/mercadopago/webhook"), ...getPreset("publicReadHeavy") });
    if (!rl.ok) {
      logger.warn("[MP webhook] rate-limited", { requestId, key: rl.key });
      return ok({ ok: true });
    }

    const data = await req.json().catch(() => ({}));
    const topic = req.nextUrl.searchParams.get("type") || req.nextUrl.searchParams.get("topic");
    const id = req.nextUrl.searchParams.get("data.id") || (data && (data.data?.id || data.id));

    if (!id) {
      logger.warn("[MP webhook] Missing payment id", { requestId, query: req.nextUrl.searchParams.toString() });
      return ok({ ok: true });
    }

    // Only handle payment notifications
    if (topic && topic !== "payment") {
      logger.info("[MP webhook] Non-payment topic received", { requestId, topic });
      return ok({ ok: true });
    }

    // Fetch payment details from Mercado Pago
    const paymentResp = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (!paymentResp.ok) {
      const txt = await paymentResp.text();
      logger.error("[MP webhook] Failed to fetch payment", { requestId, id, details: txt });
      return ok({ ok: true });
    }

    const payment = await paymentResp.json();

    const mpPaymentId = String(payment.id);
    const mpStatus: string = payment.status; // approved | in_process | rejected | cancelled | pending
    const preferenceId: string | undefined = payment.metadata?.preference_id || payment.order?.id || payment.additional_info?.metadata?.preference_id;
    const metadata = payment.metadata || {};

    // Build items from metadata and DB (prices from DB to avoid tampering)
    const metaItems = Array.isArray(metadata.items) ? metadata.items : [];
    const shippingId = metadata.shipping as string | undefined;
    const discountPercent = Number(metadata.discountPercent || 0);
    const safeDiscount = isFinite(discountPercent) && discountPercent >= 0 && discountPercent <= 1 ? discountPercent : 0;

    // Early exit if we cannot reconstruct items
    if (metaItems.length === 0) {
      logger.warn("[MP webhook] No metadata.items in payment", { requestId, mpPaymentId });
      return ok({ ok: true });
    }

    const productIds: string[] = metaItems.map((i: Record<string, unknown>) => String(i.productId));
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true, stock: true },
    });

    // Compute order totals and items
    type WebhookItem = { productId: string; quantity: number; unitPrice: number; size?: string; color?: string };
    const orderItems: WebhookItem[] = metaItems.map((it: Record<string, unknown>) => {
      const prod = dbProducts.find((p) => p.id === it.productId);
      if (!prod) throw new Error(`Producto no encontrado: ${it.productId}`);
      const unitPrice = Number((prod.price * (1 - safeDiscount)).toFixed(2));
      return {
        productId: prod.id,
        quantity: Number(it.quantity) || 1,
        unitPrice,
        size: it.size,
        color: it.color,
      };
    });

    let shippingCost = 0;
    if (shippingId) {
      const shippingMap: Record<string, { name: string; price: number }> = {
        pickup: { name: "Retiro en tienda", price: 0 },
        standard: { name: "Envío estándar", price: 1500 },
        express: { name: "Envío express", price: 2500 },
      };
      shippingCost = shippingMap[shippingId]?.price ?? 0;
    }

    const itemsTotal = orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const total = Number((itemsTotal + shippingCost).toFixed(2));

    // Map MP status to our OrderStatus
    const mapStatus = (s: string) => {
      if (s === "approved") return "PROCESSED" as const;
      if (s === "in_process" || s === "pending") return "PENDING" as const;
      return "PENDING" as const; // rejected/cancelled -> keep pending for manual review
    };

    const customerName: string = payment.payer?.first_name && payment.payer?.last_name
      ? `${payment.payer.first_name} ${payment.payer.last_name}`
      : payment.payer?.first_name || metadata.customerName || "Cliente";
    const customerPhone: string = payment.payer?.phone?.number || metadata.customerPhone || "";
    const customerAddress: string | undefined = metadata.customerAddress;
    const customerEmail: string | undefined = payment.payer?.email || metadata.customerEmail;

    // Idempotent upsert using mpPaymentId
    await prisma.$transaction(async (tx) => {
      // If order already exists, update status and return
      const existing = await tx.order.findFirst({ where: { mpPaymentId: mpPaymentId } });
      if (existing) {
        await tx.order.update({
          where: { id: existing.id },
          data: {
            mpStatus: mpStatus,
            status: mapStatus(mpStatus),
            updatedAt: new Date(),
          },
        });
        return;
      }

      await tx.order.create({
        data: {
          customerName: customerName,
          customerPhone: customerPhone,
          customerAddress: customerAddress,
          customerEmail: customerEmail,
          total: total,
          status: mapStatus(mpStatus),
          mpPaymentId: mpPaymentId,
          mpPreferenceId: preferenceId,
          mpStatus: mpStatus,
          items: {
            create: orderItems.map((it) => ({
              productId: it.productId,
              quantity: it.quantity,
              price: it.unitPrice,
              size: it.size,
              color: it.color,
            })),
          },
        },
      });

      // Decrement stock for each product
      for (const it of orderItems) {
        await tx.product.update({
          where: { id: it.productId },
          data: {
            stock: { decrement: it.quantity },
          },
        });
      }
    });

    return ok({ ok: true });
  } catch (e: unknown) {
    logger.error("[MP webhook] error", { requestId, error: e instanceof Error ? e.message : String(e) });
    // Always return 200 so MP stops retrying; log for later inspection
    return ok({ ok: true });
  }
}

// Optional GET handler for quick checks
export async function GET() {
  return NextResponse.json({ ok: true });
}
