"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileSearch,
  FileText,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import React from "react";

import { ORDER_STATUS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type StatusVariant =
  | "warning"
  | "info"
  | "success"
  | "error"
  | "destructive"
  | "primary"
  | "secondary"
  | "default";

interface StatusEntry {
  label: string;
  variant: StatusVariant;
  Icon: React.ElementType;
}

export const STATUS_CONFIG: Record<string, StatusEntry> = {
  [ORDER_STATUS.PENDING]: {
    label: "Incompleto",
    variant: "warning",
    Icon: AlertCircle,
  },
  [ORDER_STATUS.PENDING_PAYMENT]: {
    label: "Aguardando Pago",
    variant: "warning",
    Icon: Clock,
  },
  [ORDER_STATUS.RESERVED]: {
    label: "Reservado (Efectivo)",
    variant: "info",
    Icon: Package,
  },
  [ORDER_STATUS.PROCESSED]: {
    label: "Listo para entregar",
    variant: "success",
    Icon: CheckCircle2,
  },
  [ORDER_STATUS.DELIVERED]: {
    label: "Entregado",
    variant: "default",
    Icon: Truck,
  },
  [ORDER_STATUS.CANCELLED]: {
    label: "Cancelado",
    variant: "error",
    Icon: XCircle,
  },
  [ORDER_STATUS.WAITING_TRANSFER_PROOF]: {
    label: "Esperando comprobante",
    variant: "warning",
    Icon: FileText,
  },
  [ORDER_STATUS.PAYMENT_REVIEW]: {
    label: "Revisando comprobante",
    variant: "info",
    Icon: FileSearch,
  },
};

const variantClasses: Record<StatusVariant, string> = {
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
  const config: StatusEntry = STATUS_CONFIG[status] ?? {
    label: "Desconocido",
    variant: "info" as StatusVariant,
    Icon: AlertCircle,
  };
  const { Icon } = config;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
        variantClasses[config.variant]
      )}
    >
      <Icon size={11} className="shrink-0" />
      {config.label}
    </span>
  );
}
