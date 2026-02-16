import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

export type DateRange = "today" | "week" | "month" | "year";

export interface DashboardData {
  kpi: {
    revenue: { value: number; change: number; trend: number[] };
    orders: { value: number; change: number; trend: number[] };
    aov: { value: number; change: number; trend: number[] };
    conversion: { value: number; change: number; trend: number[] };
  };
  chart: { date: string; revenue: number; orders: number }[];
  topProducts: {
    id: string;
    name: string;
    image: string | null;
    revenue: number;
    quantity: number;
  }[];
  topCustomers: {
    email: string;
    name: string | null;
    spent: number;
    count: number;
    isVip: boolean;
    isNew: boolean;
  }[];
  devices: { name: string; value: number; color: string }[];
}

export const analyticsService = {
  async getDashboardData(range: DateRange): Promise<DashboardData> {
    try {
      const { currentStart, currentEnd, previousStart, previousEnd } =
        this.calculateDateRanges(range);

      // Parallel Fetching for Maximum Performance
      const [
        currentKPIs,
        previousKPIs,
        revenueTrend,
        topProducts,
        topCustomersRaw,
        deviceStats,
      ] = await Promise.all([
        this.fetchKPIs(currentStart, currentEnd),
        this.fetchKPIs(previousStart, previousEnd),
        this.fetchRevenueTrend(currentStart, currentEnd, range),
        this.fetchTopProducts(currentStart, currentEnd),
        this.fetchTopCustomers(currentStart, currentEnd),
        this.fetchDeviceStats(currentStart, currentEnd),
      ]);

      return {
        kpi: {
          revenue: {
            value: currentKPIs.revenue,
            change: this.calculateChange(
              currentKPIs.revenue,
              previousKPIs.revenue
            ),
            trend: [], // TODO: Add sparkline data if needed later
          },
          orders: {
            value: currentKPIs.orders,
            change: this.calculateChange(
              currentKPIs.orders,
              previousKPIs.orders
            ),
            trend: [],
          },
          aov: {
            value: currentKPIs.aov,
            change: this.calculateChange(currentKPIs.aov, previousKPIs.aov),
            trend: [],
          },
          conversion: {
            value: currentKPIs.conversion, // Placeholder until Session tracking is robust
            change: 0,
            trend: [],
          },
        },
        chart: revenueTrend,
        topProducts,
        topCustomers: topCustomersRaw.map((c) => ({
          ...c,
          isVip: c.spent > currentKPIs.aov * 3, // VIP Rule: Spent > 3x AOV
          isNew: c.count === 1, // New Rule: Only 1 order
        })),
        devices: deviceStats,
      };
    } catch (error) {
      logger.error("AnalyticsService.getDashboardData failed", {
        error,
        range,
      });
      throw new Error("Failed to fetch analytics data");
    }
  },

  // --- Private Helpers ---

  calculateDateRanges(range: DateRange) {
    const now = new Date();
    const currentEnd = now;
    const currentStart = new Date(); // Changed from 'let' to 'const' and kept original initialization

    switch (range) {
      case "today":
        currentStart.setHours(0, 0, 0, 0);
        break;
      case "week":
        currentStart.setDate(now.getDate() - 7);
        break;
      case "month":
        currentStart.setDate(now.getDate() - 30);
        break;
      case "year":
        currentStart.setFullYear(now.getFullYear() - 1);
        break;
    }

    const duration = currentEnd.getTime() - currentStart.getTime();
    const previousEnd = new Date(currentStart);
    const previousStart = new Date(currentStart.getTime() - duration);

    return { currentStart, currentEnd, previousStart, previousEnd };
  },

  async fetchKPIs(start: Date, end: Date) {
    const aggregations = await prisma.orders.aggregate({
      where: {
        createdAt: { gte: start, lte: end },
        status: { not: "CANCELLED" },
      },
      _sum: { total: true },
      _count: { id: true },
    });

    const revenueDecimal = aggregations._sum.total;
    const revenue = revenueDecimal ? Number(revenueDecimal) : 0;

    // Safety check for count
    const orders = aggregations._count?.id ?? 0;

    const aov = orders > 0 ? revenue / orders : 0;

    // Mock conversion
    const conversion = 2.5;

    return { revenue, orders, aov, conversion };
  },

  async fetchRevenueTrend(start: Date, end: Date, range: DateRange) {
    const orders = await prisma.orders.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { not: "CANCELLED" },
      },
      select: { createdAt: true, total: true },
    });

    const grouped = new Map<string, { revenue: number; orders: number }>();

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const key = currentDate.toISOString().split("T")[0];
      grouped.set(key, { revenue: 0, orders: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    orders.forEach((order) => {
      const key = order.createdAt.toISOString().split("T")[0];
      const entry = grouped.get(key) || { revenue: 0, orders: 0 };

      const orderTotal = order.total ? Number(order.total) : 0;

      entry.revenue += orderTotal;
      entry.orders += 1;
      grouped.set(key, entry);
    });

    return Array.from(grouped.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  async fetchTopProducts(start: Date, end: Date) {
    const items = await prisma.order_items.groupBy({
      by: ["productId"],
      where: {
        orders: {
          // Corrected from 'order' to 'orders'
          createdAt: { gte: start, lte: end },
          status: { not: "CANCELLED" },
        },
      },
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { price: "desc" } },
      take: 5,
    });

    const productDetails = await prisma.products.findMany({
      where: { id: { in: items.map((i) => i.productId) } },
      select: { id: true, name: true, images: true },
    });

    return items.map((item) => {
      const product = productDetails.find((p) => p.id === item.productId);

      const revenueExVal = item._sum.price;
      const revenue = revenueExVal ? Number(revenueExVal) : 0;

      const quantity = item._sum.quantity ?? 0;

      return {
        id: item.productId,
        name: product?.name || "Unknown",
        image: product?.images?.[0] || null,
        revenue,
        quantity,
      };
    });
  },

  async fetchTopCustomers(start: Date, end: Date) {
    const customers = await prisma.orders.groupBy({
      by: ["customerEmail"],
      where: {
        createdAt: { gte: start, lte: end },
        status: { not: "CANCELLED" },
        customerEmail: { not: null },
      },
      _sum: { total: true },
      _count: { id: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    });

    const emails = customers.map((c) => c.customerEmail!);

    const namesMap = new Map<string, string>();

    // Fetch latest name for each email (only 5, so efficient enough)
    await Promise.all(
      emails.map(async (email) => {
        const order = await prisma.orders.findFirst({
          where: { customerEmail: email },
          select: { customerName: true },
          orderBy: { createdAt: "desc" },
        });
        if (order?.customerName) {
          namesMap.set(email, order.customerName);
        }
      })
    );

    return customers.map((c) => {
      const spentDecimal = c._sum.total;
      const spent = spentDecimal ? Number(spentDecimal) : 0;

      const count = c._count.id ?? 0;

      return {
        email: c.customerEmail!,
        name: namesMap.get(c.customerEmail!) || null,
        spent,
        count,
        isVip: false, // will be calculated in getDashboardData
        isNew: false, // will be calculated in getDashboardData
      };
    });
  },

  async fetchDeviceStats(start: Date, end: Date) {
    return [
      { name: "Mobile", value: 65, color: "#ef4444" },
      { name: "Desktop", value: 30, color: "#3b82f6" },
      { name: "Tablet", value: 5, color: "#eab308" },
    ];
  },

  calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },
};
