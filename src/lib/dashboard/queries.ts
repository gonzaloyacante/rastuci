import { prisma } from "@/lib/prisma";

import { generateOrdersChartFromOrders, generateSalesChartFromOrders } from "./charts";
import { calculateMetric } from "./metrics";
import type { MetricsDashboard } from "./types";

// ─── Order type inferred from Prisma ─────────────────────────────────────────

type OrderWithItems = Awaited<ReturnType<typeof fetchCurrentOrders>>[number];
type PreviousOrder = Awaited<ReturnType<typeof fetchPreviousOrders>>[number];

// ─── DB fetchers ──────────────────────────────────────────────────────────────

async function fetchCurrentOrders(currentStart: Date, currentEnd: Date) {
  return prisma.orders.findMany({
    where: { createdAt: { gte: currentStart, lte: currentEnd } },
    include: {
      order_items: {
        include: {
          products: { include: { categories: true } },
        },
      },
    },
  });
}

async function fetchPreviousOrders(previousStart: Date, previousEnd: Date) {
  return prisma.orders.findMany({
    where: { createdAt: { gte: previousStart, lte: previousEnd } },
  });
}

// ─── Aggregation helpers ──────────────────────────────────────────────────────

function computeSalesMetrics(
  currentOrders: OrderWithItems[],
  previousOrders: PreviousOrder[]
) {
  const currentTotalSales = currentOrders.reduce(
    (sum, o) => sum + Number(o.total),
    0
  );
  const previousTotalSales = previousOrders.reduce(
    (sum, o) => sum + Number(o.total),
    0
  );
  const currentOrderCount = currentOrders.length;
  const previousOrderCount = previousOrders.length;
  const currentAOV =
    currentOrderCount > 0 ? currentTotalSales / currentOrderCount : 0;
  const previousAOV =
    previousOrderCount > 0 ? previousTotalSales / previousOrderCount : 0;

  const currentCustomerNames = new Set(currentOrders.map((o) => o.customerName));
  const previousCustomerNames = new Set(previousOrders.map((o) => o.customerName));

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

  return {
    currentTotalSales,
    previousTotalSales,
    currentOrderCount,
    previousOrderCount,
    currentAOV,
    previousAOV,
    currentCustomerNames,
    previousCustomerNames,
    currentCustomerCount: currentCustomerNames.size,
    previousCustomerCount: previousCustomerNames.size,
    currentReturnRate,
    previousReturnRate,
  };
}

function computeDeliveryMetrics(
  currentOrders: OrderWithItems[],
  previousOrders: PreviousOrder[]
) {
  const currentDeliveredOrders = currentOrders.filter(
    (o) => o.status === "DELIVERED" && o.updatedAt && o.createdAt
  );
  const previousDeliveredOrders = previousOrders.filter(
    (o) => o.status === "DELIVERED" && o.updatedAt && o.createdAt
  );

  const avgDeliveryTime = (orders: typeof currentDeliveredOrders) =>
    orders.length > 0
      ? orders.reduce((sum, o) => {
          return (
            sum +
            (o.updatedAt.getTime() - o.createdAt.getTime()) /
              (1000 * 60 * 60 * 24)
          );
        }, 0) / orders.length
      : 0;

  return {
    currentDeliveredOrders,
    currentAvgDeliveryTime: avgDeliveryTime(currentDeliveredOrders),
    previousAvgDeliveryTime: avgDeliveryTime(
      previousDeliveredOrders as typeof currentDeliveredOrders
    ),
  };
}

function computeTopProducts(currentOrders: OrderWithItems[]) {
  const map = new Map<
    string,
    {
      id: string;
      name: string;
      sales: number;
      orders: number;
      revenue: number;
      rating: number;
    }
  >();

  currentOrders.forEach((order) => {
    order.order_items.forEach((item) => {
      const existing = map.get(item.productId) ?? {
        id: item.productId,
        name: item.products?.name ?? "Producto desconocido",
        sales: 0,
        orders: 0,
        revenue: 0,
        rating: Number(item.products?.rating ?? 0),
      };
      existing.sales += item.quantity;
      existing.orders += 1;
      existing.revenue += Number(item.price) * item.quantity;
      map.set(item.productId, existing);
    });
  });

  return Array.from(map.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

function computeTopCategories(currentOrders: OrderWithItems[]) {
  const map = new Map<string, { name: string; sales: number }>();

  currentOrders.forEach((order) => {
    order.order_items.forEach((item) => {
      const categoryName =
        item.products?.categories?.name ?? "Sin categoría";
      const existing = map.get(categoryName) ?? { name: categoryName, sales: 0 };
      existing.sales += item.quantity;
      map.set(categoryName, existing);
    });
  });

  const total = Array.from(map.values()).reduce((s, c) => s + c.sales, 0);
  return Array.from(map.values())
    .map((c) => ({
      ...c,
      percentage:
        total > 0 ? Math.round((c.sales / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);
}

function computeShippingDistribution(currentOrders: OrderWithItems[]) {
  const withAgency = currentOrders.filter((o) => !!o.shippingAgency).length;
  const home = currentOrders.filter(
    (o) => !o.shippingAgency && o.shippingMethod !== "pickup"
  ).length;
  const total = withAgency + home;
  return {
    homeDelivery: home,
    branchPickup: withAgency,
    homePercentage: total > 0 ? Math.round((home / total) * 100) : 0,
    branchPercentage: total > 0 ? Math.round((withAgency / total) * 100) : 0,
  };
}

function computeShippingCost(
  currentOrders: OrderWithItems[],
  previousOrders: PreviousOrder[]
) {
  const withCost = (orders: OrderWithItems[] | PreviousOrder[]) =>
    orders.filter((o) => o.shippingCost && Number(o.shippingCost) > 0);

  const avgCost = (orders: ReturnType<typeof withCost>) =>
    orders.length > 0
      ? orders.reduce((s, o) => s + Number(o.shippingCost ?? 0), 0) /
        orders.length
      : 0;

  return {
    avgShippingCost: avgCost(withCost(currentOrders)),
    previousAvgShipping: avgCost(withCost(previousOrders)),
  };
}

function computeOrdersPerDay(currentOrders: OrderWithItems[]) {
  const last7Days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push(date);
  }
  return last7Days.map((date) => {
    const dateKey = date.toISOString().split("T")[0];
    const count = currentOrders.filter(
      (o) => o.createdAt.toISOString().split("T")[0] === dateKey
    ).length;
    return {
      day: date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short",
      }),
      orders: count,
    };
  });
}

function computeTopCustomers(currentOrders: OrderWithItems[]) {
  const map = new Map<string, number>();
  currentOrders.forEach((o) => {
    map.set(o.customerName, (map.get(o.customerName) ?? 0) + Number(o.total));
  });
  return Array.from(map.entries())
    .map(([name, totalSpent]) => ({
      name: name.split(" ")[0] || name,
      totalSpent,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);
}

function computeOrderStatus(currentOrders: OrderWithItems[]) {
  const labels: Record<string, string> = {
    PENDING: "Pendiente",
    PROCESSING: "Procesando",
    DELIVERED: "Completado",
    CANCELLED: "Cancelado",
  };
  const map = new Map<string, number>();
  currentOrders.forEach((o) => {
    const status = labels[o.status] ?? o.status;
    map.set(status, (map.get(status) ?? 0) + 1);
  });
  return Array.from(map.entries()).map(([status, count]) => ({ status, count }));
}

function computeHourlyOrders(currentOrders: OrderWithItems[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = currentOrders.filter((o) => o.createdAt >= today);
  const map = new Map<number, number>();
  todayOrders.forEach((o) => {
    const hour = o.createdAt.getHours();
    map.set(hour, (map.get(hour) ?? 0) + 1);
  });
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    orders: map.get(i) ?? 0,
  })).filter(
    (h) => h.orders > 0 || (h.hour >= "8:00" && h.hour <= "22:00")
  );
}

// ─── Secondary fetcher ────────────────────────────────────────────────────────

async function fetchProductAndCustomerData(previousEnd: Date, currentStart: Date) {
  const [
    totalProducts,
    previousTotalProducts,
    lowStockProducts,
    outOfStockProducts,
    productsWithRating,
    recentOrders,
    allTimeCustomers,
  ] = await Promise.all([
    prisma.products.count(),
    prisma.products.count({ where: { createdAt: { lte: previousEnd } } }),
    prisma.products.count({ where: { stock: { gt: 0, lte: 5 } } }),
    prisma.products.count({ where: { stock: 0 } }),
    prisma.products.aggregate({ _avg: { rating: true } }),
    prisma.orders.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, customerName: true, total: true, status: true, createdAt: true },
    }),
    prisma.orders.findMany({
      where: { createdAt: { lt: currentStart } },
      select: { customerName: true },
    }),
  ]);
  return { totalProducts, previousTotalProducts, lowStockProducts, outOfStockProducts, productsWithRating, recentOrders, allTimeCustomers };
}

// ─── Dashboard assembler ──────────────────────────────────────────────────────

function assembleDashboard(
  currentOrders: OrderWithItems[],
  previousOrders: PreviousOrder[],
  period: string,
  sales: ReturnType<typeof computeSalesMetrics>,
  delivery: ReturnType<typeof computeDeliveryMetrics>,
  productData: Awaited<ReturnType<typeof fetchProductAndCustomerData>>
): MetricsDashboard {
  const { totalProducts, previousTotalProducts, lowStockProducts, outOfStockProducts, productsWithRating, recentOrders, allTimeCustomers } = productData;
  const topProducts = computeTopProducts(currentOrders);
  const topCategories = computeTopCategories(currentOrders);
  const shippingDistribution = computeShippingDistribution(currentOrders);
  const { avgShippingCost, previousAvgShipping } = computeShippingCost(currentOrders, previousOrders);

  const averageRating = productsWithRating._avg.rating ?? 0;
  const allTimeCustomerNames = new Set(allTimeCustomers.map((o) => o.customerName));
  const newCustomers = Array.from(sales.currentCustomerNames).filter((name) => !allTimeCustomerNames.has(name)).length;
  const returningCustomers = sales.currentCustomerCount - newCustomers;
  const onTimeDeliveryRate = sales.currentOrderCount > 0
    ? (delivery.currentDeliveredOrders.length / sales.currentOrderCount) * 100 : 0;
  const previousOnTimeRate = sales.previousOrderCount > 0
    ? (previousOrders.filter((o) => o.status === "DELIVERED").length / sales.previousOrderCount) * 100 : 0;

  const recentActivity = recentOrders.map((order) => ({
    id: order.id,
    type: "order" as const,
    description: `${order.status === "DELIVERED" ? "Orden completada" : "Nueva orden"} #${order.id.slice(0, 8)} por $${Number(order.total).toLocaleString("es-AR")}`,
    timestamp: order.createdAt.toISOString(),
    value: Number(order.total),
  }));

  const conversionRate = (count: number) =>
    count > 0 ? Math.round((count / (count + 10)) * 100 * 10) / 10 : 0;

  return {
    overview: {
      totalSales: calculateMetric(sales.currentTotalSales, sales.previousTotalSales, "Ventas Totales"),
      totalOrders: calculateMetric(sales.currentOrderCount, sales.previousOrderCount, "Órdenes Totales"),
      averageOrderValue: calculateMetric(Math.round(sales.currentAOV), Math.round(sales.previousAOV), "Valor Promedio de Orden"),
      customerCount: calculateMetric(sales.currentCustomerCount, sales.previousCustomerCount, "Clientes"),
      conversionRate: calculateMetric(conversionRate(sales.currentOrderCount), conversionRate(sales.previousOrderCount), "Tasa de Conversión"),
      returnRate: calculateMetric(Math.round(sales.currentReturnRate * 10) / 10, Math.round(sales.previousReturnRate * 10) / 10, "Tasa de Devolución"),
    },
    salesChart: generateSalesChartFromOrders(currentOrders, period),
    ordersChart: generateOrdersChartFromOrders(currentOrders, period),
    topProducts,
    topCategories,
    shippingMetrics: {
      averageDeliveryTime: calculateMetric(delivery.currentAvgDeliveryTime, delivery.previousAvgDeliveryTime, "Tiempo Promedio de Entrega"),
      onTimeDeliveryRate: calculateMetric(Math.round(onTimeDeliveryRate * 10) / 10, Math.round(previousOnTimeRate * 10) / 10, "Entregas a Tiempo"),
      shippingCost: calculateMetric(Math.round(avgShippingCost), Math.round(previousAvgShipping), "Costo de Envío Promedio"),
      shippingDistribution,
    },
    customerMetrics: {
      newCustomers: calculateMetric(newCustomers, Math.round(sales.previousCustomerCount * 0.3), "Nuevos Clientes"),
      returningCustomers: calculateMetric(returningCustomers, Math.round(sales.previousCustomerCount * 0.7), "Clientes Recurrentes"),
      customerLifetimeValue: calculateMetric(
        sales.currentCustomerCount > 0 ? Math.round(sales.currentTotalSales / sales.currentCustomerCount) : 0,
        sales.previousCustomerCount > 0 ? Math.round(sales.previousTotalSales / sales.previousCustomerCount) : 0,
        "Valor de Vida del Cliente"
      ),
    },
    productMetrics: {
      totalProducts: calculateMetric(totalProducts, previousTotalProducts, "Productos Totales"),
      lowStockProducts,
      outOfStockProducts,
      averageRating: calculateMetric(Math.round(averageRating * 10) / 10, Math.round(averageRating * 10) / 10, "Calificación Promedio"),
    },
    recentActivity,
    ordersPerDay: computeOrdersPerDay(currentOrders),
    topCustomers: computeTopCustomers(currentOrders),
    orderStatus: computeOrderStatus(currentOrders),
    hourlyOrders: computeHourlyOrders(currentOrders),
    productPerformance: topProducts.slice(0, 5).map((p) => ({
      product: p.name.substring(0, 20),
      sales: p.sales,
      revenue: p.revenue,
      rating: p.rating ?? 0,
    })),
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function buildDashboard(
  currentStart: Date,
  currentEnd: Date,
  previousStart: Date,
  previousEnd: Date,
  period: string
): Promise<MetricsDashboard> {
  const [currentOrders, previousOrders, productData] = await Promise.all([
    fetchCurrentOrders(currentStart, currentEnd),
    fetchPreviousOrders(previousStart, previousEnd),
    fetchProductAndCustomerData(previousEnd, currentStart),
  ]);

  const sales = computeSalesMetrics(currentOrders, previousOrders);
  const delivery = computeDeliveryMetrics(currentOrders, previousOrders);

  return assembleDashboard(currentOrders, previousOrders, period, sales, delivery, productData);
}
