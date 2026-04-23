"use client";

import { AlertTriangle, ArrowLeft, Printer } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { CustomerInfoCard } from "@/components/admin/orders/CustomerInfoCard";
import { OrderActionsCard } from "@/components/admin/orders/OrderActionsCard";
import {
  OrderStatusBadge,
  STATUS_CONFIG,
} from "@/components/admin/orders/OrderStatusBadge";
import { OrderStatusTimeline } from "@/components/admin/orders/OrderStatusTimeline";
import { OrderSummaryCard } from "@/components/admin/orders/OrderSummaryCard";
import { ShipmentControlCard } from "@/components/admin/orders/ShipmentControlCard";
import { DetailViewSkeleton } from "@/components/admin/skeletons";
import { Button } from "@/components/ui/Button";
import { PAYMENT_METHOD_DISPLAY, STATUS_HEADER_BG } from "@/hooks/useOrderCard";
import { useOrderDetail } from "@/hooks/useOrderDetail";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/utils/formatters";

const STATUS_HERO_BG: Record<string, string> = {
  warning: "bg-amber-50 border-b border-amber-200",
  info: "bg-blue-50 border-b border-blue-200",
  success: "bg-emerald-50 border-b border-emerald-200",
  error: "bg-red-50 border-b border-red-200",
  default: "bg-surface-secondary border-b border-border",
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { order, loading, error, handleOrderUpdate } = useOrderDetail(orderId);

  if (loading) return <DetailViewSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border border-red-200">
          <AlertTriangle size={22} className="text-red-500" />
        </div>
        <p className="text-base font-medium">{error}</p>
        <p className="text-sm text-muted-foreground">
          Verificá el ID del pedido o intentá nuevamente.
        </p>
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
  const statusVariant = statusEntry?.variant ?? "default";
  const heroBg = STATUS_HERO_BG[statusVariant] ?? STATUS_HERO_BG.default;
  const pm =
    PAYMENT_METHOD_DISPLAY[order.paymentMethod ?? "unknown"] ??
    PAYMENT_METHOD_DISPLAY.unknown;

  return (
    <div>
      {/* ── Status Hero Banner ───────────────────────────────── */}
      <div
        className={cn("rounded-xl mb-6 overflow-hidden border border-border")}
      >
        {/* Back nav */}
        <div className="px-5 pt-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={13} />
            Volver a pedidos
          </button>
        </div>

        {/* Hero content */}
        <div className={cn("px-5 py-4", heroBg)}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Order ID + status */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight font-mono">
                  #{order.id.slice(-8).toUpperCase()}
                </h1>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {order.customerName}
                </span>
                <span className="text-muted-foreground/40">·</span>
                <span>{formatDate(order.createdAt)}</span>
                <span className="text-muted-foreground/40">·</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                    pm.pill
                  )}
                >
                  <pm.Icon size={10} className="shrink-0" />
                  {pm.label}
                </span>
              </div>
            </div>

            {/* Total + print */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                  Total
                </p>
                <p className="text-3xl font-bold tabular-nums tracking-tight">
                  {formatCurrency(order.total)}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="hidden sm:flex items-center gap-2 h-auto py-2 bg-surface/80"
              >
                <Printer size={14} />
                <span className="text-xs">Imprimir</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <OrderStatusTimeline order={order} />
          <OrderSummaryCard order={order} />
        </div>

        {/* Sidebar */}
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
