import { Product } from "@/types";
import { useCategories } from "@/hooks/useCategories";
import useGlobalCache from "@/hooks/useGlobalCache";
import { type HomeSettings, defaultHomeSettings } from "@/lib/validation/home";

export function useHomeData() {
  // Usar hooks optimizados con cache
  const { categories, isLoading: categoriesLoading } = useCategories();
  
  // Cache para productos en oferta
  const {
    data: products,
    isLoading: productsLoading
  } = useGlobalCache<Product[]>(
    'featured-products',
    async () => {
      const response = await fetch("/api/products?onSale=true&limit=4");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.success && data.data?.data ? data.data.data : [];
    },
    {
      ttl: 5 * 60 * 1000, // 5 minutos para productos
      revalidateOnMount: false
    }
  );

  // Cache para configuración del home
  const {
    data: home,
    isLoading: homeLoading
  } = useGlobalCache<HomeSettings>(
    'home-settings',
    async () => {
      const response = await fetch("/api/home");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.success && data.data ? data.data as HomeSettings : defaultHomeSettings;
    },
    {
      ttl: 10 * 60 * 1000, // 10 minutos para settings
      revalidateOnMount: false
    }
  );

  const loading = categoriesLoading || productsLoading || homeLoading;

  return {
    categories: categories || [],
    products: products || [],
    home: home || defaultHomeSettings,
    loading
  };
}