"use client";

import { useCallback, useEffect, useState } from "react";

import { Order, OrderItem } from "@/types";

function parseOrderImages(data: Record<string, unknown>): Order {
  return {
    ...data,
    items: ((data.items as OrderItem[]) || []).map((item: OrderItem) => ({
      ...item,
      product: item.product
        ? {
            ...item.product,
            images:
              typeof item.product.images === "string"
                ? (JSON.parse(item.product.images) as string[])
                : item.product.images,
          }
        : item.product,
    })),
  } as Order;
}

export function useOrderDetail(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/orders/${orderId}`);

        if (!response.ok) {
          setError(
            response.status === 404
              ? "Pedido no encontrado"
              : "Error al cargar el pedido"
          );
          return;
        }

        const data = (await response.json()) as {
          success: boolean;
          data: Record<string, unknown>;
          error?: string;
        };

        if (data.success) {
          setOrder(parseOrderImages(data.data));
        } else {
          setError(data.error ?? "No se pudo cargar el pedido");
        }
      } catch {
        setError("Ocurrió un error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    };

    void fetchOrder();
  }, [orderId]);

  const handleOrderUpdate = useCallback(
    (updates: Partial<Order>) => {
      if (order) {
        setOrder({ ...order, ...updates });
      }
    },
    [order]
  );

  return { order, loading, error, handleOrderUpdate };
}
