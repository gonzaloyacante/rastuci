import { ApiErrorCode, fail, ok } from "@/lib/apiResponse";
import { normalizeApiError } from "@/lib/errors";
import { getRequestId, logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";
import { NextRequest } from "next/server";

interface MercadoPagoPreference {
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
  }>;
  payer?: {
    name?: string;
    email?: string;
  };
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  auto_return?: string;
  notification_url?: string;
  metadata?: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  try {
    const requestId = getRequestId(req.headers);
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return fail("INTERNAL_ERROR", "Missing MP_ACCESS_TOKEN env var", 500, {
        requestId,
      });
    }

    // Basic rate limiting per IP for preference creation
    const rl = await checkRateLimit(req, {
      key: makeKey("POST", "/api/payments/mercadopago/preference"),
      ...getPreset("mutatingLow"),
    });
    if (!rl.ok) {
      return fail(
        "RATE_LIMITED",
        "Too many requests, please try again later.",
        429,
        { requestId }
      );
    }

    const body = await req.json();
    const { items = [], customer = null, metadata = {}, discount = 0, shippingCost = 0 } = body || {};

    // Log para debugging (solo en desarrollo)
    if (process.env.NODE_ENV === "development") {
      logger.info("Creating MP preference", {
        requestId,
        itemsCount: items.length,
        hasCustomer: !!customer,
        discount,
        shippingCost
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return fail("BAD_REQUEST", "Items required to create preference", 400, {
        requestId,
      });
    }

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    // Server-side validation: rebuild items from DB using metadata.items
    const metaItems = Array.isArray(metadata?.items) ? metadata.items : [];
    if (metaItems.length === 0) {
      return fail(
        "BAD_REQUEST",
        "metadata.items es requerido para validar en el servidor",
        400,
        { requestId }
      );
    }

    const productIds: string[] = metaItems.map((i: Record<string, unknown>) =>
      String(i.productId)
    );
    const dbProducts = await prisma.products.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        images: true,
      },
    });

    type ProductType = (typeof dbProducts)[0];
    const validatedItems = metaItems.map((it: Record<string, unknown>) => {
      const prod = dbProducts.find((p: ProductType) => p.id === it.productId);
      if (!prod) {
        throw new Error(`Producto no encontrado: ${it.productId}`);
      }
      // Use original DB price. Discount is applied as separate item.
      const unitPrice = Number(prod.price);
      const title =
        prod.name + (it.size && it.color ? ` (${it.size} - ${it.color})` : "");
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

    // Agregar ítem de envío si shippingCost > 0
    if (shippingCost > 0) {
      validatedItems.push({
        title: "Costo de envío",
        quantity: 1,
        unit_price: Number(shippingCost),
        currency_id: "ARS",
        picture_url: undefined,
        description: "Envío",
      });
    }

    // Agregar ítem de descuento si discount > 0 (negativo)
    if (discount > 0) {
      validatedItems.push({
        title: "Descuento aplicado",
        quantity: 1,
        unit_price: -Number(discount),
        currency_id: "ARS",
        picture_url: undefined,
        description: "Cupón o promoción"
      });
    }

    // Build Mercado Pago preference con items validados
    // Determine a safe notification_url: only send to MP if explicitly configured and not localhost
    let mpNotificationUrl: string | undefined = undefined;
    if (process.env.MP_WEBHOOK_URL) {
      try {
        const parsed = new URL(process.env.MP_WEBHOOK_URL);
        if (
          parsed.hostname !== "localhost" &&
          parsed.hostname !== "127.0.0.1"
        ) {
          mpNotificationUrl = process.env.MP_WEBHOOK_URL;
        }
      } catch {
        mpNotificationUrl = undefined;
      }
    }

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
        success: `${origin}/checkout/success`,
        failure: `${origin}/checkout/failure`,
        pending: `${origin}/checkout/pending`,
      },
      // "all" = redirige automáticamente en TODOS los casos (approved, pending, rejected)
      auto_return: "all",
      // Only include notification_url if it's a non-local MP webhook URL
      ...(mpNotificationUrl ? { notification_url: mpNotificationUrl } : {}),
      metadata,
    } as MercadoPagoPreference;

    // Log payload in development to help debug MP errors
    if (process.env.NODE_ENV === "development") {
      logger.info("MP preference payload", {
        requestId,
        payload: preferencePayload,
      });
    }

    const resp = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferencePayload),
      }
    );

    if (!resp.ok) {
      const err = await resp.text();
      logger.error("MP preference create failed", {
        requestId,
        details: err,
        payload: preferencePayload,
      });
      const details =
        process.env.NODE_ENV === "development"
          ? { error: err, payload: preferencePayload }
          : { error: err };
      return fail("INTERNAL_ERROR", "Failed to create preference", 500, {
        requestId,
        details,
      });
    }

    const data = await resp.json();
    // data.init_point (desktop) / data.sandbox_init_point; data.id preference id
    return ok({
      init_point: data.init_point || data.sandbox_init_point,
      preference_id: data.id,
    });
  } catch (e: unknown) {
    const requestId = getRequestId(req.headers);
    logger.error("Unexpected error creating MP preference", {
      requestId,
      error: String(e),
    });
    const n = normalizeApiError(e, "INTERNAL_ERROR", "Unexpected error", 500);
    return fail(n.code as ApiErrorCode, n.message, n.status, {
      requestId,
      ...(n.details as Record<string, unknown>),
    });
  }
}
