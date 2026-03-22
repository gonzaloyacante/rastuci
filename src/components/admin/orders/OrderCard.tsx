"use client";

import { Package, Truck as TruckIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/Button";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency as defaultFormatCurrency } from "@/utils/formatters";

import { OrderStatusBadge } from "./OrderStatusBadge";
import { shippingMethodLabels } from "./ShippingDisplay";

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

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-200 hover:border-primary/20">
      <CardHeader order={order} formatDate={formatDate} />
      <CardContent
        order={order}
        formatCurrency={formatCurrency}
      />
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
  order: Pick<OrderCardData, "customerName" | "status" | "createdAt" | "relativeTime">;
  formatDate: (date: string) => string;
}

function CardHeader({ order, formatDate }: CardHeaderProps) {
  return (
    <div className="bg-linear-to-r from-surface-secondary to-surface-secondary/50 p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-base font-bold text-content-primary leading-snug flex-1 min-w-0">
          {order.customerName}
        </h3>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="text-xs text-content-secondary flex items-center gap-1">
        <span>{formatDate(order.createdAt)}</span>
        {order.relativeTime && (
          <>
            <span className="text-content-secondary/50">•</span>
            <span className="italic">{order.relativeTime}</span>
          </>
        )}
      </p>
    </div>
  );
}

interface CardContentProps {
  order: Pick<OrderCardData, "customerPhone" | "customerAddress" | "itemsCount" | "total" | "caTrackingNumber" | "paymentMethod" | "shippingMethod">;
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
      <h4 className="text-xs font-bold text-content-secondary uppercase tracking-wider mb-2">
        Información de contacto
      </h4>
      <div className="flex items-center gap-2">
        <span className="text-lg">📞</span>
        <a
          href={`tel:${order.customerPhone}`}
          className="text-sm text-primary hover:underline font-medium"
        >
          {order.customerPhone}
        </a>
      </div>
      {order.customerAddress && (
        <div className="flex items-start gap-2">
          <span className="text-lg shrink-0">📍</span>
          <p className="text-xs text-content-primary leading-relaxed">
            {order.customerAddress}
          </p>
        </div>
      )}
    </div>
  );
}

interface SummaryColumnProps {
  order: Pick<CardContentProps["order"], "itemsCount" | "total" | "caTrackingNumber" | "paymentMethod" | "shippingMethod">;
  formatCurrency: (value: number) => string;
}

function SummaryColumn({ order, formatCurrency }: SummaryColumnProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold text-content-secondary uppercase tracking-wider mb-2">
        Resumen del pedido
      </h4>
      <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-content-secondary">
            {order.itemsCount}{" "}
            {order.itemsCount === 1 ? "producto" : "productos"}
          </span>
          <span className="text-lg font-bold text-primary">
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
      <div className="flex items-center gap-1.5 text-xs text-content-secondary mt-1">
        <span>
          {order.paymentMethod === "mercadopago" ? "💳" : "💵"}{" "}
          {order.paymentMethod === "mercadopago"
            ? "MercadoPago"
            : "Efectivo / Transferencia"}
        </span>
      </div>
      {order.shippingMethod && (
        <div className="flex items-center gap-1.5 text-xs text-content-secondary mt-1">
          <Package size={12} className="shrink-0" />
          <span>
            {shippingMethodLabels[order.shippingMethod] ||
              order.shippingMethod}
          </span>
        </div>
      )}
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
    <div className="pt-3 border-t border-border space-y-2">
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
          disabled={isUpdating}
        >
          {isUpdating ? "⏳ Procesando..." : "✓ Aprobar Transferencia"}
        </Button>
      )}
      {order.status === "PROCESSED" && (
        <Button
          onClick={onMarkDelivered}
          variant="primary"
          className="w-full text-xs py-2.5 font-semibold h-auto"
          disabled={isUpdating}
        >
          {isUpdating ? "⏳ Procesando..." : "✓ Marcar entregado"}
        </Button>
      )}
      {isCancelable && (
        <Button
          onClick={onCancelOrder}
          variant="destructive"
          className="w-full text-xs py-2.5 font-semibold h-auto bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
          disabled={isUpdating}
        >
          {isUpdating ? "⏳..." : "✕ Cancelar Orden"}
        </Button>
      )}
      <Link href={`/admin/pedidos/${order.id}`} className="block">
        <Button
          variant="outline"
          className="w-full text-xs py-2.5 font-semibold hover:bg-primary/5 hover:border-primary/30 h-auto"
        >
          Ver Detalles →
        </Button>
      </Link>
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
      >
        <span className="flex items-center justify-center gap-1.5">
          <span>📦</span>
          <span>Pagar en MiCorreo</span>
        </span>
      </Button>
      <Button
        onClick={onMarkProcessed}
        variant="primary"
        className="text-xs py-2.5 font-semibold h-auto"
        disabled={isUpdating}
      >
        {isUpdating ? "⏳ Procesando..." : "✓ Marcar procesado"}
      </Button>
    </div>
  );
}
