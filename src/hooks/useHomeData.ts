import useSWR from "swr";

import { useCategories } from "@/hooks/useCategories";
import { defaultHomeSettings, type HomeSettings } from "@/lib/validation/home";
import { Product } from "@/types";

const selectFeaturedProducts = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data.success && data.data?.data ? data.data.data : []) as Product[];
};

const selectHomeSettings = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (
    data.success && data.data ? data.data : defaultHomeSettings
  ) as HomeSettings;
};

export function useHomeData() {
  const { categories, isLoading: categoriesLoading } = useCategories();

  const { data: products, isLoading: productsLoading } = useSWR(
    "/api/products?onSale=true&limit=4",
    selectFeaturedProducts,
    { dedupingInterval: 5 * 60 * 1000, revalidateOnFocus: false }
  );

  const { data: home, isLoading: homeLoading } = useSWR(
    "/api/home",
    selectHomeSettings,
    { dedupingInterval: 10 * 60 * 1000, revalidateOnFocus: false }
  );

  return {
    categories: categories || [],
    products: products || [],
    home: home || defaultHomeSettings,
    loading: categoriesLoading || productsLoading || homeLoading,
  };
}
