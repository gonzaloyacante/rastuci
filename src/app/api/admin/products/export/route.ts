import { NextRequest, NextResponse } from "next/server";

import { withAdminAuth } from "@/lib/adminAuth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { escapeCsvCell } from "@/utils/formatters";

export const dynamic = "force-dynamic";

export const GET = withAdminAuth(async (_req: NextRequest) => {
  try {
    // 1. Fetch ALL products with necessary relations
    const products = await prisma.products.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        categories: true,
        product_variants: true,
      },
    });

    // 2. Define CSV Headers
    const headers = [
      "ID",
      "Nombre",
      "Categoría",
      "Precio",
      "Precio Oferta",
      "Stock Total",
      "En Oferta",
      "Activo",
      "Variantes (Color|Talle|Stock)",
      "Descripción",
    ];

    // 3. Transform Data to CSV Rows
    const csvRows = products.map((product) => {
      // Format variants as a single string: "Rojo|S|10; Azul|M|5"
      const variantsString = product.product_variants
        .map((v) => `${v.color}|${v.size}|${v.stock}`)
        .join("; ");

      return [
        escapeCsvCell(product.id),
        escapeCsvCell(product.name),
        escapeCsvCell(product.categories?.name),
        escapeCsvCell(product.price.toString()),
        escapeCsvCell(product.salePrice ? product.salePrice.toString() : ""),
        escapeCsvCell(product.stock.toString()),
        escapeCsvCell(product.onSale ? "SI" : "NO"),
        escapeCsvCell(product.isActive ? "SI" : "NO"),
        escapeCsvCell(variantsString),
        escapeCsvCell((product.description || "").replace(/\n/g, " ")),
      ].join(",");
    });

    // 4. Combine Headers and Rows
    const csvContent = [headers.join(","), ...csvRows].join("\n");

    // 5. Return as CSV File
    const filename = `productos_export_${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    logger.error("Error exporting products:", { error });
    return new NextResponse("Error generating CSV", { status: 500 });
  }
});
