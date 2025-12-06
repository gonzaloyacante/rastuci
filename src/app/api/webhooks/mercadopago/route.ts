import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Payment, MercadoPagoConfig } from "mercadopago";

// Configurar MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
  options: { timeout: 5000 },
});

const paymentClient = new Payment(client);

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  size?: string | null;
  color?: string | null;
}

/**
 * Webhook de MercadoPago
 * Se ejecuta cuando MercadoPago notifica cambios en un pago
 * https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    logger.info("[MP Webhook] Notificación recibida", {
      type: body.type,
      action: body.action,
      paymentId: body.data?.id,
    });

    // Validar que sea una notificación de pago
    if (body.type !== "payment" || !body.data?.id) {
      logger.warn("[MP Webhook] Notificación ignorada (no es pago)", { body });
      return NextResponse.json({ received: true });
    }

    // Obtener información del pago desde MercadoPago
    const paymentId = body.data.id;
    let payment;
    
    try {
      payment = await paymentClient.get({ id: paymentId });
    } catch (error) {
      logger.error("[MP Webhook] Error al obtener pago desde MP", {
        paymentId,
        error,
      });
      return NextResponse.json(
        { error: "Error al obtener pago desde MercadoPago" },
        { status: 500 }
      );
    }

    if (!payment) {
      logger.error("[MP Webhook] Pago no encontrado", { paymentId });
      return NextResponse.json(
        { error: "Pago no encontrado" },
        { status: 404 }
      );
    }

    logger.info("[MP Webhook] Pago obtenido", {
      paymentId,
      status: payment.status,
      externalReference: payment.external_reference,
      metadata: payment.metadata,
    });

    // Solo procesar pagos aprobados
    if (payment.status !== "approved") {
      logger.info("[MP Webhook] Pago no aprobado aún", {
        paymentId,
        status: payment.status,
      });
      return NextResponse.json({ received: true });
    }

    // Verificar que no exista ya una orden con este payment_id
    const existingOrder = await prisma.orders.findFirst({
      where: { mpPaymentId: String(paymentId) },
    });

    if (existingOrder) {
      logger.info("[MP Webhook] Orden ya existe para este pago", {
        paymentId,
        orderId: existingOrder.id,
      });
      return NextResponse.json({ received: true, orderId: existingOrder.id });
    }

    // Extraer metadata del pago
    const metadata = payment.metadata as Record<string, string>;
    
    if (!metadata || !metadata.tempOrderId) {
      logger.error("[MP Webhook] Metadata no encontrada o inválida", {
        paymentId,
        metadata,
      });
      return NextResponse.json(
        { error: "Metadata del pago inválida" },
        { status: 400 }
      );
    }

    // Deserializar items
    let items: OrderItem[];
    try {
      items = JSON.parse(metadata.items);
    } catch (error) {
      logger.error("[MP Webhook] Error al parsear items", {
        paymentId,
        itemsString: metadata.items,
        error,
      });
      return NextResponse.json(
        { error: "Items inválidos en metadata" },
        { status: 400 }
      );
    }

    // Validar stock ANTES de crear la orden
    const productIds = items.map((item) => item.productId);
    const products = await prisma.products.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, stock: true },
    });

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        logger.error("[MP Webhook] Producto no encontrado", {
          productId: item.productId,
        });
        return NextResponse.json(
          { error: `Producto no encontrado: ${item.productId}` },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        logger.error("[MP Webhook] Stock insuficiente", {
          productId: item.productId,
          productName: product.name,
          stock: product.stock,
          requested: item.quantity,
        });
        return NextResponse.json(
          { error: `Stock insuficiente para ${product.name}` },
          { status: 400 }
        );
      }
    }

    // 🎉 CREAR ORDEN EN BASE DE DATOS
    const finalOrderId = `ord_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const order = await prisma.orders.create({
      data: {
        id: finalOrderId,
        customerName: metadata.customerName,
        customerPhone: metadata.customerPhone,
        customerEmail: metadata.customerEmail,
        customerAddress: `${metadata.customerAddress}, ${metadata.customerCity}, ${metadata.customerProvince}`,
        total: parseFloat(metadata.total),
        status: "PENDING", // Estado inicial después de pago aprobado
        mpPaymentId: String(paymentId),
        // @ts-expect-error - MercadoPago types don't include preference_id but it exists in the response
        mpPreferenceId: payment.preference_id || null,
        mpStatus: "approved",
        shippingMethod: metadata.shippingMethodName || null,
        shippingCost: metadata.shippingMethodPrice ? parseFloat(metadata.shippingMethodPrice) : null,
        shippingAgency: metadata.shippingAgencyCode || null,
        updatedAt: new Date(),
        order_items: {
          create: items.map((item) => ({
            id: `${finalOrderId}_${item.productId}_${Date.now()}`,
            quantity: item.quantity,
            price: item.price,
            size: item.size || null,
            color: item.color || null,
            products: {
              connect: { id: item.productId },
            },
          })),
        },
      },
      include: {
        order_items: {
          include: {
            products: true,
          },
        },
      },
    });

    logger.info("[MP Webhook] ✅ Orden creada exitosamente después de pago aprobado", {
      orderId: order.id,
      paymentId,
      total: order.total,
    });

    // TODO: Enviar notificación al cliente (email, WhatsApp, etc.)
    // TODO: Si es envío con Correo Argentino, crear shipment

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: "Orden creada exitosamente",
    });
  } catch (error) {
    logger.error("[MP Webhook] Error procesando webhook", { error });
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
