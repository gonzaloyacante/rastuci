"use client";

import {
  Banknote,
  Building2,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Eye,
  MapPin,
  Package,
  Phone,
  Truck as TruckIcon,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/Button";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { formatCurrency as defaultFormatCurrency } from "@/utils/formatters";

import { OrderStatusBadge, STATUS_CONFIG } from "./OrderStatusBadge";
import { shippingMethodLabels } from "./ShippingDisplay";

const PAYMENT_METHOD_DISPLAY: Record<
  string,
  { label: string; Icon: React.ElementType; pill: string }
> = {
  mercadopago: {
    label: "MercadoPago",
    Icon: CreditCard,
    pill: "bg-sky-50 text-sky-700 border border-sky-200",
  },
  transfer: {
    label: "Transferencia Bancaria",
    Icon: Building2,
    pill: "bg-violet-50 text-violet-700 border border-violet-200",
  },
  cash: {
    label: "Efectivo",
    Icon: Banknote,
    pill: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  unknown: {
    label: "Sin registrar",
    Icon: CreditCard,
    pill: "bg-gray-50 text-gray-500 border border-gray-200",
  },
};

const STATUS_BORDER: Record<string, string> = {
  warning: "border-l-amber-400",
  info: "border-l-blue-400",
  success: "border-l-emerald-500",
  error: "border-l-red-400",
  default: "border-l-gray-300",
};

export interface OrderCardData {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string | null;
  status: string;
  total: number;
  createdAt: string;
  itemsCount: number;
  shippingMethod?: string;
  caTrackingNumber?: string;
  relativeTime?: string;
  paymentMethod?: string;
}

interface OrderCardProps {
  order: OrderCardData;
  formatDate?: (date: string) => string;
  formatCurrency?: (value: number) => string;
  onStatusChange?: () => void;
}

const defaultFormatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface OrderActionOptions {
  url: string;
  method: "PATCH" | "POST";
  title: string;
  message: string;
  confirmText: string;
  successMessage: string;
}

async function executeOrderAction(
  options: OrderActionOptions,
  deps: {
    confirm: ReturnType<typeof useConfirmDialog>["confirm"];
    show: ReturnType<typeof useToast>["show"];
    setIsUpdating: React.Dispatch<React.SetStateAction<boolean>>;
    onStatusChange?: () => void;
  }
): Promise<void> {
  const confirmed = await deps.confirm({
    title: options.title,
    message: options.message,
    confirmText: options.confirmText,
    variant: "danger",
  });
  if (!confirmed) return;

  deps.setIsUpdating(true);
  try {
    const response = await fetch(options.url, { method: options.method });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Error al procesar la acción");
    }
    deps.onStatusChange?.();
    deps.show({ type: "success", message: options.successMessage });
  } catch (error) {
    deps.show({
      type: "error",
      message: error instanceof Error ? error.message : "Error desconocido",
    });
  } finally {
    deps.setIsUpdating(false);
  }
}

export function OrderCard({
  order,
  formatDate = defaultFormatDate,
  formatCurrency = defaultFormatCurrency,
  onStatusChange,
}: OrderCardProps) {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const { show } = useToast();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const actionDeps = { confirm, show, setIsUpdating, onStatusChange };

  const handleMarkProcessed = () =>
    executeOrderAction(
      {
        url: `/api/admin/orders/${order.id}/mark-processed`,
        method: "PATCH",
        title: "Marcar como procesado",
        message: "¿Confirmas que ya pagaste el envío en MiCorreo?",
        confirmText: "Confirmar",
        successMessage: "Pedido marcado como procesado",
      },
      actionDeps
    );

  const handleMarkDelivered = () =>
    executeOrderAction(
      {
        url: `/api/admin/orders/${order.id}/mark-delivered`,
        method: "PATCH",
        title: "Marcar como entregado",
        message: "¿Confirmas que este pedido fue entregado al cliente?",
        confirmText: "Confirmar entrega",
        successMessage: "Pedido marcado como entregado",
      },
      actionDeps
    );

  const handleApproveTransfer = () =>
    executeOrderAction(
      {
        url: `/api/admin/orders/${order.id}/approve-transfer`,
        method: "POST",
        title: "Aprobar transferencia",
        message: "¿Confirmas que recibiste el pago de esta transferencia?",
        confirmText: "Aprobar",
        successMessage: "Transferencia aprobada correctamente",
      },
      actionDeps
    );

  const handleCancelOrder = () =>
    executeOrderAction(
      {
        url: `/api/admin/orders/${order.id}/cancel`,
        method: "POST",
        title: "Cancelar orden",
        message:
          "¿Seguro que querés CANCELAR esta orden? Se restaurará el stock.",
        confirmText: "Cancelar orden",
        successMessage: "Orden cancelada correctamente",
      },
      actionDeps
    );

  const openMiCorreo = () => {
    window.open("https://micorreo.correoargentino.com.ar/login", "_blank");
  };

  const statusVariant = STATUS_CONFIG[order.status]?.variant ?? "default";
  const borderClass = STATUS_BORDER[statusVariant] ?? "border-l-gray-300";
  const pm =
    PAYMENT_METHOD_DISPLAY[order.paymentMethod ?? "unknown"] ??
    PAYMENT_METHOD_DISPLAY.unknown;
  const shortId = `#${order.id.slice(-8).toUpperCase()}`;

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
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold leading-tight truncate max-w-[180px]">
              {order.customerName}
            </h3>
            <span className="text-[10px] font-mono text-muted-foreground bg-surface-secondary border border-border px-1.5 py-0.5 rounded shrink-0">
              {shortId}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {defaultFormatDate(order.createdAt)}
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
      <div className="px-4 pb-3 space-y-2">
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
              {shippingMethodLabels[order.shippingMethod] ||
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
          <span className="text-lg font-bold tabular-nums text-foreground">
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
          <Link href={`/admin/pedidos/${order.id}`} className="block">
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

// ─── Private sub-components ───────────────────────────────────────────────────

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
  // Only show for non-MP pending orders (cash = pickup, transfer = needs processing)
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
