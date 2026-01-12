import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
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
    // Obtener configuración de contacto para la ubicación
    const contactSetting = await prisma.settings.findUnique({
      where: { key: "contact" },
    });
    let locationString = "Buenos Aires";

    if (contactSetting?.value) {
      // Intentar parsear ubicación
      try {
        const contactData = JSON.parse(JSON.stringify(contactSetting.value));
        if (contactData?.address?.cityCountry) {
          locationString = contactData.address.cityCountry;
        }
      } catch (e) {
        // ignore parsing error
      }
    }

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

    // Si existen settings guardados, actualizamos la descripción del efectivo dinámicamente también
    // por si cambió la dirección pero no el método de pago
    const methods = setting.value as z.infer<typeof PaymentMethodsSchema>;
    const updatedMethods = methods.map((m) => {
      if (m.id === "cash") {
        return {
          ...m,
          description: `Retiro en nuestro local de ${locationString} - Sin costo de envío`,
        };
      }
      return m;
    });

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
