import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 min cache

export async function GET() {
  try {
    const [sizesRaw, colorsRaw] = await Promise.all([
      prisma.product_variants.findMany({
        where: { stock: { gt: 0 } },
        select: { size: true },
        distinct: ["size"],
        orderBy: { size: "asc" },
      }),
      prisma.product_variants.findMany({
        where: { stock: { gt: 0 } },
        select: { color: true },
        distinct: ["color"],
        orderBy: { color: "asc" },
      }),
    ]);

    const sizes = sizesRaw.map((v) => v.size).filter(Boolean);
    const colors = colorsRaw.map((v) => v.color).filter(Boolean) as string[];

    return NextResponse.json({ sizes, colors });
  } catch (error) {
    logger.error("Error fetching product facets", { error });
    return NextResponse.json({ sizes: [], colors: [] }, { status: 500 });
  }
}
