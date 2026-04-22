"use client";

import { Package, Truck as TruckIcon } from "lucide-react";

export const shippingMethodLabels: Record<string, string> = {
  pickup: "Retiro en tienda",
  standard: "Envío estándar",
  express: "Envío express",
  ca: "Correo Argentino",
  correo_argentino: "Correo Argentino",
};

export function ShippingMethodLabel({ method }: { method?: string }) {
  if (!method) return null;
  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
      <Package size={14} className="shrink-0" />
      <span className="wrap-break-word">
        {shippingMethodLabels[method] || method}
      </span>
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
