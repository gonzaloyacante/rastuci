import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ShippingOptionSchema = z.object({
  optionId: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().min(0),
  estimatedDays: z.string(),
});

const ShippingOptionsSchema = z.array(ShippingOptionSchema).min(1);

// GET /api/settings/shipping-options - Obtener opciones de envío
export async function GET() {
  try {
    const options = await prisma.shipping_options.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    if (options.length === 0) {
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

    // Map to API response format
    const data = options.map((o) => ({
      id: o.optionId,
      name: o.name,
      description: o.description,
      price: Number(o.price),
      estimatedDays: o.estimatedDays,
    }));

    return NextResponse.json({ success: true, data });
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

    // Upsert each shipping option
    const results = await prisma.$transaction(
      validated.map((option, index) =>
        prisma.shipping_options.upsert({
          where: { optionId: option.optionId },
          create: {
            optionId: option.optionId,
            name: option.name,
            description: option.description,
            price: option.price,
            estimatedDays: option.estimatedDays,
            sortOrder: index,
          },
          update: {
            name: option.name,
            description: option.description,
            price: option.price,
            estimatedDays: option.estimatedDays,
            sortOrder: index,
          },
        })
      )
    );

    const data = results.map((r) => ({
      id: r.optionId,
      name: r.name,
      description: r.description,
      price: Number(r.price),
      estimatedDays: r.estimatedDays,
    }));

    return NextResponse.json({ success: true, data });
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
