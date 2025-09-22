import useSWR from "swr";

interface Review {
  id: string;
  rating: number;
  comment: string;
  customerName: string;
  createdAt: string;
  productId: string;
}

export function useProductReviews(productId: string) {
  const { data, error, isLoading, mutate } = useSWR<Review[]>(
    productId ? `/api/products/${productId}/reviews` : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutos
    },
  );

  return {
    reviews: data || [],
    isLoading,
    error,
    mutate,
  };
}

// Export alias para compatibilidad
export { useProductReviews as useReviews };
