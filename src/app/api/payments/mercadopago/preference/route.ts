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

import { orderService } from "@/services/order-service";
import { checkoutService } from "@/services/checkout-service";

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
    const {
      items = [],
      customer = null,
      metadata = {},
      discount = 0,
      shippingCost = 0,
      shippingMethodName,
    } = body || {};

    if (process.env.NODE_ENV === "development") {
      logger.info("Creating order + MP preference", {
        requestId,
        itemsCount: items.length,
        hasCustomer: !!customer,
        shippingMethodName,
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return fail("BAD_REQUEST", "Items required", 400, { requestId });
    }

    if (!customer) {
      return fail("BAD_REQUEST", "Customer data required", 400, { requestId });
    }

    // 1. CREATE LOCAL ORDER FIRST (The "Order First" Pattern)
    // This ensures exact data fidelity before interacting with MP.
    let createdOrder;
    try {
      // Map items to simple format expected by service
      const simpleItems = items.map((i: any) => ({
        productId: i.productId,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
      }));

      // Map shipping data
      // Note: customer address string might be "Street 123" or generic.
      // We assume CheckoutForm passes granular data in customer object if available,
      // but here we only have 'customer.address' as string usually.
      // However, check CheckoutForm payload... it sends:
      // customer: { name, email, phone?, address: { street_name, zip_code }? or flat props? }
      // The CheckoutForm sends: body.customer = { name, email } and body.metadata...
      // WAIT. CheckoutForm sends:
      // body: { items, customer: {name, email}, metadata: { customerName, customerAddress... }, ... }
      // This route's destructuring above reads 'customer' from body.
      // We need to ensure we get address info.
      // Based on CheckoutForm.tsx:
      // metadata has: customerAddress, customerCity, etc.

      const method = shippingMethodName || metadata.shippingMethodName || "";

      // CRITICAL FIX: Distinguish "Retiro en Tienda" (Free) vs "Retiro en Sucursal Correo Argentino" (Paid)
      // "pickup" ID comes from shipping-calculator.ts for local store pickup.
      // Any other ID (numeric or agency code) implies a carrier shipment (CA, Andreani, etc).
      const shippingIdToCheck =
        metadata.shippingAgencyCode || metadata.shippingMethodId;

      // We assume if the Explicit ID is "pickup", it's the free store pickup.
      // We also check the name for "Tienda" just in case, but NEVER "Sucursal" (which implies Carrier Branch)
      const isLocalStorePickup =
        String(shippingIdToCheck) === "pickup" ||
        /retiro en tienda|local/i.test(method);

      // Validate/Force shipping cost logic
      // If it's a LOCAL STORE PICKUP, cost MUST be 0.
      // If it's Sucursal CA, it IS a shipment, so we preserve the cost.
      const validatedShippingCost = isLocalStorePickup
        ? 0
        : Number(shippingCost) || 0;

      const shippingData = {
        street: metadata.customerAddress as string,
        city: metadata.customerCity as string,
        province: metadata.customerProvince as string, // Might be undefined
        postalCode: metadata.customerPostalCode as string,
        agency: metadata.shippingAgencyCode as string,
        methodName: method,
        cost: validatedShippingCost,
      };

      const customerData = {
        name: customer.name || metadata.customerName,
        email: customer.email || metadata.customerEmail,
        phone: metadata.customerPhone as string,
        address: metadata.customerAddress as string,
        city: metadata.customerCity as string,
        province: metadata.customerProvince as string,
        postalCode: metadata.customerPostalCode as string,
      };

      // CRITICAL: Validate stock before creating potential ghost order
      // We map to the interface expected by validateStock
      await checkoutService.validateStock(
        simpleItems.map((i: any) => ({
          ...i,
          price: 0, // Price irrelevant for stock check
        }))
      );

      createdOrder = await orderService.createFullOrder(
        customerData,
        simpleItems,
        shippingData,
        "mercadopago"
      );

      logger.info("Local order created successfully", {
        orderId: createdOrder.id,
        isLocalPickup: isLocalStorePickup,
        shippingMethod: method,
      });
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      // Differentiate stock error vs DB error
      if (
        err.includes("Stock insuficiente") ||
        err.includes("no está disponible")
      ) {
        return fail("BAD_REQUEST", err, 400, { requestId });
      }
      logger.error("Failed to create local order", { error: e });
      return fail("INTERNAL_ERROR", "Failed to create order record", 500);
    }

    // 2. CREATE MP PREFERENCE LINKED TO ORDER
    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const totalItemsAmount =
      Number(createdOrder.total) -
      (Number(shippingCost) || 0) +
      (Number(discount) || 0);
    // Wait, createdOrder.total includes shipping.
    // So totalItemsAmount = createdOrder.order_items sum.
    // Let's just recalculate simple total for MP item display.
    // Actually we can reuse 'createdOrder.total' logic or just trust the logic below.

    // We strictly use the createdOrder ID as external_reference
    const externalReference = createdOrder.id;

    // ... (Consolidation Logic) ...
    // We already have the order total calculated securely by createFullOrder
    // createdOrder.total is the final price to pay.
    // The content of the preference items is now mostly for display/receipt,
    // since the authoritative total is in our DB.
    // MP requires items sum to match (or we just send one item with total).

    // Simplest approach: One item with the Total Amount of the order.
    // This avoids rounding errors between our calculation and MP's sum.
    const finalItems = [
      {
        id: "all-items",
        title: "Rastući - Compra Web",
        quantity: 1,
        // We use the TOTAL from the DB order which includes shipping/discount logic
        unit_price: Number(createdOrder.total),
        currency_id: "ARS",
        picture_url: undefined,
        description: `Pedido #${createdOrder.id}`,
      },
    ];

    // Determine notification URL
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
        /* ignore */
      }
    }

    const preferencePayload = {
      items: finalItems,
      payer: customer
        ? {
            name: customer.name,
            email: customer.email,
            phone: metadata.customerPhone
              ? { number: metadata.customerPhone }
              : undefined,
            address: metadata.customerPostalCode
              ? {
                  street_name: metadata.customerAddress,
                  zip_code: metadata.customerPostalCode,
                  city: metadata.customerCity,
                }
              : undefined,
          }
        : undefined,
      back_urls: {
        success: `${origin}/finalizar-compra/success`,
        failure: `${origin}/finalizar-compra/failure`,
        pending: `${origin}/finalizar-compra/pending`,
      },
      auto_return: "all",
      external_reference: externalReference, // LINK TO DB ORDER
      ...(mpNotificationUrl ? { notification_url: mpNotificationUrl } : {}),
      statement_descriptor: "RASTUCI",
      metadata: {
        ...metadata,
        shippingMethodName: shippingMethodName || metadata.shippingMethodName,
        // We include orderId here too just in case
        localOrderId: createdOrder.id,
      },
    } as MercadoPagoPreference;

    if (process.env.NODE_ENV === "development") {
      logger.info("MP preference payload", {
        requestId,
        externalReference,
        amount: Number(createdOrder.total),
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
      logger.error("MP preference create failed", { requestId, details: err });
      return fail("INTERNAL_ERROR", "Failed to create preference", 500);
    }

    const data = await resp.json();

    // Save preference ID to order? Optional but good for tracing.
    // Async update to avoid blocking.
    prisma.orders
      .update({
        where: { id: createdOrder.id },
        data: { mpPreferenceId: data.id },
      })
      .catch((e) => logger.error("Failed to save pref ID", { e }));

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
    return fail(n.code as ApiErrorCode, n.message, n.status, { requestId });
  }
}
