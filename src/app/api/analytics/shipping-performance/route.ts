import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ShippingPerformanceData {
  correoArgentino: {
    totalShipments: number;
    deliveredShipments: number;
    pendingShipments: number;
    averageDeliveryTime: number; // días
    successRate: number; // porcentaje
    timelyDelivery: number; // porcentaje de entregas a tiempo
  };
  delivery: {
    averageDeliveryTime: number;
    onTimeDeliveryRate: number;
    delayedShipments: number;
  };
  costs: {
    averageShippingCost: number;
    totalRevenue: number;
    shippingRevenue: number;
  };
  trends: {
    dailyShipments: Array<{
      date: string;
      count: number;
      delivered: number;
    }>;
    monthlyGrowth: number;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const period = searchParams.get("period") || "month"; // day, week, month, year

    // Calcular rango de fechas
    const now = new Date();
    const start = startDate ? new Date(startDate) : getPeriodStart(period, now);
    const end = endDate ? new Date(endDate) : now;

    // Obtener pedidos con envío de Correo Argentino
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        trackingNumber: { not: null },
      },
      select: {
        id: true,
        status: true,
        total: true,
        shippingCost: true,
        createdAt: true,
        updatedAt: true,
        trackingNumber: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calcular métricas de Correo Argentino
    const totalShipments = orders.length;
    const deliveredShipments = orders.filter(
      (o) => o.status === "DELIVERED"
    ).length;
    const pendingShipments = orders.filter(
      (o) => o.status === "PENDING" || o.status === "PROCESSED"
    ).length;

    // Calcular tiempo promedio de entrega (solo para pedidos entregados)
    const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");
    const averageDeliveryTime =
      deliveredOrders.length > 0
        ? deliveredOrders.reduce((sum, order) => {
            const deliveryTime =
              (order.updatedAt.getTime() - order.createdAt.getTime()) /
              (1000 * 60 * 60 * 24);
            return sum + deliveryTime;
          }, 0) / deliveredOrders.length
        : 0;

    const successRate = totalShipments > 0
      ? (deliveredShipments / totalShipments) * 100
      : 0;

    // Entregas a tiempo (estimado: < 5 días)
    const onTimeDeliveries = deliveredOrders.filter((order) => {
      const deliveryTime =
        (order.updatedAt.getTime() - order.createdAt.getTime()) /
        (1000 * 60 * 60 * 24);
      return deliveryTime <= 5;
    }).length;

    const timelyDelivery = deliveredOrders.length > 0
      ? (onTimeDeliveries / deliveredOrders.length) * 100
      : 0;

    // Envíos retrasados
    const delayedShipments = deliveredOrders.filter((order) => {
      const deliveryTime =
        (order.updatedAt.getTime() - order.createdAt.getTime()) /
        (1000 * 60 * 60 * 24);
      return deliveryTime > 5;
    }).length;

    // Costos y revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const shippingRevenue = orders.reduce(
      (sum, order) => sum + (order.shippingCost || 0),
      0
    );
    const averageShippingCost =
      totalShipments > 0 ? shippingRevenue / totalShipments : 0;

    // Tendencias diarias
    const dailyShipments = calculateDailyShipments(orders, start, end);

    // Crecimiento mensual
    const previousPeriodStart = new Date(start);
    previousPeriodStart.setDate(
      previousPeriodStart.getDate() -
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    const previousOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: previousPeriodStart,
          lt: start,
        },
        trackingNumber: { not: null },
      },
    });

    const monthlyGrowth =
      previousOrders > 0
        ? ((totalShipments - previousOrders) / previousOrders) * 100
        : 0;

    const performanceData: ShippingPerformanceData = {
      correoArgentino: {
        totalShipments,
        deliveredShipments,
        pendingShipments,
        averageDeliveryTime: Math.round(averageDeliveryTime * 10) / 10,
        successRate: Math.round(successRate * 10) / 10,
        timelyDelivery: Math.round(timelyDelivery * 10) / 10,
      },
      delivery: {
        averageDeliveryTime: Math.round(averageDeliveryTime * 10) / 10,
        onTimeDeliveryRate: Math.round(timelyDelivery * 10) / 10,
        delayedShipments,
      },
      costs: {
        averageShippingCost: Math.round(averageShippingCost * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        shippingRevenue: Math.round(shippingRevenue * 100) / 100,
      },
      trends: {
        dailyShipments,
        monthlyGrowth: Math.round(monthlyGrowth * 10) / 10,
      },
    };

    const response: ApiResponse<ShippingPerformanceData> = {
      success: true,
      data: performanceData,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<never> = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error interno del servidor",
    };

    return NextResponse.json(response, { status: 500 });
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

function calculateDailyShipments(
  orders: Array<{
    status: string;
    createdAt: Date;
  }>,
  start: Date,
  end: Date
): Array<{ date: string; count: number; delivered: number }> {
  const dailyMap = new Map<string, { count: number; delivered: number }>();

  // Inicializar todos los días en el rango
  const current = new Date(start);
  while (current <= end) {
    const dateKey = current.toISOString().split("T")[0];
    dailyMap.set(dateKey, { count: 0, delivered: 0 });
    current.setDate(current.getDate() + 1);
  }

  // Contar envíos por día
  orders.forEach((order) => {
    const dateKey = order.createdAt.toISOString().split("T")[0];
    const existing = dailyMap.get(dateKey);

    if (existing) {
      existing.count++;
      if (order.status === "DELIVERED") {
        existing.delivered++;
      }
    }
  });

  // Convertir a array
  return Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      count: data.count,
      delivered: data.delivered,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
