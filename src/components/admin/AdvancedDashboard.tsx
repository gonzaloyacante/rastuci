'use client';

import { useState, useEffect } from 'react';
import { LineChart, BarChart, PieChart, MetricCard, ProgressRing } from '@/components/charts/ChartComponents';
import {
  ChartDataProcessor,
  formatChartValue,
  calculateGrowthRate,
  ChartDataPoint,
  TimeSeriesPoint,
} from '@/lib/charts';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Download,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface DashboardFilters {
  period: '7d' | '30d' | '90d' | '1y';
  category?: string;
  region?: string;
}

// Minimal raw types for API responses used by the dashboard
interface RawOrderItem {
  id: string;
  quantity: number;
  price: number;
  productId: string;
  product?: { id: string; name: string; category?: { id: string; name: string } };
}

interface RawOrder {
  id: string;
  createdAt: string;
  total: number;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerEmail?: string;
  items?: RawOrderItem[];
}

interface RawProduct {
  id: string;
  name: string;
  stock?: number;
  rating?: number;
  category?: { id: string; name: string };
}

export function AdvancedDashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({ period: '30d' });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Data loaded from API
  const [salesData, setSalesData] = useState<TimeSeriesPoint[]>([]);
  const [productData, setProductData] = useState<ChartDataPoint[]>([]);
  const [categoryData, setCategoryData] = useState<ChartDataPoint[]>([]);
  const [userActivityData, setUserActivityData] = useState<TimeSeriesPoint[]>([]);
  const [revenueByRegion, setRevenueByRegion] = useState<ChartDataPoint[]>([]);
  const [inventoryStatus, setInventoryStatus] = useState<ChartDataPoint[]>([]);
  const [customerSegments, setCustomerSegments] = useState<ChartDataPoint[]>([]);

  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [revenueGrowth, setRevenueGrowth] = useState<number | undefined>(undefined);
  const [rawOrders, setRawOrders] = useState<RawOrder[]>([]);
  const [rawProducts, setRawProducts] = useState<RawProduct[]>([]);

  useEffect(() => {
    // Load initial dashboard data
    (async () => {
      setIsLoading(true);
      try {
        await loadDashboardData();
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadDashboardData() {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch(`/api/orders?page=1&limit=1000`),
        fetch(`/api/products?page=1&limit=1000`),
      ]);

      if (!ordersRes.ok || !productsRes.ok) {
        console.error('Failed to fetch dashboard data');
        return;
      }

      const ordersJson = await ordersRes.json();
      const productsJson = await productsRes.json();

  const orders = (Array.isArray(ordersJson?.data?.data) ? ordersJson.data.data : []) as RawOrder[];
  const products = (Array.isArray(productsJson?.data?.data) ? productsJson.data.data : []) as RawProduct[];
  setRawOrders(orders);
  setRawProducts(products);

      // Sales time series
      const salesPoints: TimeSeriesPoint[] = orders.map(o => ({ timestamp: new Date(o.createdAt), value: Number(o.total || 0) }));
      setSalesData(salesPoints);

      // Totals
      const revenue = salesPoints.reduce((s, p) => s + p.value, 0);
      setTotalRevenue(revenue);
      setTotalOrders(orders.length);
  const uniqueCustomers = new Set(orders.map(o => (o.customerPhone || o.customerAddress || o.customerName)));
      setTotalCustomers(uniqueCustomers.size);

      // Top products
      const productMap = new Map<string, { label: string; value: number }>();
      for (const ord of orders) {
        for (const item of ord.items || []) {
          const label = item.product?.name || item.productId || 'Producto';
          const prev = productMap.get(item.productId) ?? { label, value: 0 };
          prev.value += Number(item.quantity || 0);
          productMap.set(item.productId, prev);
        }
      }
      setProductData(Array.from(productMap.values()));

      // Category revenue
      const categoryMap = new Map<string, { label: string; value: number }>();
      for (const ord of orders) {
        for (const item of ord.items || []) {
          const cat = item.product?.category?.name || 'Sin categoría';
          const prev = categoryMap.get(cat) ?? { label: cat, value: 0 };
          prev.value += Number(item.price || 0) * Number(item.quantity || 0);
          categoryMap.set(cat, prev);
        }
      }
  setCategoryData(Array.from(categoryMap.values()));

  // User activity (orders in last 24h)
  const now = new Date();
  const last24h = orders.filter(o => (now.getTime() - new Date(o.createdAt).getTime()) <= 24 * 60 * 60 * 1000);
  const activityPoints: TimeSeriesPoint[] = last24h.map(o => ({ timestamp: new Date(o.createdAt), value: 1 }));
  setUserActivityData(activityPoints);

      // Inventory status
      const inv = { in_stock: 0, low_stock: 0, out_of_stock: 0 };
      for (const p of products) {
        const s = Number(p.stock || 0);
        if (s <= 0) inv.out_of_stock += 1;
        else if (s <= 5) inv.low_stock += 1;
        else inv.in_stock += 1;
      }
      setInventoryStatus([
        { label: 'En Stock', value: inv.in_stock, color: '#4caf50' },
        { label: 'Stock Bajo', value: inv.low_stock, color: '#ff9800' },
        { label: 'Agotado', value: inv.out_of_stock, color: '#f44336' },
      ]);

      // Customer segments
      const customerOrders = new Map<string, number>();
      for (const ord of orders) {
  const k = ord.customerPhone || ord.customerEmail || ord.customerName || ord.id;
        customerOrders.set(k, (customerOrders.get(k) || 0) + 1);
      }
      let newC = 0, recur = 0, vip = 0;
      for (const [, c] of customerOrders) {
        if (c === 1) newC++;
        else if (c < 5) recur++;
        else vip++;
      }
      setCustomerSegments([
        { label: 'Nuevos Clientes', value: newC, color: '#4caf50' },
        { label: 'Recurrentes', value: recur, color: '#2196f3' },
        { label: 'VIP', value: vip, color: '#ff9800' },
      ]);

      // revenue growth (simple comparison previous period)
      try {
        const days = 30;
        const now = new Date();
        const start = new Date(now);
        start.setDate(now.getDate() - days);
        const prevStart = new Date(start);
        prevStart.setDate(prevStart.getDate() - days);
        const prevOrders = orders.filter(o => new Date(o.createdAt) >= prevStart && new Date(o.createdAt) < start);
        const prevRevenue = prevOrders.reduce((s, o) => s + Number(o.total || 0), 0);
        setRevenueGrowth(calculateGrowthRate(revenue, prevRevenue));
      } catch {
        setRevenueGrowth(undefined);
      }

      // Revenue by region (best-effort using customerAddress)
      const regionMap = new Map<string, { label: string; value: number }>();
      for (const ord of orders) {
        const region = ord.customerAddress || 'Otros';
        const prev = regionMap.get(region) ?? { label: region, value: 0 };
        prev.value += Number(ord.total || 0);
        regionMap.set(region, prev);
      }
      setRevenueByRegion(Array.from(regionMap.values()));

      // mark last updated
      setLastUpdated(new Date());

    } catch (err) {
      console.error('Error loading dashboard data', err);
    }
  }

  const handleRefresh = async () => {
    setIsLoading(true);
    await loadDashboardData();
    setIsLoading(false);
  };

  const topProducts = ChartDataProcessor.processTopItems(
    productData,
    (item) => item.value,
    (item) => item.label,
    5,
  );

  const recentOrders = rawOrders
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

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
          change={undefined}
          icon={<ShoppingCart className="w-6 h-6" />}
        />
        
        <MetricCard
          title="Clientes"
          value={totalCustomers.toLocaleString()}
          change={undefined}
          icon={<Users className="w-6 h-6" />}
        />
        
        <MetricCard
          title="Tasa de Conversión"
          value={'N/A'}
          change={undefined}
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
            {customerSegments && customerSegments.length > 0 ? (
              customerSegments.map((seg) => (
                <div key={seg.label} className="flex items-center justify-between">
                  <span className="text-sm">{seg.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${(seg.value || 0)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {seg.value}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted">No hay datos disponibles para el embudo de conversión.</div>
            )}
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
                {totalOrders > 0 ? formatChartValue(totalRevenue / totalOrders, 'currency') : 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Productos Activos</span>
              <span className="font-semibold">{rawProducts.length}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Categorías</span>
              <span className="font-semibold">{categoryData.length}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Tasa de Retorno</span>
              <span className="font-semibold text-success">N/A</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Satisfacción (media)</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold">{rawProducts.length > 0 ? (rawProducts.reduce((s, p) => s + (p.rating || 0), 0) / rawProducts.length).toFixed(1) : 'N/A'}</span>
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
          {/* Recent orders */}
          {recentOrders.map((o) => (
            <Link key={o.id} href={`/admin/pedidos/${o.id}`} className="block">
              <div className="flex items-center gap-3 p-2 hover-surface rounded">
                <div className={`w-2 h-2 rounded-full bg-success`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">Nueva venta</span>
                    <span className="text-xs text-muted">{new Date(o.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-muted">Pedido #{o.id} - {formatChartValue(o.total, 'currency')}</p>
                </div>
              </div>
            </Link>
          ))}

          {/* Low stock alerts */}
          {rawProducts.filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5).slice(0, 5).map(p => (
            <div key={`low-${p.id}`} className="flex items-center gap-3 p-2 hover-surface rounded">
              <div className={`w-2 h-2 rounded-full bg-warning`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">Stock bajo</span>
                </div>
                <p className="text-sm text-muted">{p.name} - Solo {p.stock} unidades</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
