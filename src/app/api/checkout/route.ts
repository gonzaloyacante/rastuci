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
    productId: z.string().min(1, "ID de producto requerido"),
    quantity: z.number().int().positive("La cantidad debe ser positiva"),
    price: z.number().nonnegative("El precio no puede ser negativo"),
    name: z.string().min(1, "Nombre del producto requerido"),
    size: z.string().optional(),
    color: z.string().optional(),
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
    id: z.string(),
    name: z.string(),
    price: z.number().nonnegative(),
  });

  const CheckoutRequestSchema = z.object({
    items: z.array(CheckoutItemSchema).min(1, "No hay productos en el carrito"),
    customer: CheckoutCustomerSchema,
    shippingMethod: CheckoutShippingMethodSchema.optional(),
    paymentMethod: z.string().min(1, "Método de pago requerido"),
    orderData: z.object({
      total: z.number().nonnegative(),
      subtotal: z.number().nonnegative().default(0),
      shippingCost: z.number().nonnegative().default(0),
      discount: z.number().nonnegative().default(0),
    }),
    shippingAgency: z.object({ code: z.string() }).optional(),
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

    // 3. Process Payment Logic (Split by Method)

    // 3. Process Payment Logic (Split by Method)
    const shippingData = {
      street: customer.address,
      city: customer.city,
      province: customer.province,
      postalCode: customer.postalCode,
      agency: body.shippingAgency?.code,
      methodName: shippingMethod?.name || "Correo Argentino",
      cost: orderData.shippingCost,
    };

    // A) CASH PAYMENT
    if (paymentMethod === PAYMENT_METHODS.CASH) {
      const order = await orderService.createCashOrder(
        { ...customer, phone: customer.phone || "" },
        items,
        orderData.total,
        shippingData
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
        shippingData
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
    // Note: Stock IS decremented immediately by createFullOrder to reserve items.
    // If payment fails/cancels, we must ensure it's restored (via Cron or Webhook).
    const order = await orderService.createFullOrder(
      { ...customer, phone: customer.phone || "" },
      items,
      shippingData,
      paymentMethod
    );

    if (paymentMethod === PAYMENT_METHODS.MERCADOPAGO) {
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

      // Update order with preference ID logic
      const prisma = (await import("@/lib/prisma")).default;
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
    }

    return NextResponse.json(
      { success: false, error: "Método de pago no válido" },
      { status: 400 }
    );
  } catch (error) {
    logger.error("Error processing checkout:", { error });
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
