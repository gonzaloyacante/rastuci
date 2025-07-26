import { Product } from "@/types";

interface ProductScore {
  product: Product;
  score: number;
}

/**
 * Algoritmo híbrido para encontrar productos relacionados
 * Combina múltiples factores para dar una puntuación a cada producto
 */
export function getRelatedProducts(
  currentProduct: Product,
  allProducts: Product[],
  limit: number = 4
): Product[] {
  if (!currentProduct || allProducts.length === 0) {
    return [];
  }

  const scores: ProductScore[] = allProducts.map((product) => {
    // Excluir el producto actual
    if (product.id === currentProduct.id) {
      return { product, score: 0 };
    }

    let score = 0;

    // 1. Misma categoría (+4 puntos) - Factor más importante
    if (product.categoryId === currentProduct.categoryId) {
      score += 4;
    }

    // 2. Precio similar (+3 puntos) - Productos en el mismo rango de precio
    const priceDiff =
      Math.abs(product.price - currentProduct.price) / currentProduct.price;
    if (priceDiff <= 0.3) {
      // ±30% del precio
      score += 3;
    } else if (priceDiff <= 0.5) {
      // ±50% del precio
      score += 1;
    }

    // 3. Stock disponible (+2 puntos) - Preferir productos con stock
    if (product.stock > 0) {
      score += 2;
    }

    // 4. Productos en oferta (+1 punto) - Dar prioridad a ofertas
    if (product.onSale) {
      score += 1;
    }

    // 5. Productos más recientes (+1 punto) - Dar prioridad a productos nuevos
    const daysSinceCreation =
      (Date.now() - new Date(product.createdAt).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysSinceCreation <= 30) {
      // Productos creados en los últimos 30 días
      score += 1;
    }

    // 6. Similitud en el nombre (+1 punto) - Productos con nombres similares
    const currentWords = currentProduct.name.toLowerCase().split(" ");
    const productWords = product.name.toLowerCase().split(" ");
    const commonWords = currentWords.filter((word) =>
      productWords.includes(word)
    );
    if (commonWords.length > 0) {
      score += 1;
    }

    return { product, score };
  });

  // Filtrar productos con puntuación > 0, ordenar por puntuación y tomar los primeros
  return scores
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.product);
}

/**
 * Función para obtener productos relacionados desde la API
 */
export async function fetchRelatedProducts(
  currentProductId: string,
  limit: number = 4
): Promise<Product[]> {
  try {
    // Primero obtener el producto actual para tener sus datos
    const currentProductResponse = await fetch(
      `/api/products/${currentProductId}`
    );
    const currentProductData = await currentProductResponse.json();

    if (!currentProductData.success) {
      console.error(
        "Error fetching current product:",
        currentProductData.error
      );
      return [];
    }

    const currentProduct = currentProductData.data;

    // Obtener todos los productos para hacer el análisis
    const allProductsResponse = await fetch("/api/products?page=1&limit=100");
    const allProductsData = await allProductsResponse.json();

    if (!allProductsData.success) {
      console.error("Error fetching all products:", allProductsData.error);
      return [];
    }

    const allProducts = allProductsData.data.data || [];

    // Aplicar el algoritmo híbrido
    return getRelatedProducts(currentProduct, allProducts, limit);
  } catch (error) {
    console.error("Error in fetchRelatedProducts:", error);
    return [];
  }
}
