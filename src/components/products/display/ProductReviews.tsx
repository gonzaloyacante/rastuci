"use client";

import { Star, User } from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import { ReviewSkeleton } from "@/components/ui/Skeleton";
import { useProductReviews } from "@/hooks/useReviews";
import { formatDate } from "@/utils/formatters";

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { reviews, averageRating, isLoading } = useProductReviews(productId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <ReviewSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  return (
    <section className="mb-12" aria-labelledby="reviews-title">
      <div className="flex items-center justify-between mb-6">
        <h2 id="reviews-title" className="text-2xl font-bold text-primary">
          Reseñas de clientes
        </h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={`item-${i}`}
                size={20}
                className={`${i < Math.round(averageRating) ? "text-primary fill-current" : "muted"}`}
              />
            ))}
          </div>
          <span className="muted">
            {averageRating.toFixed(1)} ({reviews.length} reseñas)
          </span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="muted">Aún no hay reseñas para este producto.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 surface border border-muted rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-primary">
                        {review.customerName}
                      </p>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={`item-${i}`}
                            size={14}
                            className={`${i < review.rating ? "text-primary fill-current" : "muted"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm muted">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <p className="text-primary leading-relaxed">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
