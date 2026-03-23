export interface MetricData {
  label: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
}

export interface MetricsDashboard {
  overview: {
    totalSales: MetricData;
    totalOrders: MetricData;
    averageOrderValue: MetricData;
    customerCount: MetricData;
    conversionRate: MetricData;
    returnRate: MetricData;
  };
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    orders: number;
    revenue: number;
  }>;
  shippingMetrics: {
    averageDeliveryTime: MetricData;
    onTimeDeliveryRate: MetricData;
    shippingCost: MetricData;
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
  ordersPerDay?: Array<{ day: string; orders: number }>;
  topCustomers?: Array<{ name: string; totalSpent: number }>;
  orderStatus?: Array<{ status: string; count: number }>;
  hourlyOrders?: Array<{ hour: string; orders: number }>;
  productPerformance?: Array<{
    product: string;
    sales: number;
    revenue: number;
    rating: number;
  }>;
}

export type Period = "week" | "month" | "quarter" | "year";

export const periodLabels: Record<Period, string> = {
  week: "Semana",
  month: "Mes",
  quarter: "Trimestre",
  year: "Año",
};

export type FormatType = "currency" | "number" | "percentage" | "days";
