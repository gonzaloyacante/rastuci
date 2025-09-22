import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";
import { logger, getRequestId } from "@/lib/logger";
import { normalizeApiError } from "@/lib/errors";
import { ok, fail } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const requestId = getRequestId(req.headers);
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return fail("INTERNAL_ERROR", "Missing MP_ACCESS_TOKEN env var", 500, { requestId });
    }

    // Basic rate limiting per IP for preference creation
    const rl = checkRateLimit(req, { key: makeKey("POST", "/api/payments/mercadopago/preference"), ...getPreset("mutatingLow") });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many requests, please try again later.", 429, { requestId });
    }

    const body = await req.json();
    const { items = [], customer = null, metadata = {} } = body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return fail("BAD_REQUEST", "Items required to create preference", 400, { requestId });
    }

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    // Server-side validation: rebuild items from DB using metadata.items
    const metaItems = Array.isArray(metadata?.items) ? metadata.items : [];
    if (metaItems.length === 0) {
      return fail("BAD_REQUEST", "metadata.items es requerido para validar en el servidor", 400, { requestId });
    }

    const productIds: string[] = metaItems.map((i: any) => String(i.productId));
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true, description: true, images: true },
    });

    // Verificar stock: como el schema no tiene stock por variante, validamos cantidad >= 1 (stock global se ajustará en webhook)
    // Calcular descuento proporcional enviado por el cliente como referencia pero aplicado en el server
    const discountPercent = Number(metadata?.discountPercent || 0);
    const safeDiscount = isFinite(discountPercent) && discountPercent >= 0 && discountPercent <= 1 ? discountPercent : 0;

    const validatedItems = metaItems.map((it: any) => {
      const prod = dbProducts.find((p) => p.id === it.productId);
      if (!prod) {
        throw new Error(`Producto no encontrado: ${it.productId}`);
      }
      const unitPrice = Number((prod.price * (1 - safeDiscount)).toFixed(2));
      const title = prod.name + (it.size && it.color ? ` (${it.size} - ${it.color})` : "");
      const firstImage = (() => {
        try {
          const arr = JSON.parse(prod.images);
          return Array.isArray(arr) && arr.length > 0 ? arr[0] : undefined;
        } catch {
          return undefined;
        }
      })();
      return {
        title,
        quantity: Number(it.quantity) || 1,
        unit_price: unitPrice,
        currency_id: "ARS",
        picture_url: firstImage,
        description: prod.description || undefined,
      };
    });

    // Agregar ítem de envío según metadata.shipping (fallback a 0)
    const shippingId = metadata?.shipping as string | undefined;
    if (shippingId) {
      const shippingMap: Record<string, { name: string; price: number; description?: string }> = {
        pickup: { name: "Retiro en tienda", price: 0 },
        standard: { name: "Envío estándar", price: 1500, description: "3-5 días" },
        express: { name: "Envío express", price: 2500, description: "24-48 horas" },
      };
      const ship = shippingMap[shippingId];
      if (ship) {
        validatedItems.push({
          title: `Envío - ${ship.name}`,
          quantity: 1,
          unit_price: Number(ship.price.toFixed(2)),
          currency_id: "ARS",
          picture_url: undefined,
          description: ship.description,
        });
      }
    }

    // Build Mercado Pago preference con items validados
    const preferencePayload = {
      items: validatedItems,
      payer: customer
        ? {
            name: customer.name,
            email: customer.email,
            phone: customer.phone ? { number: customer.phone } : undefined,
            address: customer.address
              ? {
                  street_name: customer.address,
                  zip_code: customer.postalCode,
                  city: customer.city,
                }
              : undefined,
          }
        : undefined,
      back_urls: {
        success: `${origin}/checkout?status=success`,
        failure: `${origin}/checkout?status=failure`,
        pending: `${origin}/checkout?status=pending`,
      },
      auto_return: "approved",
      notification_url:
        process.env.MP_WEBHOOK_URL || `${origin}/api/payments/mercadopago/webhook`,
      metadata,
    } as any;

    const resp = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferencePayload),
    });

    if (!resp.ok) {
      const err = await resp.text();
      logger.error("MP preference create failed", { requestId, details: err });
      return fail("INTERNAL_ERROR", "Failed to create preference", 500, { requestId, details: err });
    }

    const data = await resp.json();
    // data.init_point (desktop) / data.sandbox_init_point; data.id preference id
    return ok({ init_point: data.init_point || data.sandbox_init_point, preference_id: data.id });
  } catch (e: any) {
    const requestId = getRequestId(req.headers);
    logger.error("Unexpected error creating MP preference", { requestId, error: String(e) });
    const n = normalizeApiError(e, "INTERNAL_ERROR", "Unexpected error", 500);
    return fail(n.code as any, n.message, n.status, { requestId, ...(n.details as object) });
  }
}
