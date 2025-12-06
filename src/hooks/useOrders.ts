import { useCallback, useRef, useState } from "react";

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  productId: string;
  size?: string;
  color?: string;
  product: {
    id: string;
    name: string;
  };
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  // Campos de MercadoPago
  mpPaymentId?: string;
  mpPreferenceId?: string;
  mpStatus?: string;
  // Campos de envío
  shippingMethod?: string;
  shippingCost?: number;
  shippingAgency?: string;
  // Campos de tracking
  caTrackingNumber?: string;
  trackingNumber?: string;
  // Items del pedido
  items: OrderItem[];
}

interface UseOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export const useOrders = (initialParams?: UseOrdersParams) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(initialParams?.page || 1);
  // useRef en lugar de useState para evitar re-renders innecesarios
  const lastParamsRef = useRef<UseOrdersParams>(initialParams || {});

  const fetchOrders = useCallback(async (params?: UseOrdersParams) => {
    try {
      setLoading(true);
      setError(null);
      // Combinar con los últimos parámetros sin disparar re-render
      const finalParams = { ...lastParamsRef.current, ...params };
      lastParamsRef.current = finalParams;

      const urlParams = new URLSearchParams();
      if (finalParams.page) {
        urlParams.append("page", finalParams.page.toString());
      }
      if (finalParams.limit) {
        urlParams.append("limit", finalParams.limit.toString());
      }
      if (finalParams.status) {
        urlParams.append("status", finalParams.status);
      }
      if (finalParams.search) {
        urlParams.append("search", finalParams.search);
      }

      const response = await fetch(`/api/orders?${urlParams}`);
      if (!response.ok) {
        throw new Error("Error al cargar los pedidos");
      }

      const data = await response.json();
      if (data.success) {
        setOrders(data.data.data);
        setTotalPages(data.data.totalPages);
        setCurrentPage(data.data.page);
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias - fetchOrders es estable

  return {
    orders,
    loading,
    error,
    totalPages,
    currentPage,
    fetchOrders,
  };
};
