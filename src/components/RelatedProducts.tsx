"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types";
import ProductCard from "./ProductCard";
import { Card, CardContent } from "@/components/ui/Card";

interface RelatedProductsProps {
  categoryId?: string;
  currentProductId: string;
}

export default function RelatedProducts({
  categoryId,
  currentProductId,
}: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);

        // Simular fetch de productos relacionados
        // En producción, esto vendría de tu API con filtros por categoría
        const response = await fetch(
          `/api/products?limit=4&category=${categoryId || ""}`
        );
        const data = await response.json();

        if (data.success && data.data?.data) {
          // Filtrar el producto actual
          const filteredProducts = data.data.data.filter(
            (product: Product) => product.id !== currentProductId
          );
          setProducts(filteredProducts.slice(0, 4));
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [categoryId, currentProductId]);

  if (loading) {
    return (
      <section className="mb-12" aria-labelledby="related-products-title">
        <h2
          id="related-products-title"
          className="text-2xl font-bold text-gray-900 mb-6">
          Productos relacionados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // No mostrar sección si no hay productos relacionados
  }

  return (
    <section className="mb-12" aria-labelledby="related-products-title">
      <h2
        id="related-products-title"
        className="text-2xl font-bold text-gray-900 mb-6">
        Productos relacionados
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < 2} // Prioridad para las primeras 2 imágenes
          />
        ))}
      </div>
    </section>
  );
}
