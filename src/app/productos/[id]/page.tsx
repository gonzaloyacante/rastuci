import { Metadata } from "next";
import { generateProductMetadata } from "@/lib/seo";
import ProductDetailClient from "./client-page";
import type { Product } from "@/types";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// Generate metadata para SEO
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/products/${id}`,
      {
        next: { revalidate: 3600 }, // Cache por 1 hora
      },
    );

    if (!response.ok) {
      return {
        title: "Producto no encontrado",
        description: "El producto que buscas no está disponible.",
      };
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      return {
        title: "Producto no encontrado",
        description: "El producto que buscas no está disponible.",
      };
    }

    const product = data.data as Product;

    return generateProductMetadata({
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        images: Array.isArray(product.images)
          ? product.images
          : typeof product.images === "string"
            ? JSON.parse(product.images)
            : [],
        category: product.category?.name || "General",
        inStock: product.stock > 0,
      },
    });
  } catch (error) {
    console.error("Error generating product metadata:", error);
    return {
      title: "Error - Producto",
      description: "Error al cargar la información del producto.",
    };
  }
}

// Force dynamic rendering para productos
export const dynamic = "force-dynamic";

export default async function ProductPage({ params: _ }: ProductPageProps) {
  // El componente client usa useParams() internamente
  return <ProductDetailClient />;
}
