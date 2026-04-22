"use client";

import {
  Banknote,
  Building2,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Eye,
  Hash,
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
    label: "Transferencia",
    Icon: Building2,
    pill: "bg-violet-50 text-violet-700 border border-violet-200",
  },
  cash: {
    label: "Efectivo",
    Icon: Banknote,
    pill: "bg-amber-50 text-amber-700 border border-amber-200",
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

  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-xl overflow-hidden",
        "hover:shadow-lg hover:border-primary/20 transition-all duration-200",
        "border-l-4",
        borderClass
      )}
    >
      <CardHeader order={order} formatDate={formatDate} />
      <CardContent order={order} formatCurrency={formatCurrency} />
      <CardActions
        order={order}
        isUpdating={isUpdating}
        onMiCorreo={openMiCorreo}
        onMarkProcessed={handleMarkProcessed}
        onMarkDelivered={handleMarkDelivered}
        onApproveTransfer={handleApproveTransfer}
        onCancelOrder={handleCancelOrder}
      />
      {ConfirmDialog}
    </div>
  );
}

// ─── Private sub-components ───────────────────────────────────────────────────

interface CardHeaderProps {
  order: Pick<
    OrderCardData,
    "id" | "customerName" | "status" | "createdAt" | "relativeTime"
  >;
  formatDate: (date: string) => string;
}

function CardHeader({ order, formatDate }: CardHeaderProps) {
  const shortId = order.id.slice(-8).toUpperCase();
  return (
    <div className="bg-linear-to-r from-surface-secondary to-surface-secondary/50 p-4">
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold leading-snug truncate">
            {order.customerName}
          </h3>
          <div className="flex items-center gap-1 mt-0.5">
            <Hash size={10} className="text-muted-foreground shrink-0" />
            <span className="text-xs font-mono text-muted-foreground tracking-wider">
              {shortId}
            </span>
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <span>{formatDate(order.createdAt)}</span>
        {order.relativeTime && (
          <>
            <span className="opacity-50">·</span>
            <span className="italic">{order.relativeTime}</span>
          </>
        )}
      </p>
    </div>
  );
}

interface CardContentProps {
  order: Pick<
    OrderCardData,
    | "customerPhone"
    | "customerAddress"
    | "itemsCount"
    | "total"
    | "caTrackingNumber"
    | "paymentMethod"
    | "shippingMethod"
  >;
  formatCurrency: (value: number) => string;
}

function CardContent({ order, formatCurrency }: CardContentProps) {
  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ContactColumn order={order} />
        <SummaryColumn order={order} formatCurrency={formatCurrency} />
      </div>
    </div>
  );
}

interface ContactColumnProps {
  order: Pick<CardContentProps["order"], "customerPhone" | "customerAddress">;
}

function ContactColumn({ order }: ContactColumnProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
        Información de contacto
      </h4>
      <div className="flex items-center gap-2">
        <Phone size={13} className="text-muted-foreground shrink-0" />
        <a
          href={`tel:${order.customerPhone}`}
          className="text-sm text-primary hover:underline font-medium"
        >
          {order.customerPhone}
        </a>
      </div>
      {order.customerAddress && (
        <div className="flex items-start gap-2">
          <MapPin size={13} className="text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {order.customerAddress}
          </p>
        </div>
      )}
    </div>
  );
}

interface SummaryColumnProps {
  order: Pick<
    CardContentProps["order"],
    | "itemsCount"
    | "total"
    | "caTrackingNumber"
    | "paymentMethod"
    | "shippingMethod"
  >;
  formatCurrency: (value: number) => string;
}

function SummaryColumn({ order, formatCurrency }: SummaryColumnProps) {
  const pm =
    PAYMENT_METHOD_DISPLAY[order.paymentMethod ?? "cash"] ??
    PAYMENT_METHOD_DISPLAY.cash;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
        Resumen del pedido
      </h4>
      <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">
            {order.itemsCount}{" "}
            {order.itemsCount === 1 ? "producto" : "productos"}
          </span>
          <span className="text-xl font-bold text-primary">
            {formatCurrency(order.total)}
          </span>
        </div>
        {order.caTrackingNumber && (
          <div className="flex items-center gap-1.5 text-xs text-success mt-2 pt-2 border-t border-success/20">
            <TruckIcon size={12} className="shrink-0" />
            <span className="font-mono">{order.caTrackingNumber}</span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1.5 mt-1">
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
            pm.pill
          )}
        >
          <pm.Icon size={11} className="shrink-0" />
          {pm.label}
        </span>
        {order.shippingMethod && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-surface-secondary border border-border text-muted-foreground">
            <Package size={11} className="shrink-0" />
            {shippingMethodLabels[order.shippingMethod] || order.shippingMethod}
          </span>
        )}
      </div>
    </div>
  );
}

interface CardActionsProps {
  order: Pick<OrderCardData, "id" | "status" | "paymentMethod">;
  isUpdating: boolean;
  onMiCorreo: () => void;
  onMarkProcessed: () => void;
  onMarkDelivered: () => void;
  onApproveTransfer: () => void;
  onCancelOrder: () => void;
}

function CardActions({
  order,
  isUpdating,
  onMiCorreo,
  onMarkProcessed,
  onMarkDelivered,
  onApproveTransfer,
  onCancelOrder,
}: CardActionsProps) {
  const isCancelable =
    order.status !== "DELIVERED" && order.status !== "CANCELLED";

  return (
    <div className="px-4 pb-4 pt-3 border-t border-border space-y-2">
      <PendingPaymentButtons
        order={order}
        isUpdating={isUpdating}
        onMiCorreo={onMiCorreo}
        onMarkProcessed={onMarkProcessed}
      />
      {(order.status === "WAITING_TRANSFER_PROOF" ||
        order.status === "PAYMENT_REVIEW") && (
        <Button
          onClick={onApproveTransfer}
          className="w-full text-xs py-2.5 font-semibold h-auto bg-green-600 hover:bg-green-700 text-white"
          loading={isUpdating}
          leftIcon={<CheckCircle2 size={14} />}
        >
          Aprobar Transferencia
        </Button>
      )}
      {order.status === "PROCESSED" && (
        <Button
          onClick={onMarkDelivered}
          variant="primary"
          className="w-full text-xs py-2.5 font-semibold h-auto"
          loading={isUpdating}
          leftIcon={<CheckCircle2 size={14} />}
        >
          Marcar entregado
        </Button>
      )}
      <div
        className={cn(
          "grid gap-2",
          isCancelable ? "grid-cols-2" : "grid-cols-1"
        )}
      >
        <Link href={`/admin/pedidos/${order.id}`} className="block">
          <Button
            variant="outline"
            className="w-full text-xs py-2.5 font-semibold hover:bg-primary/5 hover:border-primary/30 h-auto"
            leftIcon={<Eye size={14} />}
          >
            Ver Detalles
          </Button>
        </Link>
        {isCancelable && (
          <Button
            onClick={onCancelOrder}
            variant="destructive"
            className="w-full text-xs py-2.5 font-semibold h-auto bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
            disabled={isUpdating}
            leftIcon={<XCircle size={14} />}
          >
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}

interface PendingPaymentButtonsProps {
  order: Pick<CardActionsProps["order"], "status" | "paymentMethod">;
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
        className="text-xs py-2.5 bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900 font-semibold h-auto"
        disabled={isUpdating}
        leftIcon={<ExternalLink size={14} />}
      >
        Pagar en MiCorreo
      </Button>
      <Button
        onClick={onMarkProcessed}
        variant="primary"
        className="text-xs py-2.5 font-semibold h-auto"
        loading={isUpdating}
        leftIcon={<CheckCircle2 size={14} />}
      >
        Marcar procesado
      </Button>
    </div>
  );
}
