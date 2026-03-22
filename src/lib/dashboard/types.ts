import { z } from "zod";

// ─── Zod Schema ───────────────────────────────────────────────────────────────

export const MetricsQuerySchema = z.object({
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

export type MetricsQuery = z.infer<typeof MetricsQuerySchema>;

// ─── Core metric types ────────────────────────────────────────────────────────

export interface MetricData {
  label: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

// ─── Dashboard response ───────────────────────────────────────────────────────

export interface MetricsDashboard {
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
