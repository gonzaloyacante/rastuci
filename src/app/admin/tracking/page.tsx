"use client";

import { TrackingSkeleton } from "@/components/admin/skeletons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useDocumentTitle } from "@/hooks";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Package,
  RefreshCw,
  Search,
  Truck,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface TrackingData {
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

interface TrackingStats {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  delayed: number;
  avgDeliveryTime: number;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  "in-transit": "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  delayed: "bg-red-100 text-red-800",
  error: "bg-red-100 text-red-800",
};

const statusIcons = {
  pending: Clock,
  "in-transit": Truck,
  delivered: CheckCircle,
  delayed: AlertTriangle,
  error: AlertTriangle,
};

export default function AdminTrackingDashboard() {
  useDocumentTitle({ title: "Seguimiento de Envíos" });
  const [trackingData, setTrackingData] = useState<TrackingData[]>([]);
  const [stats, setStats] = useState<TrackingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [alertFilter, setAlertFilter] = useState<string>("all");
  const { toast } = useToast();

  const loadTrackingData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/tracking");

      if (!response.ok) {
        throw new Error("Error al cargar datos de tracking");
      }

      const data = await response.json();
      setTrackingData(data.trackings || []);
      setStats(data.stats || null);
    } catch {
      // Error handling without console.error
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de tracking",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTrackingData();
  }, [loadTrackingData]);

  const refreshTrackingData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/admin/tracking/refresh", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Error al actualizar tracking");
      }

      await loadTrackingData();
      toast({
        title: "Actualización completada",
        description: "Los datos de tracking han sido actualizados",
      });
    } catch {
      // Error handling without console.error
      toast({
        title: "Error",
        description: "Error al actualizar los datos de tracking",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const updateBulkStatus = async (newStatus: string) => {
    if (selectedItems.length === 0) {
      toast({
        title: "Aviso",
        description: "Selecciona al menos un envío para actualizar",
        variant: "default",
      });
      return;
    }

    try {
      const response = await fetch("/api/admin/tracking/bulk-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trackingIds: selectedItems,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar envíos");
      }

      await loadTrackingData();
      setSelectedItems([]);
      toast({
        title: "Actualización completada",
        description: `${selectedItems.length} envíos actualizados correctamente`,
      });
    } catch {
      // Error handling without console.error
      toast({
        title: "Error",
        description: "Error al actualizar los envíos seleccionados",
        variant: "destructive",
      });
    }
  };

  const exportTrackingData = async () => {
    try {
      const response = await fetch("/api/admin/tracking/export");

      if (!response.ok) {
        throw new Error("Error al exportar datos");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tracking-data-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Exportación completada",
        description: "Los datos han sido exportados correctamente",
      });
    } catch {
      // Error handling without console.error
      toast({
        title: "Error",
        description: "Error al exportar los datos",
        variant: "destructive",
      });
    }
  };

  const filteredTrackingData = trackingData.filter((item) => {
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    const matchesSearch =
      searchTerm === "" ||
      item.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAlert =
      alertFilter === "all" ||
      (alertFilter === "alerts" && item.alertLevel !== "none") ||
      item.alertLevel === alertFilter;

    return matchesStatus && matchesSearch && matchesAlert;
  });

  const toggleItemSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === filteredTrackingData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredTrackingData.map((item) => item.id));
    }
  };

  if (loading) {
    return <TrackingSkeleton />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Tracking</h1>
          <p className="text-muted">Gestiona y monitorea todos los envíos</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={refreshTrackingData}
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
          <Button onClick={exportTrackingData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Envíos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Tránsito</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inTransit}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entregados</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.delivered}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tiempo Promedio
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.avgDeliveryTime} días
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="tracking" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tracking">Tracking de Envíos</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted h-4 w-4" />
                <Input
                  placeholder="Buscar por código, pedido, cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "Todos los estados" },
                { value: "pending", label: "Pendiente" },
                { value: "in-transit", label: "En tránsito" },
                { value: "delivered", label: "Entregado" },
                { value: "delayed", label: "Retrasado" },
                { value: "error", label: "Error" },
              ]}
              placeholder="Filtrar por estado"
              className="w-48"
            />

            <Select
              value={alertFilter}
              onChange={setAlertFilter}
              options={[
                { value: "all", label: "Todas las alertas" },
                { value: "alerts", label: "Solo con alertas" },
                { value: "warning", label: "Advertencias" },
                { value: "error", label: "Errores" },
              ]}
              placeholder="Filtrar por alertas"
              className="w-48"
            />
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-4 p-4 surface-secondary rounded-lg border">
              <span className="text-sm font-medium">
                {selectedItems.length} envíos seleccionados
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => updateBulkStatus("in-transit")}
                  variant="outline"
                >
                  Marcar en tránsito
                </Button>
                <Button
                  size="sm"
                  onClick={() => updateBulkStatus("delivered")}
                  variant="outline"
                >
                  Marcar entregado
                </Button>
                <Button
                  size="sm"
                  onClick={() => setSelectedItems([])}
                  variant="ghost"
                >
                  Limpiar selección
                </Button>
              </div>
            </div>
          )}

          {/* Tracking Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Envíos Activos</CardTitle>
                <Button variant="outline" size="sm" onClick={selectAllItems}>
                  {selectedItems.length === filteredTrackingData.length
                    ? "Deseleccionar todo"
                    : "Seleccionar todo"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">
                        <input
                          type="checkbox"
                          checked={
                            selectedItems.length ===
                              filteredTrackingData.length &&
                            filteredTrackingData.length > 0
                          }
                          onChange={selectAllItems}
                          className="rounded"
                        />
                      </th>
                      <th className="text-left p-2">Código Tracking</th>
                      <th className="text-left p-2">Pedido</th>
                      <th className="text-left p-2">Cliente</th>
                      <th className="text-left p-2">Estado</th>
                      <th className="text-left p-2">Estado OCA</th>
                      <th className="text-left p-2">Última Act.</th>
                      <th className="text-left p-2">Alertas</th>
                      <th className="text-left p-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrackingData.map((item) => {
                      const StatusIcon =
                        statusIcons[item.status as keyof typeof statusIcons] ||
                        Clock;
                      return (
                        <tr
                          key={item.id}
                          className="border-b hover:surface-secondary"
                        >
                          <td className="p-2">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => toggleItemSelection(item.id)}
                              className="rounded"
                            />
                          </td>
                          <td className="p-2 font-mono text-sm">
                            {item.trackingCode}
                          </td>
                          <td className="p-2">
                            <span className="font-medium">{item.orderId}</span>
                          </td>
                          <td className="p-2">
                            <div>
                              <div className="font-medium">
                                {item.customerName}
                              </div>
                              <div className="text-sm text-muted">
                                {item.customerEmail}
                              </div>
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge
                              className={
                                statusColors[
                                  item.status as keyof typeof statusColors
                                ] || "surface-secondary text-content"
                              }
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {item.status}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <span className="text-sm">
                              {item.ocaStatus || "N/A"}
                            </span>
                          </td>
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
                              Ver detalles
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredTrackingData.length === 0 && (
                <div className="text-center py-8 text-muted">
                  No se encontraron envíos que coincidan con los filtros
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas y Problemas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trackingData
                  .filter((item) => item.alertLevel !== "none")
                  .map((item) => (
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
                          {item.alertMessage ||
                            "Problema detectado en el envío"}
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

                {trackingData.filter((item) => item.alertLevel !== "none")
                  .length === 0 && (
                  <div className="text-center py-8 text-muted">
                    No hay alertas activas
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Tiempo promedio de entrega</span>
                    <span className="font-bold">
                      {stats?.avgDeliveryTime || 0} días
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tasa de entrega exitosa</span>
                    <span className="font-bold">
                      {stats
                        ? Math.round((stats.delivered / stats.total) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Envíos retrasados</span>
                    <span className="font-bold text-error">
                      {stats?.delayed || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Estados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 badge-warning rounded"></div>
                    <span className="text-sm">
                      Pendiente: {stats?.pending || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 badge-default rounded"></div>
                    <span className="text-sm">
                      En tránsito: {stats?.inTransit || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 badge-success rounded"></div>
                    <span className="text-sm">
                      Entregado: {stats?.delivered || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 badge-destructive rounded"></div>
                    <span className="text-sm">
                      Retrasado: {stats?.delayed || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
