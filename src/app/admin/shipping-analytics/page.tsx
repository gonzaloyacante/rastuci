'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Calendar, TrendingUp, TrendingDown, Minus, Download } from "lucide-react";

interface DateRange {
  start: string;
  end: string;
}

interface DeliveryMetrics {
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  totalOrders: number;
  deliveredOrders: number;
  delayedOrders: number;
  averageShippingCost: number;
  totalShippingRevenue: number;
  performanceByRegion: Array<{
    region: string;
    averageDeliveryTime: number;
    onTimeRate: number;
    orderCount: number;
    avgCost: number;
  }>;
  deliveryTimeDistribution: Array<{
    timeRange: string;
    count: number;
    percentage: number;
  }>;
  trendsOverTime: Array<{
    date: string;
    deliveryTime: number;
    onTimeRate: number;
    avgCost: number;
    orderCount: number;
  }>;
}

interface CustomerSatisfactionMetrics {
  overallSatisfactionRate: number;
  totalResponses: number;
  satisfactionByDeliveryTime: Array<{
    timeRange: string;
    avgRating: number;
    responseCount: number;
  }>;
  npsScore: number;
  recommendationRate: number;
}

interface ShippingAnalyticsData {
  dateRange: DateRange;
  delivery: DeliveryMetrics;
  satisfaction?: CustomerSatisfactionMetrics;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgDeliveryTime: number;
    performanceScore: number;
    trendsIndicator: 'improving' | 'declining' | 'stable';
  };
}

export default function ShippingAnalytics() {
  const [data, setData] = useState<ShippingAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [includeDetails, setIncludeDetails] = useState(true);

  // Establecer fechas por defecto (últimos 30 días)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  const fetchAnalytics = useCallback(async () => {
    if (!startDate || !endDate) {
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate,
        endDate,
        includeDetails: includeDetails.toString(),
      });
      
      if (selectedRegion) {
        params.append('region', selectedRegion);
      }

      const response = await fetch(`/api/analytics/shipping-performance?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch {
      // Error silencioso
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedRegion, includeDetails]);

  // Cargar datos cuando cambien los filtros
  useEffect(() => {
    if (startDate && endDate) {
      fetchAnalytics();
    }
  }, [startDate, endDate, selectedRegion, includeDetails, fetchAnalytics]);

  const exportData = async () => {
    if (!data) {
      return;
    }
    
    // Crear CSV con los datos
    const csvData = [
      ['Métrica', 'Valor'],
      ['Tiempo Promedio de Entrega (días)', data.delivery.averageDeliveryTime.toString()],
      ['Tasa de Entrega a Tiempo (%)', data.delivery.onTimeDeliveryRate.toString()],
      ['Total de Órdenes', data.delivery.totalOrders.toString()],
      ['Órdenes Entregadas', data.delivery.deliveredOrders.toString()],
      ['Costo Promedio de Envío', `$${data.delivery.averageShippingCost}`],
      ['Ingresos Totales de Envío', `$${data.delivery.totalShippingRevenue}`],
      ['Puntaje de Performance', data.summary.performanceScore.toString()],
    ];

    if (data.satisfaction) {
      csvData.push(
        ['Satisfacción Promedio', data.satisfaction.overallSatisfactionRate.toString()],
        ['NPS Score', data.satisfaction.npsScore.toString()],
        ['Tasa de Recomendación (%)', data.satisfaction.recommendationRate.toString()]
      );
    }

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shipping-analytics-${startDate}-${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-error" />;
      default:
        return <Minus className="h-4 w-4 muted" />;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) {
      return 'text-success';
    }
    if (score >= 60) {
      return 'text-warning';
    }
    return 'text-error';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 muted">Cargando analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics de Envíos</h1>
        <Button onClick={exportData} variant="outline" disabled={!data}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Fecha Inicio</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fecha Fin</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Región</label>
              <Select 
                value={selectedRegion} 
                onChange={(value: string) => setSelectedRegion(value)}
                placeholder="Todas las regiones"
                options={[
                  { label: "Todas las regiones", value: "" },
                  { label: "Buenos Aires", value: "Buenos Aires" },
                  { label: "Córdoba", value: "Córdoba" },
                  { label: "Rosario", value: "Rosario" },
                  { label: "Mendoza", value: "Mendoza" },
                ]}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeDetails}
                  onChange={(e) => setIncludeDetails(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Incluir satisfacción</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {data && (
        <>
          {/* Resumen General */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Performance General</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getPerformanceColor(data.summary.performanceScore)}`}>
                    {data.summary.performanceScore}%
                  </span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(data.summary.trendsIndicator)}
                    <Badge variant={
                      data.summary.trendsIndicator === 'improving' ? 'default' :
                      data.summary.trendsIndicator === 'declining' ? 'destructive' : 'secondary'
                    }>
                      {data.summary.trendsIndicator === 'improving' ? 'Mejorando' :
                       data.summary.trendsIndicator === 'declining' ? 'Declinando' : 'Estable'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Tiempo Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.delivery.averageDeliveryTime} días</div>
                <p className="text-sm muted">Tiempo de entrega</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Entregas a Tiempo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {data.delivery.onTimeDeliveryRate}%
                </div>
                <p className="text-sm muted">
                  {data.delivery.deliveredOrders} de {data.delivery.totalOrders} órdenes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Ingresos de Envío</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${data.delivery.totalShippingRevenue}</div>
                <p className="text-sm muted">
                  Promedio: ${data.delivery.averageShippingCost}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Distribución de Tiempos de Entrega */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Tiempos de Entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.delivery.deliveryTimeDistribution.map((item) => (
                  <div key={item.timeRange} className="flex items-center justify-between">
                    <span className="font-medium">{item.timeRange}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-surface-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm muted w-16 text-right">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance por Región */}
          <Card>
            <CardHeader>
              <CardTitle>Performance por Región</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Región</th>
                      <th className="text-right py-2">Tiempo Promedio</th>
                      <th className="text-right py-2">Tasa a Tiempo</th>
                      <th className="text-right py-2">Órdenes</th>
                      <th className="text-right py-2">Costo Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.delivery.performanceByRegion.map((region) => (
                      <tr key={region.region} className="border-b">
                        <td className="py-2 font-medium">{region.region}</td>
                        <td className="text-right py-2">{region.averageDeliveryTime} días</td>
                        <td className="text-right py-2">
                          <span className={
                            region.onTimeRate >= 80 ? 'text-success' :
                            region.onTimeRate >= 60 ? 'text-warning' : 'text-error'
                          }>
                            {region.onTimeRate}%
                          </span>
                        </td>
                        <td className="text-right py-2">{region.orderCount}</td>
                        <td className="text-right py-2">${region.avgCost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Satisfacción del Cliente */}
          {data.satisfaction && (
            <Card>
              <CardHeader>
                <CardTitle>Satisfacción del Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {data.satisfaction.overallSatisfactionRate}/5
                    </div>
                    <p className="text-sm muted">Calificación Promedio</p>
                    <p className="text-xs muted">{data.satisfaction.totalResponses} respuestas</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success">
                      {data.satisfaction.npsScore}
                    </div>
                    <p className="text-sm muted">NPS Score</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">
                      {data.satisfaction.recommendationRate}%
                    </div>
                    <p className="text-sm muted">Tasa de Recomendación</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Satisfacción por Tiempo de Entrega</h4>
                  {data.satisfaction.satisfactionByDeliveryTime.map((item) => (
                    <div key={item.timeRange} className="flex items-center justify-between p-3 surface rounded">
                      <span className="font-medium">{item.timeRange}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-warning text-lg">
                          {'★'.repeat(Math.round(item.avgRating))}
                          {'☆'.repeat(5 - Math.round(item.avgRating))}
                        </span>
                        <span className="text-sm muted">
                          {item.avgRating}/5 ({item.responseCount} respuestas)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}