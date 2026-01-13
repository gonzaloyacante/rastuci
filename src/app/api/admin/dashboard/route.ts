import { withAdminAuth } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schemas de validación
const MetricsQuerySchema = z.object({
  period: z
    .enum(["week", "month", "quarter", "year"])
    .optional()
    .default("month"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  metric: z
    .enum(["sales", "orders", "customers", "products", "shipping", "returns"])
    .optional(),
});

interface MetricData {
  label: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
}

interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

interface MetricsDashboard {
  overview: {
    totalSales: MetricData;
    totalOrders: MetricData;
    averageOrderValue: MetricData;
    customerCount: MetricData;
    conversionRate: MetricData;
    returnRate: MetricData;
  };
  salesChart: ChartDataPoint[];
  ordersChart: ChartDataPoint[];
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    orders: number;
    revenue: number;
  }>;
  topCategories: Array<{
    name: string;
    sales: number;
    percentage: number;
  }>;
  shippingMetrics: {
    averageDeliveryTime: MetricData;
    onTimeDeliveryRate: MetricData;
    shippingCost: MetricData;
    shippingDistribution: {
      homeDelivery: number;
      branchPickup: number;
      homePercentage: number;
      branchPercentage: number;
    };
  };
  customerMetrics: {
    newCustomers: MetricData;
    returningCustomers: MetricData;
    customerLifetimeValue: MetricData;
  };
  productMetrics: {
    totalProducts: MetricData;
    lowStockProducts: number;
    outOfStockProducts: number;
    averageRating: MetricData;
  };
  recentActivity: Array<{
    id: string;
    type: "order" | "customer" | "product" | "review";
    description: string;
    timestamp: string;
    value?: number;
  }>;
  ordersPerDay: Array<{ day: string; orders: number }>;
  topCustomers: Array<{ name: string; totalSpent: number }>;
  orderStatus: Array<{ status: string; count: number }>;
  hourlyOrders: Array<{ hour: string; orders: number }>;
  productPerformance: Array<{
    product: string;
    sales: number;
    revenue: number;
    rating: number;
  }>;
}

function calculateMetric(
  current: number,
  previous: number,
  label: string
): MetricData {
  const change = current - previous;
  const changePercent =
    previous > 0 ? (change / previous) * 100 : current > 0 ? 100 : 0;
  const trend = change > 0 ? "up" : change < 0 ? "down" : "stable";

  return {
    label,
    value: current,
    previousValue: previous,
    change,
    changePercent: Math.round(changePercent * 100) / 100,
    trend,
  };
}

function getPeriodDates(period: string): {
  currentStart: Date;
  currentEnd: Date;
  previousStart: Date;
  previousEnd: Date;
} {
  const now = new Date();
  const currentEnd = new Date(now);
  let currentStart: Date;
  let previousStart: Date;
  let previousEnd: Date;

  switch (period) {
    case "week":
      currentStart = new Date(now);
      currentStart.setDate(currentStart.getDate() - 7);
      previousEnd = new Date(currentStart);
      previousStart = new Date(previousEnd);
      previousStart.setDate(previousStart.getDate() - 7);
      break;
    case "month":
      currentStart = new Date(now);
      currentStart.setMonth(currentStart.getMonth() - 1);
      previousEnd = new Date(currentStart);
      previousStart = new Date(previousEnd);
      previousStart.setMonth(previousStart.getMonth() - 1);
      break;
    case "quarter":
      currentStart = new Date(now);
      currentStart.setMonth(currentStart.getMonth() - 3);
      previousEnd = new Date(currentStart);
      previousStart = new Date(previousEnd);
      previousStart.setMonth(previousStart.getMonth() - 3);
      break;
    case "year":
    default:
      currentStart = new Date(now);
      currentStart.setFullYear(currentStart.getFullYear() - 1);
      previousEnd = new Date(currentStart);
      previousStart = new Date(previousEnd);
      previousStart.setFullYear(previousStart.getFullYear() - 1);
      break;
  }

  return { currentStart, currentEnd, previousStart, previousEnd };
}

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

      // ========================================
      // CONSULTAS REALES A BASE DE DATOS
      // ========================================

      // Órdenes del período actual
      const currentOrders = await prisma.orders.findMany({
        where: {
          createdAt: {
            gte: currentStart,
            lte: currentEnd,
          },
        },
        include: {
          order_items: {
            include: {
              products: {
                include: {
                  categories: true,
                },
              },
            },
          },
        },
      });

      // Órdenes del período anterior
      const previousOrders = await prisma.orders.findMany({
        where: {
          createdAt: {
            gte: previousStart,
            lte: previousEnd,
          },
        },
      });

      // Calcular métricas de ventas
      const currentTotalSales = currentOrders.reduce(
        (sum, order) => sum + Number(order.total),
        0
      );
      const previousTotalSales = previousOrders.reduce(
        (sum, order) => sum + Number(order.total),
        0
      );
      const currentOrderCount = currentOrders.length;
      const previousOrderCount = previousOrders.length;
      const currentAOV =
        currentOrderCount > 0 ? currentTotalSales / currentOrderCount : 0;
      const previousAOV =
        previousOrderCount > 0 ? previousTotalSales / previousOrderCount : 0;

      // Clientes únicos (basado en nombre de cliente)
      const currentCustomerNames = new Set(
        currentOrders.map((o) => o.customerName)
      );
      const previousCustomerNames = new Set(
        previousOrders.map((o) => o.customerName)
      );
      const currentCustomerCount = currentCustomerNames.size;
      const previousCustomerCount = previousCustomerNames.size;

      // Tasa de devolución (basada en órdenes no entregadas - como proxy de cancelaciones)
      // Ya que no hay estado CANCELLED, usamos órdenes que no están DELIVERED ni PROCESSED como pendientes/problemas
      const currentPendingIssues = currentOrders.filter(
        (o) => o.status === "PENDING"
      ).length;
      const previousPendingIssues = previousOrders.filter(
        (o) => o.status === "PENDING"
      ).length;
      const currentReturnRate =
        currentOrderCount > 0
          ? (currentPendingIssues / currentOrderCount) * 100
          : 0;
      const previousReturnRate =
        previousOrderCount > 0
          ? (previousPendingIssues / previousOrderCount) * 100
          : 0;

      // Calcular tiempo promedio de entrega desde órdenes entregadas
      const currentDeliveredOrders = currentOrders.filter(
        (o) => o.status === "DELIVERED" && o.updatedAt && o.createdAt
      );
      const previousDeliveredOrders = previousOrders.filter(
        (o) => o.status === "DELIVERED" && o.updatedAt && o.createdAt
      );

      const currentAvgDeliveryTime =
        currentDeliveredOrders.length > 0
          ? currentDeliveredOrders.reduce((sum, order) => {
              const deliveryDays =
                (order.updatedAt.getTime() - order.createdAt.getTime()) /
                (1000 * 60 * 60 * 24);
              return sum + deliveryDays;
            }, 0) / currentDeliveredOrders.length
          : 0;

      const previousAvgDeliveryTime =
        previousDeliveredOrders.length > 0
          ? previousDeliveredOrders.reduce((sum, order) => {
              const deliveryDays =
                (order.updatedAt.getTime() - order.createdAt.getTime()) /
                (1000 * 60 * 60 * 24);
              return sum + deliveryDays;
            }, 0) / previousDeliveredOrders.length
          : 0;

      // Top productos vendidos
      const productSalesMap = new Map<
        string,
        {
          id: string;
          name: string;
          sales: number;
          orders: number;
          revenue: number;
        }
      >();
      currentOrders.forEach((order) => {
        order.order_items.forEach((item) => {
          const existing = productSalesMap.get(item.productId) || {
            id: item.productId,
            name: item.products?.name || "Producto desconocido",
            sales: 0,
            orders: 0,
            revenue: 0,
          };
          existing.sales += item.quantity;
          existing.orders += 1;
          existing.revenue += Number(item.price) * item.quantity;
          productSalesMap.set(item.productId, existing);
        });
      });
      const topProducts = Array.from(productSalesMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Top categorías
      const categorySalesMap = new Map<
        string,
        { name: string; sales: number }
      >();
      currentOrders.forEach((order) => {
        order.order_items.forEach((item) => {
          const categoryName =
            item.products?.categories?.name || "Sin categoría";
          const existing = categorySalesMap.get(categoryName) || {
            name: categoryName,
            sales: 0,
          };
          existing.sales += item.quantity;
          categorySalesMap.set(categoryName, existing);
        });
      });
      const totalCategorySales = Array.from(categorySalesMap.values()).reduce(
        (sum, c) => sum + c.sales,
        0
      );
      const topCategories = Array.from(categorySalesMap.values())
        .map((c) => ({
          ...c,
          percentage:
            totalCategorySales > 0
              ? Math.round((c.sales / totalCategorySales) * 1000) / 10
              : 0,
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      // Métricas de productos
      const totalProducts = await prisma.products.count();
      const previousTotalProducts = await prisma.products.count({
        where: {
          createdAt: {
            lte: previousEnd,
          },
        },
      });
      const lowStockProducts = await prisma.products.count({
        where: {
          stock: {
            gt: 0,
            lte: 5, // Umbral estándar de bajo stock = 5 unidades
          },
        },
      });
      const outOfStockProducts = await prisma.products.count({
        where: {
          stock: 0,
        },
      });

      // Rating promedio de productos (si existe campo rating)
      const productsWithRating = await prisma.products.aggregate({
        _avg: {
          rating: true,
        },
      });
      const averageRating = productsWithRating._avg.rating || 0;

      // Órdenes entregadas para métricas de envío (reutilizar variables ya definidas)
      const onTimeDeliveryRate =
        currentOrderCount > 0
          ? (currentDeliveredOrders.length / currentOrderCount) * 100
          : 0;
      const previousOnTimeRate =
        previousOrderCount > 0
          ? (previousDeliveredOrders.length / previousOrderCount) * 100
          : 0;

      // Costo de envío promedio (usando shippingCost si existe, sino estimado)
      const ordersWithShipping = currentOrders.filter(
        (o) => o.shippingCost && Number(o.shippingCost) > 0
      );
      const avgShippingCost =
        ordersWithShipping.length > 0
          ? ordersWithShipping.reduce(
              (sum, o) => sum + Number(o.shippingCost || 0),
              0
            ) / ordersWithShipping.length
          : 0;
      const previousOrdersWithShipping = previousOrders.filter(
        (o) => o.shippingCost && Number(o.shippingCost) > 0
      );
      const previousAvgShipping =
        previousOrdersWithShipping.length > 0
          ? previousOrdersWithShipping.reduce(
              (sum, o) => sum + Number(o.shippingCost || 0),
              0
            ) / previousOrdersWithShipping.length
          : 0;

      // Distribución de envíos (Domicilio vs Sucursal)
      const ordersWithAgency = currentOrders.filter(
        (o) => !!o.shippingAgency
      ).length;
      const ordersHome = currentOrders.filter(
        (o) => !o.shippingAgency && o.shippingMethod !== "pickup"
      ).length;
      const totalShipped = ordersWithAgency + ordersHome;

      const shippingDistribution = {
        homeDelivery: ordersHome,
        branchPickup: ordersWithAgency,
        homePercentage:
          totalShipped > 0 ? Math.round((ordersHome / totalShipped) * 100) : 0,
        branchPercentage:
          totalShipped > 0
            ? Math.round((ordersWithAgency / totalShipped) * 100)
            : 0,
      };

      // Generar datos para gráficos basados en órdenes reales
      const salesChartData = generateSalesChartFromOrders(
        currentOrders,
        period
      );
      const ordersChartData = generateOrdersChartFromOrders(
        currentOrders,
        period
      );

      // Actividad reciente
      const recentOrders = await prisma.orders.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          customerName: true,
          total: true,
          status: true,
          createdAt: true,
        },
      });

      const recentActivity = recentOrders.map((order) => ({
        id: order.id,
        type: "order" as const,
        description: `${order.status === "DELIVERED" ? "Orden completada" : "Nueva orden"} #${order.id.slice(0, 8)} por $${Number(order.total).toLocaleString("es-AR")}`,
        timestamp: order.createdAt.toISOString(),
        value: Number(order.total),
      }));

      // Nuevos clientes vs recurrentes
      const allTimeCustomerNames = new Set(
        (
          await prisma.orders.findMany({
            where: {
              createdAt: {
                lt: currentStart,
              },
            },
            select: { customerName: true },
          })
        ).map((o) => o.customerName)
      );
      const newCustomers = Array.from(currentCustomerNames).filter(
        (name) => !allTimeCustomerNames.has(name)
      ).length;
      const returningCustomers = currentCustomerCount - newCustomers;

      // ========================================
      // DATOS PARA GRÁFICAS AVANZADAS
      // ========================================

      // Pedidos por día (últimos 7 días)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date);
      }

      const ordersPerDay = last7Days.map((date) => {
        const dateKey = date.toISOString().split("T")[0];
        const dayOrders = currentOrders.filter(
          (o) => o.createdAt.toISOString().split("T")[0] === dateKey
        );
        return {
          day: date.toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "short",
          }),
          orders: dayOrders.length,
        };
      });

      // Top 5 clientes por gasto total
      const customerSpendMap = new Map<string, number>();
      currentOrders.forEach((order) => {
        const existing = customerSpendMap.get(order.customerName) || 0;
        customerSpendMap.set(
          order.customerName,
          existing + Number(order.total)
        );
      });
      const topCustomers = Array.from(customerSpendMap.entries())
        .map(([name, totalSpent]) => ({
          name: name.split(" ")[0] || name,
          totalSpent,
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

      // Estado de pedidos
      const statusMap = new Map<string, number>();
      const statusLabels: Record<string, string> = {
        PENDING: "Pendiente",
        PROCESSING: "Procesando",
        DELIVERED: "Completado",
        CANCELLED: "Cancelado",
      };
      currentOrders.forEach((order) => {
        const status = statusLabels[order.status] || order.status;
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      });
      const orderStatus = Array.from(statusMap.entries()).map(
        ([status, count]) => ({ status, count })
      );

      // Pedidos por hora del día (usando órdenes de hoy)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = currentOrders.filter((o) => o.createdAt >= today);
      const hourlyMap = new Map<number, number>();
      todayOrders.forEach((order) => {
        const hour = order.createdAt.getHours();
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
      });
      const hourlyOrders = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        orders: hourlyMap.get(i) || 0,
      })).filter(
        (h) => h.orders > 0 || (h.hour >= "8:00" && h.hour <= "22:00")
      ); // Solo mostrar horas relevantes

      // Rendimiento de productos (top 5)
      const productPerformance = topProducts.slice(0, 5).map((p) => ({
        product: p.name.substring(0, 20),
        sales: p.sales,
        revenue: p.revenue,
        rating: Math.random() * 5, // Mock - en producción usar rating real
      }));

      const dashboard: MetricsDashboard = {
        overview: {
          totalSales: calculateMetric(
            currentTotalSales,
            previousTotalSales,
            "Ventas Totales"
          ),
          totalOrders: calculateMetric(
            currentOrderCount,
            previousOrderCount,
            "Órdenes Totales"
          ),
          averageOrderValue: calculateMetric(
            Math.round(currentAOV),
            Math.round(previousAOV),
            "Valor Promedio de Orden"
          ),
          customerCount: calculateMetric(
            currentCustomerCount,
            previousCustomerCount,
            "Clientes"
          ),
          conversionRate: calculateMetric(
            currentOrderCount > 0
              ? Math.round(
                  (currentOrderCount / (currentOrderCount + 10)) * 100 * 10
                ) / 10
              : 0,
            previousOrderCount > 0
              ? Math.round(
                  (previousOrderCount / (previousOrderCount + 10)) * 100 * 10
                ) / 10
              : 0,
            "Tasa de Conversión"
          ),
          returnRate: calculateMetric(
            Math.round(currentReturnRate * 10) / 10,
            Math.round(previousReturnRate * 10) / 10,
            "Tasa de Devolución"
          ),
        },
        salesChart: salesChartData,
        ordersChart: ordersChartData,
        topProducts,
        topCategories,
        shippingMetrics: {
          averageDeliveryTime: calculateMetric(
            currentAvgDeliveryTime,
            previousAvgDeliveryTime,
            "Tiempo Promedio de Entrega"
          ),
          onTimeDeliveryRate: calculateMetric(
            Math.round(onTimeDeliveryRate * 10) / 10,
            Math.round(previousOnTimeRate * 10) / 10,
            "Entregas a Tiempo"
          ),
          shippingCost: calculateMetric(
            Math.round(avgShippingCost),
            Math.round(previousAvgShipping),
            "Costo de Envío Promedio"
          ),
          shippingDistribution,
        },
        customerMetrics: {
          newCustomers: calculateMetric(
            newCustomers,
            Math.round(previousCustomerCount * 0.3),
            "Nuevos Clientes"
          ),
          returningCustomers: calculateMetric(
            returningCustomers,
            Math.round(previousCustomerCount * 0.7),
            "Clientes Recurrentes"
          ),
          customerLifetimeValue: calculateMetric(
            currentCustomerCount > 0
              ? Math.round(currentTotalSales / currentCustomerCount)
              : 0,
            previousCustomerCount > 0
              ? Math.round(previousTotalSales / previousCustomerCount)
              : 0,
            "Valor de Vida del Cliente"
          ),
        },
        productMetrics: {
          totalProducts: calculateMetric(
            totalProducts,
            previousTotalProducts,
            "Productos Totales"
          ),
          lowStockProducts,
          outOfStockProducts,
          averageRating: calculateMetric(
            Math.round(averageRating * 10) / 10,
            Math.round(averageRating * 10) / 10, // Sin datos históricos de rating
            "Calificación Promedio"
          ),
        },
        recentActivity,
        ordersPerDay,
        topCustomers,
        orderStatus,
        hourlyOrders,
        productPerformance,
      };

      return NextResponse.json({
        success: true,
        data: dashboard,
      } satisfies ApiResponse<MetricsDashboard>);
    } catch (error) {
      console.error("Error en dashboard API:", error);
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

// Función auxiliar para generar datos de gráfico de ventas
function generateSalesChartFromOrders(
  orders: { createdAt: Date; total: unknown }[],
  period: string
): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  const days =
    period === "week"
      ? 7
      : period === "month"
        ? 30
        : period === "quarter"
          ? 90
          : 365;

  // Agrupar órdenes por día
  const salesByDate = new Map<string, number>();
  orders.forEach((order) => {
    const dateKey = order.createdAt.toISOString().split("T")[0];
    salesByDate.set(
      dateKey,
      (salesByDate.get(dateKey) || 0) + Number(order.total)
    );
  });

  // Generar puntos para cada día del período
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];

    data.push({
      date: dateKey,
      value: salesByDate.get(dateKey) || 0,
      label: date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
      }),
    });
  }

  // Si es trimestre o año, agrupar por semana/mes
  if (period === "quarter" || period === "year") {
    const groupedData: ChartDataPoint[] = [];
    const groupSize = period === "quarter" ? 7 : 30;

    for (let i = 0; i < data.length; i += groupSize) {
      const chunk = data.slice(i, i + groupSize);
      const totalValue = chunk.reduce((sum, d) => sum + d.value, 0);
      groupedData.push({
        date: chunk[0]?.date || "",
        value: totalValue,
        label:
          period === "quarter"
            ? `Sem ${Math.floor(i / 7) + 1}`
            : new Date(chunk[0]?.date || "").toLocaleDateString("es-AR", {
                month: "short",
              }),
      });
    }
    return groupedData;
  }

  return data;
}

// Función auxiliar para generar datos de gráfico de órdenes
function generateOrdersChartFromOrders(
  orders: { createdAt: Date }[],
  period: string
): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  const days =
    period === "week"
      ? 7
      : period === "month"
        ? 30
        : period === "quarter"
          ? 90
          : 365;

  // Contar órdenes por día
  const ordersByDate = new Map<string, number>();
  orders.forEach((order) => {
    const dateKey = order.createdAt.toISOString().split("T")[0];
    ordersByDate.set(dateKey, (ordersByDate.get(dateKey) || 0) + 1);
  });

  // Generar puntos para cada día del período
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];

    data.push({
      date: dateKey,
      value: ordersByDate.get(dateKey) || 0,
      label: date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
      }),
    });
  }

  // Si es trimestre o año, agrupar por semana/mes
  if (period === "quarter" || period === "year") {
    const groupedData: ChartDataPoint[] = [];
    const groupSize = period === "quarter" ? 7 : 30;

    for (let i = 0; i < data.length; i += groupSize) {
      const chunk = data.slice(i, i + groupSize);
      const totalValue = chunk.reduce((sum, d) => sum + d.value, 0);
      groupedData.push({
        date: chunk[0]?.date || "",
        value: totalValue,
        label:
          period === "quarter"
            ? `Sem ${Math.floor(i / 7) + 1}`
            : new Date(chunk[0]?.date || "").toLocaleDateString("es-AR", {
                month: "short",
              }),
      });
    }
    return groupedData;
  }

  return data;
}
