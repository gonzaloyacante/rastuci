"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types";
import ProductCard from "./ProductCard";
// import { Card, CardContent } from "@/components/ui/Card"; // TODO: Implement when needed

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
          `/api/products?limit=4&categoryId=${categoryId || ""}`
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
      } catch {
        console.error("Error fetching related products");
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
        <h2 id="related-products-title" className="text-2xl font-bold text-primary mb-6">
          Productos relacionados
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
          {[...Array(4)].map(() => (
            <div key={`related-skeleton-${Math.random()}`} className="h-48 surface rounded-lg animate-pulse border border-muted" />
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
      <h2 id="related-products-title" className="text-2xl font-bold text-primary mb-6">
        Productos relacionados
      </h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={index < 2} />
        ))}
      </div>
    </section>
  );
}
