import { useCallback, useState } from "react";

import type { OrderCardData } from "@/components/admin/orders/OrderCard";
import { type Order, useOrders } from "@/hooks/useOrders";
import { formatDateRelative } from "@/utils/formatters";

export type PendingStatusFilter =
  | "PENDING_PAYMENT"
  | "WAITING_TRANSFER_PROOF"
  | "PAYMENT_REVIEW"
  | "RESERVED";

export interface PendingStatusConfig {
  label: string;
  description: string;
  emptyTitle: string;
}

export const PENDING_STATUSES: PendingStatusFilter[] = [
  "PENDING_PAYMENT",
  "WAITING_TRANSFER_PROOF",
  "PAYMENT_REVIEW",
  "RESERVED",
];

export const PENDING_STATUS_CONFIG: Record<
  PendingStatusFilter,
  PendingStatusConfig
> = {
  PENDING_PAYMENT: {
    label: "Aguardando Pago",
    description: "Pedidos de efectivo esperando confirmación del cliente",
    emptyTitle: "Sin pedidos aguardando pago",
  },
  WAITING_TRANSFER_PROOF: {
    label: "Esperando Comprobante",
    description:
      "Pedidos por transferencia esperando que el cliente suba el comprobante",
    emptyTitle: "Sin comprobantes pendientes",
  },
  PAYMENT_REVIEW: {
    label: "En Revisión",
    description:
      "Comprobantes de transferencia pendientes de aprobación de la administradora",
    emptyTitle: "Sin transferencias en revisión",
  },
  RESERVED: {
    label: "Reservados",
    description: "Pedidos reservados con efectivo listos para procesar",
    emptyTitle: "Sin pedidos reservados",
  },
};

function toCardData(order: Order): OrderCardData {
  return {
    id: order.id,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress,
    status: order.status,
    total: order.total,
    createdAt: order.createdAt,
    itemsCount: order.items.length,
    shippingMethod: order.shippingMethod,
    caTrackingNumber: order.caTrackingNumber,
    paymentMethod:
      order.paymentMethod || (order.mpPaymentId ? "mercadopago" : "unknown"),
    relativeTime: formatDateRelative(order.createdAt),
  };
}

export function usePendingOrders() {
  const [activeStatus, setActiveStatus] =
    useState<PendingStatusFilter>("PENDING_PAYMENT");

  const { orders, loading, error, fetchOrders, mutate } = useOrders({
    status: activeStatus,
    limit: 50,
  });

  const handleStatusChange = useCallback(
    (status: PendingStatusFilter) => {
      setActiveStatus(status);
      fetchOrders({ status, limit: 50, page: 1 });
    },
    [fetchOrders]
  );

  const handleRetry = useCallback(() => {
    fetchOrders({ status: activeStatus, limit: 50, page: 1 });
  }, [activeStatus, fetchOrders]);

  const handleOrderUpdate = useCallback(() => {
    void mutate();
  }, [mutate]);

  return {
    activeStatus,
    config: PENDING_STATUS_CONFIG[activeStatus],
    orders: orders.map(toCardData),
    ordersCount: orders.length,
    loading,
    error,
    handleStatusChange,
    handleRetry,
    handleOrderUpdate,
  };
}
