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
        // Simular fetch de reseñas - en producción esto vendría de tu API
        const mockReviews: Review[] = [
          {
            id: "1",
            userId: "user1",
            userName: "María G.",
            rating: 5,
            comment:
              "Excelente calidad, mi hija la ama. Perfecta para el verano.",
            createdAt: "2024-01-15T10:30:00Z",
          },
          {
            id: "2",
            userId: "user2",
            userName: "Carlos M.",
            rating: 4,
            comment:
              "Muy buena ropa, se ve exactamente como en las fotos. Envío rápido.",
            createdAt: "2024-01-10T14:20:00Z",
          },
          {
            id: "3",
            userId: "user3",
            userName: "Ana L.",
            rating: 5,
            comment:
              "Super cómoda y de buena calidad. Definitivamente volveré a comprar.",
            createdAt: "2024-01-08T09:15:00Z",
          },
        ];

        setReviews(mockReviews);
        const avg =
          mockReviews.reduce((sum, review) => sum + review.rating, 0) /
          mockReviews.length;
        setAverageRating(avg);
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
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-gray-100 rounded-lg">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-full mb-1" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="mb-12" aria-labelledby="reviews-title">
      <div className="flex items-center justify-between mb-6">
        <h2 id="reviews-title" className="text-2xl font-bold text-gray-900">
          Reseñas de clientes
        </h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={20}
                className={`${
                  i < Math.round(averageRating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-gray-600">
            {averageRating.toFixed(1)} ({reviews.length} reseñas)
          </span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
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
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {review.userName}
                      </p>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`${
                              i < review.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">
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
