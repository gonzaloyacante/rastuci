"use client";

import { LucideIcon, Package, TruckIcon } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

// ============================================================================
// Status Badge System
// ============================================================================

export type OrderStatus = "PENDING" | "PROCESSED" | "DELIVERED" | "CANCELLED";

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: "warning" | "info" | "success" | "error" }
> = {
  PENDING: { label: "Pendiente", variant: "warning" },
  PROCESSED: { label: "Procesado", variant: "info" },
  DELIVERED: { label: "Entregado", variant: "success" },
  CANCELLED: { label: "Cancelado", variant: "error" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as OrderStatus] || {
    label: "Desconocido",
    variant: "info" as const,
  };

  const variantClasses = {
    warning: "badge-warning",
    info: "badge-info",
    success: "badge-success",
    error: "badge-error",
  };

  return (
    <span className={`${variantClasses[config.variant]} text-xs`}>
      {config.label}
    </span>
  );
}

// ============================================================================
// Shipping Method Display
// ============================================================================

const shippingMethodLabels: Record<string, string> = {
  pickup: "Retiro en tienda",
  standard: "Envío estándar",
  express: "Envío express",
  ca: "Correo Argentino",
};

export function ShippingMethodLabel({ method }: { method?: string }) {
  if (!method) return null;
  return (
    <div className="flex items-center gap-2 text-sm text-content-secondary">
      <Package size={14} />
      <span>{shippingMethodLabels[method] || method}</span>
    </div>
  );
}

export function TrackingInfo({ trackingNumber }: { trackingNumber?: string }) {
  if (!trackingNumber) return null;
  return (
    <div className="flex items-center gap-2 text-sm text-success">
      <TruckIcon size={14} />
      <span>Tracking CA: {trackingNumber}</span>
    </div>
  );
}

// ============================================================================
// Order Card
// ============================================================================

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
}

interface OrderCardProps {
  order: OrderCardData;
  formatDate?: (date: string) => string;
  formatCurrency?: (value: number) => string;
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

const defaultFormatCurrency = (value: number) => {
  return `$${value.toLocaleString("es-AR")}`;
};

export function OrderCard({
  order,
  formatDate = defaultFormatDate,
  formatCurrency = defaultFormatCurrency,
}: OrderCardProps) {
  return (
    <div className="card">
      {/* Header */}
      <div className="bg-surface-secondary border-b -m-6 mb-6 p-4 rounded-t-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-content-primary truncate">
              {order.customerName}
            </h3>
            <p className="text-sm text-content-secondary">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Contact Info */}
        <div>
          <h4 className="text-sm font-medium text-content-secondary mb-2">
            Información de contacto
          </h4>
          <div className="space-y-1">
            <p className="text-sm text-content-primary">
              📞 {order.customerPhone}
            </p>
            {order.customerAddress && (
              <p className="text-sm text-content-primary">
                📍 {order.customerAddress}
              </p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <h4 className="text-sm font-medium text-content-secondary mb-2">
            Resumen del pedido
          </h4>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-content-primary">
                {order.itemsCount} producto(s)
              </span>
              <span className="font-bold text-primary text-lg">
                {formatCurrency(order.total)}
              </span>
            </div>
            <TrackingInfo trackingNumber={order.caTrackingNumber} />
            <ShippingMethodLabel method={order.shippingMethod} />
          </div>
        </div>

        {/* Action */}
        <div className="pt-4 border-t">
          <Link href={`/admin/pedidos/${order.id}`}>
            <button className="btn-primary w-full cursor-pointer">
              Ver Detalles
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Pagination Component
// ============================================================================

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || disabled}
        className="btn-secondary disabled:opacity-50"
      >
        Anterior
      </button>
      <span className="text-sm text-content-secondary">
        Página {currentPage} de {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || disabled}
        className="btn-secondary disabled:opacity-50"
      >
        Siguiente
      </button>
    </div>
  );
}

// ============================================================================
// Info Row Component (for detail pages)
// ============================================================================

interface InfoRowProps {
  icon?: LucideIcon;
  emoji?: string;
  label: string;
  value: ReactNode;
  className?: string;
}

export function InfoRow({
  icon: Icon,
  emoji,
  label,
  value,
  className = "",
}: InfoRowProps) {
  return (
    <div className={`flex items-start gap-2 ${className}`}>
      {Icon && <Icon className="w-4 h-4 text-content-secondary mt-0.5" />}
      {emoji && <span>{emoji}</span>}
      <div className="flex-1">
        <span className="text-sm text-content-secondary">{label}: </span>
        <span className="text-sm text-content-primary">{value}</span>
      </div>
    </div>
  );
}

// ============================================================================
// Section Card (for grouping content)
// ============================================================================

interface SectionCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <div className={`card ${className}`}>
      <h3 className="text-lg font-semibold text-content-primary mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}
