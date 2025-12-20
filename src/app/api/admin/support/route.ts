/**
 * Support API - Gestión de soporte al cliente
 *
 * NOTA: Esta API está preparada para usar Prisma cuando se agreguen
 * las tablas SupportTicket, ChatSession y FAQ al schema.
 * Por ahora retorna estructuras vacías hasta que se implemente la BD.
 */

import { withAdminAuth } from "@/lib/adminAuth";
import { NextRequest, NextResponse } from "next/server";

// Tipos para la API
interface SupportStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  avgResponseTime: number;
  satisfactionRate: number;
}

// GET - Obtener datos de soporte
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "stats";

    switch (type) {
      case "stats":
        const stats: SupportStats = {
          totalTickets: 0,
          openTickets: 0,
          resolvedTickets: 0,
          avgResponseTime: 0,
          satisfactionRate: 0,
        };
        return NextResponse.json({ success: true, data: stats });

      case "tickets":
        return NextResponse.json({ success: true, data: [] });

      case "chat":
        return NextResponse.json({ success: true, data: [] });

      case "faqs":
        return NextResponse.json({ success: true, data: [] });

      default:
        return NextResponse.json(
          { success: false, error: "Tipo no válido" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error en support API:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
});

// POST - Crear nuevo registro
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    await request.json();
    return NextResponse.json(
      {
        success: false,
        error:
          "Funcionalidad no disponible. Las tablas de soporte aún no están implementadas en la base de datos.",
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error en support POST:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
});

// PUT - Actualizar registro
export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    await request.json();
    return NextResponse.json(
      {
        success: false,
        error:
          "Funcionalidad no disponible. Las tablas de soporte aún no están implementadas en la base de datos.",
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error en support PUT:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
});

// DELETE - Eliminar registro
export const DELETE = withAdminAuth(async (_request: NextRequest) => {
  try {
    return NextResponse.json(
      {
        success: false,
        error:
          "Funcionalidad no disponible. Las tablas de soporte aún no están implementadas en la base de datos.",
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error en support DELETE:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
});
