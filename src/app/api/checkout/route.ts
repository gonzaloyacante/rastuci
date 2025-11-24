import {
  correoArgentinoService,
  PROVINCE_NAMES,
  type ProvinceCode,
} from "@/lib/correo-argentino-service";
import { logger } from "@/lib/logger";
import { createPreference } from "@/lib/mercadopago";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  name?: string; // Para items de MercadoPago
}

interface _CreateOrderRequest {
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    notes?: string;
  };
  paymentMethod: "cash" | "mercadopago";
  shippingMethod: "pickup" | "delivery";
}

interface _Customer {
  name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  province?: string;
  postalCode?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    // Log incoming request minimally for diagnostics (avoid logging secrets)
    try {
      logger.info("[checkout] Incoming request:", {
        origin: request.headers.get("origin"),
        paymentMethod: body?.paymentMethod,
        itemsCount: Array.isArray(body?.items) ? body.items.length : 0,
      });
    } catch (e) {
      logger.warn("[checkout] Failed to log incoming request summary", {
        data: e,
      });
    }
    const { items, customer, shippingMethod, paymentMethod, orderData } = body;

    // Validar datos requeridos
    if (!items || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No hay productos en el carrito",
        },
        { status: 400 }
      );
    }

    if (!customer || !paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan datos del cliente o método de pago",
        },
        { status: 400 }
      );
    }

    // Crear el pedido en base de datos (estado inicial PENDING)
    // Para MercadoPago, esto nos da un ID para usar como external_reference
    const order = await prisma.order.create({
      data: {
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        customerAddress: `${customer.address}, ${customer.city}, ${customer.province}`,
        total: orderData.total,
        status: "PENDING",
        mpPaymentId: null,
        mpPreferenceId: null,
        mpStatus: paymentMethod === "cash" ? "cash_payment" : "pending_payment",
        items: {
          create: items.map((item: OrderItem) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            size: item.size || null,
            color: item.color || null,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Si es pago en efectivo
    if (paymentMethod === "cash") {
      // Si el método de envío es Correo Argentino (id empieza con 'ca-')
      if (
        shippingMethod &&
        shippingMethod.id.startsWith("ca-") &&
        customer.address &&
        customer.postalCode
      ) {
        try {
          await correoArgentinoService.authenticate();

          // Determinar tipo de entrega y sucursal
          const deliveryType =
            shippingMethod.id.includes("paq-suc") || body.shippingAgency
              ? "S"
              : "D";
          const agencyCode = body.shippingAgency?.code;

          // Mapear código de provincia
          let provinceCode: ProvinceCode = "B"; // Default Buenos Aires
          if (customer.province) {
            // Import PROVINCE_NAMES to find key by value
            const entry = Object.entries(PROVINCE_NAMES).find(
              ([_, name]) =>
                name.toLowerCase() === customer.province?.toLowerCase() ||
                name
                  .toLowerCase()
                  .includes(customer.province?.toLowerCase() || "")
            );
            if (entry) {
              provinceCode = entry[0] as ProvinceCode;
            }
          }

          const shipmentResult = await correoArgentinoService.importShipment({
            customerId: process.env.CORREO_ARGENTINO_CUSTOMER_ID || "",
            extOrderId: order.id,
            sender: {
              name: process.env.STORE_NAME || "Rastuci",
              phone: process.env.STORE_PHONE || "",
              email: process.env.STORE_EMAIL || "",
              originAddress: {
                streetName: process.env.STORE_ADDRESS || "Dirección Local",
                city: "Don Torcuato",
                provinceCode: "B",
                postalCode: "1611",
              },
            },
            recipient: {
              name: customer.name,
              phone: customer.phone,
              email: customer.email,
            },
            shipping: {
              deliveryType: deliveryType,
              productType: "CP", // Clásico Pack
              agency: deliveryType === "S" ? agencyCode : undefined,
              address:
                deliveryType === "D"
                  ? {
                      streetName: customer.address,
                      streetNumber: customer.address.match(/\d+/)?.[0] || "0", // Extract number or default
                      city: customer.city,
                      provinceCode: provinceCode,
                      postalCode: customer.postalCode,
                    }
                  : undefined,
              weight: orderData.weight || 1000,
              height: orderData.height || 10,
              width: orderData.width || 20,
              length: orderData.length || 30,
              declaredValue: orderData.total,
            },
          });

          if (shipmentResult.success && shipmentResult.data) {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                caTrackingNumber: shipmentResult.data.trackingNumber,
                caShipmentId: shipmentResult.data.shipmentId,
                shippingMethod: "Correo Argentino",
                shippingAgency: agencyCode,
              },
            });

            logger.info("[checkout] CA shipment imported", {
              orderId: order.id,
              trackingNumber: shipmentResult.data.trackingNumber,
            });
          } else {
            logger.error(
              "[checkout] Failed to import CA shipment (API error)",
              {
                orderId: order.id,
                error: shipmentResult.error,
              }
            );
          }
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
        paymentMethod: "cash",
        message:
          "Pedido creado exitosamente. Te confirmaremos por WhatsApp cuando esté listo para retirar.",
      });
    }

    // Si es MercadoPago, crear preferencia y redirigir
    if (paymentMethod === "mercadopago") {
      const origin =
        request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL;

      // Preparar items para MercadoPago
      const mpItems = items.map((item: OrderItem) => ({
        id: item.productId,
        title: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: "ARS",
      }));

      // Agregar envío si aplica (validar shape primero)
      if (
        shippingMethod &&
        typeof shippingMethod.price === "number" &&
        shippingMethod.price > 0
      ) {
        mpItems.push({
          id: "shipping",
          title: `Envío - ${shippingMethod.name}`,
          quantity: 1,
          unit_price: shippingMethod.price,
          currency_id: "ARS",
        });
      }

      // Crear preferencia en MercadoPago
      let preference;
      try {
        const payer = {
          name: customer.name,
          email: customer.email,
          phone: customer.phone ? { number: customer.phone } : undefined,
          address: {
            street_name: customer.address,
            zip_code: customer.postalCode,
          },
        };

        // Pasar external_reference (order.id) y metadata
        preference = await createPreference(mpItems, payer, {
          external_reference: order.id,
          metadata: {
            orderId: order.id,
            customerEmail: customer.email,
          },
        });

        // Actualizar orden con ID de preferencia
        await prisma.order.update({
          where: { id: order.id },
          data: {
            mpPreferenceId: preference.id,
          },
        });
      } catch (mpError) {
        logger.error("[checkout] MercadoPago preference creation error:", {
          error: mpError,
        });
        // Include some context to help debugging
        logger.error("[checkout] preference payload summary:", {
          error: {
            itemsCount: mpItems.length,
            back_urls: {
              success: `${origin}/checkout/success`,
              failure: `${origin}/checkout/failure`,
              pending: `${origin}/checkout/pending`,
            },
            notification_url: process.env.MP_WEBHOOK_URL,
          },
        });

        return NextResponse.json(
          {
            success: false,
            error: "Error creating MercadoPago preference",
            details:
              mpError instanceof Error ? mpError.message : String(mpError),
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        preferenceId: preference.id,
        initPoint: preference.init_point,
        paymentMethod: "mercadopago",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Método de pago no válido",
      },
      { status: 400 }
    );
  } catch (error) {
    logger.error("Error processing checkout:", { error: error });
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
