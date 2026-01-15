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
    const faqs = await prisma.faq_items.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        question: true,
        answer: true,
      },
    });

    if (faqs.length === 0) {
      // Return default FAQs if none exist
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

    return NextResponse.json({ success: true, data: faqs });
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

    // Use transaction to delete all and recreate
    await prisma.$transaction(async (tx) => {
      // Delete all existing FAQs
      await tx.faq_items.deleteMany({});

      // Create new FAQs
      if (validated.length > 0) {
        await tx.faq_items.createMany({
          data: validated.map((faq, index) => ({
            question: faq.question,
            answer: faq.answer,
            sortOrder: index,
            isActive: true,
          })),
        });
      }
    });

    // Fetch the updated FAQs
    const faqs = await prisma.faq_items.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        question: true,
        answer: true,
      },
    });

    return NextResponse.json({ success: true, data: faqs });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating FAQs:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar las preguntas frecuentes",
      },
      { status: 500 }
    );
  }
});
