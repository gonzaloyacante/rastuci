"use client";

import { DownloadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  AdminEmpty,
  AdminEmptyIcons,
  AdminError,
  AdminPageHeader,
  OrderCard,
  OrderCardData,
  Pagination,
} from "@/components/admin";
import { STATUS_CONFIG } from "@/components/admin/orders/OrderStatusBadge";
import { OrdersSkeleton } from "@/components/admin/skeletons";
import { FilterBar, SearchBar } from "@/components/search";
import { ADMIN_ROUTES } from "@/config/routes";
import { useDocumentTitle, useOrderExport } from "@/hooks";
import { type Order, useOrders } from "@/hooks/useOrders";
import { formatCurrency, formatDateRelative } from "@/utils/formatters";

type StatusFilter =
  | "ALL"
  | "PENDING"
  | "PENDING_PAYMENT"
  | "RESERVED"
  | "PROCESSED"
  | "DELIVERED"
  | "CANCELLED";

// Configuración de filtros
const FILTER_FIELDS = [
  {
    key: "status",
    label: "Estado",
    type: "select" as const,
    options: [
      { value: "ALL", label: "Todos los estados" },
      { value: "PENDING_PAYMENT", label: "Aguardando Pago" },
      { value: "RESERVED", label: "Reservado (Efectivo)" },
      { value: "PROCESSED", label: "Listo para entregar" },
      { value: "DELIVERED", label: "Entregado" },
      { value: "CANCELLED", label: "Cancelado" },
      { value: "PENDING", label: "Incompleto" },
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
function getStatusLabel(status: string): string {
  return STATUS_CONFIG[status]?.label ?? status;
}

// Transform Order to OrderCardData
function toOrderCardData(order: Order): OrderCardData {
  return {
    id: order.id,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress,
    status: order.status,
    total: order.total,
    createdAt: order.createdAt,
    itemsCount: order.items.length,
    shippingMethod: order.shippingMethod,
    caTrackingNumber: order.caTrackingNumber,
    paymentMethod: order.paymentMethod ?? "unknown",
  };
}

export default function OrdersPage() {
  const router = useRouter();
  useDocumentTitle({ title: "Pedidos" });

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [shippingFilter, setShippingFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Data fetching
  const { orders, loading, error, totalPages, fetchOrders } = useOrders();

  // CSV export logic delegada al hook
  const { exportToCSV } = useOrderExport(orders);

  useEffect(() => {
    fetchOrders({
      page: currentPage,
      limit: 10,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      search: searchTerm || undefined,
      shippingMethod: shippingFilter === "ALL" ? undefined : shippingFilter,
    });
  }, [statusFilter, shippingFilter, searchTerm, currentPage, fetchOrders]);

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
              onClick: () => router.push(ADMIN_ROUTES.ORDERS_PENDING),
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={{
                  ...toOrderCardData(order),
                  relativeTime: formatDateRelative(order.createdAt),
                }}
                formatCurrency={formatCurrency}
                onStatusChange={() => setCurrentPage(1)}
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
