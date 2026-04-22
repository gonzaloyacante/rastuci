"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { AdminEmpty, AdminEmptyIcons, AdminError } from "@/components/admin";
import { OrderCard } from "@/components/admin/orders/OrderCard";
import { OrdersSkeleton } from "@/components/admin/skeletons";
import { Button } from "@/components/ui/Button";
import { useDocumentTitle } from "@/hooks";
import {
  PENDING_STATUS_CONFIG,
  PENDING_STATUSES,
  type PendingStatusFilter,
  usePendingOrders,
} from "@/hooks/usePendingOrders";
import { formatCurrency } from "@/utils/formatters";

const TAB_ACTIVE_STYLES: Record<PendingStatusFilter, string> = {
  PENDING_PAYMENT:
    "bg-amber-50 border-amber-300 text-amber-900 shadow-sm shadow-amber-100",
  WAITING_TRANSFER_PROOF:
    "bg-blue-50 border-blue-300 text-blue-900 shadow-sm shadow-blue-100",
  PAYMENT_REVIEW:
    "bg-violet-50 border-violet-300 text-violet-900 shadow-sm shadow-violet-100",
  RESERVED:
    "bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm shadow-emerald-100",
};

const TAB_DOT_STYLES: Record<PendingStatusFilter, string> = {
  PENDING_PAYMENT: "bg-amber-500",
  WAITING_TRANSFER_PROOF: "bg-blue-500",
  PAYMENT_REVIEW: "bg-violet-500",
  RESERVED: "bg-emerald-500",
};

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function PendingOrdersPage() {
  useDocumentTitle({ title: "Pedidos Pendientes" });
  const router = useRouter();

  const {
    activeStatus,
    config,
    orders,
    ordersCount,
    loading,
    error,
    handleStatusChange,
    handleRetry,
    handleOrderUpdate,
  } = usePendingOrders();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => router.back()}
              className="p-1 rounded-lg text-muted-foreground hover:text-base-primary hover:bg-surface-secondary transition-all"
              aria-label="Volver"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-2xl font-bold text-base-primary">
              Pedidos Pendientes
            </h1>
          </div>
          <p className="text-sm text-muted-foreground pl-8">
            {config.description}
          </p>
        </div>
        <Button
          variant="outline"
          className="shrink-0 text-sm"
          onClick={() => router.push("/admin/pedidos")}
        >
          Ver todos los pedidos
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {PENDING_STATUSES.map((status) => {
          const isActive = status === activeStatus;
          const cfg = PENDING_STATUS_CONFIG[status];
          return (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-150 ${
                isActive
                  ? TAB_ACTIVE_STYLES[status]
                  : "bg-surface border-border text-muted-foreground hover:bg-surface-secondary hover:text-base-primary"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${TAB_DOT_STYLES[status]}`}
              />
              {cfg.label}
              {isActive && !loading && ordersCount > 0 && (
                <span className="ml-0.5 bg-white/60 rounded-md px-1.5 py-0.5 text-xs font-semibold">
                  {ordersCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <OrdersSkeleton />
      ) : error ? (
        <AdminError
          message={error}
          actions={[
            { label: "Reintentar", onClick: handleRetry, variant: "primary" },
          ]}
        />
      ) : orders.length === 0 ? (
        <AdminEmpty
          icon={AdminEmptyIcons.orders}
          title={config.emptyTitle}
          description="No hay pedidos en este estado. ¡Todo está al día!"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              onStatusChange={handleOrderUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
