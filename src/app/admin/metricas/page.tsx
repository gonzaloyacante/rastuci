"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface MetricData {
  label: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
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
    type: 'order' | 'customer' | 'product' | 'review';
    description: string;
    timestamp: string;
    value?: number;
  }>;
}

const MetricasPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<MetricsDashboard | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        
        // Mock data simplificado
        const mockDashboard: MetricsDashboard = {
          overview: {
            totalSales: {
              label: 'Ventas Totales',
              value: 485000,
              previousValue: 432000,
              change: 53000,
              changePercent: 12.3,
              trend: 'up'
            },
            totalOrders: {
              label: 'Órdenes Totales',
              value: 342,
              previousValue: 298,
              change: 44,
              changePercent: 14.8,
              trend: 'up'
            },
            averageOrderValue: {
              label: 'Valor Promedio de Orden',
              value: 1418,
              previousValue: 1402,
              change: 16,
              changePercent: 1.1,
              trend: 'up'
            },
            customerCount: {
              label: 'Clientes',
              value: 278,
              previousValue: 245,
              change: 33,
              changePercent: 13.5,
              trend: 'up'
            },
            conversionRate: {
              label: 'Tasa de Conversión',
              value: 3.8,
              previousValue: 3.4,
              change: 0.4,
              changePercent: 11.8,
              trend: 'up'
            },
            returnRate: {
              label: 'Tasa de Devolución',
              value: 1.8,
              previousValue: 2.3,
              change: -0.5,
              changePercent: -21.7,
              trend: 'down'
            }
          },
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
            }
          ],
          shippingMetrics: {
            averageDeliveryTime: {
              label: 'Tiempo Promedio de Entrega',
              value: 3.2,
              previousValue: 3.8,
              change: -0.6,
              changePercent: -15.8,
              trend: 'down'
            },
            onTimeDeliveryRate: {
              label: 'Entregas a Tiempo',
              value: 94.5,
              previousValue: 89.2,
              change: 5.3,
              changePercent: 5.9,
              trend: 'up'
            },
            shippingCost: {
              label: 'Costo de Envío Promedio',
              value: 1250,
              previousValue: 1420,
              change: -170,
              changePercent: -12.0,
              trend: 'down'
            }
          },
          customerMetrics: {
            newCustomers: {
              label: 'Nuevos Clientes',
              value: 83,
              previousValue: 73,
              change: 10,
              changePercent: 13.7,
              trend: 'up'
            },
            returningCustomers: {
              label: 'Clientes Recurrentes',
              value: 195,
              previousValue: 172,
              change: 23,
              changePercent: 13.4,
              trend: 'up'
            },
            customerLifetimeValue: {
              label: 'Valor de Vida del Cliente',
              value: 4250,
              previousValue: 3890,
              change: 360,
              changePercent: 9.3,
              trend: 'up'
            }
          },
          productMetrics: {
            totalProducts: {
              label: 'Productos Totales',
              value: 1256,
              previousValue: 1198,
              change: 58,
              changePercent: 4.8,
              trend: 'up'
            },
            lowStockProducts: 23,
            outOfStockProducts: 7,
            averageRating: {
              label: 'Calificación Promedio',
              value: 4.6,
              previousValue: 4.4,
              change: 0.2,
              changePercent: 4.5,
              trend: 'up'
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
            }
          ]
        };

        setDashboard(mockDashboard);
      } catch {
        // Error handling removed for production
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  const MetricCard: React.FC<{ metric: MetricData; format?: 'currency' | 'number' | 'percentage' | 'days' }> = ({ 
    metric, 
    format = 'number' 
  }) => {
    const formatValue = (value: number): string => {
      switch (format) {
        case 'currency':
          return `$${value.toLocaleString('es-AR')}`;
        case 'percentage':
          return `${value}%`;
        case 'days':
          return `${value} días`;
        default:
          return value.toLocaleString('es-AR');
      }
    };

    const trendIcon = metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→';
    const trendColor = metric.trend === 'up' ? 'text-success' : metric.trend === 'down' ? 'text-error' : 'text-content-secondary';
    const bgColor = metric.trend === 'up' ? 'badge-success' : metric.trend === 'down' ? 'badge-error' : 'badge-default';

    return (
      <Card className="p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-content-secondary">{metric.label}</h3>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold">{formatValue(metric.value)}</span>
            <div className="flex items-center gap-1">
              <Badge className={bgColor}>
                <span className={trendColor}>{trendIcon}</span>
                <span className="ml-1">{Math.abs(metric.changePercent)}%</span>
              </Badge>
            </div>
          </div>
          <p className="text-xs text-content-tertiary">
            {metric.trend === 'up' ? '+' : metric.trend === 'down' ? '-' : ''}
            {formatValue(Math.abs(metric.change))} vs período anterior
          </p>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-8">
        <p className="text-content-secondary">Error al cargar el dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Métricas Avanzadas</h1>
        <div className="flex gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'primary' : 'outline'}
              onClick={() => setPeriod(p)}
            >
              {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : p === 'quarter' ? 'Trimestre' : 'Año'}
            </Button>
          ))}
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard metric={dashboard.overview.totalSales} format="currency" />
        <MetricCard metric={dashboard.overview.totalOrders} format="number" />
        <MetricCard metric={dashboard.overview.averageOrderValue} format="currency" />
        <MetricCard metric={dashboard.overview.customerCount} format="number" />
        <MetricCard metric={dashboard.overview.conversionRate} format="percentage" />
        <MetricCard metric={dashboard.overview.returnRate} format="percentage" />
      </div>

      {/* Productos Top */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Top Productos</h3>
        <div className="space-y-3">
          {dashboard.topProducts.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-3 surface-secondary rounded">
              <div>
                <h4 className="font-medium">{product.name}</h4>
                <p className="text-sm text-content-secondary">{product.sales} ventas • {product.orders} órdenes</p>
              </div>
              <span className="font-semibold">${product.revenue.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Logística</h3>
          <div className="space-y-3">
            <MetricCard metric={dashboard.shippingMetrics.averageDeliveryTime} format="days" />
            <MetricCard metric={dashboard.shippingMetrics.onTimeDeliveryRate} format="percentage" />
            <MetricCard metric={dashboard.shippingMetrics.shippingCost} format="currency" />
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Clientes</h3>
          <div className="space-y-3">
            <MetricCard metric={dashboard.customerMetrics.newCustomers} format="number" />
            <MetricCard metric={dashboard.customerMetrics.returningCustomers} format="number" />
            <MetricCard metric={dashboard.customerMetrics.customerLifetimeValue} format="currency" />
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Inventario</h3>
          <div className="space-y-3">
            <MetricCard metric={dashboard.productMetrics.totalProducts} format="number" />
            <div className="p-3 surface-secondary rounded">
              <p className="text-sm">Stock bajo: <span className="font-semibold text-warning">{dashboard.productMetrics.lowStockProducts}</span></p>
              <p className="text-sm">Sin stock: <span className="font-semibold text-error">{dashboard.productMetrics.outOfStockProducts}</span></p>
            </div>
            <MetricCard metric={dashboard.productMetrics.averageRating} format="number" />
          </div>
        </Card>
      </div>

      {/* Actividad reciente */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          {dashboard.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-3 surface-secondary rounded">
              <span className="text-primary">
                {activity.type === 'order' ? '🛍️' : 
                 activity.type === 'customer' ? '👤' : 
                 activity.type === 'review' ? '⭐' : '📦'}
              </span>
              <div className="flex-1">
                <p className="text-sm">{activity.description}</p>
                <p className="text-xs text-content-tertiary">
                  {new Date(activity.timestamp).toLocaleString('es-AR')}
                </p>
              </div>
              {activity.value && (
                <Badge className="badge-default">
                  {activity.type === 'review' ? `${activity.value}★` : 
                   activity.type === 'order' ? `$${activity.value.toLocaleString()}` :
                   activity.value}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default MetricasPage;