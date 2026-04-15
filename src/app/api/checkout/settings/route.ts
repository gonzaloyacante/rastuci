import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/checkout/settings
 *
 * Devuelve los métodos de pago y las opciones de envío activos para usar
 * en el flujo de checkout del cliente.
 */
export async function GET() {
  try {
    const [methods, options] = await Promise.all([
      prisma.payment_methods.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.shipping_options.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    const paymentMethods = methods.map((m) => ({
      id: m.methodId,
      name: m.name,
      icon: m.icon,
      description: m.description,
      requiresShipping: m.requiresShipping,
    }));

    const shippingOptions = options.map((o) => ({
      id: o.optionId,
      name: o.name,
      description: o.description,
      price: Number(o.price),
      estimatedDays: o.estimatedDays,
    }));

    return NextResponse.json({ paymentMethods, shippingOptions });
  } catch (error) {
    logger.error("[GET /api/checkout/settings] Error:", { error });
    // Retornar listas vacías en vez de 500 para no bloquear el checkout
    return NextResponse.json({ paymentMethods: [], shippingOptions: [] });
  }
}
