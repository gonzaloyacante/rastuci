"use client";

import { AlertTriangle, ArrowLeft, Printer } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { CustomerInfoCard } from "@/components/admin/orders/CustomerInfoCard";
import { OrderActionsCard } from "@/components/admin/orders/OrderActionsCard";
import {
  OrderStatusBadge,
  STATUS_CONFIG,
} from "@/components/admin/orders/OrderStatusBadge";
import { OrderSummaryCard } from "@/components/admin/orders/OrderSummaryCard";
import { ShipmentControlCard } from "@/components/admin/orders/ShipmentControlCard";
import { DetailViewSkeleton } from "@/components/admin/skeletons";
import { Button } from "@/components/ui/Button";
import { useOrderDetail } from "@/hooks/useOrderDetail";

// Use generic Order from types since it now includes all admin fields
// Data fetching logic extracted to useOrderDetail hook (SRP)

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { order, loading, error, handleOrderUpdate } = useOrderDetail(orderId);

  if (loading) {
    return <DetailViewSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border border-red-200">
            <AlertTriangle size={22} className="text-red-500" />
          </div>
          <p className="text-base font-medium">{error}</p>
          <p className="text-sm text-muted-foreground">
            Verificá el ID del pedido o intentá nuevamente.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft size={14} className="mr-2" />
          Volver
        </Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Pedido no encontrado</p>
        <Button variant="outline" onClick={() => router.back()}>
          Volver
        </Button>
      </div>
    );
  }

  const statusEntry = STATUS_CONFIG[order.status];

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="space-y-1">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-1"
          >
            <ArrowLeft size={13} />
            Volver a pedidos
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold">
              Pedido{" "}
              <span className="font-mono text-primary">
                #{order.id.substring(0, 8).toUpperCase()}
              </span>
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          {statusEntry && (
            <p className="text-xs text-muted-foreground">{statusEntry.label}</p>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="hidden sm:flex items-center gap-2 self-start"
        >
          <Printer size={15} />
          Imprimir
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          <OrderSummaryCard order={order} />
        </div>

        {/* Columna lateral */}
        <div className="space-y-4">
          <CustomerInfoCard order={order} />
          <ShipmentControlCard
            order={order}
            onOrderUpdate={handleOrderUpdate}
          />
          <OrderActionsCard order={order} onOrderUpdate={handleOrderUpdate} />
        </div>
      </div>
    </div>
  );
}
