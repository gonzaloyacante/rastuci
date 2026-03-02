import { NextRequest, NextResponse } from "next/server";

import { withAdminAuth } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { escapeCsvCell } from "@/utils/formatters";

export const GET = withAdminAuth(
  async (_request: NextRequest): Promise<NextResponse> => {
    try {
      const orders = await prisma.orders.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      // Crear CSV content
      const headers = [
        "ID Pedido",
        "Código Tracking",
        "Estado",
        "Cliente",
        "Email",
        "Dirección de Envío",
        "Fecha Creación",
        "Última Actualización",
        "Total",
      ];

      const csvRows = [
        headers.join(","), // Header row
        ...orders.map((order) =>
          [
            escapeCsvCell(order.id),
            escapeCsvCell(order.trackingNumber || ""),
            escapeCsvCell(order.status),
            escapeCsvCell(order.customerName || ""),
            escapeCsvCell(order.customerEmail || ""),
            escapeCsvCell(order.customerAddress || ""),
            escapeCsvCell(order.createdAt.toISOString().split("T")[0]),
            escapeCsvCell(order.updatedAt.toISOString().split("T")[0]),
            escapeCsvCell(order.total ? Number(order.total).toString() : "0"),
          ].join(",")
        ),
      ];

      const csvContent = csvRows.join("\n");

      // Crear response con headers apropiados para descarga
      const response = new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="tracking-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });

      return response;
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Error interno del servidor",
        },
        { status: 500 }
      );
    }
  }
);
