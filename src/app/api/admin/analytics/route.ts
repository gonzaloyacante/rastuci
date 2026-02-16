import { NextRequest } from "next/server";
import { analyticsService, DateRange } from "@/services/analytics-service";
import { ok, fail } from "@/lib/apiResponse";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = (searchParams.get("range") || "today") as DateRange;

    const data = await analyticsService.getDashboardData(range);

    return ok(data);
  } catch (error) {
    logger.error("GET /api/admin/analytics failed", { error });
    return fail("INTERNAL_ERROR", "No se pudieron cargar las analíticas", 500);
  }
}
