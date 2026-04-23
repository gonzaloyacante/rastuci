"use client";

import {
  CheckCircle2,
  ExternalLink,
  Eye,
  MapPin,
  Package,
  Phone,
  Truck as TruckIcon,
  XCircle,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import {
  formatOrderDate,
  type OrderCardData,
  useOrderCard,
} from "@/hooks/useOrderCard";
import { cn } from "@/lib/utils";
import { formatCurrency as defaultFormatCurrency } from "@/utils/formatters";

import { OrderStatusBadge } from "./OrderStatusBadge";
import { shippingMethodLabels } from "./ShippingDisplay";

export type { OrderCardData };

interface OrderCardProps {
  order: OrderCardData;
  formatCurrency?: (value: number) => string;
  onStatusChange?: () => void;
}

export function OrderCard({
  order,
  formatCurrency = defaultFormatCurrency,
  onStatusChange,
}: OrderCardProps) {
  const {
    isUpdating,
    handleMarkProcessed,
    handleMarkDelivered,
    handleApproveTransfer,
    handleCancelOrder,
    openMiCorreo,
    borderClass,
    headerBgClass,
    pm,
    shortId,
    ConfirmDialog,
  } = useOrderCard(order, onStatusChange);

  return (
    <div
      className={cn(
        "group bg-surface border border-border rounded-xl overflow-hidden",
        "hover:shadow-md hover:border-border/80 transition-all duration-150",
        "border-l-4",
        borderClass
      )}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex items-start justify-between gap-3 px-4 pt-4 pb-3",
          headerBgClass
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold leading-tight truncate max-w-[180px]">
              {order.customerName}
            </h3>
            <span className="text-[10px] font-mono text-muted-foreground bg-surface border border-border px-1.5 py-0.5 rounded shrink-0">
              {shortId}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {formatOrderDate(order.createdAt)}
            {order.relativeTime && (
              <span className="ml-1.5 text-muted-foreground/60 italic">
                · {order.relativeTime}
              </span>
            )}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* ── Data rows ──────────────────────────────────────────── */}
      <div className="px-4 pb-3 space-y-2 pt-3">
        {/* Contact */}
        <div className="flex items-center gap-4 flex-wrap">
          <a
            href={`tel:${order.customerPhone}`}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
          >
            <Phone size={11} className="shrink-0 text-muted-foreground" />
            {order.customerPhone}
          </a>
          {order.customerAddress && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground truncate max-w-[260px]">
              <MapPin size={11} className="shrink-0 text-muted-foreground/60" />
              {order.customerAddress}
            </span>
          )}
        </div>

        {/* Pills: payment + shipping */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium",
              pm.pill
            )}
          >
            <pm.Icon size={10} className="shrink-0" />
            {pm.label}
          </span>
          {order.shippingMethod && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface-secondary border border-border text-muted-foreground">
              <Package size={10} className="shrink-0" />
              {shippingMethodLabels[order.shippingMethod] ??
                order.shippingMethod}
            </span>
          )}
          {order.caTrackingNumber && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <TruckIcon size={10} className="shrink-0" />
              <span className="font-mono">{order.caTrackingNumber}</span>
            </span>
          )}
        </div>

        {/* Total + item count */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            {order.itemsCount}{" "}
            {order.itemsCount === 1 ? "producto" : "productos"}
          </span>
          <span className="text-xl font-bold tabular-nums tracking-tight text-foreground">
            {formatCurrency(order.total)}
          </span>
        </div>
      </div>

      {/* ── Actions ────────────────────────────────────────────── */}
      <div className="px-4 pb-4 pt-2 border-t border-border space-y-2">
        <PendingPaymentButtons
          order={order}
          isUpdating={isUpdating}
          onMiCorreo={openMiCorreo}
          onMarkProcessed={handleMarkProcessed}
        />
        {(order.status === "WAITING_TRANSFER_PROOF" ||
          order.status === "PAYMENT_REVIEW") && (
          <Button
            onClick={handleApproveTransfer}
            className="w-full text-xs py-2 font-semibold h-auto bg-emerald-600 hover:bg-emerald-700 text-white"
            loading={isUpdating}
            leftIcon={<CheckCircle2 size={13} />}
          >
            Aprobar Transferencia
          </Button>
        )}
        {order.status === "PROCESSED" && (
          <Button
            onClick={handleMarkDelivered}
            variant="primary"
            className="w-full text-xs py-2 font-semibold h-auto"
            loading={isUpdating}
            leftIcon={<CheckCircle2 size={13} />}
          >
            Marcar entregado
          </Button>
        )}
        <div
          className={cn(
            "grid gap-2",
            order.status !== "DELIVERED" && order.status !== "CANCELLED"
              ? "grid-cols-2"
              : "grid-cols-1"
          )}
        >
          <Link href={`/admin/orders/${order.id}`} className="block">
            <Button
              variant="outline"
              className="w-full text-xs py-2 font-medium hover:bg-surface-secondary h-auto"
              leftIcon={<Eye size={12} />}
            >
              Ver detalles
            </Button>
          </Link>
          {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
            <Button
              onClick={handleCancelOrder}
              variant="destructive"
              className="w-full text-xs py-2 font-medium h-auto bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700"
              disabled={isUpdating}
              leftIcon={<XCircle size={12} />}
            >
              Cancelar
            </Button>
          )}
        </div>
      </div>
      {ConfirmDialog}
    </div>
  );
}

// ─── Private sub-component (pure render, no logic) ────────────────────────────

interface PendingPaymentButtonsProps {
  order: Pick<OrderCardData, "status" | "paymentMethod">;
  isUpdating: boolean;
  onMiCorreo: () => void;
  onMarkProcessed: () => void;
}

function PendingPaymentButtons({
  order,
  isUpdating,
  onMiCorreo,
  onMarkProcessed,
}: PendingPaymentButtonsProps) {
  if (
    order.status !== "PENDING_PAYMENT" ||
    order.paymentMethod === "mercadopago"
  )
    return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <Button
        onClick={onMiCorreo}
        variant="outline"
        className="text-xs py-2 bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900 font-medium h-auto"
        disabled={isUpdating}
        leftIcon={<ExternalLink size={12} />}
      >
        Pagar en MiCorreo
      </Button>
      <Button
        onClick={onMarkProcessed}
        variant="primary"
        className="text-xs py-2 font-medium h-auto"
        loading={isUpdating}
        leftIcon={<CheckCircle2 size={12} />}
      >
        Marcar procesado
      </Button>
    </div>
  );
}
