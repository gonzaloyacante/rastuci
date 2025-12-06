"use client";

import { Pagination as UIPagination } from "@/components/ui/Pagination";
import { LucideIcon, Package, TruckIcon } from "lucide-react";
import Link from "next/link";
import React, { ReactNode } from "react";

// ============================================================================
// Status Badge System
// ============================================================================

export type OrderStatus = "PENDING" | "PENDING_PAYMENT" | "PROCESSED" | "DELIVERED" | "CANCELLED";

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: "warning" | "info" | "success" | "error" }
> = {
  PENDING: { label: "Sin pagar", variant: "warning" },
  PENDING_PAYMENT: { label: "⚠️ Esperando pago de envío", variant: "warning" },
  PROCESSED: { label: "Listo para entregar", variant: "info" },
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
    <div className="flex items-center gap-2 text-xs sm:text-sm text-content-secondary">
      <Package size={14} className="shrink-0" />
      <span className="wrap-break-word">{shippingMethodLabels[method] || method}</span>
    </div>
  );
}

export function TrackingInfo({ trackingNumber }: { trackingNumber?: string }) {
  if (!trackingNumber) return null;
  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm text-success">
      <TruckIcon size={14} className="shrink-0" />
      <span className="break-all">Tracking CA: {trackingNumber}</span>
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
  onStatusChange?: () => void; // Callback para refrescar datos después de cambiar estado
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
  onStatusChange,
}: OrderCardProps) {
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleMarkProcessed = async () => {
    if (!confirm("¿Confirmas que ya pagaste el envío en MiCorreo?")) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/mark-processed`, {
        method: "PATCH",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al actualizar el pedido");
      }
      
      // Éxito
      if (onStatusChange) onStatusChange();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al actualizar el pedido");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (!confirm("¿Confirmas que este pedido fue entregado al cliente?")) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/mark-delivered`, {
        method: "PATCH",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al actualizar el pedido");
      }
      
      // Éxito
      if (onStatusChange) onStatusChange();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al actualizar el pedido");
    } finally {
      setIsUpdating(false);
    }
  };

  const openMiCorreo = () => {
    window.open("https://micorreo.correoargentino.com.ar/login", "_blank");
  };

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-200 hover:border-primary/20">
      {/* Header - Mobile First */}
      <div className="bg-linear-to-r from-surface-secondary to-surface-secondary/50 p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base font-bold text-content-primary leading-snug flex-1 min-w-0">
            {order.customerName}
          </h3>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-xs text-content-secondary">
          {formatDate(order.createdAt)}
        </p>
      </div>

      {/* Content - Stack en móvil, grid en tablet */}
      <div className="p-4 space-y-4">
        
        {/* Info principal en 2 columnas tablet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Contacto */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-content-secondary uppercase tracking-wider mb-2">
              Información de contacto
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-lg">📞</span>
              <a href={`tel:${order.customerPhone}`} className="text-sm text-primary hover:underline font-medium">
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

          {/* Resumen */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-content-secondary uppercase tracking-wider mb-2">
              Resumen del pedido
            </h4>
            <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-content-secondary">
                  {order.itemsCount} {order.itemsCount === 1 ? 'producto' : 'productos'}
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
              {order.shippingMethod && (
                <div className="flex items-center gap-1.5 text-xs text-content-secondary mt-1">
                  <Package size={12} className="shrink-0" />
                  <span>{shippingMethodLabels[order.shippingMethod] || order.shippingMethod}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="pt-3 border-t border-border space-y-2">
          {order.status === "PENDING_PAYMENT" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={openMiCorreo}
                className="btn-outline text-xs py-2.5 bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900 font-semibold"
                disabled={isUpdating}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <span>📦</span>
                  <span>Pagar en MiCorreo</span>
                </span>
              </button>
              <button
                onClick={handleMarkProcessed}
                className="btn-primary text-xs py-2.5 font-semibold"
                disabled={isUpdating}
              >
                {isUpdating ? "⏳ Procesando..." : "✓ Marcar procesado"}
              </button>
            </div>
          )}

          {order.status === "PROCESSED" && (
            <button
              onClick={handleMarkDelivered}
              className="btn-primary w-full text-xs py-2.5 font-semibold"
              disabled={isUpdating}
            >
              {isUpdating ? "⏳ Procesando..." : "✓ Marcar entregado"}
            </button>
          )}

          <Link href={`/admin/pedidos/${order.id}`} className="block">
            <button className="btn-outline w-full text-xs py-2.5 font-semibold hover:bg-primary/5 hover:border-primary/30">
              Ver Detalles →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Pagination Component - Wrapper del componente UI reutilizable
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
    <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
      <UIPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        showFirstLast={totalPages > 5}
        maxVisiblePages={5}
      />
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
