"use client";

import { CheckCircle, MessageSquare, Star, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/admin";
import { useToast } from "@/components/ui/Toast";
import { useDocumentTitle } from "@/hooks";
import { logger } from "@/lib/logger";

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

interface AdminReview {
  id: string;
  rating: number;
  comment?: string | null;
  customerName: string;
  status: ReviewStatus;
  createdAt: string;
  productId: string;
  products: { id: string; name: string };
}

interface ReviewsData {
  data: AdminReview[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

const STATUS_CONFIG: Record<
  ReviewStatus,
  { label: string; className: string }
> = {
  PENDING: { label: "Pendiente", className: "bg-amber-100 text-amber-800" },
  APPROVED: { label: "Aprobada", className: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rechazada", className: "bg-red-100 text-red-800" },
};

export default function AdminReviewsPage() {
  useDocumentTitle({ title: "Moderación de Reseñas" });

  const { show: showToast } = useToast();
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "ALL">(
    "PENDING"
  );
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/reviews?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Error");
      setData(json.data);
    } catch (e: unknown) {
      logger.error("[AdminReviews] Error fetching", { error: e });
      showToast({ message: "Error al cargar las reseñas", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  const updateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Error");
      showToast({
        message: status === "APPROVED" ? "Reseña aprobada" : "Reseña rechazada",
        type: status === "APPROVED" ? "success" : "info",
      });
      void fetchReviews();
    } catch (e: unknown) {
      logger.error("[AdminReviews] Error updating", { error: e });
      showToast({ message: "Error al actualizar la reseña", type: "error" });
    } finally {
      setUpdating(null);
    }
  };

  const reviews = data?.data ?? [];
  const total = data?.pagination.total ?? 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <AdminPageHeader
        title="Moderación de Reseñas"
        subtitle={`${total} reseña${total !== 1 ? "s" : ""} encontrada${total !== 1 ? "s" : ""}`}
      />

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === s
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s === "ALL" ? "Todas" : STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-lg surface-secondary animate-pulse"
            />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No hay reseñas en este estado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-surface border border-border rounded-lg p-4 flex flex-col md:flex-row gap-4"
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 flex-wrap">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{review.customerName}</p>
                    <a
                      href={`/products/${review.productId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      {review.products.name}
                    </a>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[review.status].className}`}
                  >
                    {STATUS_CONFIG[review.status].label}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">
                    {new Date(review.createdAt).toLocaleDateString("es-AR")}
                  </span>
                </div>

                {review.comment && (
                  <p className="mt-2 text-sm text-foreground/80 line-clamp-3">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                )}
              </div>

              {/* Acciones */}
              {review.status === "PENDING" && (
                <div className="flex md:flex-col gap-2 self-center shrink-0">
                  <button
                    onClick={() => void updateStatus(review.id, "APPROVED")}
                    disabled={updating === review.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-sm font-medium disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aprobar
                  </button>
                  <button
                    onClick={() => void updateStatus(review.id, "REJECTED")}
                    disabled={updating === review.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium disabled:opacity-50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
