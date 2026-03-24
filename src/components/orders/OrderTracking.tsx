"use client";

import { AlertCircle, Download, Mail } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { generateInvoiceHTML } from "@/lib/invoiceGenerator";
import { logger } from "@/lib/logger";

import {
  Order,
  OrderItemsCard,
  OrderTrackingHeader,
  ShippingAddressCard,
  StatusHistoryCard,
  TrackingData,
  TrackingEventsCard,
  TrackingNumberCard,
} from "./OrderTrackingSections";

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
    if (!trackingNumber) return;
    try {
      setTrackingLoading(true);
      const res = await fetch(`/api/tracking/${trackingNumber}`);
      if (!res.ok) throw new Error(`Error obteniendo tracking: ${res.status}`);
      const data = await res.json();
      if (data.success && data.data) {
        setTracking(data.data);
        setLastTrackingUpdate(new Date());
      }
    } catch (err) {
      logger.error("Error loading tracking", { error: err });
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

      if (apiOrder.trackingNumber) {
        await loadTracking(apiOrder.trackingNumber);
      }
    } catch (err) {
      logger.error("Error loading order", { error: err });
      setError(
        (err as Error)?.message ?? "Error desconocido al cargar el pedido"
      );
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId, onOrderUpdate, loadTracking]);

  const refreshTracking = useCallback(async () => {
    if (order?.trackingNumber) await loadTracking(order.trackingNumber);
  }, [order, loadTracking]);

  useEffect(() => {
    void loadOrderData();
  }, [loadOrderData]);

  useEffect(() => {
    if (!order?.trackingNumber) return;
    const interval = setInterval(() => void refreshTracking(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [order?.trackingNumber, refreshTracking]);

  const downloadInvoice = async () => {
    if (!order) return;
    try {
      logger.info("Downloading invoice", { orderId: order.id });
      const blob = new Blob([generateInvoiceHTML(order)], {
        type: "text/html",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `factura_${order.id}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      logger.info("Invoice downloaded successfully", { orderId: order.id });
    } catch (err) {
      logger.error("Error downloading invoice", {
        orderId: order.id,
        error: err,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
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
      <OrderTrackingHeader order={order} />

      {order.trackingNumber && (
        <TrackingNumberCard
          trackingNumber={order.trackingNumber}
          lastUpdate={lastTrackingUpdate}
          loading={trackingLoading}
          onRefresh={refreshTracking}
        />
      )}

      {tracking && tracking.events && tracking.events.length > 0 && (
        <TrackingEventsCard events={tracking.events} />
      )}

      {order.statusHistory && order.statusHistory.length > 0 && (
        <StatusHistoryCard statusHistory={order.statusHistory} />
      )}

      <ShippingAddressCard address={order.shippingAddress} />

      <OrderItemsCard order={order} />

      <div className="flex gap-4">
        <Button onClick={downloadInvoice} variant="outline" className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Descargar Factura
        </Button>
        <Button variant="outline" className="flex-1" asChild>
          <Link href="/contacto">
            <Mail className="h-4 w-4 mr-2" />
            Contactar Soporte
          </Link>
        </Button>
      </div>
    </div>
  );
}
