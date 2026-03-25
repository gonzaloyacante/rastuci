"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { AnalyticsPageHeader, BulkActionsBar } from "@/components/admin";
import { TrackingSkeleton } from "@/components/admin/skeletons";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { useDocumentTitle } from "@/hooks";

import {
  alertOptions,
  AlertsPanel,
  AnalyticsPanel,
  StatsCards,
  statusOptions,
  TrackingData,
  TrackingStats,
  TrackingTable,
} from "./TrackingSections";

// ============================================================================
// Filter helper
// ============================================================================

function filterItem(
  item: TrackingData,
  statusFilter: string,
  searchTerm: string,
  alertFilter: string
): boolean {
  if (statusFilter !== "all" && item.status !== statusFilter) return false;
  const q = searchTerm.toLowerCase();
  const fields = [item.trackingCode, item.orderId, item.customerName];
  if (searchTerm && !fields.some((f) => f.toLowerCase().includes(q)))
    return false;
  if (alertFilter === "alerts") return item.alertLevel !== "none";
  return alertFilter === "all" || item.alertLevel === alertFilter;
}

export default function AdminTrackingDashboard() {
  useDocumentTitle({ title: "Seguimiento de Envíos" });
  const [trackingData, setTrackingData] = useState<TrackingData[]>([]);
  const [stats, setStats] = useState<TrackingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [alertFilter, setAlertFilter] = useState("all");
  const { show } = useToast();

  const loadTrackingData = useCallback(
    async (isMounted = true) => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/tracking");
        if (!response.ok) throw new Error("Error");
        const data = await response.json();
        if (isMounted) {
          setTrackingData(data.trackings || []);
          setStats(data.stats || null);
        }
      } catch {
        if (isMounted) {
          show({ type: "error", message: "No se pudieron cargar los datos" });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    },
    [show]
  );

  useEffect(() => {
    let isMounted = true;
    void loadTrackingData(isMounted);
    return () => {
      isMounted = false;
    };
  }, [loadTrackingData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/admin/tracking/refresh", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Error HTTP al actualizar");
      await loadTrackingData();
      show({ type: "success", message: "Datos actualizados correctamente" });
    } catch {
      show({ type: "error", message: "Error al actualizar" });
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/tracking/export");
      if (!response.ok) throw new Error("Error");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tracking-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      show({ type: "success", message: "Datos exportados correctamente" });
    } catch {
      show({ type: "error", message: "Error al exportar" });
    }
  };

  const handleBulkUpdate = async (newStatus: string) => {
    if (selectedItems.length === 0 || refreshing) return;
    try {
      setRefreshing(true);
      await fetch("/api/admin/tracking/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingIds: selectedItems, status: newStatus }),
      });
      await loadTrackingData(true);
      setSelectedItems([]);
      show({
        type: "success",
        message: `${selectedItems.length} envíos actualizados`,
      });
    } catch {
      show({ type: "error", message: "Error al actualizar" });
    } finally {
      setRefreshing(false);
    }
  };

  const filteredData = trackingData.filter((item) =>
    filterItem(item, statusFilter, searchTerm, alertFilter)
  );

  const toggleItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedItems(
      selectedItems.length === filteredData.length
        ? []
        : filteredData.map((i) => i.id)
    );
  };

  if (loading) return <TrackingSkeleton />;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AnalyticsPageHeader
        title="Dashboard de Tracking"
        subtitle="Gestiona y monitorea todos los envíos"
        onRefresh={handleRefresh}
        onExport={handleExport}
        refreshing={refreshing}
      />

      {stats && <StatsCards stats={stats} />}

      <Tabs defaultValue="tracking" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tracking">Tracking de Envíos</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted h-4 w-4" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={alertFilter} onValueChange={setAlertFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {alertOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <BulkActionsBar
            selectedCount={selectedItems.length}
            actions={[
              {
                label: "Marcar en tránsito",
                onClick: () => handleBulkUpdate("in-transit"),
              },
              {
                label: "Marcar entregado",
                onClick: () => handleBulkUpdate("delivered"),
              },
            ]}
            onClear={() => setSelectedItems([])}
          />

          <TrackingTable
            data={filteredData}
            selectedItems={selectedItems}
            onToggleItem={toggleItem}
            onSelectAll={selectAll}
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <AlertsPanel alerts={trackingData} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsPanel stats={stats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
