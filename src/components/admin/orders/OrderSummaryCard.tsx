import {
  Banknote,
  Building2,
  CreditCard,
  Package,
  Tag,
  Truck,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Agency } from "@/lib/correo-argentino-service";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";
import { Order, OrderStatus } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface OrderSummaryCardProps {
  order: Order;
}

const PAYMENT_INFO: Record<
  string,
  { label: string; Icon: React.ElementType; pill: string }
> = {
  mercadopago: {
    label: "MercadoPago",
    Icon: CreditCard,
    pill: "bg-sky-50 text-sky-700 border border-sky-200",
  },
  transfer: {
    label: "Transferencia Bancaria",
    Icon: Building2,
    pill: "bg-violet-50 text-violet-700 border border-violet-200",
  },
  cash: {
    label: "Efectivo",
    Icon: Banknote,
    pill: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  unknown: {
    label: "Sin registrar",
    Icon: CreditCard,
    pill: "bg-gray-50 text-gray-500 border border-gray-200",
  },
};

// A compact data-pair component for the general info grid
function InfoPair({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}

// Color swatch for variant display
function ColorSwatch({ color }: { color: string }) {
  const colorMap: Record<string, string> = {
    rojo: "#ef4444",
    azul: "#3b82f6",
    verde: "#22c55e",
    amarillo: "#eab308",
    negro: "#1f2937",
    blanco: "#f9fafb",
    rosa: "#ec4899",
    naranja: "#f97316",
    violeta: "#8b5cf6",
    gris: "#6b7280",
    celeste: "#38bdf8",
  };
  const bg = colorMap[color.toLowerCase()] ?? "#e5e7eb";
  return (
    <span
      className="inline-block w-3 h-3 rounded-full border border-border/50 shrink-0"
      style={{ backgroundColor: bg }}
      title={color}
    />
  );
}

const getDetailedStatus = (order: OrderSummaryCardProps["order"]) => {
  const isPaid =
    order.paymentStatus === "approved" ||
    order.status === OrderStatus.PROCESSED;
  const shippingId =
    typeof order.shippingMethod === "object" &&
    order.shippingMethod &&
    "id" in order.shippingMethod
      ? (order.shippingMethod as { id: string }).id
      : order.shippingMethod;
  const requiresShipping = order.shippingMethod && shippingId !== "pickup";
  const isShipped = !!order.caTrackingNumber;
  const isImported =
    order.caImportStatus === "processed" || !!order.caTrackingNumber;

  if (order.status === OrderStatus.DELIVERED)
    return {
      label: "Entregado",
      color: "bg-green-100 text-green-800 border-green-200",
    };
  if (isPaid) {
    if (!requiresShipping)
      return {
        label: "Pagado · Retiro en Local",
        color: "bg-blue-100 text-blue-800 border-blue-200",
      };
    if (isShipped)
      return {
        label: "En Tránsito",
        color: "bg-purple-100 text-purple-800 border-purple-200",
      };
    if (isImported)
      return {
        label: "Etiqueta Generada",
        color: "bg-orange-100 text-orange-800 border-orange-200",
      };
    return {
      label: "Pagado · Pendiente Envío",
      color: "bg-blue-100 text-blue-800 border-blue-200",
    };
  }
  return {
    label: "Pendiente de Pago",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };
};

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  const status = getDetailedStatus(order);
  const pm =
    PAYMENT_INFO[order.paymentMethod ?? "unknown"] ?? PAYMENT_INFO.unknown;

  const [agencyDetails, setAgencyDetails] = useState<Agency | null>(null);

  useEffect(() => {
    if (order.shippingAgency && order.shippingProvinceCode && !agencyDetails) {
      const fetchAgency = async () => {
        try {
          const res = await fetch(
            `/api/shipping/agencies?provinceCode=${order.shippingProvinceCode}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.agencies)) {
              const found = data.agencies.find(
                (a: Agency) => a.code === order.shippingAgency
              );
              if (found) setAgencyDetails(found);
            }
          }
        } catch (err) {
          logger.error("Failed to fetch agency details", { error: err });
        }
      };
      void fetchAgency();
    }
  }, [order.shippingAgency, order.shippingProvinceCode, agencyDetails]);

  const items = order.items || [];

  return (
    <div className="space-y-5">
      {/* ── General Info Card ──────────────────────────────────── */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-surface-secondary border-b border-border pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Información General</CardTitle>
            <span
              className={cn(
                "inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                status.color
              )}
            >
              {status.label}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            <InfoPair label="ID del Pedido">
              <span className="font-mono text-primary">
                #{order.id.slice(0, 8).toUpperCase()}
              </span>
            </InfoPair>
            <InfoPair label="Fecha">{formatDate(order.createdAt)}</InfoPair>
            <InfoPair label="Total">
              <span className="text-lg font-bold text-primary">
                {formatCurrency(order.total)}
              </span>
            </InfoPair>
            <InfoPair label="Método de Pago">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
                  pm.pill
                )}
              >
                <pm.Icon size={11} />
                {pm.label}
              </span>
            </InfoPair>
            {order.couponCode && (
              <InfoPair label="Cupón Aplicado">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Tag size={10} />
                  {order.couponCode}
                </span>
              </InfoPair>
            )}
            {order.shippingMethod && (
              <InfoPair label="Método de Envío">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-surface-secondary border border-border text-muted-foreground">
                  <Truck size={10} />
                  {order.shippingMethod}
                </span>
              </InfoPair>
            )}
          </div>

          {/* Shipping details */}
          {(order.shippingAgency ||
            order.shippingStreet ||
            order.shippingCity) && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Dirección de Entrega
              </p>
              <div className="space-y-2">
                {order.shippingAgency && (
                  <div className="p-3 bg-surface-secondary rounded-lg border border-border text-sm">
                    {agencyDetails ? (
                      <div>
                        <p className="font-semibold text-base-primary flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          {agencyDetails.name}{" "}
                          <span className="text-muted-foreground font-normal text-xs">
                            ({agencyDetails.code})
                          </span>
                        </p>
                        <p className="text-muted-foreground mt-1 ml-4 text-xs">
                          {agencyDetails.location.address.streetName}{" "}
                          {agencyDetails.location.address.streetNumber},{" "}
                          {agencyDetails.location.address.city}
                        </p>
                      </div>
                    ) : (
                      <span className="text-primary font-medium">
                        Sucursal {order.shippingAgency}
                      </span>
                    )}
                  </div>
                )}
                {(order.shippingStreet || order.shippingCity) && (
                  <p className="text-sm text-muted-foreground">
                    {[
                      order.shippingStreet,
                      order.shippingCity,
                      order.shippingProvince,
                      order.shippingPostalCode
                        ? `(${order.shippingPostalCode})`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Products Card ──────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-surface-secondary border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Package size={15} className="text-muted-foreground" />
            <CardTitle className="text-base">
              Productos
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({items.length} {items.length === 1 ? "item" : "items"})
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {items.map((item) => {
              const productImages = item.product?.images;
              const firstImage = Array.isArray(productImages)
                ? productImages[0]
                : typeof productImages === "string"
                  ? productImages
                  : null;

              return (
                <li
                  key={item.id}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-surface-secondary/50 transition-colors"
                >
                  {/* Image */}
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-surface-secondary border border-border shrink-0">
                    {firstImage ? (
                      <Image
                        src={firstImage}
                        alt={item.product?.name ?? "Producto"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package
                          size={18}
                          className="text-muted-foreground/40"
                        />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {item.product?.name ?? "Producto desconocido"}
                    </p>
                    {(item.color || item.size) && (
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {item.color && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-secondary border border-border text-muted-foreground">
                            <ColorSwatch color={item.color} />
                            {item.color}
                          </span>
                        )}
                        {item.size && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/5 border border-primary/20 text-primary">
                            T: {item.size}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quantity × Price */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Financial summary */}
          <div className="px-4 py-3 bg-surface-secondary border-t border-border space-y-1.5">
            {order.subtotal != null && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
            )}
            {order.shippingCost != null && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Envío</span>
                <span>
                  {order.shippingCost === 0
                    ? "Gratis"
                    : formatCurrency(order.shippingCost)}
                </span>
              </div>
            )}
            {order.discount != null && order.discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600 font-medium">
                <span>
                  Descuento{order.couponCode ? ` (${order.couponCode})` : ""}
                </span>
                <span>−{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-sm font-bold">Total</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
