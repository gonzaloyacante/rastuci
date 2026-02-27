import { NextRequest } from "next/server";

import { withAdminAuth } from "@/lib/adminAuth";
import { fail, ok } from "@/lib/apiResponse";
import { logger } from "@/lib/logger";
import { analyticsService, DateRange } from "@/services/analytics-service";

export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const range = (searchParams.get("range") || "today") as DateRange;

    const data = await analyticsService.getDashboardData(range);

    return ok(data);
  } catch (error) {
    logger.error("GET /api/admin/analytics failed", { error });
    return fail("INTERNAL_ERROR", "No se pudieron cargar las analíticas", 500);
  }
});
