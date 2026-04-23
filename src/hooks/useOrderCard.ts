"use client";

import { Banknote, Building2, CreditCard } from "lucide-react";
import React from "react";

import { STATUS_CONFIG } from "@/components/admin/orders/OrderStatusBadge";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Display maps ─────────────────────────────────────────────────────────────

export const PAYMENT_METHOD_DISPLAY: Record<
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

export const STATUS_BORDER: Record<string, string> = {
  warning: "border-l-amber-400",
  info: "border-l-blue-400",
  success: "border-l-emerald-500",
  error: "border-l-red-400",
  default: "border-l-gray-300",
};

export const STATUS_HEADER_BG: Record<string, string> = {
  warning: "bg-amber-50/70",
  info: "bg-blue-50/70",
  success: "bg-emerald-50/60",
  error: "bg-red-50/60",
  default: "bg-surface-secondary/60",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatOrderDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ActionConfig {
  url: string;
  method: "PATCH" | "POST";
  title: string;
  message: string;
  confirmText: string;
  successMessage: string;
}

async function runAction(
  config: ActionConfig,
  deps: {
    confirm: ReturnType<typeof useConfirmDialog>["confirm"];
    show: ReturnType<typeof useToast>["show"];
    setUpdating: React.Dispatch<React.SetStateAction<boolean>>;
    onStatusChange?: () => void;
  }
) {
  const confirmed = await deps.confirm({
    title: config.title,
    message: config.message,
    confirmText: config.confirmText,
    variant: "danger",
  });
  if (!confirmed) return;

  deps.setUpdating(true);
  try {
    const res = await fetch(config.url, { method: config.method });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Error al procesar la acción");
    }
    deps.onStatusChange?.();
    deps.show({ type: "success", message: config.successMessage });
  } catch (err) {
    deps.show({
      type: "error",
      message: err instanceof Error ? err.message : "Error desconocido",
    });
  } finally {
    deps.setUpdating(false);
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOrderCard(
  order: OrderCardData,
  onStatusChange?: () => void
) {
  const [isUpdating, setUpdating] = React.useState(false);
  const { show } = useToast();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const deps = { confirm, show, setUpdating, onStatusChange };

  const handleMarkProcessed = () =>
    runAction(
      {
        url: `/api/admin/orders/${order.id}/mark-processed`,
        method: "PATCH",
        title: "Marcar como procesado",
        message: "¿Confirmas que ya pagaste el envío en MiCorreo?",
        confirmText: "Confirmar",
        successMessage: "Pedido marcado como procesado",
      },
      deps
    );

  const handleMarkDelivered = () =>
    runAction(
      {
        url: `/api/admin/orders/${order.id}/mark-delivered`,
        method: "PATCH",
        title: "Marcar como entregado",
        message: "¿Confirmas que este pedido fue entregado al cliente?",
        confirmText: "Confirmar entrega",
        successMessage: "Pedido marcado como entregado",
      },
      deps
    );

  const handleApproveTransfer = () =>
    runAction(
      {
        url: `/api/admin/orders/${order.id}/approve-transfer`,
        method: "POST",
        title: "Aprobar transferencia",
        message: "¿Confirmas que recibiste el pago de esta transferencia?",
        confirmText: "Aprobar",
        successMessage: "Transferencia aprobada correctamente",
      },
      deps
    );

  const handleCancelOrder = () =>
    runAction(
      {
        url: `/api/admin/orders/${order.id}/cancel`,
        method: "POST",
        title: "Cancelar orden",
        message:
          "¿Seguro que querés CANCELAR esta orden? Se restaurará el stock.",
        confirmText: "Cancelar orden",
        successMessage: "Orden cancelada correctamente",
      },
      deps
    );

  const openMiCorreo = () =>
    window.open("https://micorreo.correoargentino.com.ar/login", "_blank");

  const statusVariant = STATUS_CONFIG[order.status]?.variant ?? "default";
  const borderClass = STATUS_BORDER[statusVariant] ?? STATUS_BORDER.default;
  const headerBgClass =
    STATUS_HEADER_BG[statusVariant] ?? STATUS_HEADER_BG.default;
  const pm =
    PAYMENT_METHOD_DISPLAY[order.paymentMethod ?? "unknown"] ??
    PAYMENT_METHOD_DISPLAY.unknown;
  const shortId = `#${order.id.slice(-8).toUpperCase()}`;

  return {
    isUpdating,
    handleMarkProcessed,
    handleMarkDelivered,
    handleApproveTransfer,
    handleCancelOrder,
    openMiCorreo,
    statusVariant,
    borderClass,
    headerBgClass,
    pm,
    shortId,
    ConfirmDialog,
  };
}
