import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { ok, fail } from "@/lib/apiResponse";

export async function GET() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Run all queries in parallel for performance
    const [
      // Session counts
      sessionsToday,
      sessionsWeek,
      sessionsMonth,
      sessionsTotal,

      // Conversion metrics
      conversionsToday,
      conversionsWeek,
      conversionsMonth,

      // Revenue
      revenueToday,
      revenueWeek,
      revenueMonth,

      // Device breakdown
      deviceBreakdown,

      // Top pages (from events)
      topPages,

      // Top searches
      topSearches,

      // Abandoned carts
      abandonedCartsCount,
      abandonedCartsValue,

      // Recent sessions with activity
      recentSessions,

      // Sessions over time (last 7 days)
      sessionsOverTime,
    ] = await Promise.all([
      // Session counts
      prisma.analytics_sessions.count({
        where: { startedAt: { gte: today } },
      }),
      prisma.analytics_sessions.count({
        where: { startedAt: { gte: weekAgo } },
      }),
      prisma.analytics_sessions.count({
        where: { startedAt: { gte: monthAgo } },
      }),
      prisma.analytics_sessions.count(),

      // Conversions
      prisma.analytics_sessions.count({
        where: { startedAt: { gte: today }, isConverted: true },
      }),
      prisma.analytics_sessions.count({
        where: { startedAt: { gte: weekAgo }, isConverted: true },
      }),
      prisma.analytics_sessions.count({
        where: { startedAt: { gte: monthAgo }, isConverted: true },
      }),

      // Revenue
      prisma.analytics_sessions.aggregate({
        where: { startedAt: { gte: today }, isConverted: true },
        _sum: { conversionValue: true },
      }),
      prisma.analytics_sessions.aggregate({
        where: { startedAt: { gte: weekAgo }, isConverted: true },
        _sum: { conversionValue: true },
      }),
      prisma.analytics_sessions.aggregate({
        where: { startedAt: { gte: monthAgo }, isConverted: true },
        _sum: { conversionValue: true },
      }),

      // Device breakdown
      prisma.analytics_sessions.groupBy({
        by: ["deviceType"],
        where: { startedAt: { gte: monthAgo } },
        _count: { id: true },
      }),

      // Top pages
      prisma.analytics_events.groupBy({
        by: ["pageUrl"],
        where: {
          eventName: "page_view",
          createdAt: { gte: weekAgo },
          pageUrl: { not: null },
        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),

      // Top searches
      prisma.search_analytics.groupBy({
        by: ["query"],
        where: { createdAt: { gte: weekAgo } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),

      // Abandoned carts
      prisma.cart_abandonment.count({
        where: { recoveredAt: null },
      }),
      prisma.cart_abandonment.aggregate({
        where: { recoveredAt: null },
        _sum: { cartValue: true },
      }),

      // Recent sessions
      prisma.analytics_sessions.findMany({
        where: { startedAt: { gte: today } },
        orderBy: { startedAt: "desc" },
        take: 10,
        select: {
          id: true,
          startedAt: true,
          pageViews: true,
          deviceType: true,
          entryPage: true,
          isConverted: true,
          conversionValue: true,
        },
      }),

      // Sessions per day (last 7 days)
      prisma.$queryRaw`
        SELECT 
          DATE("startedAt") as date,
          COUNT(*) as sessions,
          SUM(CASE WHEN "isConverted" = true THEN 1 ELSE 0 END) as conversions
        FROM analytics_sessions
        WHERE "startedAt" >= ${weekAgo}
        GROUP BY DATE("startedAt")
        ORDER BY date ASC
      ` as Promise<
        Array<{ date: Date; sessions: bigint; conversions: bigint }>
      >,
    ]);

    // Calculate conversion rates
    const conversionRateToday =
      sessionsToday > 0 ? (conversionsToday / sessionsToday) * 100 : 0;
    const conversionRateWeek =
      sessionsWeek > 0 ? (conversionsWeek / sessionsWeek) * 100 : 0;
    const conversionRateMonth =
      sessionsMonth > 0 ? (conversionsMonth / sessionsMonth) * 100 : 0;

    return ok({
      overview: {
        sessions: {
          today: sessionsToday,
          week: sessionsWeek,
          month: sessionsMonth,
          total: sessionsTotal,
        },
        conversions: {
          today: conversionsToday,
          week: conversionsWeek,
          month: conversionsMonth,
        },
        conversionRate: {
          today: Math.round(conversionRateToday * 100) / 100,
          week: Math.round(conversionRateWeek * 100) / 100,
          month: Math.round(conversionRateMonth * 100) / 100,
        },
        revenue: {
          today: revenueToday._sum.conversionValue || 0,
          week: revenueWeek._sum.conversionValue || 0,
          month: revenueMonth._sum.conversionValue || 0,
        },
      },
      devices: deviceBreakdown.map((d) => ({
        type: d.deviceType || "unknown",
        count: d._count.id,
      })),
      topPages: topPages.map((p) => ({
        url: p.pageUrl,
        views: p._count.id,
      })),
      topSearches: topSearches.map((s) => ({
        query: s.query,
        count: s._count.id,
      })),
      abandonment: {
        count: abandonedCartsCount,
        value: abandonedCartsValue._sum.cartValue || 0,
      },
      recentSessions,
      sessionsOverTime: sessionsOverTime.map((s) => ({
        date: s.date,
        sessions: Number(s.sessions),
        conversions: Number(s.conversions),
      })),
    });
  } catch (error) {
    logger.error("Analytics dashboard API error:", { error });
    return fail("INTERNAL_ERROR", "Error al obtener analíticas", 500);
  }
}
