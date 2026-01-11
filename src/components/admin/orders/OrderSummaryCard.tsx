import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/lib/utils";
import Image from "next/image";

import { Order, OrderStatus } from "@/types";

interface OrderSummaryCardProps {
  order: Order;
}

const getDetailedStatus = (order: OrderSummaryCardProps["order"]) => {
  // 1. Payment Status
  const isPaid =
    order.paymentStatus === "approved" ||
    order.status === OrderStatus.PROCESSED;

  // 2. Shipping Status (only if shipping is required)
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

  if (order.status === OrderStatus.DELIVERED) {
    return {
      label: "Entregado",
      color: "bg-green-100 text-green-800 border-green-200",
    };
  }

  if (isPaid) {
    if (!requiresShipping) {
      return {
        label: "Pagado (Retiro en Local)",
        color: "bg-blue-100 text-blue-800 border-blue-200",
      };
    }
    if (isShipped) {
      return {
        label: "Enviado / En Tránsito",
        color: "bg-purple-100 text-purple-800 border-purple-200",
      };
    }
    if (isImported) {
      return {
        label: "Etiqueta Generada (Esperando Pago Envío)",
        color: "bg-orange-100 text-orange-800 border-orange-200",
      };
    }
    return {
      label: "Pagado (Pendiente Envío)",
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

  const items = order.items || [];

  return (
    <div className="space-y-6">
      {/* Información general del pedido */}
      <Card>
        <CardHeader className="surface border-b border-muted">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Información General</CardTitle>
            <Badge
              className={`${status.color} border px-3 py-1 text-sm font-medium`}
            >
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium muted">ID del Pedido</h3>
              <p className="text-sm font-mono">{order.id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium muted">Fecha del Pedido</h3>
              <p className="text-sm">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium muted">Total</h3>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(order.total)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium muted">Método de Pago</h3>
              <p className="text-sm capitalize">
                {order.paymentMethod === "mercadopago"
                  ? "Mercado Pago"
                  : order.paymentMethod}
              </p>
            </div>
          </div>

          {/* Detalles de Envío / Sucursal */}
          {(order.shippingMethod === "correo-argentino" ||
            order.shippingAgency) && (
            <div className="mt-4 pt-4 border-t border-muted">
              <h3 className="text-sm font-medium muted mb-2">
                Detalles de Envío
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-semibold">Método:</span>{" "}
                  <span className="text-sm">{order.shippingMethod}</span>
                </div>
                {order.shippingAgency && (
                  <div>
                    <span className="text-sm font-semibold">
                      Agencia/Sucursal:
                    </span>{" "}
                    <span className="text-sm text-primary font-medium">
                      {order.shippingAgency}
                    </span>
                  </div>
                )}
                {(order.shippingStreet || order.shippingCity) && (
                  <div className="md:col-span-2">
                    <span className="text-sm font-semibold">
                      Dirección de Entrega:
                    </span>{" "}
                    <span className="text-sm">
                      {order.shippingStreet} {order.shippingNumber},{" "}
                      {order.shippingCity}, {order.shippingProvince} (
                      {order.shippingPostalCode})
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Productos */}
      <Card>
        <CardHeader className="surface border-b border-muted">
          <CardTitle className="text-lg">Productos ({items.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-sm font-medium text-muted-foreground">
                    Producto
                  </th>
                  <th className="py-2 px-4 text-sm font-medium text-muted-foreground text-right">
                    Cantidad
                  </th>
                  <th className="py-2 px-4 text-sm font-medium text-muted-foreground text-right">
                    Precio Unitario
                  </th>
                  <th className="py-2 px-4 text-sm font-medium text-muted-foreground text-right">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const productImages = item.product?.images;
                  const firstImage = Array.isArray(productImages)
                    ? productImages[0]
                    : typeof productImages === "string"
                      ? productImages
                      : null;

                  return (
                    <tr key={item.id} className="border-b last:border-b-0">
                      <td className="py-2 px-4 flex items-center gap-3">
                        {firstImage && (
                          <div className="relative w-10 h-10 rounded overflow-hidden bg-muted">
                            <Image
                              src={firstImage}
                              alt={item.product?.name || "Producto"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <span className="text-sm font-medium">
                          {item.product?.name || "Producto desconocido"}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-right text-sm">
                        {item.quantity}
                      </td>
                      <td className="py-2 px-4 text-right text-sm">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-2 px-4 text-right text-sm font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 surface flex justify-between items-center border-t border-muted">
            <span className="font-medium">Total:</span>
            <span className="font-bold text-primary">
              {formatCurrency(order.total)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
