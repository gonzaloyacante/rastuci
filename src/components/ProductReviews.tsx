"use client";

import { useState, useEffect } from "react";
import { Star, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // Obtener reseñas reales desde la API
        const res = await fetch(`/api/products/${productId}/reviews`);
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const json = await res.json();
        const data: Review[] = json.data || [];
        setReviews(data);
        if (data.length > 0) {
          const avg = data.reduce((sum, review) => sum + review.rating, 0) / data.length;
          setAverageRating(avg);
        } else {
          setAverageRating(0);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 surface border border-muted rounded animate-pulse w-1/3" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 surface border border-muted rounded-lg">
              <div className="h-4 surface border border-muted rounded animate-pulse w-1/4 mb-2" />
              <div className="h-3 surface border border-muted rounded animate-pulse w-full mb-1" />
              <div className="h-3 surface border border-muted rounded animate-pulse w-3/4" />
            </div>
          ))}
        </div>
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
                key={i}
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
          <p className="muted">
            Aún no hay reseñas para este producto.
          </p>
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
                        {review.userName}
                      </p>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
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
                <p className="text-primary leading-relaxed">
                  {review.comment}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
