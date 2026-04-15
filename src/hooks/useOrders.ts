import { useCallback, useState } from "react";
import useSWR from "swr";

import { OrderStatus } from "@/types";
import { fetcher } from "@/utils/fetcher";

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
  status: OrderStatus;
  paymentMethod?: string;
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
  status?: OrderStatus | string;
  search?: string;
  shippingMethod?: string;
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

export const useOrders = (initialParams?: UseOrdersParams) => {
  // Estado interno para manejar filtros y paginación
  const [params, setParams] = useState<UseOrdersParams>({
    page: 1,
    limit: 20,
    ...initialParams,
  });

  // Construir key dinámicamente
  const buildKey = useCallback(() => {
    const urlParams = new URLSearchParams();
    if (params.page) urlParams.append("page", params.page.toString());
    if (params.limit) urlParams.append("limit", params.limit.toString());
    if (params.status) urlParams.append("status", params.status);
    if (params.search) urlParams.append("search", params.search);
    if (params.shippingMethod)
      urlParams.append("shippingMethod", params.shippingMethod);

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
    mutate, // Expose mutate for direct cache invalidation
  };
};
