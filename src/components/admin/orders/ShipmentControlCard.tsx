"use client";

import { MapPin, RefreshCw, Send, Truck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useCorreoArgentino } from "@/hooks/useCorreoArgentino";
import type {
  TrackingErrorResponse,
  TrackingInfo,
} from "@/lib/correo-argentino-service";
import { logger } from "@/lib/logger";
import { Order } from "@/types";

interface ShipmentControlCardProps {
  order: Order;
  onOrderUpdate: (updates: Partial<Order>) => void; // Pass partial order updates
}

function isShippingAddressComplete(order: Order): boolean {
  return !!(
    order.shippingStreet &&
    order.shippingCity &&
    order.shippingProvince &&
    order.shippingPostalCode
  );
}

export function ShipmentControlCard({
  order,
  onOrderUpdate,
}: ShipmentControlCardProps) {
  const { show } = useToast();
  const { getTracking } = useCorreoArgentino();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<
    TrackingInfo | TrackingInfo[] | TrackingErrorResponse | null
  >(null);

  const handleGetTracking = async () => {
    if (!order.caTrackingNumber) {
      show({
        type: "error",
        message: "No hay número de tracking de Correo Argentino",
      });
      return;
    }

    setLoadingTracking(true);
    try {
      const result = await getTracking({ shippingId: order.caTrackingNumber });
      if (result) {
        setTrackingInfo(result);
        show({ type: "success", message: "Información de tracking obtenida" });
      } else {
        show({
          type: "error",
          message: "No se pudo obtener información de tracking",
        });
      }
    } catch (err) {
      logger.error("Error al obtener tracking", { error: err });
      show({ type: "error", message: "Error al obtener tracking" });
    } finally {
      setLoadingTracking(false);
    }
  };

  const handleSyncCA = async () => {
    if (!order.caShipmentId && !order.caTrackingNumber) return;

    setSyncing(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/sync-ca`, {
        method: "POST",
      });
      const json = await res.json();

      if (json.success) {
        show({
          type: "success",
          message: "Estado sincronizado con Correo Argentino",
        });
        if (json.data.emailSent) {
          show({
            type: "success",
            message: "Email de seguimiento enviado al cliente",
          });
        }
        // Update local state if tracking number changed
        if (
          json.data.trackingNumber &&
          json.data.trackingNumber !== order.caTrackingNumber
        ) {
          onOrderUpdate({ caTrackingNumber: json.data.trackingNumber });
        }
      } else {
        show({
          type: "error",
          message: json.error || "No se pudo sincronizar",
        });
      }
    } catch (_e) {
      show({ type: "error", message: "Error de conexión al sincronizar" });
    } finally {
      setSyncing(false);
    }
  };

  const handleImportShipment = async () => {
    if (order.caShipmentId) {
      show({
        type: "error",
        message: "Este pedido ya tiene un envío importado en Correo Argentino",
      });
      return;
    }
    if (!isShippingAddressComplete(order)) {
      show({
        type: "error",
        message: "El pedido no tiene dirección completa de envío",
      });
      return;
    }
    const confirmed = await confirm({
      title: "Crear envío en Correo Argentino",
      message: "¿Confirmar creación de envío en Correo Argentino?",
      confirmText: "Confirmar",
      variant: "danger",
    });
    if (!confirmed) return;
    setImporting(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/retry-ca-import`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        show({
          type: "success",
          message: "Envío importado correctamente en Correo Argentino",
        });
        onOrderUpdate(json.data.order);
      } else {
        show({
          type: "error",
          message: json.error || "Error al importar envío",
        });
      }
    } catch (err) {
      logger.error("Error al importar envío", { error: err });
      show({
        type: "error",
        message: "Error al importar envío en Correo Argentino",
      });
    } finally {
      setImporting(false);
    }
  };

  // Logic needed for retrying
  const handleRetryImport = async () => {
    const confirmed = await confirm({
      title: "Reintentar envío",
      message: "¿Reintentar envío a Correo Argentino?",
      confirmText: "Reintentar",
      variant: "danger",
    });
    if (!confirmed) return;
    setImporting(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/retry-ca-import`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        show({ type: "success", message: "Envío creado correctamente" });
        onOrderUpdate(json.data.order);
      } else {
        show({ type: "error", message: json.error || "Error al crear envío" });
      }
    } catch (_e) {
      show({ type: "error", message: "Error de conexión" });
    } finally {
      setImporting(false);
    }
  };

  if (!order.caTrackingNumber && !order.shippingStreet) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader className="surface border-b border-muted">
          <CardTitle className="text-lg flex items-center gap-2">
            <Truck size={18} />
            Correo Argentino
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {/* Status de Importación CA (si hubo error) */}
            {order.caImportStatus === "ERROR" && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm mb-3">
                <p className="font-bold flex items-center gap-2">
                  <span className="text-lg">⚠️</span> Error al enviar a CA
                </p>
                <p className="mt-1">{order.caImportError}</p>
              </div>
            )}

            {order.caTrackingNumber && (
              <div>
                <h3 className="text-sm font-medium muted">Tracking</h3>
                <p className="text-sm font-mono">{order.caTrackingNumber}</p>
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={handleGetTracking}
                  disabled={loadingTracking}
                >
                  {loadingTracking ? (
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                  ) : (
                    <MapPin size={16} className="mr-2" />
                  )}
                  Rastrear Envío
                </Button>
              </div>
            )}
            {trackingInfo &&
              !Array.isArray(trackingInfo) &&
              "events" in trackingInfo && (
                <div className="p-3 surface-secondary rounded text-sm">
                  <p>
                    <strong>Tracking:</strong> {trackingInfo.shippingId}
                  </p>
                  {trackingInfo.events && trackingInfo.events.length > 0 && (
                    <>
                      <p>
                        <strong>Estado:</strong>{" "}
                        {trackingInfo.events[0].eventDescription}
                      </p>
                      <p>
                        <strong>Ubicación:</strong>{" "}
                        {trackingInfo.events[0].branchName}
                      </p>
                      <p>
                        <strong>Fecha:</strong>{" "}
                        {new Date(
                          trackingInfo.events[0].eventDate
                        ).toLocaleString("es-AR")}
                      </p>
                    </>
                  )}
                </div>
              )}
            {!order.caShipmentId && order.shippingStreet && (
              <div>
                <h3 className="text-sm font-medium muted mb-2">
                  Dirección de Envío
                </h3>
                <p className="text-sm">
                  {order.shippingStreet} {order.shippingNumber}
                  {order.shippingFloor && `, Piso ${order.shippingFloor}`}
                  {order.shippingApartment &&
                    `, Depto ${order.shippingApartment}`}
                </p>
                <p className="text-sm">
                  {order.shippingCity}, {order.shippingProvince}
                </p>
                <p className="text-sm">CP: {order.shippingPostalCode}</p>

                <Button
                  className="w-full mt-3 btn-hero"
                  onClick={
                    order.caImportStatus === "ERROR"
                      ? handleRetryImport
                      : handleImportShipment
                  }
                  disabled={importing}
                >
                  {importing ? (
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                  ) : (
                    <Send size={16} className="mr-2" />
                  )}
                  {order.caImportStatus === "ERROR"
                    ? "Reintentar envío a CA"
                    : "Importar a Correo Argentino"}
                </Button>
              </div>
            )}
            {order.caShipmentId && (
              <div className="p-3 surface text-success border border-success rounded-lg text-sm">
                <p>
                  <strong>ID Envío:</strong> {order.caShipmentId}
                </p>
                <p className="text-xs mt-1">
                  Envío registrado en Correo Argentino
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 bg-white text-black border-gray-300 hover:bg-gray-50"
                  onClick={handleSyncCA}
                  disabled={syncing}
                >
                  <RefreshCw
                    size={14}
                    className={`mr-2 ${syncing ? "animate-spin" : ""}`}
                  />
                  Sincronizar Estado (Check Pago)
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {ConfirmDialog}
    </>
  );
}
