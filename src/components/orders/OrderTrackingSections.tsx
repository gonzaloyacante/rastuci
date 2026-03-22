"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Info,
  MapPin,
  Navigation,
  Package,
  Phone,
  RefreshCw,
  Truck,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Spinner } from "@/components/ui/Spinner";
import { formatCurrency } from "@/lib/utils";
import { OrderStatus } from "@/types";

// ─── Local types (shared between OrderTracking and this file) ─────────────────

export interface OrderHistoryEvent {
  id: string;
  status: OrderStatus;
  timestamp: Date;
  description: string;
  location?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerAddress?: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  discount?: number;
  shippingCost?: number;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: Date;
  statusHistory?: OrderHistoryEvent[];
  createdAt: Date;
  mpPaymentId?: string;
  shippingMethod?: "domicilio" | "sucursal";
}

export interface TrackingEvent {
  fecha: string;
  descripcion: string;
  ubicacion?: string;
  estado: string;
}

export interface TrackingData {
  trackingNumber: string;
  events: TrackingEvent[];
  estimatedDelivery?: string;
  currentStatus: string;
}

// ─── Status utilities ─────────────────────────────────────────────────────────

export function getStatusColor(status: OrderStatus) {
  switch (status) {
    case OrderStatus.DELIVERED:
      return "success";
    case OrderStatus.PROCESSED:
    case OrderStatus.PENDING_PAYMENT:
    case OrderStatus.WAITING_TRANSFER_PROOF:
    case OrderStatus.PAYMENT_REVIEW:
    case OrderStatus.RESERVED:
      return "warning";
    case OrderStatus.CANCELLED:
      return "error";
    default:
      return "default";
  }
}

export function getStatusIcon(status: OrderStatus) {
  switch (status) {
    case OrderStatus.DELIVERED:
      return <CheckCircle className="h-5 w-5" />;
    case OrderStatus.PROCESSED:
    case OrderStatus.PENDING_PAYMENT:
      return <Package className="h-5 w-5" />;
    case OrderStatus.CANCELLED:
      return <AlertCircle className="h-5 w-5" />;
    default:
      return <Clock className="h-5 w-5" />;
  }
}

const STATUS_TEXT: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.PENDING]: "Pendiente",
  [OrderStatus.PENDING_PAYMENT]: "Esperando pago de envío",
  [OrderStatus.RESERVED]: "Reservado",
  [OrderStatus.WAITING_TRANSFER_PROOF]: "Esperando comprobante",
  [OrderStatus.PAYMENT_REVIEW]: "Pago en revisión",
  [OrderStatus.PROCESSED]: "En preparación",
  [OrderStatus.DELIVERED]: "Entregado",
  [OrderStatus.CANCELLED]: "Cancelado",
};

export function getStatusText(status: OrderStatus): string {
  return STATUS_TEXT[status] ?? (status as string);
}

// ─── Invoice generator ────────────────────────────────────────────────────────

function escapeHtml(unsafe: string | null | undefined): string {
  if (unsafe == null) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function generateInvoiceHTML(order: Order): string {
  const rows = order.items
    .map(
      (item) => `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td>${item.quantity}</td>
        <td>$${item.price.toFixed(2)}</td>
        <td>$${(item.quantity * item.price).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Factura #${order.id}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .info { margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    .total { font-weight: bold; font-size: 1.2em; margin-top: 20px; text-align: right; }
  </style>
</head>
<body>
  <div class="header"><h1>RASTUCI</h1><p>Factura de Compra</p></div>
  <div class="info">
    <p><strong>Factura #:</strong> ${escapeHtml(order.id)}</p>
    <p><strong>Fecha:</strong> ${escapeHtml(new Date(order.createdAt).toLocaleDateString("es-AR"))}</p>
    <p><strong>Cliente:</strong> ${escapeHtml(order.customerName)}</p>
    <p><strong>Dirección:</strong> ${escapeHtml(order.customerAddress || "N/A")}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th>Producto</th><th>Cantidad</th><th>Precio Unitario</th><th>Subtotal</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="total"><p>TOTAL: $${order.total.toFixed(2)}</p></div>
</body>
</html>`;
}

// ─── Section components ───────────────────────────────────────────────────────

export function OrderTrackingHeader({ order }: { order: Order }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Pedido #{order.orderNumber}</h1>
        <Badge variant={getStatusColor(order.status)} className="text-sm">
          {getStatusIcon(order.status)}
          <span className="ml-2">{getStatusText(order.status)}</span>
        </Badge>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(order.createdAt).toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        {order.estimatedDelivery && (
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span>
              Entrega estimada:{" "}
              {new Date(order.estimatedDelivery).toLocaleDateString("es-AR")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface TrackingNumberCardProps {
  trackingNumber: string;
  lastUpdate: Date | null;
  loading: boolean;
  onRefresh: () => void;
}

export function TrackingNumberCard({
  trackingNumber,
  lastUpdate,
  loading,
  onRefresh,
}: TrackingNumberCardProps) {
  return (
    <div className="bg-muted/50 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Número de Seguimiento
          </h3>
          <div className="flex items-center gap-4">
            <code className="text-lg font-mono bg-background px-3 py-1 rounded">
              {trackingNumber}
            </code>
            {lastUpdate && (
              <span className="text-xs text-muted-foreground">
                Actualizado hace{" "}
                {Math.floor((Date.now() - lastUpdate.getTime()) / 60000)} min
              </span>
            )}
          </div>
        </div>
        <Button
          onClick={onRefresh}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Actualizando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export function TrackingEventsCard({ events }: { events: TrackingEvent[] }) {
  if (events.length === 0) return null;
  return (
    <div className="bg-card rounded-lg border p-6 mb-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Info className="h-5 w-5" />
        Historial de Seguimiento
      </h3>
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
            <div className="shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{event.descripcion}</p>
                  {event.ubicacion && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {event.ubicacion}
                    </p>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(event.fecha).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatusHistoryCard({
  statusHistory,
}: {
  statusHistory: OrderHistoryEvent[];
}) {
  return (
    <div className="bg-card rounded-lg border p-6 mb-6">
      <h3 className="font-semibold mb-4">Estado del Pedido</h3>
      <div className="space-y-4">
        {statusHistory.map((status, index) => (
          <div
            key={status.id}
            className="flex gap-4 pb-4 border-b last:border-b-0"
          >
            <div className="shrink-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index === 0
                    ? "bg-primary text-white"
                    : "surface-secondary muted"
                }`}
              >
                {getStatusIcon(status.status)}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{getStatusText(status.status)}</p>
                  <p className="text-sm text-muted-foreground">
                    {status.description}
                  </p>
                  {status.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {status.location}
                    </p>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(status.timestamp).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ShippingAddressCard({
  address,
}: {
  address: Order["shippingAddress"];
}) {
  return (
    <div className="bg-card rounded-lg border p-6 mb-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        Dirección de Envío
      </h3>
      <div className="space-y-2 text-sm">
        <p className="font-medium">{address.name}</p>
        <p>{address.street}</p>
        <p>
          {address.city}, {address.state} {address.zipCode}
        </p>
        <p>{address.country}</p>
        <div className="flex items-center gap-2 text-muted-foreground pt-2">
          <Phone className="h-4 w-4" />
          <span>{address.phone}</span>
        </div>
      </div>
    </div>
  );
}

export function OrderItemsCard({ order }: { order: Order }) {
  return (
    <div className="bg-card rounded-lg border p-6 mb-6">
      <h3 className="font-semibold mb-4">Productos</h3>
      <div className="space-y-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
            <OptimizedImage
              src={item.image}
              alt={item.name}
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="font-medium">{item.name}</h4>
              {(item.size || item.color) && (
                <p className="text-sm text-muted-foreground">
                  {item.size && `Talle: ${item.size}`}
                  {item.size && item.color && " | "}
                  {item.color && `Color: ${item.color}`}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Cantidad: {item.quantity}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                {formatCurrency(item.price * item.quantity)}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(item.price)} c/u
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t pt-4 space-y-2 text-sm">
        {order.subtotal != null && (
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
        )}
        {order.shippingCost != null && (
          <div className="flex justify-between text-muted-foreground">
            <span>Envío</span>
            <span>
              {order.shippingCost === 0
                ? "Gratis"
                : formatCurrency(order.shippingCost)}
            </span>
          </div>
        )}
        {order.discount != null && order.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Descuento</span>
            <span>-{formatCurrency(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="font-semibold">Total</span>
          <span className="text-2xl font-bold">
            {formatCurrency(order.total)}
          </span>
        </div>
      </div>
    </div>
  );
}
