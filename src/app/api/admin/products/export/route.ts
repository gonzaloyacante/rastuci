import { NextRequest, NextResponse } from "next/server";

import { withAdminAuth } from "@/lib/adminAuth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

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
        product.id,
        `"${(product.name || "").replace(/"/g, '""')}"`, // Escape quotes
        `"${(product.categories?.name || "").replace(/"/g, '""')}"`,
        product.price.toString(),
        product.salePrice ? product.salePrice.toString() : "",
        product.stock.toString(),
        product.onSale ? "SI" : "NO",
        product.isActive ? "SI" : "NO",
        `"${variantsString}"`,
        `"${(product.description || "").replace(/"/g, '""').replace(/\n/g, " ")}"`, // Escape quotes & newlines
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
