import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ShippingOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().min(0),
  estimatedDays: z.string(),
});

const ShippingOptionsSchema = z.array(ShippingOptionSchema).min(1);

// GET /api/settings/shipping-options - Obtener opciones de envío
export async function GET() {
  try {
    const setting = await prisma.settings.findUnique({
      where: { key: "shipping_options" },
    });

    if (!setting) {
      // Retornar opciones por defecto si no existen en DB
      return NextResponse.json({
        success: true,
        data: [
          {
            id: "pickup",
            name: "Retiro en tienda",
            description: "Retira tu pedido en nuestra tienda física",
            price: 0,
            estimatedDays: "Inmediato",
          },
          {
            id: "standard",
            name: "Envío estándar",
            description: "Envío a domicilio en 3-5 días hábiles",
            price: 1500,
            estimatedDays: "3-5 días",
          },
          {
            id: "express",
            name: "Envío express",
            description: "Envío prioritario en 24-48 horas",
            price: 2500,
            estimatedDays: "24-48 horas",
          },
        ],
      });
    }

    return NextResponse.json({ success: true, data: setting.value });
  } catch (error) {
    console.error("Error fetching shipping options:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener las opciones de envío" },
      { status: 500 }
    );
  }
}

// POST /api/settings/shipping-options - Crear/actualizar opciones (ADMIN ONLY)
export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const validated = ShippingOptionsSchema.parse(body);

    const setting = await prisma.settings.upsert({
      where: { key: "shipping_options" },
      create: {
        key: "shipping_options",
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
        { success: false, error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating shipping options:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar las opciones de envío" },
      { status: 500 }
    );
  }
});
