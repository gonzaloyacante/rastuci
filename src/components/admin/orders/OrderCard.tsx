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
import { ADMIN_ROUTES } from "@/config/routes";
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
    headerBgClass,
    pm,
    shortId,
    ConfirmDialog,
  } = useOrderCard(order, onStatusChange);

  return (
    <div
      className={cn(
        "group bg-surface border border-border rounded-2xl overflow-hidden",
        "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
      )}
    >
      {/* ── Header: customer + financials ──────────────────────── */}
      <div
        className={cn(
          "flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-border/60",
          headerBgClass
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold leading-tight truncate max-w-[180px]">
              {order.customerName}
            </h3>
            <span className="text-[10px] font-mono text-muted-foreground bg-surface border border-border px-1.5 py-0.5 rounded shrink-0">
              {shortId}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {formatOrderDate(order.createdAt)}
            {order.relativeTime && (
              <span className="ml-1.5 text-muted-foreground/60 italic">
                · {order.relativeTime}
              </span>
            )}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground leading-none">
            {formatCurrency(order.total)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5 text-right">
            {order.itemsCount}{" "}
            {order.itemsCount === 1 ? "producto" : "productos"}
          </p>
        </div>
      </div>

      {/* ── Status + payment method ─────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 px-5 py-2 border-b border-border/60">
        <OrderStatusBadge status={order.status} />
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium",
            pm.pill
          )}
        >
          <pm.Icon size={10} className="shrink-0" />
          {pm.label}
        </span>
      </div>

      {/* ── Data rows ──────────────────────────────────────────── */}
      <div className="px-5 pb-3 space-y-2 pt-3">
        {/* Contact */}
        <div className="flex items-center gap-4 flex-wrap">
          <a
            href={`tel:${order.customerPhone}`}
            className="flex items-center gap-1.5 text-xs text-foreground hover:underline font-medium"
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

        {/* Shipping pills */}
        {(order.shippingMethod || order.caTrackingNumber) && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {order.shippingMethod && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface-secondary border border-border text-muted-foreground">
                <Package size={10} className="shrink-0" />
                {shippingMethodLabels[order.shippingMethod] ??
                  order.shippingMethod}
              </span>
            )}
            {order.caTrackingNumber && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-success-50 text-success-700 border border-success-100">
                <TruckIcon size={10} className="shrink-0" />
                <span className="font-mono">{order.caTrackingNumber}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Actions ────────────────────────────────────────────── */}
      <div className="px-5 pb-5 pt-2 border-t border-border space-y-2">
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
            className="w-full text-xs py-2 font-semibold h-auto bg-success-600 hover:bg-success-700 text-white border-0"
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
          <Link href={ADMIN_ROUTES.ORDER_DETAIL(order.id)} className="block">
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
              className="w-full text-xs py-2 font-medium h-auto bg-error-50 text-error-600 border border-error-100 hover:bg-error-100 hover:text-error-700"
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
