import { useState, useEffect } from "react";
import { useNotifications } from "@/context/NotificationContext";

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  images: string[];
  stock: number;
  category: {
    id: string;
    name: string;
  };
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

interface UseProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  fetchProducts: (params?: UseProductsParams) => Promise<void>;
  refreshProducts: () => Promise<void>;
  createProduct: (
    productData: Omit<Product, "id" | "createdAt" | "updatedAt" | "category">
  ) => Promise<Product | null>;
  updateProduct: (
    productId: string,
    productData: Partial<
      Omit<Product, "id" | "createdAt" | "updatedAt" | "category">
    >
  ) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<boolean>;
  getProductById: (productId: string) => Promise<Product | null>;
}

export const useProducts = (
  initialParams?: UseProductsParams
): UseProductsReturn => {
  const { success, error: notifyError } = useNotifications();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(initialParams?.page || 1);
  const [lastParams, setLastParams] = useState<UseProductsParams>(
    initialParams || {}
  );

  const fetchProducts = async (params?: UseProductsParams) => {
    try {
      setLoading(true);
      setError(null);

      const finalParams = { ...lastParams, ...params };
      setLastParams(finalParams);

      const urlParams = new URLSearchParams();

      if (finalParams.page)
        urlParams.append("page", finalParams.page.toString());
      if (finalParams.limit)
        urlParams.append("limit", finalParams.limit.toString());
      if (finalParams.category)
        urlParams.append("category", finalParams.category);
      if (finalParams.search) urlParams.append("search", finalParams.search);

      const response = await fetch(`/api/products?${urlParams}`);

      if (!response.ok) {
        throw new Error("Error al cargar los productos");
      }

      const data = await response.json();

      if (data.success) {
        setProducts(data.data.data);
        setTotalPages(data.data.totalPages);
        setCurrentPage(data.data.page);
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      notifyError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = async () => {
    await fetchProducts(lastParams);
  };

  const createProduct = async (
    productData: Omit<Product, "id" | "createdAt" | "updatedAt" | "category">
  ): Promise<Product | null> => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error("Error al crear el producto");
      }

      const data = await response.json();

      if (data.success) {
        const newProduct = data.data;
        setProducts((prevProducts) => [newProduct, ...prevProducts]);
        success("Producto creado correctamente");
        return newProduct;
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      notifyError(errorMessage);
      return null;
    }
  };

  const updateProduct = async (
    productId: string,
    productData: Partial<
      Omit<Product, "id" | "createdAt" | "updatedAt" | "category">
    >
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el producto");
      }

      const data = await response.json();

      if (data.success) {
        // Actualizar el producto en la lista local
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === productId
              ? {
                  ...product,
                  ...productData,
                  updatedAt: new Date().toISOString(),
                }
              : product
          )
        );
        success("Producto actualizado correctamente");
        return true;
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      notifyError(errorMessage);
      return false;
    }
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el producto");
      }

      const data = await response.json();

      if (data.success) {
        // Remover el producto de la lista local
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product.id !== productId)
        );
        success("Producto eliminado correctamente");
        return true;
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      notifyError(errorMessage);
      return false;
    }
  };

  const getProductById = async (productId: string): Promise<Product | null> => {
    try {
      const response = await fetch(`/api/products/${productId}`);

      if (!response.ok) {
        throw new Error("Error al cargar el producto");
      }

      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      notifyError(errorMessage);
      return null;
    }
  };

  // Cargar productos iniciales
  useEffect(() => {
    if (initialParams) {
      fetchProducts(initialParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    products,
    loading,
    error,
    totalPages,
    currentPage,
    fetchProducts,
    refreshProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
  };
};
