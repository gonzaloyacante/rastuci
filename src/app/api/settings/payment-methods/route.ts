import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const PaymentMethodSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  description: z.string(),
  requiresShipping: z.boolean().optional(),
});

const PaymentMethodsSchema = z.array(PaymentMethodSchema).min(1);

// GET /api/settings/payment-methods - Obtener métodos de pago
export async function GET() {
  try {
    const setting = await prisma.settings.findUnique({
      where: { key: "payment_methods" },
    });

    if (!setting) {
      // Retornar métodos por defecto si no existen en DB
      return NextResponse.json({
        success: true,
        data: [
          {
            id: "mercadopago",
            name: "MercadoPago",
            icon: "wallet",
            description: "Tarjetas, transferencias y más - Redirección a MercadoPago",
            requiresShipping: true,
          },
          {
            id: "cash",
            name: "Efectivo - Retiro en Local",
            icon: "dollar-sign",
            description: "Retiro en nuestro local de Buenos Aires - Sin costo de envío",
            requiresShipping: false,
          },
        ],
      });
    }

    return NextResponse.json({ success: true, data: setting.value });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener los métodos de pago" },
      { status: 500 }
    );
  }
}

// POST /api/settings/payment-methods - Crear/actualizar métodos (solo admin)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = PaymentMethodsSchema.parse(body);

    const setting = await prisma.settings.upsert({
      where: { key: "payment_methods" },
      create: {
        key: "payment_methods",
        value: validated,
        updatedAt: new Date(),
      },
      update: {
        value: validated,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: setting.value });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating payment methods:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar los métodos de pago" },
      { status: 500 }
    );
  }
}
