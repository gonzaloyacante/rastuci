import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAdminAuth } from '@/lib/adminAuth';
import type { ApiResponse } from '@/types';

// Schemas de validación
const MetricsQuerySchema = z.object({
  period: z.enum(['week', 'month', 'quarter', 'year']).optional().default('month'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  metric: z.enum(['sales', 'orders', 'customers', 'products', 'shipping', 'returns']).optional()
});

interface MetricData {
  label: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
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
    type: 'order' | 'customer' | 'product' | 'review';
    description: string;
    timestamp: string;
    value?: number;
  }>;
}

function calculateMetric(current: number, previous: number): MetricData {
  const change = current - previous;
  const changePercent = previous > 0 ? (change / previous) * 100 : 0;
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';

  return {
    label: '',
    value: current,
    previousValue: previous,
    change,
    changePercent: Math.round(changePercent * 100) / 100,
    trend
  };
}

function generateTimeSeriesData(period: string, baseValue: number): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  let periods = 30;
  let formatStr = 'DD/MM';

  switch (period) {
    case 'week':
      periods = 7;
      formatStr = 'DD/MM';
      break;
    case 'month':
      periods = 30;
      formatStr = 'DD/MM';
      break;
    case 'quarter':
      periods = 12;
      formatStr = 'Week';
      break;
    case 'year':
      periods = 12;
      formatStr = 'MMM';
      break;
  }

  for (let i = periods - 1; i >= 0; i--) {
    const date = new Date(now);
    const variance = Math.random() * 0.4 - 0.2; // ±20% variación
    const seasonality = Math.sin((i / periods) * Math.PI * 2) * 0.1; // Variación estacional
    const trendFactor = (periods - i) / periods * 0.1; // Tendencia creciente ligera

    switch (period) {
      case 'week':
        date.setDate(date.getDate() - i);
        break;
      case 'month':
        date.setDate(date.getDate() - i);
        break;
      case 'quarter':
        date.setDate(date.getDate() - (i * 7));
        break;
      case 'year':
        date.setMonth(date.getMonth() - i);
        break;
    }

    const value = Math.round(baseValue * (1 + variance + seasonality + trendFactor));

    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.max(0, value),
      label: formatStr === 'MMM' ? date.toLocaleDateString('es-AR', { month: 'short' }) :
             formatStr === 'Week' ? `Sem ${Math.ceil((periods - i) / 7)}` :
             date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
    });
  }

  return data;
}

export const GET = withAdminAuth(async (request: NextRequest): Promise<NextResponse> => {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      period: searchParams.get('period') || 'month',
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      metric: searchParams.get('metric') || undefined
    };

    const validation = MetricsQuerySchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Parámetros inválidos'
      } satisfies ApiResponse<never>, { status: 400 });
    }

    const { period } = validation.data;

    // Simular datos de métricas para diferentes períodos
    const baseMetrics = {
      week: {
        sales: 125000,
        orders: 89,
        customers: 67,
        aov: 1404,
        conversion: 3.2,
        returnRate: 2.1
      },
      month: {
        sales: 485000,
        orders: 342,
        customers: 278,
        aov: 1418,
        conversion: 3.8,
        returnRate: 1.8
      },
      quarter: {
        sales: 1456000,
        orders: 1028,
        customers: 745,
        aov: 1416,
        conversion: 4.1,
        returnRate: 1.6
      },
      year: {
        sales: 5824000,
        orders: 4234,
        customers: 2890,
        aov: 1376,
        conversion: 4.3,
        returnRate: 1.4
      }
    };

    const current = baseMetrics[period];
    const previous = {
      sales: Math.round(current.sales * (0.85 + Math.random() * 0.2)),
      orders: Math.round(current.orders * (0.85 + Math.random() * 0.2)),
      customers: Math.round(current.customers * (0.85 + Math.random() * 0.2)),
      aov: Math.round(current.aov * (0.95 + Math.random() * 0.1)),
      conversion: Number((current.conversion * (0.9 + Math.random() * 0.15)).toFixed(1)),
      returnRate: Number((current.returnRate * (0.8 + Math.random() * 0.4)).toFixed(1))
    };

    const dashboard: MetricsDashboard = {
      overview: {
        totalSales: {
          ...calculateMetric(current.sales, previous.sales),
          label: 'Ventas Totales'
        },
        totalOrders: {
          ...calculateMetric(current.orders, previous.orders),
          label: 'Órdenes Totales'
        },
        averageOrderValue: {
          ...calculateMetric(current.aov, previous.aov),
          label: 'Valor Promedio de Orden'
        },
        customerCount: {
          ...calculateMetric(current.customers, previous.customers),
          label: 'Clientes'
        },
        conversionRate: {
          ...calculateMetric(current.conversion, previous.conversion),
          label: 'Tasa de Conversión'
        },
        returnRate: {
          ...calculateMetric(current.returnRate, previous.returnRate),
          label: 'Tasa de Devolución'
        }
      },
      salesChart: generateTimeSeriesData(period, current.sales / 30),
      ordersChart: generateTimeSeriesData(period, current.orders / 30),
      topProducts: [
        {
          id: 'PROD-001',
          name: 'Smartphone Premium XZ',
          sales: 89,
          orders: 89,
          revenue: 178000
        },
        {
          id: 'PROD-002',
          name: 'Auriculares Inalámbricos Pro',
          sales: 156,
          orders: 142,
          revenue: 124800
        },
        {
          id: 'PROD-003',
          name: 'Tablet Ultra 10"',
          sales: 67,
          orders: 67,
          revenue: 100500
        },
        {
          id: 'PROD-004',
          name: 'Smartwatch Fitness',
          sales: 234,
          orders: 198,
          revenue: 93600
        },
        {
          id: 'PROD-005',
          name: 'Cámara Digital 4K',
          sales: 45,
          orders: 43,
          revenue: 90000
        }
      ],
      topCategories: [
        { name: 'Electrónicos', sales: 2156, percentage: 34.8 },
        { name: 'Indumentaria', sales: 1834, percentage: 29.6 },
        { name: 'Hogar', sales: 1245, percentage: 20.1 },
        { name: 'Deportes', sales: 678, percentage: 10.9 },
        { name: 'Libros', sales: 287, percentage: 4.6 }
      ],
      shippingMetrics: {
        averageDeliveryTime: {
          ...calculateMetric(3.2, 3.8),
          label: 'Tiempo Promedio de Entrega'
        },
        onTimeDeliveryRate: {
          ...calculateMetric(94.5, 89.2),
          label: 'Entregas a Tiempo'
        },
        shippingCost: {
          ...calculateMetric(1250, 1420),
          label: 'Costo de Envío Promedio'
        }
      },
      customerMetrics: {
        newCustomers: {
          ...calculateMetric(current.customers * 0.3, previous.customers * 0.3),
          label: 'Nuevos Clientes'
        },
        returningCustomers: {
          ...calculateMetric(current.customers * 0.7, previous.customers * 0.7),
          label: 'Clientes Recurrentes'
        },
        customerLifetimeValue: {
          ...calculateMetric(4250, 3890),
          label: 'Valor de Vida del Cliente'
        }
      },
      productMetrics: {
        totalProducts: {
          ...calculateMetric(1256, 1198),
          label: 'Productos Totales'
        },
        lowStockProducts: 23,
        outOfStockProducts: 7,
        averageRating: {
          ...calculateMetric(4.6, 4.4),
          label: 'Calificación Promedio'
        }
      },
      recentActivity: [
        {
          id: 'ACT-001',
          type: 'order',
          description: 'Nueva orden #ORD-2024-001 por $2,500',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          value: 2500
        },
        {
          id: 'ACT-002',
          type: 'customer',
          description: 'Nuevo cliente registrado: maria.garcia@email.com',
          timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString()
        },
        {
          id: 'ACT-003',
          type: 'review',
          description: 'Nueva reseña de 5 estrellas para Smartphone Premium XZ',
          timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
          value: 5
        },
        {
          id: 'ACT-004',
          type: 'product',
          description: 'Stock bajo en Auriculares Inalámbricos Pro (8 unidades)',
          timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          value: 8
        },
        {
          id: 'ACT-005',
          type: 'order',
          description: 'Orden completada #ORD-2024-000 por $1,850',
          timestamp: new Date(Date.now() - 33 * 60 * 1000).toISOString(),
          value: 1850
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: dashboard
    } satisfies ApiResponse<MetricsDashboard>);

  } catch {
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    } satisfies ApiResponse<never>, { status: 500 });
  }
});