"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useCorreoArgentino } from "@/hooks/useCorreoArgentino";
import type {
  ProvinceCode,
  TrackingErrorResponse,
  TrackingInfo,
} from "@/lib/correo-argentino-service";
import { logger } from "@/lib/logger";
import { MapPin, RefreshCw, Send, Truck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface ShipmentControlCardProps {
  order: {
    id: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    total: number;
    shippingMethod?: string;
    shippingStreet?: string;
    shippingNumber?: string;
    shippingFloor?: string;
    shippingApartment?: string;
    shippingCity?: string;
    shippingProvince?: string;
    shippingPostalCode?: string;
    shippingAgency?: string;
    caTrackingNumber?: string;
    caShipmentId?: string;
    caExtOrderId?: string;
    caImportStatus?: string | null;
    caImportError?: string | null;
    items: { quantity: number }[];
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onOrderUpdate: (updates: Partial<any>) => void; // Pass partial order updates
}

export function ShipmentControlCard({
  order,
  onOrderUpdate,
}: ShipmentControlCardProps) {
  const {
    getTracking,
    importShipment,
    loading: caLoading,
  } = useCorreoArgentino();
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<
    TrackingInfo | TrackingInfo[] | TrackingErrorResponse | null
  >(null);

  const handleGetTracking = async () => {
    if (!order.caTrackingNumber) {
      toast.error("No hay número de tracking de Correo Argentino");
      return;
    }

    setLoadingTracking(true);
    try {
      const result = await getTracking({ shippingId: order.caTrackingNumber });
      if (result) {
        setTrackingInfo(result);
        toast.success("Información de tracking obtenida");
      } else {
        toast.error("No se pudo obtener información de tracking");
      }
    } catch (err) {
      logger.error("Error al obtener tracking", { error: err });
      toast.error("Error al obtener tracking");
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
        toast.success("Estado sincronizado con Correo Argentino");
        if (json.data.emailSent) {
          toast.success("Email de seguimiento enviado al cliente");
        }
        // Update local state if tracking number changed
        if (
          json.data.trackingNumber &&
          json.data.trackingNumber !== order.caTrackingNumber
        ) {
          onOrderUpdate({ caTrackingNumber: json.data.trackingNumber });
        }
      } else {
        toast.error(json.error || "No se pudo sincronizar");
      }
    } catch (_e) {
      toast.error("Error de conexión al sincronizar");
    } finally {
      setSyncing(false);
    }
  };

  const handleImportShipment = async () => {
    if (order.caShipmentId) {
      toast.error(
        "Este pedido ya tiene un envío importado en Correo Argentino"
      );
      return;
    }

    if (
      !order.shippingStreet ||
      !order.shippingCity ||
      !order.shippingProvince ||
      !order.shippingPostalCode
    ) {
      toast.error("El pedido no tiene dirección completa de envío");
      return;
    }

    if (!confirm("¿Confirmar creación de envío en Correo Argentino?")) return;

    try {
      const totalWeight = order.items.reduce(
        (sum, item) => sum + item.quantity * 1000,
        0
      );

      const shipmentData = {
        customerId: process.env.NEXT_PUBLIC_CORREO_ARGENTINO_CUSTOMER_ID || "",
        extOrderId: order.id,
        recipient: {
          name: order.customerName,
          phone: order.customerPhone,
          email: order.customerEmail || "cliente@example.com",
        },
        shipping: {
          deliveryType:
            order.shippingMethod === "S" ? ("S" as const) : ("D" as const),
          productType: "CP",
          agency: order.shippingAgency,
          address: {
            streetName: order.shippingStreet,
            streetNumber: order.shippingNumber || "SN",
            floor: order.shippingFloor,
            apartment: order.shippingApartment,
            city: order.shippingCity,
            provinceCode: order.shippingProvince as ProvinceCode,
            postalCode: order.shippingPostalCode,
          },
          weight: totalWeight,
          height: 10,
          width: 20,
          length: 30,
          declaredValue: order.total,
        },
      };

      const result = await importShipment(shipmentData);

      if (result) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const resultAny = result as any;
        const shipmentId =
          resultAny.shipmentId || resultAny.id || result.trackingNumber;

        await fetch(`/api/orders/${order.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caTrackingNumber: result.trackingNumber,
            caShipmentId: shipmentId,
            caExtOrderId: order.id,
          }),
        });

        onOrderUpdate({
          caTrackingNumber: result.trackingNumber,
          caShipmentId: shipmentId,
          caExtOrderId: order.id,
        });

        toast.success("Envío importado correctamente en Correo Argentino");
      }
    } catch (err) {
      logger.error("Error al importar envío", { error: err });
      toast.error("Error al importar envío en Correo Argentino");
    }
  };

  // Logic needed for retrying
  const handleRetryImport = async () => {
    if (!confirm("¿Reintentar envío a Correo Argentino?")) return;
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/retry-ca-import`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Envío creado correctamente");
        onOrderUpdate(json.data.order);
      } else {
        toast.error(json.error || "Error al crear envío");
      }
    } catch (_e) {
      toast.error("Error de conexión");
    }
  };

  if (!order.caTrackingNumber && !order.shippingStreet) {
    return null;
  }

  return (
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
                disabled={caLoading}
              >
                {caLoading ? (
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
  );
}
