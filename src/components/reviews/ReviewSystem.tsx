'use client';

import React, { useState } from "react";
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Star, ThumbsUp, ThumbsDown, Flag, User } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { EnhancedForm, FormField } from '@/components/forms/EnhancedForm';
import { z } from 'zod';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  notHelpful: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ReviewSystemProps {
  productId: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  onReviewSubmit: (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onReviewHelpful: (reviewId: string, helpful: boolean) => Promise<void>;
  onReviewReport: (reviewId: string, reason: string) => Promise<void>;
  currentUserId?: string;
}

const reviewSchema = z.object({
  rating: z.number().min(1, 'Debes seleccionar una calificación').max(5),
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  comment: z.string().min(20, 'El comentario debe tener al menos 20 caracteres'),
});

export default function ReviewSystem({ productId: _productId, reviews, averageRating, totalReviews, onReviewSubmit, onReviewHelpful, onReviewReport, currentUserId }: ReviewSystemProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating-high' | 'rating-low' | 'helpful'>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const userHasReviewed = reviews.some(review => review.userId === currentUserId);

  const sortedAndFilteredReviews = reviews
    .filter(review => filterRating ? review.rating === filterRating : true)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'rating-high':
          return b.rating - a.rating;
        case 'rating-low':
          return a.rating - b.rating;
        case 'helpful':
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(review => review.rating === rating).length,
    percentage: totalReviews > 0 ? (reviews.filter(review => review.rating === rating).length / totalReviews) * 100 : 0,
  }));

  const handleReviewSubmit = async (data: z.infer<typeof reviewSchema>) => {
    if (!currentUserId) {
      toast.error('Debes iniciar sesión para escribir una reseña');
      return;
    }

    try {
      await onReviewSubmit({
        userId: currentUserId,
        userName: 'Usuario', // This would come from user context
        rating: selectedRating,
        title: data.title,
        comment: data.comment,
        verified: false, // Would be determined by purchase history
        helpful: 0,
        notHelpful: 0,
      });
      
      setShowReviewForm(false);
      setSelectedRating(0);
      toast.success('Reseña enviada correctamente');
    } catch {
      toast.error('Error al enviar la reseña');
    }
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="surface border border-muted rounded-lg p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${
                    star <= averageRating ? 'text-warning fill-current' : 'muted'
                  }`}
                />
              ))}
            </div>
            <p className="muted">Basado en {totalReviews} reseñas</p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm w-8">{rating}★</span>
                <div className="flex-1 surface-secondary rounded-full h-2">
                  <div
                    className="bg-warning h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm muted w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Write Review Button */}
        {currentUserId && !userHasReviewed && (
          <div className="mt-6 text-center">
            <Button onClick={() => setShowReviewForm(true)}>
              Escribir Reseña
            </Button>
          </div>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="surface border border-muted rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Escribir Reseña</h3>
          
          <EnhancedForm
            schema={reviewSchema}
            onSubmit={handleReviewSubmit}
            submitText="Enviar Reseña"
          >
            {({ register, errors }) => (
              <>
                {/* Rating Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Calificación <span className="text-error">*</span>
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            star <= (hoverRating || selectedRating)
                              ? 'text-warning fill-current'
                              : 'muted'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {selectedRating === 0 && (
                    <p className="text-sm text-error">Selecciona una calificación</p>
                  )}
                </div>

                <FormField
                  name="title"
                  label="Título de la reseña"
                  placeholder="Resumen de tu experiencia"
                  required
                  register={register}
                  errors={errors}
                />

                <div className="space-y-2">
                  <label htmlFor="comment" className="block text-sm font-medium">
                    Comentario <span className="text-error">*</span>
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    placeholder="Comparte tu experiencia con este producto..."
                    {...register('comment')}
                    className={`w-full px-3 py-2 border rounded-md surface focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.comment ? 'border-error' : 'border-muted'
                    }`}
                  />
                  {errors.comment && (
                    <p className="text-sm text-error">{errors.comment.message}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            )}
          </EnhancedForm>
        </div>
      )}

      {/* Filters and Sorting */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'rating-high' | 'rating-low')}
            className="px-3 py-1 border border-muted rounded surface text-sm"
          >
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="rating-high">Mejor valorados</option>
            <option value="rating-low">Peor valorados</option>
            <option value="helpful">Más útiles</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filtrar por:</span>
          <div className="flex gap-1">
            <Button
              variant={filterRating === null ? "secondary" : "outline"}
              size="sm"
              onClick={() => setFilterRating(null)}
            >
              Todas
            </Button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Button
                key={rating}
                variant={filterRating === rating ? "secondary" : "outline"}
                size="sm"
                onClick={() => setFilterRating(rating)}
              >
                {rating}★
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedAndFilteredReviews.length === 0 ? (
          <div className="text-center py-8 muted">
            {filterRating ? 'No hay reseñas con esta calificación' : 'No hay reseñas aún'}
          </div>
        ) : (
          sortedAndFilteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onHelpful={onReviewHelpful}
              onReport={onReviewReport}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
  onHelpful: (reviewId: string, helpful: boolean) => Promise<void>;
  onReport: (reviewId: string, reason: string) => Promise<void>;
  currentUserId?: string;
}

function ReviewCard({ review, onHelpful, onReport, currentUserId }: ReviewCardProps) {
  const [showReportForm, setShowReportForm] = useState(false);

  const handleHelpful = (helpful: boolean) => {
    onHelpful(review.id, helpful);
  };

  const handleReport = (reason: string) => {
    onReport(review.id, reason);
    setShowReportForm(false);
  };

  return (
    <div className="surface border border-muted rounded-lg p-6">
      <div className="flex items-start gap-4">
        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full surface border border-muted flex items-center justify-center">
          {review.userAvatar ? (
            <OptimizedImage
              src={review.userAvatar}
              alt={review.userName}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <User className="w-5 h-5 muted" />
          )}
        </div>

        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium">{review.userName}</span>
            {review.verified && (
              <Badge variant="success" className="text-xs">
                Compra verificada
              </Badge>
            )}
            <span className="muted text-sm">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.rating ? 'text-warning fill-current' : 'muted'
                  }`}
                />
              ))}
            </div>
            <span className="font-medium">{review.title}</span>
          </div>

          {/* Comment */}
          <p className="mb-4">{review.comment}</p>

          {/* Images */}
          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mb-4">
              {review.images.map((image) => (
                <OptimizedImage
                  key={`review-image-${image}`}
                  src={image}
                  alt={`Review image`}
                  width={80}
                  height={80}
                  className="rounded border border-muted"
                />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleHelpful(true)}
                className="flex items-center gap-1"
              >
                <ThumbsUp className="w-4 h-4" />
                Útil ({review.helpful})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleHelpful(false)}
                className="flex items-center gap-1"
              >
                <ThumbsDown className="w-4 h-4" />
                ({review.notHelpful})
              </Button>
            </div>

            {currentUserId && currentUserId !== review.userId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReportForm(true)}
                className="flex items-center gap-1 text-error"
              >
                <Flag className="w-4 h-4" />
                Reportar
              </Button>
            )}
          </div>

          {/* Report Form */}
          {showReportForm && (
            <div className="mt-4 p-4 border border-muted rounded">
              <h4 className="font-medium mb-2">Reportar reseña</h4>
              <div className="space-y-2">
                {['Contenido inapropiado', 'Spam', 'Información falsa', 'Otro'].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => handleReport(reason)}
                    className="block w-full text-left px-3 py-2 hover-surface rounded"
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReportForm(false)}
                className="mt-2"
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
