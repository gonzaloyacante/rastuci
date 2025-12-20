import {
  CorreoArgentinoService,
  type ProvinceCode,
} from "@/lib/correo-argentino-service";
import { PAYMENT_METHODS, PROVINCE_CODE_MAP } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { createPreference } from "@/lib/mercadopago"; // Leaving this here or move to checkout-service too? It's fine here or via service.
import { NextRequest, NextResponse } from "next/server";
import { checkoutService } from "@/services/checkout-service";
import { orderService } from "@/services/order-service";
import { apiHandler } from "@/lib/api-handler";

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  name?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Using apiHandler would be nice but we need specific response shapes for Checkout success
  // We can try to use it or keep manual try/catch for now to match current return types exactly.
  // Manual try-catch for safety during refactor to not break frontend expectations.

  interface CheckoutItem {
    productId: string;
    quantity: number;
    price: number;
    name: string;
    size?: string;
    color?: string;
  }

  interface CheckoutCustomer {
    name: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  }

  interface CheckoutShippingMethod {
    id: string;
    name: string;
    price: number;
  }

  interface CheckoutRequestBody {
    items: CheckoutItem[];
    customer: CheckoutCustomer;
    shippingMethod?: CheckoutShippingMethod;
    paymentMethod: string;
    orderData: {
      total: number;
      subtotal: number;
      shippingCost: number;
      discount: number;
    };
    shippingAgency?: {
      code: string;
    };
  }

  try {
    const body: CheckoutRequestBody = await request.json();
    const { items, customer, shippingMethod, paymentMethod, orderData } = body;

    // 1. Validate
    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "No hay productos en el carrito" },
        { status: 400 }
      );
    }
    if (!customer || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Faltan datos del cliente o método de pago" },
        { status: 400 }
      );
    }

    // 2. Validate Stock via Service
    let validatedProducts: any[] = [];
    try {
      validatedProducts = await checkoutService.validateStock(items);
    } catch (e: any) {
      return NextResponse.json(
        { success: false, error: e.message },
        { status: 400 }
      );
    }

    // 3. Process Payment Method
    if (paymentMethod === PAYMENT_METHODS.CASH) {
      // Prepare Shipping Data
      const shippingData = {
        street: customer.address,
        city: customer.city,
        province: customer.province,
        postalCode: customer.postalCode,
        agency: body.shippingAgency?.code,
        methodName: shippingMethod?.name || "Correo Argentino",
      };

      // Create Order via Service
      const order = await orderService.createCashOrder(
        { ...customer, phone: customer.phone || "" },
        items,
        orderData.total,
        shippingData
      );

      // Handle CA Shipment Immediate Creation if needed
      // Original logic checked for 'ca-' id. Reuse logic or move to shipment service?
      // Let's implement CA creation call here if it was done before.
      // Logic was: if shippingMethod.id.startsWith("ca-") ... create shipment immediately
      if (
        shippingMethod &&
        shippingMethod.id &&
        shippingMethod.id.startsWith("ca-") &&
        customer.address &&
        customer.postalCode
      ) {
        // ... CA Logic (Simplify or keep inline for now, ideally extract to shipmentService.createFromCheckoutData)
        // For now, let's keep the CA logic inline or move to shipment-service.
        // shipmentService methods are tailored for "Order exists in DB". We have the order now!
        // So we can use shipmentService.createCAShipment(order.id) IF the order has all data nicely saved.
        // orderService.createCashOrder saves shipping fields (street, etc).
        // So createCAShipment should work!

        // Async call to avoid blocking? Or await? Original awaited.
        try {
          // However, createCAShipment logic relies on order fields.
          // We passed them to createCashOrder.
          // But wait, createCAShipment logic calculates weight from items in DB order_items.
          // Yes, createCashOrder creates order_items.
          // So this should work!
          const { shipmentService } =
            await import("@/services/shipment-service");
          await shipmentService.createCAShipment(order.id);
        } catch (caError) {
          logger.error("[checkout] Failed to import CA shipment", {
            orderId: order.id,
            error: caError,
          });
          // Don't fail the request, just log.
        }
      }

      return NextResponse.json({
        success: true,
        orderId: order.id,
        paymentMethod: PAYMENT_METHODS.CASH,
        message:
          "Pedido creado exitosamente. Te confirmaremos por WhatsApp cuando esté listo para retirar.",
      });
    }

    if (paymentMethod === PAYMENT_METHODS.MERCADOPAGO) {
      const origin =
        request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL;
      const tempOrderId = `tmp_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const mpItems = checkoutService.prepareMPItems(
        items,
        shippingMethod,
        orderData.discount,
        validatedProducts
      );
      const customerForMP = { ...customer, phone: customer.phone || "" };

      // Preference Creation
      // We still need local logic for Payer and Metadata construction because it depends on specific body fields
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
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        customerCity: customer.city,
        customerProvince: customer.province,
        customerPostalCode: customer.postalCode,
        total: orderData.total,
        subtotal: orderData.subtotal,
        shippingCost: orderData.shippingCost,
        discount: orderData.discount,
        shippingMethodId: shippingMethod?.id || null,
        shippingMethodName: shippingMethod?.name || null,
        shippingMethodPrice: shippingMethod?.price || null,
        shippingAgencyCode: body.shippingAgency?.code || null,
        items: JSON.stringify(
          items.map((item: CheckoutItem) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            size: item.size || null,
            color: item.color || null,
            products: { connect: { id: item.productId } },
          }))
        ),
      };

      logger.info("[Checkout] Creating MP Preference", {
        itemsCount: mpItems.length,
        hasDiscount: mpItems.some((i) => i.id === "discount"),
        rawItems: JSON.stringify(mpItems),
      });

      const preference = await createPreference(mpItems, payer, {
        external_reference: tempOrderId,
        metadata: metadata,
      });

      return NextResponse.json({
        success: true,
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
