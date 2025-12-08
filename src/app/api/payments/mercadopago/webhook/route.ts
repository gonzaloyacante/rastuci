import { ok } from "@/lib/apiResponse";
import { getRequestId, logger } from "@/lib/logger";
import { validateWebhookSignature } from "@/lib/mercadopago";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";
import { correoArgentinoService } from "@/lib/correo-argentino-service";
import { NextRequest, NextResponse } from "next/server";

// Tipos para el webhook de MercadoPago
interface MercadoPagoPayment {
  id: string;
  status: string;
  status_detail: string;
  external_reference?: string;
  payment_method_id: string;
  payment_type_id: string;
  transaction_amount: number;
  transaction_details: {
    net_received_amount: number;
    total_paid_amount: number;
    installment_amount: number;
    financial_institution?: string;
  };
  payer: {
    id?: string;
    email?: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  date_created: string;
  date_approved?: string;
  date_last_updated: string;
  metadata?: Record<string, unknown>;
  additional_info?: {
    items?: Array<{
      id: string;
      title: string;
      quantity: number;
      unit_price: number;
    }>;
  };
}

// Mapeo de estados de MercadoPago a estados internos
const _mapPaymentStatus = (status: string, statusDetail: string) => {
  switch (status) {
    case "approved":
      return "COMPLETED";
    case "pending":
      // Diferentes tipos de pending
      switch (statusDetail) {
        case "pending_waiting_payment":
        case "pending_waiting_transfer":
          return "PENDING_PAYMENT";
        case "pending_review_manual":
        case "pending_waiting_for_remedy":
          return "PENDING_REVIEW";
        default:
          return "PENDING";
      }
    case "in_process":
      return "PROCESSING";
    case "rejected":
      return "FAILED";
    case "cancelled":
      return "CANCELLED";
    case "refunded":
      return "REFUNDED";
    case "charged_back":
      return "CHARGED_BACK";
    default:
      return "PENDING";
  }
};

/**
 * Crea el envío en Correo Argentino automáticamente
 * Prioridad: SIEMPRE guardar pedido en DB primero
 * Si CA falla, el pedido queda PENDING_SHIPMENT para gestión manual
 */
async function createCAShipment(orderId: string): Promise<void> {
  try {
    logger.info("[CA Shipment] Starting automatic shipment creation", {
      orderId,
    });

    // 1. Obtener datos completos del pedido
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        order_items: {
          include: {
            products: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    // 2. Validar que tengamos datos necesarios para envío
    if (!order.customerAddress || !order.customerEmail || !order.customerName) {
      throw new Error(
        `Order ${orderId} missing required shipping data (address, email, or name)`
      );
    }

    // 3. Validar credenciales de CA
    const customerId =
      process.env.CORREO_ARGENTINO_CUSTOMER_ID ||
      correoArgentinoService.getCustomerId();

    if (!customerId) {
      throw new Error(
        "CORREO_ARGENTINO_CUSTOMER_ID not configured - cannot create shipment"
      );
    }

    // 4. Usar campos estructurados si existen, sino parsear dirección
    // Prioridad: campos estructurados > parsing de customerAddress
    let streetName = order.shippingStreet || "";
    let streetNumber = order.shippingNumber || "S/N";
    let city = order.shippingCity || "";
    let postalCode = order.shippingPostalCode || "1611";
    let provinceCode: "B" | "C" = order.shippingProvinceCode as "B" | "C" || "B";

    // Fallback: parsear customerAddress si no hay campos estructurados
    if (!streetName && order.customerAddress) {
      const addressParts = order.customerAddress.split(",").map((s) => s.trim());
      const streetPart = addressParts[0] || "";
      const streetMatch = streetPart.match(/^(.+?)\s+(\d+)/);
      streetName = streetMatch ? streetMatch[1].trim() : streetPart;
      streetNumber = streetMatch ? streetMatch[2] : "S/N";
      city = addressParts[3] || addressParts[1] || "Buenos Aires";

      const postalCodeMatch = order.customerAddress.match(/\b(\d{4})\b/);
      postalCode = postalCodeMatch ? postalCodeMatch[1] : "1611";

      // Determinar provincia por CP
      const cpNum = parseInt(postalCode);
      provinceCode = (cpNum >= 1000 && cpNum <= 1439) ? "C" : "B";
    }

    // 5. Calcular dimensiones estimadas del paquete
    const totalItems = order.order_items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const estimatedWeight = Math.max(500, totalItems * 300); // Min 500g, ~300g por item
    const estimatedDimensions = {
      weight: estimatedWeight,
      height: 10,
      width: 20,
      length: 30,
    };

    // 6. Preparar datos para /shipping/import según documentación oficial
    const shipmentData = {
      customerId: customerId,
      extOrderId: orderId,
      orderNumber: orderId.substring(0, 20), // Max 20 chars para MiCorreo
      sender: {
        name: "Rastuci E-commerce",
        phone: "1123456789",
        cellPhone: "1123456789",
        email: "ventas@rastuci.com",
        originAddress: {
          streetName: "Av. San Martín",
          streetNumber: "1234",
          floor: null,
          apartment: null,
          city: "Don Torcuato",
          provinceCode: "B" as const,
          postalCode: "1611",
        },
      },
      recipient: {
        name: order.customerName,
        phone: order.customerPhone || "",
        cellPhone: order.customerPhone || "",
        email: order.customerEmail,
      },
      shipping: {
        deliveryType: "D" as const, // Domicilio por defecto
        productType: "CP", // Correo Argentino Clásico
        agency: null,
        address: {
          streetName: streetName || "Dirección",
          streetNumber: streetNumber,
          floor: order.shippingFloor || "",
          apartment: order.shippingApartment || "",
          city: city || "Buenos Aires",
          provinceCode: provinceCode,
          postalCode: postalCode,
        },
        weight: estimatedDimensions.weight,
        declaredValue: order.total,
        height: estimatedDimensions.height,
        length: estimatedDimensions.length,
        width: estimatedDimensions.width,
      },
    };

    logger.info("[CA Shipment] Sending shipment data to CA", {
      orderId,
      shipmentData: JSON.stringify(shipmentData),
    });

    // 7. Llamar a la API de Correo Argentino
    const response = await correoArgentinoService.importShipment(shipmentData);

    if (!response.success) {
      throw new Error(
        `CA API error: ${response.error?.message || "Unknown error"} (code: ${response.error?.code})`
      );
    }

    // 8. Actualizar pedido con tracking number
    const trackingNumber = response.data?.trackingNumber;
    const shipmentId = response.data?.shipmentId;

    await prisma.orders.update({
      where: { id: orderId },
      data: {
        trackingNumber: trackingNumber || shipmentId || null,
        shippingMethod: "correo-argentino",
        status: "PROCESSED", // Envío creado exitosamente
        updatedAt: new Date(),
      },
    });

    logger.info("[CA Shipment] Shipment created successfully", {
      orderId,
      trackingNumber,
      shipmentId,
    });

    // 9. Admin notification handled via email in main webhook flow
    logger.info("[CA Shipment] Shipment created, admin notified via email", {
      orderId,
      shipmentId,
    });
  } catch (error) {
    logger.error("[CA Shipment] Failed to create shipment", {
      orderId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error; // Re-throw para que el caller pueda manejar
  }
}

// Función para notificar al cliente por email/SMS
async function _notifyCustomer(
  orderId: string,
  status: string,
  paymentDetails: MercadoPagoPayment
) {
  try {
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      select: {
        customerEmail: true,
        customerName: true,
        total: true,
        order_items: {
          include: {
            products: true,
          },
        },
      },
    });

    if (!order?.customerEmail) {
      logger.warn("[Webhook] Order has no email, skipping notification", {
        orderId,
      });
      return;
    }

    // Enviar email de confirmación solo si el pago fue aprobado
    if (status === "approved") {
      const { sendEmail, getOrderConfirmationEmail, getNewOrderNotificationEmail } = await import(
        "@/lib/resend"
      );
      const { getAdminEmail } = await import("@/lib/store-settings");

      // Log email configuration status for debugging
      logger.info("[Webhook] Preparing to send confirmation email", {
        orderId,
        customerEmail: order.customerEmail,
        resendConfigured: !!process.env.RESEND_API_KEY,
        resendKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 8) + "...",
      });

      const items = order.order_items.map((item) => ({
        name: item.products.name,
        quantity: item.quantity,
        price: item.price,
      }));

      // Email al cliente
      const customerEmailHtml = getOrderConfirmationEmail({
        customerName: order.customerName,
        orderId,
        total: order.total,
        items,
      });

      const customerEmailSent = await sendEmail({
        to: order.customerEmail,
        subject: "✅ Confirmación de tu pedido en Rastuci",
        html: customerEmailHtml,
      });

      logger.info("[Webhook] Customer email send result", {
        orderId,
        email: order.customerEmail,
        sent: customerEmailSent,
        paymentMethod: paymentDetails.payment_method_id,
      });

      // Email al admin (desde configuración de tienda en DB)
      const adminEmail = await getAdminEmail();
      const adminEmailHtml = getNewOrderNotificationEmail({
        orderId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        total: order.total,
        items,
      });

      const adminEmailSent = await sendEmail({
        to: adminEmail,
        subject: `🔔 Nuevo Pedido #${orderId.slice(0, 8)} - ${order.customerName}`,
        html: adminEmailHtml,
      });

      logger.info("[Webhook] Admin notification email result", {
        orderId,
        adminEmail,
        sent: adminEmailSent,
      });

      // Nota: OneSignal push removido - emails son suficientes
    }
  } catch (error) {
    logger.error("[Webhook] Failed to send customer notification", {
      orderId,
      error,
    });
  }
}

// Mercado Pago sends POST for notifications (may also retry). Keep idempotent.
export async function POST(req: NextRequest) {
  const requestId = getRequestId(req.headers);
  const accessToken = process.env.MP_ACCESS_TOKEN;

  if (!accessToken) {
    logger.error("MP webhook missing access token", { requestId });
    return ok({ ok: true });
  }

  try {
    // Validar firma del webhook si está configurada
    const xSignature = req.headers.get("x-signature") || "";
    const xRequestId = req.headers.get("x-request-id") || "";
    const ts = req.headers.get("ts") || "";

    // Rate-limit webhook bursts per IP to protect server. If limited, ACK 200 to avoid retries.
    const rl = checkRateLimit(req, {
      key: makeKey("POST", "/api/payments/mercadopago/webhook"),
      ...getPreset("publicReadHeavy"),
    });

    if (!rl.ok) {
      logger.warn("[MP webhook] rate-limited", { requestId, key: rl.key });
      return ok({ ok: true });
    }

    const data = await req.json().catch(() => ({}));
    const topic =
      req.nextUrl.searchParams.get("type") ||
      req.nextUrl.searchParams.get("topic");
    const id =
      req.nextUrl.searchParams.get("data.id") ||
      (data && (data.data?.id || data.id));

    if (!id) {
      logger.warn("[MP webhook] Missing payment id", {
        requestId,
        query: req.nextUrl.searchParams.toString(),
        body: data,
      });
      return ok({ ok: true });
    }

    // Validar firma si está disponible
    if (xSignature && xRequestId && ts) {
      const isValid = validateWebhookSignature(xSignature, xRequestId, id, ts);
      if (!isValid) {
        logger.warn("[MP webhook] Invalid signature", { requestId, id });
        return new NextResponse("Invalid signature", { status: 401 });
      }
    }

    // Only handle payment notifications
    if (topic && topic !== "payment") {
      logger.info("[MP webhook] Non-payment topic received", {
        requestId,
        topic,
        id,
      });
      return ok({ ok: true });
    }

    // Fetch payment details from Mercado Pago con reintento
    let paymentResp: Response | undefined = undefined;
    let retries = 3;

    while (retries > 0) {
      paymentResp = await fetch(
        `https://api.mercadopago.com/v1/payments/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "Rastuci-Webhook/1.0",
          },
          cache: "no-store",
        }
      );

      if (paymentResp.ok) {
        break;
      }

      retries--;
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!paymentResp) {
      logger.error("[MP webhook] No response when fetching payment", {
        requestId,
        id,
      });
      return ok({ ok: true });
    }

    if (!paymentResp.ok) {
      const txt = await paymentResp.text();
      logger.error("[MP webhook] Failed to fetch payment after retries", {
        requestId,
        id,
        status: paymentResp.status,
        details: txt,
      });
      return ok({ ok: true });
    }

    const payment = await paymentResp.json();

    const mpPaymentId = String(payment.id);
    const mpStatus: string = payment.status; // approved | in_process | rejected | cancelled | pending
    const preferenceId: string | undefined =
      payment.metadata?.preference_id ||
      payment.order?.id ||
      payment.additional_info?.metadata?.preference_id;
    const metadata = payment.metadata || {};

    // Build items from metadata and DB (prices from DB to avoid tampering)
    // metadata.items puede venir como string JSON o array directo
    let metaItems: Record<string, unknown>[] = [];
    if (Array.isArray(metadata.items)) {
      metaItems = metadata.items;
    } else if (typeof metadata.items === "string") {
      try {
        const parsed = JSON.parse(metadata.items);
        metaItems = Array.isArray(parsed) ? parsed : [];
      } catch (parseError) {
        logger.error("[MP webhook] Failed to parse metadata.items", {
          requestId,
          mpPaymentId,
          items: metadata.items,
          error: parseError,
        });
      }
    }

    const shippingId = metadata.shipping as string | undefined;
    const discountPercent = Number(metadata.discountPercent || 0);
    const safeDiscount =
      isFinite(discountPercent) && discountPercent >= 0 && discountPercent <= 1
        ? discountPercent
        : 0;

    // Early exit if we cannot reconstruct items
    if (metaItems.length === 0) {
      logger.warn("[MP webhook] No metadata.items in payment", {
        requestId,
        mpPaymentId,
        metadataKeys: Object.keys(metadata),
        hasItems: !!metadata.items,
        itemsType: typeof metadata.items,
      });
      return ok({ ok: true });
    }

    const productIds: string[] = metaItems.map((i: Record<string, unknown>) =>
      String(i.productId)
    );
    const dbProducts = await prisma.products.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true, stock: true },
    });

    // Compute order totals and items
    type WebhookItem = {
      productId: string;
      quantity: number;
      unitPrice: number;
      size?: string;
      color?: string;
    };
    type ProductType = (typeof dbProducts)[0];
    const orderItems: WebhookItem[] = metaItems.map(
      (it: Record<string, unknown>) => {
        const prod = dbProducts.find((p: ProductType) => p.id === it.productId);
        if (!prod) {
          throw new Error(`Producto no encontrado: ${it.productId}`);
        }
        const unitPrice = Number((prod.price * (1 - safeDiscount)).toFixed(2));
        return {
          productId: prod.id,
          quantity: Number(it.quantity) || 1,
          unitPrice,
          size: typeof it.size === "string" ? it.size : undefined,
          color: typeof it.color === "string" ? it.color : undefined,
        };
      }
    );

    let shippingCost = 0;
    if (shippingId) {
      const shippingMap: Record<string, { name: string; price: number }> = {
        pickup: { name: "Retiro en tienda", price: 0 },
        standard: { name: "Envío estándar", price: 1500 },
        express: { name: "Envío express", price: 2500 },
      };
      shippingCost = shippingMap[shippingId]?.price ?? 0;
    }

    const itemsTotal = orderItems.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity,
      0
    );
    const total = Number((itemsTotal + shippingCost).toFixed(2));

    // Map MP status to our OrderStatus
    // approved → PENDING_PAYMENT (cliente pagó, admin debe crear envío en CA)
    // in_process/pending → PENDING (esperando confirmación de pago)
    // rejected/cancelled → PENDING (revisión manual)
    const mapStatus = (s: string) => {
      if (s === "approved") {
        return "PENDING_PAYMENT" as const; // Cliente pagó, crear envío automáticamente
      }
      if (s === "in_process" || s === "pending") {
        return "PENDING" as const;
      }
      return "PENDING" as const; // rejected/cancelled -> keep pending for manual review
    };

    // 1. Try to find order by external_reference (our order.id)
    if (payment.external_reference) {
      const orderId = payment.external_reference;
      const existingOrder = await prisma.orders.findUnique({
        where: { id: orderId },
        include: { order_items: true },
      });

      if (existingOrder) {
        // Update existing order
        await prisma.orders.update({
          where: { id: orderId },
          data: {
            mpPaymentId: mpPaymentId,
            mpStatus: mpStatus,
            status: mapStatus(mpStatus),
            updatedAt: new Date(),
          },
        });

        // Si pago aprobado, decrementar stock (solo la primera vez)
        const shouldDecrementStock =
          mapStatus(mpStatus) === "PENDING_PAYMENT" &&
          existingOrder.status !== "PENDING_PAYMENT" &&
          existingOrder.status !== "PROCESSED" &&
          existingOrder.status !== "DELIVERED";

        if (shouldDecrementStock) {
          for (const item of existingOrder.order_items) {
            await prisma.products.update({
              where: { id: item.productId },
              data: {
                stock: { decrement: item.quantity },
              },
            });
          }
        }

        logger.info("[MP webhook] Order updated via external_reference", {
          orderId,
          status: mpStatus,
        });

        // Si pago aprobado, intentar crear envío en Correo Argentino
        if (mapStatus(mpStatus) === "PENDING_PAYMENT" && shouldDecrementStock) {
          try {
            await createCAShipment(orderId);
          } catch (caError) {
            logger.error(
              "[MP webhook] CA shipment creation failed, order remains PENDING_PAYMENT for manual processing",
              {
                orderId,
                error: caError,
              }
            );
            // No lanzar error - el pedido ya está guardado en DB
          }
        }

        return ok({ ok: true });
      } else {
        logger.warn(
          "[MP webhook] external_reference provided but order not found",
          {
            orderId,
          }
        );
      }
    }

    // 2. Fallback: Try to find by preference_id
    if (preferenceId) {
      const existingOrder = await prisma.orders.findFirst({
        where: { mpPreferenceId: preferenceId },
        include: { order_items: true },
      });

      if (existingOrder) {
        await prisma.orders.update({
          where: { id: existingOrder.id },
          data: {
            mpPaymentId: mpPaymentId,
            mpStatus: mpStatus,
            status: mapStatus(mpStatus),
            updatedAt: new Date(),
          },
        });

        const shouldDecrementStock2 =
          mapStatus(mpStatus) === "PENDING_PAYMENT" &&
          existingOrder.status !== "PENDING_PAYMENT" &&
          existingOrder.status !== "PROCESSED" &&
          existingOrder.status !== "DELIVERED";

        if (shouldDecrementStock2) {
          for (const item of existingOrder.order_items) {
            await prisma.products.update({
              where: { id: item.productId },
              data: {
                stock: { decrement: item.quantity },
              },
            });
          }
        }

        logger.info("[MP webhook] Order updated via preference_id", {
          orderId: existingOrder.id,
          status: mpStatus,
        });

        // Si pago aprobado, intentar crear envío en Correo Argentino
        if (mapStatus(mpStatus) === "PENDING_PAYMENT" && shouldDecrementStock2) {
          try {
            await createCAShipment(existingOrder.id);
          } catch (caError) {
            logger.error(
              "[MP webhook] CA shipment creation failed, order remains PENDING_PAYMENT for manual processing",
              {
                orderId: existingOrder.id,
                error: caError,
              }
            );
          }
        }

        return ok({ ok: true });
      }
    }

    // 3. Legacy Fallback: Create order from metadata (retained for backward compatibility or edge cases)
    // Only if we couldn't find it by ID
    logger.info(
      "[MP webhook] Order not found by ID, attempting creation from metadata",
      { mpPaymentId }
    );

    const customerName: string =
      payment.payer?.first_name && payment.payer?.last_name
        ? `${payment.payer.first_name} ${payment.payer.last_name}`
        : payment.payer?.first_name || metadata.customerName || "Cliente";
    const customerPhone: string =
      payment.payer?.phone?.number || metadata.customerPhone || "";
    const customerAddress: string | undefined = metadata.customerAddress;
    const customerEmail: string | undefined =
      payment.payer?.email || metadata.customerEmail;

    // Extraer campos de shipping estructurados desde metadata
    const shippingStreet: string | undefined =
      typeof metadata.customerAddress === 'string' ? metadata.customerAddress : undefined;
    const shippingCity: string | undefined =
      typeof metadata.customerCity === 'string' ? metadata.customerCity : undefined;
    const shippingProvince: string | undefined =
      typeof metadata.customerProvince === 'string' ? metadata.customerProvince : undefined;
    const shippingPostalCode: string | undefined =
      typeof metadata.customerPostalCode === 'string' ? metadata.customerPostalCode : undefined;
    const shippingAgencyCode: string | undefined =
      typeof metadata.shippingAgencyCode === 'string' ? metadata.shippingAgencyCode : undefined;
    const shippingMethodId: string | undefined =
      typeof metadata.shippingMethodId === 'string' ? metadata.shippingMethodId : undefined;

    // Idempotent upsert using mpPaymentId
    await prisma.$transaction(
      async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
        // If order already exists (by payment ID), update status and return
        const existing = await tx.orders.findFirst({
          where: { mpPaymentId: mpPaymentId },
        });
        if (existing) {
          await tx.orders.update({
            where: { id: existing.id },
            data: {
              mpStatus: mpStatus,
              status: mapStatus(mpStatus),
              updatedAt: new Date(),
            },
          });
          return;
        }

        await tx.orders.create({
          data: {
            id: `ord_${mpPaymentId}_${Date.now()}`,
            customerName: customerName,
            customerPhone: customerPhone,
            customerAddress: customerAddress,
            customerEmail: customerEmail,
            total: total,
            status: mapStatus(mpStatus),
            mpPaymentId: mpPaymentId,
            mpPreferenceId: preferenceId,
            mpStatus: mpStatus,
            // Campos de shipping estructurados para CA
            shippingStreet: shippingStreet,
            shippingCity: shippingCity,
            shippingProvince: shippingProvince,
            shippingPostalCode: shippingPostalCode,
            shippingAgency: shippingAgencyCode,
            shippingMethod: shippingMethodId,
            updatedAt: new Date(),
            order_items: {
              create: orderItems.map((it) => ({
                id: `${mpPaymentId}-${it.productId}-${Date.now()}`,
                quantity: it.quantity,
                price: it.unitPrice,
                size: it.size,
                color: it.color,
                products: {
                  connect: { id: it.productId },
                },
              })),
            },
          },
        });

        // Decrement stock for each product
        for (const it of orderItems) {
          await tx.products.update({
            where: { id: it.productId },
            data: {
              stock: { decrement: it.quantity },
            },
          });
        }
      }
    );

    return ok({ ok: true });
  } catch (e: unknown) {
    logger.error("[MP webhook] error", {
      requestId,
      error: e instanceof Error ? e.message : String(e),
    });
    // Always return 200 so MP stops retrying; log for later inspection
    return ok({ ok: true });
  }
}

// Optional GET handler for quick checks
export async function GET() {
  return NextResponse.json({ ok: true });
}
