import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import { useCallback } from 'react';

// Generic fetcher function
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
};

// Custom hook for API calls with SWR
export function useAPI<T = any>(
  url: string | null,
  config?: SWRConfiguration
): SWRResponse<T, Error> & { refetch: () => void } {
  const { mutate, ...swr } = useSWR<T, Error>(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
    ...config,
  });

  const refetch = useCallback(() => {
    mutate();
  }, [mutate]);

  return { ...swr, mutate, refetch };
}

// Products API hooks
export function useProducts(params?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const query = params ? new URLSearchParams(params as any).toString() : '';
  const url = `/api/products${query ? `?${query}` : ''}`;
  
  return useAPI(url, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });
}

export function useProduct(id: string | null) {
  return useAPI(id ? `/api/products/${id}` : null, {
    revalidateOnFocus: false,
  });
}

export function useProductReviews(productId: string | null) {
  return useAPI(productId ? `/api/products/${productId}/reviews` : null);
}

// Categories API hooks
export function useCategories() {
  return useAPI('/api/categories', {
    revalidateOnFocus: false,
    dedupingInterval: 30000, // Categories don't change often
  });
}

// Orders API hooks
export function useOrders(userId?: string) {
  return useAPI(userId ? `/api/orders?userId=${userId}` : null);
}

export function useOrder(orderId: string | null) {
  return useAPI(orderId ? `/api/orders/${orderId}` : null);
}

// Admin API hooks
export function useAdminStats() {
  return useAPI('/api/admin/stats', {
    refreshInterval: 30000, // Refresh every 30 seconds
  });
}

export function useAdminProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const query = params ? new URLSearchParams(params as any).toString() : '';
  const url = `/api/admin/products${query ? `?${query}` : ''}`;
  
  return useAPI(url);
}

export function useAdminUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const query = params ? new URLSearchParams(params as any).toString() : '';
  const url = `/api/admin/users${query ? `?${query}` : ''}`;
  
  return useAPI(url);
}

// Search API hook
export function useSearch(query: string, options?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}) {
  const searchParams = new URLSearchParams({
    q: query,
    ...options,
  } as any);

  return useAPI(
    query.trim() ? `/api/search?${searchParams.toString()}` : null,
    {
      dedupingInterval: 2000,
      revalidateOnFocus: false,
    }
  );
}

// Wishlist API hook
export function useWishlist(userId: string | null) {
  return useAPI(userId ? `/api/wishlist?userId=${userId}` : null);
}

// Cart API hook (if using server-side cart)
export function useCart(userId: string | null) {
  return useAPI(userId ? `/api/cart?userId=${userId}` : null);
}

// Generic mutation hook
export function useMutation<T = any>(
  url: string,
  options?: RequestInit
) {
  return useCallback(
    async (data?: any): Promise<T> => {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return res.json();
    },
    [url, options]
  );
}

// Specific mutation hooks
export function useCreateProduct() {
  return useMutation('/api/admin/products', { method: 'POST' });
}

export function useUpdateProduct(id: string) {
  return useMutation(`/api/admin/products/${id}`, { method: 'PUT' });
}

export function useDeleteProduct(id: string) {
  return useMutation(`/api/admin/products/${id}`, { method: 'DELETE' });
}

export function useCreateOrder() {
  return useMutation('/api/orders', { method: 'POST' });
}

export function useAddToWishlist() {
  return useMutation('/api/wishlist', { method: 'POST' });
}

export function useRemoveFromWishlist() {
  return useMutation('/api/wishlist', { method: 'DELETE' });
}
