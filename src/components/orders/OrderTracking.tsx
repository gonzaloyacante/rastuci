"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useOCAService } from "@/hooks/useOCA";
import { logger } from "@/lib/logger";
import { useCallback, useEffect, useState } from "react";
// import { useTrackingValidation } from '@/hooks/useTrackingValidation';
import { type TrackingCompleto } from "@/lib/oca-service";
// import { type EstadoEnvio } from '@/lib/oca-service';
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
  // Nuevos campos para OCA
  ocaTrackingNumber?: string;
  mpPaymentId?: string;
  shippingMethod?: "domicilio" | "sucursal";
  ocaOrderId?: string;
}

interface OCATrackingEvent {
  fecha: string;
  descripcion: string;
  ubicacion?: string;
  estado: string;
}

interface OrderTrackingProps {
  orderId: string;
  onOrderUpdate?: (order: Order) => void;
}

export function OrderTracking({ orderId, onOrderUpdate }: OrderTrackingProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ocaTracking, setOcaTracking] = useState<TrackingCompleto | null>(null);
  const [ocaTrackingLoading, setOcaTrackingLoading] = useState(false);
  const [lastTrackingUpdate, setLastTrackingUpdate] = useState<Date | null>(
    null
  );

  const {
    obtenerTracking,
    obtenerEstadoEnvio,
    isLoading: ocaServiceLoading,
    error: ocaError,
  } = useOCAService();

  const loadOCATracking = useCallback(
    async (trackingNumber: string) => {
      if (!trackingNumber) {
        return;
      }

      try {
        setOcaTrackingLoading(true);

        // Intentar obtener tracking completo primero
        try {
          const trackingData = await obtenerTracking(trackingNumber);
          setOcaTracking(trackingData);
          setLastTrackingUpdate(new Date());
        } catch {
          // Si el tracking completo falla, intentar solo estado
          try {
            await obtenerEstadoEnvio(trackingNumber);
            setLastTrackingUpdate(new Date());
          } catch {
            // Si ambos fallan, no es crítico
          }
        }
      } catch {
        // Error silencioso - el tracking de OCA es opcional
      } finally {
        setOcaTrackingLoading(false);
      }
    },
    [obtenerTracking, obtenerEstadoEnvio]
  );

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

      // Si el pedido tiene tracking de OCA, cargar información adicional
      if (apiOrder.ocaTrackingNumber || apiOrder.trackingNumber) {
        await loadOCATracking(
          apiOrder.ocaTrackingNumber || apiOrder.trackingNumber!
        );
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
  }, [orderId, onOrderUpdate, loadOCATracking]);

  const refreshTracking = useCallback(async () => {
    if (!order?.trackingNumber && !order?.ocaTrackingNumber) {
      return;
    }
    const trackingNumber = order.ocaTrackingNumber || order.trackingNumber!;
    await loadOCATracking(trackingNumber);
  }, [order, loadOCATracking]);

  useEffect(() => {
    loadOrderData();
  }, [loadOrderData]);

  // Auto-refresh tracking cada 5 minutos si el pedido está en estado shipped
  useEffect(() => {
    if (
      order?.status === "shipped" &&
      (order.trackingNumber || order.ocaTrackingNumber)
    ) {
      const interval = setInterval(refreshTracking, 5 * 60 * 1000); // 5 minutos
      return () => clearInterval(interval);
    }
    return undefined;
  }, [order, refreshTracking]);

  const getStatusIcon = (status: OrderStatus["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-warning" />;
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-info" />;
      case "processing":
        return <Package className="w-5 h-5 text-primary" />;
      case "shipped":
        return <Truck className="w-5 h-5 text-primary" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "cancelled":
        return <AlertCircle className="w-5 h-5 text-error" />;
      default:
        return <Clock className="w-5 h-5 muted" />;
    }
  };

  const getStatusBadge = (status: OrderStatus["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pendiente</Badge>;
      case "confirmed":
        return <Badge variant="info">Confirmado</Badge>;
      case "processing":
        return <Badge variant="primary">Preparando</Badge>;
      case "shipped":
        return <Badge variant="primary">Enviado</Badge>;
      case "delivered":
        return <Badge variant="success">Entregado</Badge>;
      case "cancelled":
        return <Badge variant="error">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusLabel = (status: OrderStatus["status"]) => {
    switch (status) {
      case "pending":
        return "Pedido Recibido";
      case "confirmed":
        return "Confirmado";
      case "processing":
        return "Preparando";
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

  const getOCAStatusLabel = (estado: string) => {
    const estadosMap: Record<string, string> = {
      EN_TRANSITO: "En tránsito",
      ENTREGADO: "Entregado",
      EN_DISTRIBUCION: "En distribución",
      EN_SUCURSAL: "En sucursal",
      RETENIDO: "Retenido",
      DEVUELTO: "Devuelto",
      PENDIENTE: "Pendiente",
      PREPARACION: "En preparación",
    };
    return estadosMap[estado] || estado;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 muted">Cargando información del pedido...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center p-8">
        {error ? (
          <div className="space-y-4">
            <AlertCircle className="w-16 h-16 text-error mx-auto" />
            <h3 className="text-lg font-medium">Error al cargar el pedido</h3>
            <p className="text-sm text-error">{error}</p>
            <Button onClick={loadOrderData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        ) : (
          <div>
            <Package className="w-16 h-16 muted mx-auto mb-4" />
            <h3 className="text-lg font-medium">Pedido no encontrado</h3>
            <p className="muted mb-4">No se encontró información del pedido.</p>
            <Button onClick={loadOrderData}>Reintentar</Button>
          </div>
        )}
      </div>
    );
  }

  // Combinar historial del pedido con tracking de OCA
  const combinedHistory = [...order.statusHistory];

  if (ocaTracking?.historial) {
    const ocaEvents: OrderStatus[] = ocaTracking.historial.map(
      (event: OCATrackingEvent, index: number) => ({
        id: `oca-${index}`,
        status: "shipped" as const,
        timestamp: new Date(event.fecha),
        description: `OCA: ${event.descripcion}`,
        location: event.ubicacion,
      })
    );
    combinedHistory.push(...ocaEvents);
  }

  // Ordenar por fecha
  combinedHistory.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="surface border border-muted rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Pedido #{order.orderNumber}</h1>
            <p className="muted">
              Realizado el {order.createdAt.toLocaleDateString("es-ES")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(order.status)}
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Descargar Factura
            </Button>
          </div>
        </div>

        {/* Tracking Information */}
        {(order.trackingNumber || order.ocaTrackingNumber) && (
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="surface-secondary rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-5 h-5 text-primary" />
                <span className="font-medium">Número de Seguimiento</span>
              </div>
              <p className="font-mono text-lg">
                {order.ocaTrackingNumber || order.trackingNumber}
              </p>
              {order.estimatedDelivery && (
                <p className="text-sm muted mt-1">
                  Entrega estimada:{" "}
                  {order.estimatedDelivery.toLocaleDateString("es-ES")}
                </p>
              )}
            </div>

            <div className="surface-secondary rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  <span className="font-medium">Estado de Envío</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshTracking}
                  disabled={ocaTrackingLoading || ocaServiceLoading}
                >
                  {ocaTrackingLoading || ocaServiceLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {ocaTracking?.estadoActual ? (
                <div>
                  <p className="font-medium">
                    {getOCAStatusLabel(ocaTracking.estadoActual.estado)}
                  </p>
                  <p className="text-sm muted">
                    {ocaTracking.estadoActual.descripcionEstado}
                  </p>
                </div>
              ) : (
                <p className="muted">
                  Información de seguimiento no disponible
                </p>
              )}

              {lastTrackingUpdate && (
                <p className="text-xs muted mt-2">
                  Última actualización:{" "}
                  {lastTrackingUpdate.toLocaleTimeString("es-ES")}
                </p>
              )}

              {ocaError && (
                <p className="text-xs text-error mt-2">Error: {ocaError}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Order Progress */}
      <div className="surface border border-muted rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-6">Historial del Pedido</h2>

        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 surface-secondary"></div>

          <div className="space-y-6">
            {combinedHistory.map((event, index) => (
              <div key={event.id} className="relative flex items-start gap-4">
                {/* Status Icon */}
                <div
                  className={`
                  relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2
                  ${
                    event.status === order.status &&
                    index === combinedHistory.length - 1
                      ? "bg-primary border-primary text-white"
                      : "surface border-muted"
                  }
                `}
                >
                  {getStatusIcon(event.status)}
                </div>

                {/* Status Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium">
                      {getStatusLabel(event.status)}
                    </h3>
                    {event.status === order.status &&
                      index === combinedHistory.length - 1 && (
                        <Badge variant="primary" className="text-xs">
                          Actual
                        </Badge>
                      )}
                  </div>
                  <p className="text-sm muted mb-1">{event.description}</p>
                  <div className="flex items-center gap-4 text-xs muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {event.timestamp.toLocaleString("es-ES")}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Order Items */}
        <div className="surface border border-muted rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Productos</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 surface border border-muted rounded"
              >
                <OptimizedImage
                  src={item.image}
                  alt={item.name}
                  width={60}
                  height={60}
                  className="rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <div className="text-sm muted">
                    {item.size && <span>Talla: {item.size}</span>}
                    {item.color && (
                      <span className="ml-2">Color: {item.color}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm">Cantidad: {item.quantity}</span>
                    <span className="font-medium">${item.price}</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t border-muted pt-4">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span>${order.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="surface border border-muted rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Dirección de Envío</h2>
          <div className="space-y-3">
            <div>
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p className="muted">{order.shippingAddress.street}</p>
              <p className="muted">
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.zipCode}
              </p>
              <p className="muted">{order.shippingAddress.country}</p>
            </div>

            <div className="pt-3 border-t border-muted">
              <div className="flex items-center gap-2 text-sm muted">
                <Phone className="w-4 h-4" />
                <span>{order.shippingAddress.phone}</span>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-6 pt-4 border-t border-muted">
            <h3 className="font-medium mb-2">¿Necesitas ayuda?</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="w-4 h-4 mr-2" />
                Contactar Soporte
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Phone className="w-4 h-4 mr-2" />
                Llamar al +34 900 123 456
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time tracking updates */}
      {order.status === "shipped" &&
        (order.trackingNumber || order.ocaTrackingNumber) && (
          <div className="surface border border-muted rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm muted">
              <Navigation className="w-4 h-4" />
              <span>
                Este pedido se actualiza automáticamente cada 5 minutos mientras
                está en tránsito
              </span>
            </div>
          </div>
        )}
    </div>
  );
}

// Order tracking list component
export function OrderTrackingList({ orders }: { orders: Order[] }) {
  const getStatusBadge = (status: OrderStatus["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pendiente</Badge>;
      case "confirmed":
        return <Badge variant="info">Confirmado</Badge>;
      case "processing":
        return <Badge variant="primary">Preparando</Badge>;
      case "shipped":
        return <Badge variant="primary">Enviado</Badge>;
      case "delivered":
        return <Badge variant="success">Entregado</Badge>;
      case "cancelled":
        return <Badge variant="error">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="surface border border-muted rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-medium">Pedido #{order.orderNumber}</h3>
              <p className="text-sm muted">
                {order.createdAt.toLocaleDateString("es-ES")}
              </p>
            </div>
            <div className="text-right">
              {getStatusBadge(order.status)}
              <p className="text-sm font-medium mt-1">${order.total}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {order.items.slice(0, 3).map((item) => (
                <OptimizedImage
                  key={item.id}
                  src={item.image}
                  alt={item.name}
                  width={32}
                  height={32}
                  className="rounded border-2 border-white"
                />
              ))}
              {order.items.length > 3 && (
                <div className="w-8 h-8 rounded border-2 border-white surface flex items-center justify-center text-xs">
                  +{order.items.length - 3}
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm">
                {order.items.length} producto
                {order.items.length !== 1 ? "s" : ""}
              </p>
              {(order.trackingNumber || order.ocaTrackingNumber) && (
                <p className="text-xs muted">
                  Tracking: {order.ocaTrackingNumber || order.trackingNumber}
                </p>
              )}
            </div>

            <Button variant="outline" size="sm">
              Ver Detalles
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
