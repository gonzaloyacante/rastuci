import { useState, useEffect } from "react";
import { Product } from "@/types";

interface UseProductsOptions {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface ProductsResponse {
  success: boolean;
  data: {
    data: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useProducts(options: UseProductsOptions = {}) {
  const {
    category,
    search,
    page = 1,
    limit = 12,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const [data, setData] = useState<ProductsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Construir la URL de la API con query parameters
  const buildApiUrl = () => {
    const params = new URLSearchParams();

    if (category) params.append("categoryId", category);
    if (search) params.append("search", search);
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    params.append("sortBy", sortBy);
    params.append("sortOrder", sortOrder);

    return `/api/products?${params.toString()}`;
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const url = buildApiUrl();
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar productos"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [isMounted, category, search, page, limit, sortBy, sortOrder]);

  return {
    products: data?.data?.data || [],
    total: data?.data?.total || 0,
    page: data?.data?.page || 1,
    limit: data?.data?.limit || 12,
    totalPages: data?.data?.totalPages || 0,
    isLoading: !isMounted || isLoading,
    error,
    mutate: () => {
      // Re-fetch data
      const fetchProducts = async () => {
        setIsLoading(true);
        setError(null);

        try {
          const url = buildApiUrl();
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          setData(result);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Error al cargar productos"
          );
        } finally {
          setIsLoading(false);
        }
      };

      fetchProducts();
    },
  };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setProduct(result.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar el producto"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return { product, isLoading, error };
}

export function useRelatedProducts(productId: string, categoryId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setIsLoading(true);

      try {
        const params = new URLSearchParams();
        if (categoryId) params.append("categoryId", categoryId);
        params.append("limit", "4");

        const response = await fetch(`/api/products?${params.toString()}`);

        if (response.ok) {
          const result = await response.json();
          // Filtrar el producto actual
          const filteredProducts = result.data.data.filter(
            (p: Product) => p.id !== productId
          );
          setProducts(filteredProducts.slice(0, 3));
        }
      } catch (err) {
        console.error("Error fetching related products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId, categoryId]);

  return { products, isLoading };
}
