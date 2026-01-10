"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ORDER_STATUS } from "@/lib/constants";
import { CheckCircle, Clock, CreditCard, Package, Truck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

type OrderStatusType = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

interface OrderActionsCardProps {
  order: {
    id: string;
    status: string;
  };
  onOrderUpdate: (updates: Partial<{ status: OrderStatusType }>) => void;
}

export function OrderActionsCard({
  order,
  onOrderUpdate,
}: OrderActionsCardProps) {
  const [updating, setUpdating] = useState(false);

  const updateOrderStatus = async (newStatus: OrderStatusType) => {
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
        toast.success(`Pedido actualizado a ${newStatus}`);
      } else {
        throw new Error(data.error || "Error al actualizar el pedido");
      }
    } catch (_error) {
      toast.error("No se pudo actualizar el estado del pedido");
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
          {order.status === ORDER_STATUS.PENDING && (
            <Button
              className="w-full btn-hero flex items-center justify-center gap-2"
              onClick={() => updateOrderStatus(ORDER_STATUS.PENDING_PAYMENT)}
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

          {/* PENDING_PAYMENT -> PROCESSED (Admin pagó envío) */}
          {order.status === ORDER_STATUS.PENDING_PAYMENT && (
            <Button
              className="w-full btn-hero flex items-center justify-center gap-2"
              onClick={() => updateOrderStatus(ORDER_STATUS.PROCESSED)}
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
          {order.status === ORDER_STATUS.PROCESSED && (
            <Button
              className="w-full btn-hero flex items-center justify-center gap-2"
              onClick={() => updateOrderStatus(ORDER_STATUS.DELIVERED)}
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

          {/* Botón para volver a PENDING (si no está en PENDING ni DELIVERED) */}
          {order.status !== ORDER_STATUS.PENDING &&
            order.status !== ORDER_STATUS.DELIVERED && (
              <Button
                variant="outline"
                className="w-full mt-3 flex items-center justify-center gap-2"
                onClick={() => updateOrderStatus(ORDER_STATUS.PENDING)}
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
