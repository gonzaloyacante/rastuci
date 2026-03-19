"use client";

import {
  Ban,
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { ORDER_STATUS } from "@/lib/constants";
import { Order, OrderStatus } from "@/types";

interface OrderActionsCardProps {
  order: Pick<Order, "id" | "status">;
  onOrderUpdate: (updates: Partial<{ status: OrderStatus }>) => void;
}

export function OrderActionsCard({
  order,
  onOrderUpdate,
}: OrderActionsCardProps) {
  const { show } = useToast();
  const [updating, setUpdating] = useState(false);

  const updateOrderStatus = async (newStatus: OrderStatus) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar pedido");
      }

      const data = await response.json();

      if (data.success) {
        onOrderUpdate({ status: newStatus });
        show({ type: "success", message: `Pedido actualizado a ${newStatus}` });
      } else {
        throw new Error(data.error || "Error al actualizar el pedido");
      }
    } catch (_error) {
      show({
        type: "error",
        message: "No se pudo actualizar el estado del pedido",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="surface border-b border-muted">
        <CardTitle className="text-lg">Acciones</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {/* PENDING -> PENDING_PAYMENT (Cliente pagó) */}
          {order.status === OrderStatus.PENDING && (
            <Button
              className="w-full flex items-center justify-center space-x-2"
              onClick={() => updateOrderStatus(OrderStatus.PENDING_PAYMENT)}
              disabled={updating}
            >
              {updating ? (
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
              ) : (
                <CreditCard size={16} />
              )}
              Cliente Pagó - Esperar Envío
            </Button>
          )}

          {/* RESERVED -> WAITING_TRANSFER_PROOF (Admin confirma reserva) */}
          {order.status === OrderStatus.RESERVED && (
            <Button
              className="w-full flex items-center justify-center space-x-2"
              onClick={() =>
                updateOrderStatus(OrderStatus.WAITING_TRANSFER_PROOF)
              }
              disabled={updating}
            >
              {updating ? (
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
              ) : (
                <CreditCard size={16} />
              )}
              Solicitar Comprobante de Transferencia
            </Button>
          )}

          {/* WAITING_TRANSFER_PROOF -> PAYMENT_REVIEW (Comprobante recibido) */}
          {order.status === OrderStatus.WAITING_TRANSFER_PROOF && (
            <Button
              className="w-full flex items-center justify-center space-x-2"
              onClick={() => updateOrderStatus(OrderStatus.PAYMENT_REVIEW)}
              disabled={updating}
            >
              {updating ? (
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
              ) : (
                <Eye size={16} />
              )}
              Marcar Comprobante Recibido
            </Button>
          )}

          {/* PAYMENT_REVIEW -> PENDING_PAYMENT (Pago verificado) */}
          {order.status === OrderStatus.PAYMENT_REVIEW && (
            <Button
              className="w-full flex items-center justify-center space-x-2"
              onClick={() => updateOrderStatus(OrderStatus.PENDING_PAYMENT)}
              disabled={updating}
            >
              {updating ? (
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
              ) : (
                <ShieldCheck size={16} />
              )}
              Aprobar Pago por Transferencia
            </Button>
          )}

          {/* PENDING_PAYMENT -> PROCESSED (Admin pagó envío) */}
          {order.status === OrderStatus.PENDING_PAYMENT && (
            <Button
              className="w-full flex items-center justify-center space-x-2"
              onClick={() => updateOrderStatus(OrderStatus.PROCESSED)}
              disabled={updating}
            >
              {updating ? (
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
              ) : (
                <Package size={16} />
              )}
              Marcar como Procesado
            </Button>
          )}

          {/* PROCESSED -> DELIVERED */}
          {order.status === OrderStatus.PROCESSED && (
            <Button
              className="w-full flex items-center justify-center space-x-2"
              onClick={() => updateOrderStatus(OrderStatus.DELIVERED)}
              disabled={updating}
            >
              {updating ? (
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
              ) : (
                <Truck size={16} />
              )}
              Marcar como Entregado
            </Button>
          )}

          {/* DELIVERED - Completado */}
          {order.status === ORDER_STATUS.DELIVERED && (
            <div className="p-4 surface text-primary border border-muted rounded-lg flex items-center justify-center gap-2">
              <CheckCircle size={16} />
              Pedido completado
            </div>
          )}

          {/* CANCELLED - Cancelado */}
          {order.status === ORDER_STATUS.CANCELLED && (
            <div className="p-4 surface text-error border border-error rounded-lg flex items-center justify-center gap-2">
              <Ban size={16} />
              Pedido cancelado
            </div>
          )}

          {/* Botón Cancelar — disponible en cualquier estado activo */}
          {order.status !== ORDER_STATUS.DELIVERED &&
            order.status !== ORDER_STATUS.CANCELLED && (
              <Button
                variant="outline"
                className="w-full mt-1 flex items-center justify-center gap-2 border-error text-error hover:bg-error hover:text-white"
                onClick={() => updateOrderStatus(OrderStatus.CANCELLED)}
                disabled={updating}
              >
                <Ban size={16} />
                Cancelar Pedido
              </Button>
            )}

          {/* Botón para volver a PENDING (si no está en PENDING, DELIVERED ni CANCELLED) */}
          {order.status !== ORDER_STATUS.PENDING &&
            order.status !== ORDER_STATUS.DELIVERED &&
            order.status !== ORDER_STATUS.CANCELLED && (
              <Button
                variant="outline"
                className="w-full mt-1 flex items-center justify-center gap-2"
                onClick={() => updateOrderStatus(OrderStatus.PENDING)}
                disabled={updating}
              >
                <Clock size={16} />
                Volver a Pendiente
              </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
