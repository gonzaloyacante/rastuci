import {} from // CorreoArgentinoService,
// type ProvinceCode,
"@/lib/correo-argentino-service";
import { PAYMENT_METHODS } from "@/lib/constants"; // Removed PROVINCE_CODE_MAP
import { logger } from "@/lib/logger";
import { createPreference } from "@/lib/mercadopago"; // Leaving this here or move to checkout-service too? It's fine here or via service.
import { NextRequest, NextResponse } from "next/server";
import { checkoutService } from "@/services/checkout-service";
import { orderService } from "@/services/order-service";
// import { apiHandler } from "@/lib/api-handler";

// interface OrderItem {
//   productId: string;
//   quantity: number;
//   price: number;
//   size?: string;
//   color?: string;
//   name?: string;
// }

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let validatedProducts: any[] = [];
    try {
      validatedProducts = await checkoutService.validateStock(items);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return NextResponse.json(
        { success: false, error: e.message },
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
