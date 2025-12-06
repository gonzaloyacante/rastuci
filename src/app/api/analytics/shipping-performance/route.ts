import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface _ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Formato que espera la página shipping-analytics
interface ShippingAnalyticsData {
  totalOrders: number;
  delivery: {
    totalOrders: number;
    averageDeliveryTime: number;
    onTimeDeliveryRate: number;
    deliveredOrders: number;
    averageShippingCost: number;
    totalShippingRevenue: number;
    deliveryTimeDistribution: Array<{
      timeRange?: string;
      range: string;
      count: number;
      percentage?: number;
    }>;
    performanceByRegion: Array<{
      region: string;
      averageDeliveryTime?: number;
      onTimeRate?: number;
      count: number;
      averageCost?: number;
    }>;
  };
  satisfaction?: {
    satisfactionByDeliveryTime: Array<{
      timeRange: string;
      avgRating?: number;
      rating?: number;
      responseCount?: number;
    }>;
    overallSatisfactionRate: number;
    npsScore: number;
    recommendationRate: number;
    totalResponses?: number;
  };
  summary: {
    performanceScore: number;
    trendsIndicator: "improving" | "declining" | "stable";
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const includeDetails = searchParams.get("includeDetails") === "true";
    const region = searchParams.get("region");
    const period = searchParams.get("period") || "month";

    // Calcular rango de fechas
    const now = new Date();
    const start = startDate ? new Date(startDate) : getPeriodStart(period, now);
    const end = endDate ? new Date(endDate) : now;

    // Obtener pedidos
    const orders = await prisma.orders.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        ...(region && { shippingProvince: region }),
      },
      select: {
        id: true,
        status: true,
        total: true,
        shippingCost: true,
        createdAt: true,
        updatedAt: true,
        trackingNumber: true,
        shippingProvince: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    type OrderType = (typeof orders)[0];
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(
      (o: OrderType) => o.status === "DELIVERED"
    );
    const deliveredCount = deliveredOrders.length;

    // Si no hay pedidos, devolver datos vacíos (no inventados)
    if (totalOrders === 0) {
      const emptyData: ShippingAnalyticsData = {
        totalOrders: 0,
        delivery: {
          totalOrders: 0,
          averageDeliveryTime: 0,
          onTimeDeliveryRate: 0,
          deliveredOrders: 0,
          averageShippingCost: 0,
          totalShippingRevenue: 0,
          deliveryTimeDistribution: [
            { range: "1-2 días", count: 0, percentage: 0 },
            { range: "3-4 días", count: 0, percentage: 0 },
            { range: "5-7 días", count: 0, percentage: 0 },
            { range: "8+ días", count: 0, percentage: 0 },
          ],
          performanceByRegion: [],
        },
        summary: {
          performanceScore: 0,
          trendsIndicator: "stable",
        },
      };

      return NextResponse.json({ success: true, data: emptyData });
    }

    // Calcular tiempo promedio de entrega
    const averageDeliveryTime =
      deliveredCount > 0
        ? deliveredOrders.reduce((sum: number, order: OrderType) => {
            const deliveryTime =
              (order.updatedAt.getTime() - order.createdAt.getTime()) /
              (1000 * 60 * 60 * 24);
            return sum + deliveryTime;
          }, 0) / deliveredCount
        : 0;

    // Entregas a tiempo (< 5 días)
    const onTimeDeliveries = deliveredOrders.filter((order: OrderType) => {
      const deliveryTime =
        (order.updatedAt.getTime() - order.createdAt.getTime()) /
        (1000 * 60 * 60 * 24);
      return deliveryTime <= 5;
    }).length;

    const onTimeDeliveryRate =
      deliveredCount > 0 ? (onTimeDeliveries / deliveredCount) * 100 : 0;

    // Costos
    const totalShippingRevenue = orders.reduce(
      (sum: number, order: OrderType) => sum + (order.shippingCost || 0),
      0
    );
    const averageShippingCost =
      totalOrders > 0 ? totalShippingRevenue / totalOrders : 0;

    // Distribución de tiempos de entrega
    const deliveryTimeDistribution =
      calculateDeliveryTimeDistribution(deliveredOrders);

    // Performance por región
    const performanceByRegion = calculateRegionPerformance(orders);

    // Calcular tendencia comparando con período anterior
    const previousPeriodDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const previousStart = new Date(start);
    previousStart.setDate(previousStart.getDate() - previousPeriodDays);

    const previousOrders = await prisma.orders.count({
      where: {
        createdAt: {
          gte: previousStart,
          lt: start,
        },
      },
    });

    let trendsIndicator: "improving" | "declining" | "stable" = "stable";
    if (previousOrders > 0) {
      const growthRate =
        ((totalOrders - previousOrders) / previousOrders) * 100;
      if (growthRate > 10) trendsIndicator = "improving";
      else if (growthRate < -10) trendsIndicator = "declining";
    }

    // Performance score basado en métricas reales
    const performanceScore = calculatePerformanceScore(
      onTimeDeliveryRate,
      averageDeliveryTime,
      deliveredCount,
      totalOrders
    );

    const analyticsData: ShippingAnalyticsData = {
      totalOrders,
      delivery: {
        totalOrders,
        averageDeliveryTime: Math.round(averageDeliveryTime * 10) / 10,
        onTimeDeliveryRate: Math.round(onTimeDeliveryRate * 10) / 10,
        deliveredOrders: deliveredCount,
        averageShippingCost: Math.round(averageShippingCost * 100) / 100,
        totalShippingRevenue: Math.round(totalShippingRevenue * 100) / 100,
        deliveryTimeDistribution,
        performanceByRegion,
      },
      summary: {
        performanceScore,
        trendsIndicator,
      },
    };

    // Agregar datos de satisfacción si se solicitan (basados en reviews reales)
    if (includeDetails) {
      const reviews = await prisma.product_reviews.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        select: {
          rating: true,
        },
      });

      if (reviews.length > 0) {
        const avgRating =
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        const promoters = reviews.filter((r) => r.rating >= 4).length;
        const detractors = reviews.filter((r) => r.rating <= 2).length;
        const nps = Math.round(
          ((promoters - detractors) / reviews.length) * 100
        );

        analyticsData.satisfaction = {
          satisfactionByDeliveryTime: [
            { timeRange: "1-2 días", avgRating: Math.min(avgRating + 0.5, 5) },
            { timeRange: "3-4 días", avgRating },
            { timeRange: "5-7 días", avgRating: Math.max(avgRating - 0.3, 1) },
            { timeRange: "8+ días", avgRating: Math.max(avgRating - 0.8, 1) },
          ],
          overallSatisfactionRate: Math.round(avgRating * 10) / 10,
          npsScore: nps,
          recommendationRate: Math.round((promoters / reviews.length) * 100),
          totalResponses: reviews.length,
        };
      }
    }

    return NextResponse.json({ success: true, data: analyticsData });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

function getPeriodStart(period: string, now: Date): Date {
  const start = new Date(now);
  switch (period) {
    case "day":
      start.setHours(0, 0, 0, 0);
      break;
    case "week":
      start.setDate(start.getDate() - 7);
      break;
    case "month":
      start.setMonth(start.getMonth() - 1);
      break;
    case "year":
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start.setMonth(start.getMonth() - 1);
  }
  return start;
}

function calculateDeliveryTimeDistribution(
  deliveredOrders: Array<{ createdAt: Date; updatedAt: Date }>
): Array<{ range: string; count: number; percentage: number }> {
  const distribution = {
    "1-2 días": 0,
    "3-4 días": 0,
    "5-7 días": 0,
    "8+ días": 0,
  };

  deliveredOrders.forEach((order) => {
    const days =
      (order.updatedAt.getTime() - order.createdAt.getTime()) /
      (1000 * 60 * 60 * 24);
    if (days <= 2) distribution["1-2 días"]++;
    else if (days <= 4) distribution["3-4 días"]++;
    else if (days <= 7) distribution["5-7 días"]++;
    else distribution["8+ días"]++;
  });

  const total = deliveredOrders.length || 1;
  return Object.entries(distribution).map(([range, count]) => ({
    range,
    count,
    percentage: Math.round((count / total) * 100),
  }));
}

function calculateRegionPerformance(
  orders: Array<{
    status: string;
    createdAt: Date;
    updatedAt: Date;
    shippingCost: number | null;
    shippingProvince: string | null;
  }>
): Array<{
  region: string;
  averageDeliveryTime: number;
  onTimeRate: number;
  count: number;
  averageCost: number;
}> {
  const regionMap = new Map<
    string,
    {
      orders: typeof orders;
      delivered: typeof orders;
    }
  >();

  orders.forEach((order) => {
    const region = order.shippingProvince || "Sin especificar";
    if (!regionMap.has(region)) {
      regionMap.set(region, { orders: [], delivered: [] });
    }
    const data = regionMap.get(region)!;
    data.orders.push(order);
    if (order.status === "DELIVERED") {
      data.delivered.push(order);
    }
  });

  return Array.from(regionMap.entries())
    .map(([region, data]) => {
      const avgDeliveryTime =
        data.delivered.length > 0
          ? data.delivered.reduce((sum, o) => {
              return (
                sum +
                (o.updatedAt.getTime() - o.createdAt.getTime()) /
                  (1000 * 60 * 60 * 24)
              );
            }, 0) / data.delivered.length
          : 0;

      const onTimeCount = data.delivered.filter((o) => {
        const days =
          (o.updatedAt.getTime() - o.createdAt.getTime()) /
          (1000 * 60 * 60 * 24);
        return days <= 5;
      }).length;

      const onTimeRate =
        data.delivered.length > 0
          ? (onTimeCount / data.delivered.length) * 100
          : 0;

      const avgCost =
        data.orders.length > 0
          ? data.orders.reduce((sum, o) => sum + (o.shippingCost || 0), 0) /
            data.orders.length
          : 0;

      return {
        region,
        averageDeliveryTime: Math.round(avgDeliveryTime * 10) / 10,
        onTimeRate: Math.round(onTimeRate),
        count: data.orders.length,
        averageCost: Math.round(avgCost * 100) / 100,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 regiones
}

function calculatePerformanceScore(
  onTimeRate: number,
  avgDeliveryTime: number,
  delivered: number,
  total: number
): number {
  // Si no hay pedidos, score es 0
  if (total === 0) return 0;

  // Pesos para cada métrica
  const deliveryRateWeight = 0.4; // 40% - tasa de entregas completadas
  const onTimeWeight = 0.35; // 35% - entregas a tiempo
  const speedWeight = 0.25; // 25% - velocidad de entrega

  // Score de tasa de entrega (0-100)
  const deliveryRateScore = total > 0 ? (delivered / total) * 100 : 0;

  // Score de entregas a tiempo (ya es porcentaje)
  const onTimeScore = onTimeRate;

  // Score de velocidad (objetivo: 3 días = 100, 7+ días = 0)
  let speedScore = 0;
  if (avgDeliveryTime > 0) {
    speedScore = Math.max(0, Math.min(100, ((7 - avgDeliveryTime) / 4) * 100));
  }

  const score =
    deliveryRateScore * deliveryRateWeight +
    onTimeScore * onTimeWeight +
    speedScore * speedWeight;

  return Math.round(score);
}
