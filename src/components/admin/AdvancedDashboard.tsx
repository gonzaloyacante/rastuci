'use client';

import { useState } from 'react';
import { LineChart, BarChart, PieChart, MetricCard, ProgressRing } from '@/components/charts/ChartComponents';
import { 
  MockDataGenerator, 
  ChartDataProcessor, 
  formatChartValue, 
  calculateGrowthRate 
} from '@/lib/charts';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Download,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface DashboardFilters {
  period: '7d' | '30d' | '90d' | '1y';
  category?: string;
  region?: string;
}

export function AdvancedDashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({ period: '30d' });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock data - in real app, this would come from API
  const salesData = MockDataGenerator.generateSalesData(30);
  const productData = MockDataGenerator.generateProductData();
  const categoryData = MockDataGenerator.generateCategoryData();
  const userActivityData = MockDataGenerator.generateUserActivityData();
  const conversionData = MockDataGenerator.generateConversionFunnelData();
  const revenueByRegion = MockDataGenerator.generateRevenueByRegionData();
  const inventoryStatus = MockDataGenerator.generateInventoryStatusData();
  const customerSegments = MockDataGenerator.generateCustomerSegmentData();

  // Process data for charts
  const topProducts = ChartDataProcessor.processTopItems(
    productData,
    item => item.value,
    item => item.label,
    5
  );

  // Calculate metrics
  const totalRevenue = salesData.reduce((sum, point) => sum + point.value, 0);
  const totalOrders = Math.floor(totalRevenue / 85); // Assuming avg order value of 85€
  const totalCustomers = Math.floor(totalOrders * 0.7); // Assuming some repeat customers
  const conversionRate = (totalOrders / 50000) * 100; // Assuming 50k visitors

  // Growth calculations (mock previous period data)
  const previousRevenue = totalRevenue * 0.85;
  const revenueGrowth = calculateGrowthRate(totalRevenue, previousRevenue);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  const handleExport = () => {
    // In real app, this would generate and download a report
    console.log('Exporting dashboard data...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Avanzado</h1>
          <p className="text-muted">
            Última actualización: {lastUpdated.toLocaleString('es-ES')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Period Filter */}
          <div className="flex items-center gap-1 surface border border-muted rounded-lg p-1">
            {[
              { value: '7d', label: '7d' },
              { value: '30d', label: '30d' },
              { value: '90d', label: '90d' },
              { value: '1y', label: '1a' },
            ].map(period => (
              <button
                key={period.value}
                onClick={() => setFilters(prev => ({ ...prev, period: period.value as '7d' | '30d' | '90d' | '1y' }))}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  filters.period === period.value
                    ? 'bg-primary text-white'
                    : 'hover-surface'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>

          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Ingresos Totales"
          value={formatChartValue(totalRevenue, 'currency')}
          change={revenueGrowth}
          icon={<DollarSign className="w-6 h-6" />}
        />
        
        <MetricCard
          title="Pedidos"
          value={totalOrders.toLocaleString()}
          change={12.5}
          icon={<ShoppingCart className="w-6 h-6" />}
        />
        
        <MetricCard
          title="Clientes"
          value={totalCustomers.toLocaleString()}
          change={8.2}
          icon={<Users className="w-6 h-6" />}
        />
        
        <MetricCard
          title="Tasa de Conversión"
          value={`${conversionRate.toFixed(2)}%`}
          change={-0.3}
          icon={<TrendingUp className="w-6 h-6" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="lg:col-span-2">
          <LineChart
            data={salesData}
            config={{
              type: 'line',
              title: 'Tendencia de Ventas',
              subtitle: 'Ingresos diarios en los últimos 30 días',
              yAxis: { format: 'currency' },
            }}
            height={300}
          />
        </div>

        {/* Top Products */}
        <BarChart
          data={topProducts}
          config={{
            type: 'bar',
            title: 'Productos Más Vendidos',
            subtitle: 'Top 5 productos por unidades vendidas',
          }}
          height={300}
        />

        {/* Category Distribution */}
        <PieChart
          data={categoryData}
          config={{
            type: 'pie',
            title: 'Distribución por Categoría',
            subtitle: 'Porcentaje de ventas por categoría',
          }}
          height={300}
        />

        {/* User Activity */}
        <LineChart
          data={userActivityData}
          config={{
            type: 'line',
            title: 'Actividad de Usuarios',
            subtitle: 'Usuarios activos por hora (últimas 24h)',
          }}
          height={250}
        />

        {/* Revenue by Region */}
        <BarChart
          data={revenueByRegion}
          config={{
            type: 'bar',
            title: 'Ingresos por Región',
            subtitle: 'Distribución geográfica de ventas',
          }}
          height={250}
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Conversion Funnel */}
        <div className="surface border border-muted rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Embudo de Conversión</h3>
          <div className="space-y-3">
            {conversionData.map((step, index) => {
              const percentage = index === 0 ? 100 : (step.value / conversionData[0].value) * 100;
              return (
                <div key={step.label} className="flex items-center justify-between">
                  <span className="text-sm">{step.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory Status */}
        <div className="surface border border-muted rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Estado del Inventario</h3>
          <div className="flex justify-center">
            <ProgressRing
              value={inventoryStatus.find(s => s.label === 'En Stock')?.value || 0}
              max={inventoryStatus.reduce((sum, s) => sum + s.value, 0)}
              size={100}
              color="rgb(76, 175, 80)"
            >
              <div className="text-center">
                <div className="text-lg font-bold">85%</div>
                <div className="text-xs text-muted">En Stock</div>
              </div>
            </ProgressRing>
          </div>
          <div className="mt-4 space-y-2">
            {inventoryStatus.map(status => (
              <div key={status.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <span>{status.label}</span>
                </div>
                <span className="font-medium">{status.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Segments */}
        <div className="surface border border-muted rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Segmentos de Clientes</h3>
          <PieChart
            data={customerSegments}
            config={{ type: 'pie', title: '' }}
            height={200}
          />
        </div>

        {/* Quick Stats */}
        <div className="surface border border-muted rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Estadísticas Rápidas</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Ticket Medio</span>
              <span className="font-semibold">
                {formatChartValue(totalRevenue / totalOrders, 'currency')}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Productos Activos</span>
              <span className="font-semibold">1,247</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Categorías</span>
              <span className="font-semibold">24</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Tasa de Retorno</span>
              <span className="font-semibold text-success">2.1%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Satisfacción</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold">4.7</span>
                <span className="text-xs text-muted">/5.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="surface border border-muted rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Actividad Reciente</h3>
          <Badge variant="secondary">Tiempo Real</Badge>
        </div>
        
        <div className="space-y-3">
          {[
            { time: '14:32', event: 'Nueva venta', details: 'Pedido #12847 - €127.50', type: 'sale' },
            { time: '14:28', event: 'Stock bajo', details: 'Camiseta Premium - Solo 5 unidades', type: 'warning' },
            { time: '14:25', event: 'Nuevo cliente', details: 'María García se registró', type: 'user' },
            { time: '14:20', event: 'Reseña positiva', details: 'Zapatillas Sport - 5 estrellas', type: 'review' },
            { time: '14:15', event: 'Devolución procesada', details: 'Pedido #12834 - €89.00', type: 'return' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-2 hover-surface rounded">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'sale' ? 'bg-success' :
                activity.type === 'warning' ? 'bg-warning' :
                activity.type === 'user' ? 'bg-primary' :
                activity.type === 'review' ? 'bg-info' :
                'bg-muted'
              }`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{activity.event}</span>
                  <span className="text-xs text-muted">{activity.time}</span>
                </div>
                <p className="text-sm text-muted">{activity.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
