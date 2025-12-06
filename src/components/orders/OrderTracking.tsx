"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { logger } from "@/lib/logger";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Info,
  Loader2,
  Mail,
  MapPin,
  Navigation,
  Package,
  Phone,
  RefreshCw,
  Truck,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface OrderStatus {
  id: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  timestamp: Date;
  description: string;
  location?: string;
}

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerAddress?: string;
  status: OrderStatus["status"];
  items: OrderItem[];
  total: number;
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
  statusHistory: OrderStatus[];
  createdAt: Date;
  mpPaymentId?: string;
  shippingMethod?: "domicilio" | "sucursal";
}

interface TrackingEvent {
  fecha: string;
  descripcion: string;
  ubicacion?: string;
  estado: string;
}

interface TrackingData {
  trackingNumber: string;
  events: TrackingEvent[];
  estimatedDelivery?: string;
  currentStatus: string;
}

interface OrderTrackingProps {
  orderId: string;
  onOrderUpdate?: (order: Order) => void;
}

export function OrderTracking({ orderId, onOrderUpdate }: OrderTrackingProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [lastTrackingUpdate, setLastTrackingUpdate] = useState<Date | null>(
    null
  );

  const loadTracking = useCallback(async (trackingNumber: string) => {
    if (!trackingNumber) {
      return;
    }

    try {
      setTrackingLoading(true);

      const res = await fetch(`/api/tracking/${trackingNumber}`);
      if (!res.ok) {
        throw new Error(`Error obteniendo tracking: ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.data) {
        setTracking(data.data);
        setLastTrackingUpdate(new Date());
      }
    } catch (err) {
      logger.error("Error loading tracking", { error: err });
      // Error silencioso - el tracking es opcional
    } finally {
      setTrackingLoading(false);
    }
  }, []);

  const loadOrderData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!orderId) {
        setError("ID de pedido inválido");
        setOrder(null);
        return;
      }

      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        setError(
          `No se pudo obtener el pedido (status ${res.status})${text ? `: ${text}` : ""}`
        );
        setOrder(null);
        return;
      }

      const json = await res.json();
      const apiOrder = json.data as Order | undefined | null;
      if (!apiOrder) {
        setError("La API devolvió datos vacíos para el pedido");
        setOrder(null);
        return;
      }

      setOrder(apiOrder);
      onOrderUpdate?.(apiOrder);

      // Si el pedido tiene tracking, cargar información adicional
      if (apiOrder.trackingNumber) {
        await loadTracking(apiOrder.trackingNumber);
      }
    } catch (error) {
      logger.error("Error loading order", { error });
      setError(
        (error as Error)?.message ?? "Error desconocido al cargar el pedido"
      );
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId, onOrderUpdate, loadTracking]);

  const refreshTracking = useCallback(async () => {
    if (!order?.trackingNumber) {
      return;
    }
    await loadTracking(order.trackingNumber);
  }, [order, loadTracking]);

  useEffect(() => {
    loadOrderData();
  }, [loadOrderData]);

  // Auto-refresh tracking cada 5 minutos
  useEffect(() => {
    if (!order?.trackingNumber) {
      return;
    }

    const interval = setInterval(
      () => {
        refreshTracking();
      },
      5 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [order?.trackingNumber, refreshTracking]);

  const downloadInvoice = async () => {
    if (!order) {
      return;
    }
    
    try {
      logger.info("Downloading invoice", { orderId: order.id });
      
      // Generar contenido HTML de la factura
      const invoiceHTML = `
        <!DOCTYPE html>
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
          <div class="header">
            <h1>RASTUCI</h1>
            <p>Factura de Compra</p>
          </div>
          <div class="info">
            <p><strong>Factura #:</strong> ${order.id}</p>
            <p><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString('es-AR')}</p>
            <p><strong>Cliente:</strong> ${order.customerName}</p>
            <p><strong>Dirección:</strong> ${order.customerAddress || 'N/A'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item: { product?: { name?: string }; quantity: number; price: number }) => `
                <tr>
                  <td>${item.product?.name || 'Producto'}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>$${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>TOTAL: $${order.total.toFixed(2)}</p>
          </div>
        </body>
        </html>
      `;
      
      // Crear blob y descargar
      const blob = new Blob([invoiceHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura_${order.id}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      logger.info("Invoice downloaded successfully", { orderId: order.id });
    } catch (error) {
      logger.error("Error downloading invoice", { orderId: order.id, error });
    }
  };

  const getStatusColor = (
    status: OrderStatus["status"]
  ): "default" | "success" | "warning" | "error" | "info" => {
    switch (status) {
      case "delivered":
        return "success";
      case "shipped":
        return "info";
      case "processing":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: OrderStatus["status"]) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5" />;
      case "shipped":
        return <Truck className="h-5 w-5" />;
      case "processing":
        return <Package className="h-5 w-5" />;
      case "cancelled":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusText = (status: OrderStatus["status"]): string => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "confirmed":
        return "Confirmado";
      case "processing":
        return "En preparación";
      case "shipped":
        return "Enviado";
      case "delivered":
        return "Entregado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            Cargando información del pedido...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error al cargar el pedido</h2>
          <p className="text-muted-foreground mb-4">
            {error || "No se pudo encontrar el pedido"}
          </p>
          <Button onClick={loadOrderData}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
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

      {/* Tracking Number */}
      {order.trackingNumber && (
        <div className="bg-muted/50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Número de Seguimiento
              </h3>
              <div className="flex items-center gap-4">
                <code className="text-lg font-mono bg-background px-3 py-1 rounded">
                  {order.trackingNumber}
                </code>
                {lastTrackingUpdate && (
                  <span className="text-xs text-muted-foreground">
                    Actualizado hace{" "}
                    {Math.floor(
                      (Date.now() - lastTrackingUpdate.getTime()) / 60000
                    )}{" "}
                    min
                  </span>
                )}
              </div>
            </div>
            <Button
              onClick={refreshTracking}
              disabled={trackingLoading}
              variant="outline"
              size="sm"
            >
              {trackingLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
      )}

      {/* Tracking Events */}
      {tracking && tracking.events && tracking.events.length > 0 && (
        <div className="bg-card rounded-lg border p-6 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Historial de Seguimiento
          </h3>
          <div className="space-y-4">
            {tracking.events.map((event, index) => (
              <div
                key={index}
                className="flex gap-4 pb-4 border-b last:border-b-0"
              >
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
      )}

      {/* Status History */}
      <div className="bg-card rounded-lg border p-6 mb-6">
        <h3 className="font-semibold mb-4">Estado del Pedido</h3>
        <div className="space-y-4">
          {order.statusHistory.map((status, index) => (
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
                    <p className="font-medium">
                      {getStatusText(status.status)}
                    </p>
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

      {/* Shipping Address */}
      <div className="bg-card rounded-lg border p-6 mb-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Dirección de Envío
        </h3>
        <div className="space-y-2 text-sm">
          <p className="font-medium">{order.shippingAddress.name}</p>
          <p>{order.shippingAddress.street}</p>
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
            {order.shippingAddress.zipCode}
          </p>
          <p>{order.shippingAddress.country}</p>
          <div className="flex items-center gap-2 text-muted-foreground pt-2">
            <Phone className="h-4 w-4" />
            <span>{order.shippingAddress.phone}</span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-card rounded-lg border p-6 mb-6">
        <h3 className="font-semibold mb-4">Productos</h3>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 pb-4 border-b last:border-b-0"
            >
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
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  ${item.price.toFixed(2)} c/u
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-4 border-t">
          <span className="font-semibold">Total</span>
          <span className="text-2xl font-bold">${order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={downloadInvoice} variant="outline" className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Descargar Factura
        </Button>
        <Button variant="outline" className="flex-1">
          <Mail className="h-4 w-4 mr-2" />
          Contactar Soporte
        </Button>
      </div>
    </div>
  );
}
