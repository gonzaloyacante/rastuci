import { useState } from "react";

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: Array<Record<string, unknown>>;
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
  const [lastParams, setLastParams] = useState<UseOrdersParams>(
    initialParams || {}
  );

  const fetchOrders = async (params?: UseOrdersParams) => {
    try {
      setLoading(true);
      setError(null);
      const finalParams = { ...lastParams, ...params };
      setLastParams(finalParams);
      const urlParams = new URLSearchParams();
      if (finalParams.page)
        urlParams.append("page", finalParams.page.toString());
      if (finalParams.limit)
        urlParams.append("limit", finalParams.limit.toString());
      if (finalParams.status) urlParams.append("status", finalParams.status);
      if (finalParams.search) urlParams.append("search", finalParams.search);
      const response = await fetch(`/api/orders?${urlParams}`);
      if (!response.ok) throw new Error("Error al cargar los pedidos");
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
  };

  return {
    orders,
    loading,
    error,
    totalPages,
    currentPage,
    fetchOrders,
  };
};
