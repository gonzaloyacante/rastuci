"use client";

import { LogisticsSkeleton } from "@/components/admin/skeletons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
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
  Search,
  Star,
  Truck,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  isActive: boolean;
  paymentTerms: string;
  leadTime: number;
  totalOrders: number;
  onTimeDelivery: number;
  createdAt: string;
  updatedAt: string;
}

interface OptimizedRoute {
  id: string;
  date: string;
  region: string;
  vehicleType: string;
  driver: string;
  orders: Array<{
    orderId: string;
    customerName: string;
    address: string;
    priority: string;
    estimatedTime: string;
    status: string;
  }>;
  totalDistance: number;
  estimatedDuration: string;
  fuelCost: number;
  status: "planned" | "in_progress" | "completed";
  createdAt: string;
}

interface ReturnRequest {
  id: string;
  orderId: string;
  customerEmail: string;
  status: "pending" | "approved" | "rejected" | "processing" | "completed";
  returnType: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    reason: string;
    condition?: string;
  }>;
  customerReason: string;
  adminNotes?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  completedAt?: string;
}

type TabType = "suppliers" | "routes" | "returns";

const LogisticsPage: React.FC = () => {
  useDocumentTitle({ title: "Logística" });
  const [activeTab, setActiveTab] = useState<TabType>("suppliers");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [routes, setRoutes] = useState<OptimizedRoute[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/logistics?type=${activeTab}&status=${statusFilter}&search=${searchTerm}`
      );

      if (!response.ok) {
        throw new Error("Error al cargar datos");
      }

      const result = await response.json();

      if (result.success) {
        switch (activeTab) {
          case "suppliers":
            setSuppliers(result.data.suppliers || []);
            break;
          case "routes":
            setRoutes(result.data.routes || []);
            break;
          case "returns":
            setReturns(result.data.returns || []);
            break;
        }
      }
    } catch {
      // Set empty arrays on error
      switch (activeTab) {
        case "suppliers":
          setSuppliers([]);
          break;
        case "routes":
          setRoutes([]);
          break;
        case "returns":
          setReturns([]);
          break;
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "suppliers", label: "Proveedores", icon: <Package size={16} /> },
    { id: "routes", label: "Rutas", icon: <Truck size={16} /> },
    { id: "returns", label: "Devoluciones", icon: <RotateCcw size={16} /> },
  ];

  const getStatusBadge = (status: string) => {
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
  };

  if (loading) {
    return <LogisticsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Logística</h1>
          <p className="text-muted">
            Gestiona proveedores, rutas de entrega y devoluciones
          </p>
        </div>
        <Button variant="primary" className="gap-2">
          <Plus size={16} />
          {activeTab === "suppliers" && "Nuevo Proveedor"}
          {activeTab === "routes" && "Nueva Ruta"}
          {activeTab === "returns" && "Nueva Solicitud"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-muted pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg flex items-center gap-2 transition-colors ${
              activeTab === tab.id
                ? "surface-secondary text-primary font-medium"
                : "text-muted hover:text-primary"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input"
        >
          <option value="all">Todos los estados</option>
          {activeTab === "suppliers" && (
            <>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </>
          )}
          {activeTab === "routes" && (
            <>
              <option value="planned">Planificadas</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completadas</option>
            </>
          )}
          {activeTab === "returns" && (
            <>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="processing">En Proceso</option>
              <option value="completed">Completadas</option>
              <option value="rejected">Rechazadas</option>
            </>
          )}
        </select>
        <Button variant="outline" onClick={fetchData} className="gap-2">
          <RefreshCw size={16} />
          Actualizar
        </Button>
      </div>

      {/* Content */}
      {activeTab === "suppliers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.length === 0 ? (
            <Card className="col-span-full p-8 text-center">
              <Package size={48} className="mx-auto mb-4 text-muted" />
              <h3 className="text-lg font-medium text-primary mb-2">
                No hay proveedores
              </h3>
              <p className="text-muted mb-4">
                Agrega proveedores para gestionar la cadena de suministro
              </p>
              <Button variant="primary" className="gap-2">
                <Plus size={16} />
                Agregar Proveedor
              </Button>
            </Card>
          ) : (
            suppliers.map((supplier) => (
              <Card
                key={supplier.id}
                className="p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-primary">
                      {supplier.name}
                    </h3>
                    <p className="text-sm text-muted">{supplier.category}</p>
                  </div>
                  {getStatusBadge(supplier.isActive ? "active" : "inactive")}
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
            ))
          )}
        </div>
      )}

      {activeTab === "routes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.length === 0 ? (
            <Card className="col-span-full p-8 text-center">
              <Truck size={48} className="mx-auto mb-4 text-muted" />
              <h3 className="text-lg font-medium text-primary mb-2">
                No hay rutas optimizadas
              </h3>
              <p className="text-muted mb-4">
                Crea rutas optimizadas para las entregas
              </p>
              <Button variant="primary" className="gap-2">
                <Plus size={16} />
                Optimizar Rutas
              </Button>
            </Card>
          ) : (
            routes.map((route) => (
              <Card
                key={route.id}
                className="p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-primary">
                      Ruta {route.id}
                    </h3>
                    <p className="text-sm text-muted">{route.region}</p>
                  </div>
                  {getStatusBadge(route.status)}
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
                    <span className="font-medium">
                      {route.totalDistance} km
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Duración est.:</span>
                    <span className="font-medium">
                      {route.estimatedDuration}
                    </span>
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
            ))
          )}
        </div>
      )}

      {activeTab === "returns" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {returns.length === 0 ? (
            <Card className="col-span-full p-8 text-center">
              <RotateCcw size={48} className="mx-auto mb-4 text-muted" />
              <h3 className="text-lg font-medium text-primary mb-2">
                No hay solicitudes de devolución
              </h3>
              <p className="text-muted">
                Las solicitudes de devolución aparecerán aquí
              </p>
            </Card>
          ) : (
            returns.map((returnReq) => (
              <Card
                key={returnReq.id}
                className="p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-primary">
                      Devolución #{returnReq.id}
                    </h3>
                    <p className="text-sm text-muted">
                      Pedido: {returnReq.orderId}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(returnReq.status)}
                    <Badge className="badge-default">
                      {returnReq.returnType}
                    </Badge>
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
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LogisticsPage;
