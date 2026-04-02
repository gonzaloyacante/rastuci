import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { PAYMENT_METHODS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { createPreference } from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { checkoutService } from "@/services/checkout-service";
import { orderService } from "@/services/order-service";

export async function POST(request: NextRequest): Promise<NextResponse> {
  // [C-03] Rate limit: max 10 checkout attempts per IP per minute
  const rateLimit = await checkRateLimit(request, {
    key: "checkout",
    limit: 10,
    windowMs: 60_000,
  });
  if (!rateLimit.ok) {
    return NextResponse.json(
      {
        success: false,
        error: "Demasiados intentos. Intenta nuevamente en un momento.",
      },
      { status: 429 }
    );
  }

  // --- VACATION MODE CHECK ---

  // We check this first to block any processing if the store is closed.
  const vacationSettings = await prisma.vacation_settings.findUnique({
    where: { id: "default" },
  });

  if (vacationSettings?.enabled) {
    // If enabled, we block. Admin must disable it manually to open.
    // We could check dates here too, but 'enabled' is the master switch.
    return NextResponse.json(
      {
        success: false,
        error:
          "La tienda está cerrada por vacaciones. No se pueden realizar compras en este momento.",
        code: "VACATION_MODE",
      },
      { status: 503 }
    );
  }
  // ---------------------------

  // Zod Schemas para Validación Estricta (H-19)
  const CheckoutItemSchema = z.object({
    productId: z.string().min(1, "ID de producto requerido").max(36),
    quantity: z
      .number()
      .int()
      .positive("La cantidad debe ser positiva")
      .max(100),
    price: z
      .number()
      .nonnegative("El precio no puede ser negativo")
      .max(10_000_000),
    name: z.string().min(1, "Nombre del producto requerido").max(200),
    size: z.string().max(20).optional(),
    color: z.string().max(50).optional(),
  });

  const CheckoutCustomerSchema = z.object({
    name: z.string().min(2, "Nombre del cliente demasiado corto").max(100),
    email: z.string().email("Email inválido").max(150),
    phone: z
      .string()
      .regex(/^\+?[\d\s-]{8,20}$/, "Número de teléfono inválido")
      .optional()
      .or(z.literal("")),
    address: z.string().min(5, "Dirección inválida").max(200),
    city: z.string().min(2, "Ciudad requerida").max(100),
    province: z.string().min(2, "Provincia requerida").max(50),
    postalCode: z.string().min(2, "Código postal requerido").max(20),
  });

  const CheckoutShippingMethodSchema = z.object({
    id: z.string().max(50),
    name: z.string().max(100),
    price: z.number().nonnegative().max(10_000_000),
  });

  const CheckoutRequestSchema = z.object({
    items: z
      .array(CheckoutItemSchema)
      .min(1, "No hay productos en el carrito")
      .max(50),
    customer: CheckoutCustomerSchema,
    shippingMethod: CheckoutShippingMethodSchema.optional(),
    paymentMethod: z.string().min(1, "Método de pago requerido").max(50),
    couponCode: z.string().min(1).max(50).toUpperCase().optional(),
    orderData: z.object({
      total: z.number().nonnegative().max(100_000_000),
      subtotal: z.number().nonnegative().max(100_000_000).default(0),
      shippingCost: z.number().nonnegative().max(10_000_000).default(0),
      discount: z.number().nonnegative().max(100_000_000).default(0),
    }),
    shippingAgency: z.object({ code: z.string().max(20) }).optional(),
  });

  try {
    const rawBody = await request.json();

    // 1. Zod Validation Estricta (H-19)
    const validationResult = CheckoutRequestSchema.safeParse(rawBody);

    if (!validationResult.success) {
      const errors = validationResult.error.errors;
      const hasCustomerError = errors.some(
        (e: z.ZodIssue) => e.path[0] === "customer"
      );
      if (hasCustomerError) {
        return NextResponse.json(
          {
            success: false,
            error: "Datos del cliente requeridos o inválidos",
          },
          { status: 400 }
        );
      }
      const errorMsg = errors.map((e: z.ZodIssue) => e.message).join(", ");
      return NextResponse.json(
        { success: false, error: `Validación fallida: ${errorMsg}` },
        { status: 400 }
      );
    }

    const body = validationResult.data;
    const { items, customer, shippingMethod, paymentMethod, orderData } = body;

    // 2. Validate Stock via Service
    try {
      await checkoutService.validateStock(items);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Error validando stock";
      return NextResponse.json(
        { success: false, error: message },
        { status: 400 }
      );
    }

    // 2.5. Validar cupón server-side (si fue enviado — el descuento del cliente NUNCA se confía)
    let appliedCoupon:
      | {
          id: string;
          discount: number;
          discountType: string;
          minOrderTotal: number | null;
        }
      | undefined;
    if (body.couponCode) {
      const coupon = await prisma.coupons.findFirst({
        where: { code: body.couponCode, isActive: true },
      });
      if (!coupon) {
        return NextResponse.json(
          { success: false, error: "Cupón inválido o expirado" },
          { status: 400 }
        );
      }
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return NextResponse.json(
          { success: false, error: "El cupón ha expirado" },
          { status: 400 }
        );
      }
      if (
        coupon.usageLimit !== null &&
        coupon.usageCount >= coupon.usageLimit
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "El cupón ha alcanzado su límite de usos",
          },
          { status: 400 }
        );
      }
      appliedCoupon = {
        id: coupon.id,
        discount: Number(coupon.discount),
        discountType: coupon.discountType,
        minOrderTotal: coupon.minOrderTotal
          ? Number(coupon.minOrderTotal)
          : null,
      };
    }

    // 3. Process Payment Logic (Split by Method)

    // 3. Process Payment Logic (Split by Method)

    // Validate static shipping option price against DB (prevent client-side price manipulation)
    // CA options (ca-*) use real-time pricing; pickup is always 0.
    let resolvedShippingPrice = shippingMethod?.price ?? orderData.shippingCost;
    if (
      shippingMethod?.id &&
      shippingMethod.id !== "pickup" &&
      !shippingMethod.id.startsWith("ca-")
    ) {
      const dbShippingOption = await prisma.shipping_options.findFirst({
        where: { optionId: shippingMethod.id, isActive: true },
        select: { price: true },
      });
      if (dbShippingOption) {
        const dbPrice = Number(dbShippingOption.price);
        if (dbPrice !== shippingMethod.price) {
          logger.warn("[Checkout] Shipping price mismatch — using DB price", {
            clientPrice: shippingMethod.price,
            dbPrice,
            methodId: shippingMethod.id,
          });
        }
        resolvedShippingPrice = dbPrice;
      }
    }

    // Validate CA shipping price: must be positive (CA always charges for delivery)
    if (shippingMethod?.id?.startsWith("ca-") && resolvedShippingPrice <= 0) {
      logger.warn("[Checkout] Invalid CA shipping price — rejected", {
        clientPrice: shippingMethod.price,
        methodId: shippingMethod.id,
      });
      return NextResponse.json(
        {
          success: false,
          error:
            "El costo de envío de Correo Argentino es inválido. Recalculá el envío.",
        },
        { status: 400 }
      );
    }

    const shippingData = {
      street: customer.address,
      city: customer.city,
      province: customer.province,
      postalCode: customer.postalCode,
      agency: body.shippingAgency?.code,
      methodName: shippingMethod?.name || "Correo Argentino",
      // Server-side shipping cost enforcement:
      // Pickup = 0, static options = validated DB price, CA = client-provided real-time quote.
      cost: shippingMethod?.id === "pickup" ? 0 : resolvedShippingPrice,
    };

    // A) CASH PAYMENT
    if (paymentMethod === PAYMENT_METHODS.CASH) {
      const order = await orderService.createCashOrder(
        { ...customer, phone: customer.phone || "" },
        items,
        orderData.total,
        shippingData,
        appliedCoupon
      );

      // Handle CA Shipment (If applicable)
      if (
        shippingMethod?.id &&
        shippingMethod.id.startsWith("ca-") &&
        customer.address &&
        customer.postalCode
      ) {
        try {
          const { shipmentService } =
            await import("@/services/shipment-service");
          await shipmentService.createCAShipment(order.id);
        } catch (caError) {
          logger.error("[checkout] Failed to import CA shipment", {
            orderId: order.id,
            error: caError,
          });
        }
      }

      return NextResponse.json({
        success: true,
        orderId: order.id,
        paymentMethod: PAYMENT_METHODS.CASH,
        message: "Pedido creado. Te esperamos en la tienda.",
      });
    }

    // B) TRANSFER PAYMENT (NEW)
    if (paymentMethod === PAYMENT_METHODS.TRANSFER) {
      const order = await orderService.createTransferOrder(
        { ...customer, phone: customer.phone || "" },
        items,
        shippingData,
        appliedCoupon
      );

      return NextResponse.json({
        success: true,
        orderId: order.id,
        paymentMethod: PAYMENT_METHODS.TRANSFER,
        message:
          "Pedido creado. Revisa tu email con los datos de transferencia.",
      });
    }

    // C) MERCADO PAGO
    // Validar método antes de crear la orden y decrementar stock
    if (paymentMethod !== PAYMENT_METHODS.MERCADOPAGO) {
      return NextResponse.json(
        { success: false, error: "Método de pago no válido" },
        { status: 400 }
      );
    }

    // Note: Stock IS decremented immediately by createFullOrder to reserve items.
    // If payment fails/cancels, we must ensure it's restored (via Cron or Webhook).
    const order = await orderService.createFullOrder(
      { ...customer, phone: customer.phone || "" },
      items,
      shippingData,
      paymentMethod,
      appliedCoupon
    );

    const tempOrderId = order.id;

    // Use the server-calculated order total for the payment preference
    // This ensures that the amount to pay matches exactly what is stored in the database,
    // including all server-side discounts and shipping costs.
    const mpItems = [
      {
        id: "purchase_summary",
        title: `Compra en Rastuci (Pedido #${tempOrderId.slice(0, 8)})`,
        quantity: 1,
        unit_price: Number(order.total),
        currency_id: "ARS",
      },
    ];

    const payer = {
      name: customer.name,
      email: customer.email,
      phone: customer.phone ? { number: customer.phone } : undefined,
      address: {
        street_name: customer.address,
        zip_code: customer.postalCode,
      },
    };

    const metadata = {
      tempOrderId,
      customerEmail: customer.email, // Backup
    };

    const preference = await createPreference(mpItems, payer, {
      external_reference: tempOrderId,
      metadata: metadata,
      // Ensure auto_return if desired? Not strictly needed if webhook works, but good for UX.
    });

    // Update order with preference ID
    await prisma.orders.update({
      where: { id: order.id },
      data: { mpPreferenceId: preference.id },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      preferenceId: preference.id,
      initPoint: preference.init_point,
      paymentMethod: PAYMENT_METHODS.MERCADOPAGO,
    });
  } catch (error) {
    logger.error("Error processing checkout:", { error });
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
