"use client";

import {
  AdminEmpty,
  AdminEmptyIcons,
  AdminError,
  AdminPageHeader,
  OrderCard,
  OrderCardData,
  Pagination,
} from "@/components/admin";
import { OrdersSkeleton } from "@/components/admin/skeletons";
import { FilterBar, SearchBar } from "@/components/search";
import { useDocumentTitle } from "@/hooks";
import { useOrders, type Order } from "@/hooks/useOrders";
import { logger } from "@/lib/logger";
import { DownloadIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

type StatusFilter =
  | "ALL"
  | "PENDING"
  | "PENDING_PAYMENT"
  | "PROCESSED"
  | "DELIVERED";

// Configuración de filtros
const FILTER_FIELDS = [
  {
    key: "status",
    label: "Estado",
    type: "select" as const,
    options: [
      { value: "ALL", label: "Todos los estados" },
      { value: "PENDING", label: "Sin pagar" },
      { value: "PENDING_PAYMENT", label: "⚠️ Esperando pago de envío" },
      { value: "PROCESSED", label: "Listo para entregar" },
      { value: "DELIVERED", label: "Entregado" },
    ],
  },
  {
    key: "shipping",
    label: "Método de Envío",
    type: "select" as const,
    options: [
      { value: "ALL", label: "Todos los métodos" },
      { value: "pickup", label: "Retiro en tienda" },
      { value: "standard", label: "Envío estándar" },
      { value: "express", label: "Envío express" },
      { value: "ca", label: "Correo Argentino" },
    ],
  },
];

// Helpers
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const timeAgo = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `hace ${days} día${days > 1 ? "s" : ""}`;
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? "s" : ""}`;
  if (minutes > 0) return `hace ${minutes} min`;
  return "recién";
};

const formatCurrency = (value: number) => `$${value.toLocaleString("es-AR")}`;

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: "sin pagar",
    PENDING_PAYMENT: "esperando pago de envío",
    PROCESSED: "listo para entregar",
    DELIVERED: "entregado",
  };
  return labels[status] || status;
};

const _getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: "bg-gray-100 text-gray-800",
    PENDING_PAYMENT: "bg-yellow-100 text-yellow-800 border-2 border-yellow-400",
    PROCESSED: "bg-green-100 text-green-800",
    DELIVERED: "bg-blue-100 text-blue-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

// Transform Order to OrderCardData
const toOrderCardData = (order: Order): OrderCardData => ({
  id: order.id,
  customerName: order.customerName,
  customerPhone: order.customerPhone,
  customerAddress: order.customerAddress,
  status: order.status,
  total: order.total,
  createdAt: order.createdAt,
  itemsCount: order.items.length,
  shippingMethod: (order as { shippingMethod?: string }).shippingMethod,
  caTrackingNumber: (order as { caTrackingNumber?: string }).caTrackingNumber,
});

export default function OrdersPage() {
  useDocumentTitle({ title: "Pedidos" });

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [shippingFilter, setShippingFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Data fetching
  const { orders, loading, error, totalPages, fetchOrders } = useOrders();

  useEffect(() => {
    fetchOrders({
      page: currentPage,
      limit: 10,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      search: searchTerm || undefined,
    });
  }, [statusFilter, searchTerm, currentPage, fetchOrders]);

  // Handlers
  const handleFilterChange = useCallback(
    (key: string, value: string | string[] | null) => {
      if (key === "status" && typeof value === "string") {
        setStatusFilter(value as StatusFilter);
        setCurrentPage(1);
      } else if (key === "shipping" && typeof value === "string") {
        setShippingFilter(value);
        setCurrentPage(1);
      }
    },
    []
  );

  const handleReset = useCallback(() => {
    setStatusFilter("ALL");
    setShippingFilter("ALL");
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const exportToCSV = useCallback(() => {
    try {
      if (orders.length === 0) {
        toast.error("No hay pedidos para exportar");
        return;
      }

      // Cabeceras completas con toda la información relevante
      const headers = [
        "ID",
        "Cliente",
        "Email",
        "Teléfono",
        "Dirección",
        "Total",
        "Subtotal Productos",
        "Costo Envío",
        "Estado",
        "Estado Pago MP",
        "Método de Envío",
        "Tracking",
        "Fecha Creación",
        "Productos",
        "Tallas/Colores",
      ];

      const csvContent = [
        headers.join(","),
        ...orders.map((order: Order) => {
          // Calcular subtotal de productos
          const subtotalProducts = order.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          // Productos con detalle
          const products = order.items
            .map((item) => `${item.quantity}x ${item.product.name}`)
            .join("; ");

          // Tallas y colores
          const variants = order.items
            .map((item) => {
              const parts = [];
              if (item.size) parts.push(`Talla: ${item.size}`);
              if (item.color) parts.push(`Color: ${item.color}`);
              return parts.length > 0 ? parts.join(", ") : "-";
            })
            .join("; ");

          return [
            order.id,
            order.customerName,
            order.customerEmail || "No especificado",
            order.customerPhone,
            order.customerAddress || "No especificada",
            order.total,
            subtotalProducts,
            order.shippingCost || 0,
            getStatusLabel(order.status),
            order.mpStatus || "N/A",
            order.shippingMethod || "No especificado",
            order.caTrackingNumber || "Sin tracking",
            formatDate(order.createdAt),
            products,
            variants,
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`) // Escapar comillas dobles
            .join(",");
        }),
      ].join("\n");

      // Agregar BOM para UTF-8 y que Excel lo lea bien
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `pedidos_rastuci_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Pedidos exportados correctamente");
    } catch (err) {
      logger.error("Error al exportar pedidos", { error: err });
      toast.error("Error al exportar pedidos");
    }
  }, [orders]);

  // Empty state message
  const getEmptyMessage = () => {
    if (searchTerm)
      return "No se encontraron pedidos con ese criterio de búsqueda.";
    if (statusFilter !== "ALL")
      return `No hay pedidos con estado ${getStatusLabel(statusFilter)}.`;
    return "Aún no hay pedidos registrados en el sistema.";
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <AdminPageHeader
          title="Pedidos"
          subtitle="Gestiona todos los pedidos de la tienda"
          actions={[
            {
              label: "Exportar",
              onClick: exportToCSV,
              variant: "outline",
              icon: <DownloadIcon size={16} />,
            },
            {
              label: "Ver Pendientes",
              onClick: () =>
                (window.location.href = "/admin/pedidos/pendientes"),
              variant: "primary",
            },
          ]}
        />
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <SearchBar
          value={searchTerm}
          onChange={(value: string) => {
            setSearchTerm(value);
            if (!value.trim()) setCurrentPage(1);
          }}
          onSearch={() => setCurrentPage(1)}
          placeholder="Buscar pedidos por nombre de cliente..."
        />
        <FilterBar
          fields={FILTER_FIELDS}
          values={{ status: statusFilter, shipping: shippingFilter }}
          onChange={handleFilterChange}
          onReset={handleReset}
        />
      </div>

      {/* Content */}
      {loading ? (
        <OrdersSkeleton />
      ) : error ? (
        <AdminError
          message={error}
          actions={[
            {
              label: "Reintentar",
              onClick: () => setCurrentPage(1),
              variant: "primary",
            },
          ]}
        />
      ) : orders.length === 0 ? (
        <AdminEmpty
          icon={AdminEmptyIcons.orders}
          title="No hay pedidos"
          description={getEmptyMessage()}
          action={
            searchTerm || statusFilter !== "ALL"
              ? {
                  label: "Ver todos los pedidos",
                  onClick: handleReset,
                  variant: "outline",
                }
              : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={{
                  ...toOrderCardData(order),
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  relativeTime: timeAgo(order.createdAt as any),
                }}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
                onStatusChange={() => setCurrentPage(1)} // Recargar datos
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            disabled={loading}
          />
        </>
      )}
    </div>
  );
}
