"use client";

import { ORDER_STATUS } from "@/lib/constants";

export const STATUS_CONFIG = {
  [ORDER_STATUS.PENDING]: { label: "⚠️ Incompleto", variant: "warning" },
  [ORDER_STATUS.PENDING_PAYMENT]: {
    label: "Aguardando Pago",
    variant: "warning",
  },
  [ORDER_STATUS.RESERVED]: {
    label: "Reservado (Efectivo)",
    variant: "info",
  },
  [ORDER_STATUS.PROCESSED]: {
    label: "Listo para entregar",
    variant: "success",
  },
  [ORDER_STATUS.DELIVERED]: { label: "Entregado", variant: "default" },
  [ORDER_STATUS.CANCELLED]: { label: "Cancelado", variant: "error" },
  [ORDER_STATUS.WAITING_TRANSFER_PROOF]: {
    label: "📎 Esperando comprobante",
    variant: "warning",
  },
  [ORDER_STATUS.PAYMENT_REVIEW]: {
    label: "🔍 Revisando comprobante",
    variant: "info",
  },
} as const;

const variantClasses = {
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200 border",
  info: "bg-blue-100 text-blue-800 border-blue-200 border",
  success: "bg-emerald-100 text-emerald-800 border-emerald-200 border",
  error: "bg-red-100 text-red-800 border-red-200 border",
  destructive: "bg-red-100 text-red-800",
  primary: "badge-primary",
  secondary: "badge-secondary",
  default: "bg-gray-100 text-gray-800 border-gray-200 border",
};

export function OrderStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || {
    label: "Desconocido",
    variant: "info" as const,
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${variantClasses[config.variant]}`}
    >
      {config.label}
    </span>
  );
}
