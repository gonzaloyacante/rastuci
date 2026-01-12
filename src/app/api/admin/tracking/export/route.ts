import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/adminAuth";

interface OrderForExport {
  id: string;
  trackingNumber?: string | null;
  status: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerAddress?: string | null;
  createdAt: Date;
  updatedAt: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  total?: any;
}

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...orders.map((order: any) =>
          [
            order.id,
            order.trackingNumber || "",
            order.status,
            order.customerName || "",
            order.customerEmail || "",
            order.customerAddress || "",
            order.createdAt.toISOString().split("T")[0],
            order.updatedAt.toISOString().split("T")[0],
            order.total ? Number(order.total).toString() : "0",
          ]
            .map((field: string) => `"${field}"`)
            .join(",")
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
