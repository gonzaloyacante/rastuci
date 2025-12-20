import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const FaqSchema = z.object({
  question: z.string().min(1).max(160),
  answer: z.string().min(1).max(400),
});

const FaqsSettingsSchema = z.array(FaqSchema).min(0).max(20);

// GET /api/settings/faqs - Obtener FAQs
export async function GET() {
  try {
    const setting = await prisma.settings.findUnique({
      where: { key: "faqs" },
    });

    if (!setting) {
      // Retornar FAQs por defecto si no existen en DB
      return NextResponse.json({
        success: true,
        data: [
          {
            question: "¿Cuál es el tiempo de entrega?",
            answer:
              "Los envíos a todo el país tardan entre 3 a 7 días hábiles, dependiendo de la ubicación.",
          },
          {
            question: "¿Puedo cambiar o devolver un producto?",
            answer:
              "Sí, aceptamos cambios y devoluciones dentro de los 30 días posteriores a la compra.",
          },
          {
            question: "¿Qué métodos de pago aceptan?",
            answer:
              "Aceptamos todas las tarjetas de crédito y débito, transferencias bancarias y efectivo.",
          },
          {
            question: "¿Las prendas vienen con garantía?",
            answer:
              "Todas nuestras prendas cuentan con garantía de calidad por defectos de fabricación.",
          },
        ],
      });
    }

    return NextResponse.json({ success: true, data: setting.value });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener las preguntas frecuentes" },
      { status: 500 }
    );
  }
}

// POST /api/settings/faqs - Crear/actualizar FAQs (ADMIN ONLY)
export const POST = withAdminAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const validated = FaqsSettingsSchema.parse(body);

    const setting = await prisma.settings.upsert({
      where: { key: "faqs" },
      create: {
        key: "faqs",
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
    console.error("Error updating FAQs:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar las preguntas frecuentes" },
      { status: 500 }
    );
  }
});
