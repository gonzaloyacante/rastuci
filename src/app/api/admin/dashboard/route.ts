import { NextRequest, NextResponse } from "next/server";

import { withAdminAuth } from "@/lib/adminAuth";
import { getPeriodDates } from "@/lib/dashboard/periods";
import { buildDashboard } from "@/lib/dashboard/queries";
import type { MetricsDashboard } from "@/lib/dashboard/types";
import { MetricsQuerySchema } from "@/lib/dashboard/types";
import { logger } from "@/lib/logger";
import type { ApiResponse } from "@/types";

export const GET = withAdminAuth(
  async (request: NextRequest): Promise<NextResponse> => {
    try {
      const { searchParams } = new URL(request.url);
      const params = {
        period: searchParams.get("period") || "month",
        startDate: searchParams.get("startDate") || undefined,
        endDate: searchParams.get("endDate") || undefined,
        metric: searchParams.get("metric") || undefined,
      };

      const validation = MetricsQuerySchema.safeParse(params);
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: "Parámetros inválidos",
          } satisfies ApiResponse<never>,
          { status: 400 }
        );
      }

      const { period } = validation.data;
      const { currentStart, currentEnd, previousStart, previousEnd } =
        getPeriodDates(period);

      const dashboard = await buildDashboard(
        currentStart,
        currentEnd,
        previousStart,
        previousEnd,
        period
      );

      return NextResponse.json({
        success: true,
        data: dashboard,
      } satisfies ApiResponse<MetricsDashboard>);
    } catch (error) {
      logger.error("Error en dashboard API:", { error });
      return NextResponse.json(
        {
          success: false,
          error: "Error interno del servidor",
        } satisfies ApiResponse<never>,
        { status: 500 }
      );
    }
  }
);

