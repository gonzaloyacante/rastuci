"use client";

import {
  EmptyState,
  PageHeaderWithActions,
  SearchFiltersBar,
  TabLayout,
  TabPanel,
} from "@/components/admin";
import { LogisticsSkeleton } from "@/components/admin/skeletons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useDocumentTitle } from "@/hooks";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  RefreshCw,
  RotateCcw,
  Star,
  Truck,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

// ============================================================================
// Types
// ============================================================================

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  isActive: boolean;
  leadTime: number;
}

interface OptimizedRoute {
  id: string;
  date: string;
  region: string;
  driver: string;
  orders: Array<{ orderId: string }>;
  totalDistance: number;
  estimatedDuration: string;
  status: "planned" | "in_progress" | "completed";
}

interface ReturnRequest {
  id: string;
  orderId: string;
  customerEmail: string;
  status: "pending" | "approved" | "rejected" | "processing" | "completed";
  returnType: string;
  items: Array<{ productName: string; quantity: number }>;
  customerReason: string;
  refundAmount?: number;
  createdAt: string;
}

type TabType = "suppliers" | "routes" | "returns";

// ============================================================================
// Status Badge
// ============================================================================

const statusConfig: Record<
  string,
  { className: string; label: string; icon: React.ReactNode }
> = {
  active: {
    className: "badge-success",
    label: "Activo",
    icon: <CheckCircle size={12} />,
  },
  inactive: {
    className: "badge-error",
    label: "Inactivo",
    icon: <AlertTriangle size={12} />,
  },
  planned: {
    className: "badge-info",
    label: "Planificada",
    icon: <Clock size={12} />,
  },
  in_progress: {
    className: "badge-warning",
    label: "En Progreso",
    icon: <Truck size={12} />,
  },
  completed: {
    className: "badge-success",
    label: "Completada",
    icon: <CheckCircle size={12} />,
  },
  pending: {
    className: "badge-warning",
    label: "Pendiente",
    icon: <Clock size={12} />,
  },
  approved: {
    className: "badge-success",
    label: "Aprobada",
    icon: <CheckCircle size={12} />,
  },
  rejected: {
    className: "badge-error",
    label: "Rechazada",
    icon: <AlertTriangle size={12} />,
  },
  processing: {
    className: "badge-info",
    label: "Procesando",
    icon: <RefreshCw size={12} />,
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || {
    className: "badge-default",
    label: status,
    icon: null,
  };
  return (
    <Badge className={config.className}>
      <span className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </span>
    </Badge>
  );
}

// ============================================================================
// Suppliers Tab
// ============================================================================

function SuppliersGrid({ suppliers }: { suppliers: Supplier[] }) {
  if (suppliers.length === 0) {
    return (
      <EmptyState
        icon={<Package size={48} />}
        title="No hay proveedores"
        description="Agrega proveedores para gestionar la cadena de suministro"
        action={{ label: "Agregar Proveedor", onClick: () => {} }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {suppliers.map((supplier) => (
        <Card
          key={supplier.id}
          className="p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-primary">{supplier.name}</h3>
              <p className="text-sm text-muted">{supplier.category}</p>
            </div>
            <StatusBadge status={supplier.isActive ? "active" : "inactive"} />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted">
              <Mail size={14} />
              {supplier.email}
            </div>
            <div className="flex items-center gap-2 text-muted">
              <Phone size={14} />
              {supplier.phone}
            </div>
            <div className="flex items-center gap-2 text-muted">
              <MapPin size={14} />
              {supplier.address}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-muted">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-500 fill-current" />
              <span className="font-medium">{supplier.rating}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted">
              <Clock size={14} />
              {supplier.leadTime} días
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// Routes Tab
// ============================================================================

function RoutesGrid({ routes }: { routes: OptimizedRoute[] }) {
  if (routes.length === 0) {
    return (
      <EmptyState
        icon={<Truck size={48} />}
        title="No hay rutas optimizadas"
        description="Crea rutas optimizadas para las entregas"
        action={{ label: "Optimizar Rutas", onClick: () => {} }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {routes.map((route) => (
        <Card key={route.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-primary">Ruta {route.id}</h3>
              <p className="text-sm text-muted">{route.region}</p>
            </div>
            <StatusBadge status={route.status} />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Conductor:</span>
              <span className="font-medium">{route.driver}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Pedidos:</span>
              <span className="font-medium">{route.orders.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Distancia:</span>
              <span className="font-medium">{route.totalDistance} km</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Duración est.:</span>
              <span className="font-medium">{route.estimatedDuration}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-muted">
            <span className="text-sm text-muted">
              {new Date(route.date).toLocaleDateString("es-AR")}
            </span>
            <Button variant="outline" size="sm">
              Ver Detalles
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// Returns Tab
// ============================================================================

function ReturnsGrid({ returns }: { returns: ReturnRequest[] }) {
  if (returns.length === 0) {
    return (
      <EmptyState
        icon={<RotateCcw size={48} />}
        title="No hay solicitudes de devolución"
        description="Las solicitudes de devolución aparecerán aquí"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {returns.map((returnReq) => (
        <Card
          key={returnReq.id}
          className="p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-primary">
                Devolución #{returnReq.id}
              </h3>
              <p className="text-sm text-muted">Pedido: {returnReq.orderId}</p>
            </div>
            <div className="flex gap-2">
              <StatusBadge status={returnReq.status} />
              <Badge className="badge-default">{returnReq.returnType}</Badge>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted">
              <Mail size={14} />
              {returnReq.customerEmail}
            </div>
            <p className="text-muted line-clamp-2">
              {returnReq.customerReason}
            </p>
          </div>
          <div className="mt-3">
            <p className="text-sm font-medium mb-2">
              Productos ({returnReq.items.length}):
            </p>
            <div className="space-y-1">
              {returnReq.items.slice(0, 2).map((item, idx) => (
                <div
                  key={idx}
                  className="text-sm flex items-center justify-between"
                >
                  <span className="text-muted truncate">
                    {item.productName}
                  </span>
                  <span>x{item.quantity}</span>
                </div>
              ))}
              {returnReq.items.length > 2 && (
                <p className="text-xs text-muted">
                  +{returnReq.items.length - 2} más
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-muted">
            <span className="text-sm text-muted">
              {new Date(returnReq.createdAt).toLocaleDateString("es-AR")}
            </span>
            {returnReq.refundAmount && (
              <span className="font-medium">
                ${returnReq.refundAmount.toLocaleString("es-AR")}
              </span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

const tabs = [
  { id: "suppliers", label: "Proveedores", icon: <Package size={16} /> },
  { id: "routes", label: "Rutas", icon: <Truck size={16} /> },
  { id: "returns", label: "Devoluciones", icon: <RotateCcw size={16} /> },
];

const supplierStatusOptions = [
  { value: "all", label: "Todos los estados" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
];

const routeStatusOptions = [
  { value: "all", label: "Todos los estados" },
  { value: "planned", label: "Planificadas" },
  { value: "in_progress", label: "En Progreso" },
  { value: "completed", label: "Completadas" },
];

const returnStatusOptions = [
  { value: "all", label: "Todos los estados" },
  { value: "pending", label: "Pendientes" },
  { value: "approved", label: "Aprobadas" },
  { value: "processing", label: "En Proceso" },
  { value: "completed", label: "Completadas" },
  { value: "rejected", label: "Rechazadas" },
];

export default function LogisticsPage() {
  useDocumentTitle({ title: "Logística" });
  const [activeTab, setActiveTab] = useState<TabType>("suppliers");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [routes, setRoutes] = useState<OptimizedRoute[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/logistics?type=${activeTab}&status=${statusFilter}&search=${searchTerm}`
      );
      if (!response.ok) throw new Error("Error");
      const result = await response.json();
      if (result.success) {
        if (activeTab === "suppliers")
          setSuppliers(result.data.suppliers || []);
        else if (activeTab === "routes") setRoutes(result.data.routes || []);
        else if (activeTab === "returns") setReturns(result.data.returns || []);
      }
    } catch {
      if (activeTab === "suppliers") setSuppliers([]);
      else if (activeTab === "routes") setRoutes([]);
      else if (activeTab === "returns") setReturns([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getAddLabel = () => {
    if (activeTab === "suppliers") return "Nuevo Proveedor";
    if (activeTab === "routes") return "Nueva Ruta";
    if (activeTab === "returns") return "Nueva Solicitud";
    return "";
  };

  const getStatusOptions = () => {
    if (activeTab === "suppliers") return supplierStatusOptions;
    if (activeTab === "routes") return routeStatusOptions;
    if (activeTab === "returns") return returnStatusOptions;
    return [];
  };

  if (loading) return <LogisticsSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeaderWithActions
        title="Logística"
        subtitle="Gestiona proveedores, rutas de entrega y devoluciones"
      >
        <Button variant="primary" className="gap-2">
          <Plus size={16} />
          {getAddLabel()}
        </Button>
      </PageHeaderWithActions>

      <TabLayout
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as TabType)}
      >
        <SearchFiltersBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={getStatusOptions()}
          onRefresh={fetchData}
        />

        <TabPanel id="suppliers" activeTab={activeTab}>
          <SuppliersGrid suppliers={suppliers} />
        </TabPanel>

        <TabPanel id="routes" activeTab={activeTab}>
          <RoutesGrid routes={routes} />
        </TabPanel>

        <TabPanel id="returns" activeTab={activeTab}>
          <ReturnsGrid returns={returns} />
        </TabPanel>
      </TabLayout>
    </div>
  );
}
