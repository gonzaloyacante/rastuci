import { useCallback, useState } from "react";
import useSWR from "swr";

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
  mpPaymentId?: string;
  mpPreferenceId?: string;
  mpStatus?: string;
  shippingMethod?: string;
  shippingCost?: number;
  shippingAgency?: string;
  caTrackingNumber?: string;
  trackingNumber?: string;
  items: OrderItem[];
}

interface UseOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

interface OrdersResponse {
  success: boolean;
  data: {
    data: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al cargar pedidos");
  return res.json();
};

export const useOrders = (initialParams?: UseOrdersParams) => {
  // Estado interno para manejar filtros y paginación
  const [params, setParams] = useState<UseOrdersParams>(initialParams || {});

  // Construir key dinámicamente
  const buildKey = useCallback(() => {
    const urlParams = new URLSearchParams();
    if (params.page) urlParams.append("page", params.page.toString());
    if (params.limit) urlParams.append("limit", params.limit.toString());
    if (params.status) urlParams.append("status", params.status);
    if (params.search) urlParams.append("search", params.search);

    return `/api/orders?${urlParams.toString()}`;
  }, [params]);

  const { data, error, isLoading, mutate } = useSWR<OrdersResponse>(
    buildKey(),
    fetcher,
    {
      keepPreviousData: true,
    }
  );

  const fetchOrders = useCallback((newParams?: UseOrdersParams) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  return {
    orders: data?.data?.data || [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Error") : null,
    totalPages: data?.data?.totalPages || 1,
    currentPage: data?.data?.page || 1,
    fetchOrders, // Compatibility wrapper
    mutate, // Expose mutate for direct cache invadlidation
  };
};
