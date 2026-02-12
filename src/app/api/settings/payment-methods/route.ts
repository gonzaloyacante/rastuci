import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const PaymentMethodSchema = z.object({
  methodId: z.string(),
  name: z.string(),
  icon: z.string().default("wallet"),
  description: z.string(),
  requiresShipping: z.boolean().optional().default(true),
});

const PaymentMethodsSchema = z.array(PaymentMethodSchema).min(1);

// GET /api/settings/payment-methods - Obtener métodos de pago
export async function GET() {
  try {
    // Obtener configuración de contacto para la ubicación
    const contactSetting = await prisma.contact_settings.findUnique({
      where: { id: "default" },
      select: { addressCityCountry: true },
    });
    const locationString = contactSetting?.addressCityCountry || "Buenos Aires";

    // Obtener métodos de pago de la tabla relacional
    const methods = await prisma.payment_methods.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    if (methods.length === 0) {
      // Retornar métodos por defecto si no existen en DB
      return NextResponse.json({
        success: true,
        data: [
          {
            id: "mercadopago",
            name: "MercadoPago",
            icon: "wallet",
            description:
              "Tarjetas, transferencias y más - Redirección a MercadoPago",
            requiresShipping: true,
          },
          {
            id: "cash",
            name: "Efectivo - Retiro en Local",
            icon: "dollar-sign",
            description: `Retiro en nuestro local de ${locationString} - Sin costo de envío`,
            requiresShipping: false,
          },
        ],
      });
    }

    // Actualizar descripción del efectivo dinámicamente con la ubicación
    const updatedMethods = methods.map((m) => ({
      id: m.methodId,
      name: m.name,
      icon: m.icon,
      description:
        m.methodId === "cash"
          ? `Retiro en nuestro local de ${locationString} - Sin costo de envío`
          : m.description,
      requiresShipping: m.requiresShipping,
    }));

    return NextResponse.json({ success: true, data: updatedMethods });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener los métodos de pago" },
      { status: 500 }
    );
  }
}

// POST /api/settings/payment-methods - Crear/actualizar métodos (ADMIN ONLY)
export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const validated = PaymentMethodsSchema.parse(body);

    // Upsert each payment method
    const results = await prisma.$transaction(
      validated.map((method, index) =>
        prisma.payment_methods.upsert({
          where: { methodId: method.methodId },
          create: {
            methodId: method.methodId,
            name: method.name,
            icon: method.icon,
            description: method.description,
            requiresShipping: method.requiresShipping ?? true,
            sortOrder: index,
          },
          update: {
            name: method.name,
            icon: method.icon,
            description: method.description,
            requiresShipping: method.requiresShipping ?? true,
            sortOrder: index,
          },
        })
      )
    );

    // Return in the same format as before
    const data = results.map((r) => ({
      id: r.methodId,
      name: r.name,
      icon: r.icon,
      description: r.description,
      requiresShipping: r.requiresShipping,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating payment methods:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar los métodos de pago" },
      { status: 500 }
    );
  }
});
