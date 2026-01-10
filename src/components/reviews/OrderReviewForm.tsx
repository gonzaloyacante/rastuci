"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface ProductItem {
  id: string;
  name: string;
  image: string;
}

interface OrderReviewFormProps {
  orderId: string;
  customerName: string;
  products: ProductItem[];
}

interface ReviewState {
  rating: number;
  comment: string;
}

export default function OrderReviewForm({
  orderId,
  customerName,
  products,
}: OrderReviewFormProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Record<string, ReviewState>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRating = (productId: string, rating: number) => {
    setReviews((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], rating },
    }));
  };

  const handleComment = (productId: string, comment: string) => {
    setReviews((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], comment },
    }));
  };

  const handleSubmit = async () => {
    // Validar que al menos uno tenga rating
    const entries = Object.entries(reviews).filter(
      ([_, val]) => val.rating > 0
    );

    if (entries.length === 0) {
      toast.error("Por favor califica al menos un producto");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        orderId,
        customerName,
        reviews: entries.map(([productId, val]) => ({
          productId,
          rating: val.rating,
          comment: val.comment,
        })),
      };

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al enviar reseñas");
      }

      setSubmitted(true);
      toast.success("¡Gracias por tu opinión!");

      // Opcional: Redirigir a home después de unos segundos
      setTimeout(() => {
        router.push("/");
      }, 5000);
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar reseñas");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <Star className="w-10 h-10 text-green-600 fill-current" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          ¡Gracias por tu feedback!
        </h1>
        <p className="text-lg text-gray-600">
          Tu opinión ayuda a otros clientes a tomar mejores decisiones.
        </p>
        <Button onClick={() => router.push("/")} size="lg">
          Volver a la tienda
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">Tu opinión nos importa</h1>
        <p className="text-gray-600">
          Hola <strong>{customerName}</strong>, ¿qué te parecieron tus
          productos?
        </p>
      </div>

      <div className="space-y-6">
        {products.map((product) => {
          const state = reviews[product.id] || { rating: 0, comment: "" };

          return (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Product Image */}
                  <div className="shrink-0">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-300">
                          <span className="text-xs">Sin imagen</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rating Content */}
                  <div className="flex-1 space-y-4">
                    <h3 className="text-lg font-semibold">{product.name}</h3>

                    {/* Stars */}
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-gray-600">
                        Calificación general
                      </span>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRating(product.id, star)}
                            className="focus:outline-none transition-transform active:scale-95"
                          >
                            <Star
                              size={32}
                              className={`${
                                star <= state.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300 hover:text-yellow-200"
                              } transition-colors`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm font-medium text-gray-500">
                          {state.rating > 0
                            ? state.rating === 5
                              ? "¡Excelente!"
                              : state.rating === 4
                                ? "Muy bueno"
                                : state.rating === 3
                                  ? "Bueno"
                                  : state.rating === 2
                                    ? "Regular"
                                    : "Malo"
                            : "Seleccionar"}
                        </span>
                      </div>
                    </div>

                    {/* Comment Area (Conditional or Always visible) */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">
                        Cuéntanos más (opcional)
                      </label>
                      <textarea
                        value={state.comment}
                        onChange={(e) =>
                          handleComment(product.id, e.target.value)
                        }
                        placeholder="¿Qué es lo que más te gustó?"
                        className="w-full min-h-[80px] p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-10 flex justify-end">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full sm:w-auto min-w-[200px]"
        >
          {loading ? "Enviando..." : "Enviar Opiniones"}
        </Button>
      </div>
    </div>
  );
}
