import useSWR from "swr";

import { SerializedProductReview } from "@/types";
import { fetcher } from "@/utils/fetcher";

interface ReviewsResponse {
  success: boolean;
  data: SerializedProductReview[];
}

export function useProductReviews(productId: string) {
  const { data, error, isLoading, mutate } = useSWR<ReviewsResponse>(
    productId ? `/api/products/${productId}/reviews` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutos
    }
  );

  const reviews = data?.data || [];
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return {
    reviews,
    averageRating,
    isLoading,
    error,
    mutate,
  };
}

export { useProductReviews as useReviews };
