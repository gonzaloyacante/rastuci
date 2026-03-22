"use client";

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Truck,
} from "lucide-react";

import { MetricCard } from "@/components/admin";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

// ============================================================================
// Types
// ============================================================================

export interface TrackingData {
  id: string;
  orderId: string;
  trackingCode: string;
  status: string;
  ocaStatus?: string;
  lastUpdated: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: string;
  estimatedDelivery?: string;
  alertLevel: "none" | "warning" | "error";
  alertMessage?: string;
}

export interface TrackingStats {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  delayed: number;
  avgDeliveryTime: number;
}

// ============================================================================
// Constants
// ============================================================================

export const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  "in-transit": "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  delayed: "bg-red-100 text-red-800",
  error: "bg-red-100 text-red-800",
};

export const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  "in-transit": Truck,
  delivered: CheckCircle,
  delayed: AlertTriangle,
  error: AlertTriangle,
};

export const statusOptions = [
  { value: "all", label: "Todos los estados" },
  { value: "pending", label: "Pendiente" },
  { value: "in-transit", label: "En tránsito" },
  { value: "delivered", label: "Entregado" },
  { value: "delayed", label: "Retrasado" },
  { value: "error", label: "Error" },
];

export const alertOptions = [
  { value: "all", label: "Todas las alertas" },
  { value: "alerts", label: "Solo con alertas" },
  { value: "warning", label: "Advertencias" },
  { value: "error", label: "Errores" },
];

// ============================================================================
// Stats Cards Component
// ============================================================================

export function StatsCards({ stats }: { stats: TrackingStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <MetricCard title="Total Envíos" value={stats.total} icon={Package} />
      <MetricCard title="En Tránsito" value={stats.inTransit} icon={Truck} />
      <MetricCard
        title="Entregados"
        value={stats.delivered}
        icon={CheckCircle}
      />
      <MetricCard
        title="Tiempo Promedio"
        value={`${stats.avgDeliveryTime} días`}
        icon={Clock}
      />
    </div>
  );
}

// ============================================================================
// Tracking Table Component
// ============================================================================

export interface TrackingTableProps {
  data: TrackingData[];
  selectedItems: string[];
  onToggleItem: (id: string) => void;
  onSelectAll: () => void;
}

export function TrackingTable({
  data,
  selectedItems,
  onToggleItem,
  onSelectAll,
}: TrackingTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Envíos Activos</CardTitle>
          <Button variant="outline" size="sm" onClick={onSelectAll}>
            {selectedItems.length === data.length && data.length > 0
              ? "Deseleccionar todo"
              : "Seleccionar todo"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile View - Cards */}
        <div className="block lg:hidden space-y-3">
          {data.map((item) => {
            const StatusIcon = statusIcons[item.status] || Clock;
            return (
              <div key={item.id} className="border rounded-lg p-3 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => onToggleItem(item.id)}
                      className="rounded mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs sm:text-sm font-medium break-all">
                        {item.trackingCode}
                      </div>
                      <div className="text-xs text-muted">
                        Pedido: {item.orderId}
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={statusColors[item.status] || "surface-secondary"}
                  >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    <span className="text-xs">{item.status}</span>
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="font-medium text-sm">{item.customerName}</div>
                  <div className="text-xs text-muted break-all">
                    {item.customerEmail}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">
                    CA: {item.ocaStatus || "N/A"}
                  </span>
                  <span className="text-muted">
                    {new Date(item.lastUpdated).toLocaleDateString()}
                  </span>
                </div>

                {item.alertLevel !== "none" && (
                  <Badge
                    variant={
                      item.alertLevel === "error" ? "destructive" : "secondary"
                    }
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    <span className="text-xs">{item.alertLevel}</span>
                  </Badge>
                )}

                <Button variant="ghost" size="sm" className="w-full">
                  Ver Detalles
                </Button>
              </div>
            );
          })}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">
                  <input
                    type="checkbox"
                    checked={
                      selectedItems.length === data.length && data.length > 0
                    }
                    onChange={onSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="text-left p-2 text-xs">Código</th>
                <th className="text-left p-2 text-xs">Pedido</th>
                <th className="text-left p-2 text-xs">Cliente</th>
                <th className="text-left p-2 text-xs">Estado</th>
                <th className="text-left p-2 text-xs">Estado CA</th>
                <th className="text-left p-2 text-xs">Última Act.</th>
                <th className="text-left p-2 text-xs">Alertas</th>
                <th className="text-left p-2 text-xs">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => {
                const StatusIcon = statusIcons[item.status] || Clock;
                return (
                  <tr
                    key={item.id}
                    className="border-b hover:surface-secondary"
                  >
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => onToggleItem(item.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-2 font-mono text-sm">
                      {item.trackingCode}
                    </td>
                    <td className="p-2 font-medium">{item.orderId}</td>
                    <td className="p-2">
                      <div className="font-medium">{item.customerName}</div>
                      <div className="text-sm text-muted">
                        {item.customerEmail}
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge
                        className={
                          statusColors[item.status] || "surface-secondary"
                        }
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {item.status}
                      </Badge>
                    </td>
                    <td className="p-2 text-sm">{item.ocaStatus || "N/A"}</td>
                    <td className="p-2 text-sm text-muted">
                      {new Date(item.lastUpdated).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      {item.alertLevel !== "none" && (
                        <Badge
                          variant={
                            item.alertLevel === "error"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {item.alertLevel}
                        </Badge>
                      )}
                    </td>
                    <td className="p-2">
                      <Button variant="ghost" size="sm">
                        Ver
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {data.length === 0 && (
          <div className="text-center py-8 text-muted">
            No se encontraron envíos que coincidan con los filtros
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Alerts Panel Component
// ============================================================================

export function AlertsPanel({ alerts }: { alerts: TrackingData[] }) {
  const filteredAlerts = alerts.filter((item) => item.alertLevel !== "none");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas y Problemas</CardTitle>
      </CardHeader>
      <CardContent>
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted">
            No hay alertas activas
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 p-4 badge-destructive rounded-lg border"
              >
                <AlertTriangle className="h-5 w-5 text-error mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-error">
                    {item.trackingCode} - {item.customerName}
                  </div>
                  <div className="text-sm text-error">
                    {item.alertMessage || "Problema detectado en el envío"}
                  </div>
                  <div className="text-xs text-error mt-1">
                    Última actualización:{" "}
                    {new Date(item.lastUpdated).toLocaleString()}
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Resolver
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Analytics Panel Component
// ============================================================================

const STATUS_DISTRIBUTION = (stats: TrackingStats) => [
  { label: "Pendiente", value: stats.pending, color: "badge-warning" },
  { label: "En tránsito", value: stats.inTransit, color: "badge-default" },
  { label: "Entregado", value: stats.delivered, color: "badge-success" },
  { label: "Retrasado", value: stats.delayed, color: "badge-destructive" },
];

function StatusDistributionCard({ stats }: { stats: TrackingStats }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de Estados</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {STATUS_DISTRIBUTION(stats).map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 ${item.color} rounded`} />
            <span className="text-sm">
              {item.label}: {item.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function AnalyticsPanel({ stats }: { stats: TrackingStats | null }) {
  if (!stats) return null;

  const deliveryRate =
    stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Entrega</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Tiempo promedio de entrega</span>
            <span className="font-bold">{stats.avgDeliveryTime} días</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Tasa de entrega exitosa</span>
            <span className="font-bold">{deliveryRate}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Envíos retrasados</span>
            <span className="font-bold text-error">{stats.delayed}</span>
          </div>
        </CardContent>
      </Card>
      <StatusDistributionCard stats={stats} />
    </div>
  );
}
