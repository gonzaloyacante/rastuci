"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProductForm } from "@/components/forms";
import { AdminPageHeader, AdminLoading, AdminError } from "@/components/admin";
import { useProducts, useCategories, Product } from "@/hooks";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { getProductById } = useProducts();
  const { categories } = useCategories();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const productId = params.id as string;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await getProductById(productId);
        setProduct(productData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, getProductById]);

  const handleSubmit = async (data: {
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
    images: string[];
  }) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el producto");
      }

      router.push("/admin/productos");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCancel = () => {
    router.push("/admin/productos");
  };

  if (loading) return <AdminLoading />;
  if (error) return <AdminError message={error} />;
  if (!product) return <AdminError message="Producto no encontrado" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Editar Producto"
        subtitle={`Modifica los datos del producto: ${product.name}`}
        actions={[
          {
            label: "Volver",
            onClick: handleCancel,
            variant: "outline",
          },
        ]}
      />

      <div className="card">
        <ProductForm
          product={product}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
