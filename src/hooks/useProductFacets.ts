import useSWR from "swr";

import { fetcher } from "@/utils/fetcher";
import { sortSizes } from "@/utils/sizes";

interface ProductFacets {
  sizes: string[];
  colors: string[];
}

interface UseProductFacetsReturn {
  sizes: string[];
  colors: string[];
  isLoading: boolean;
}

export function useProductFacets(): UseProductFacetsReturn {
  const { data, isLoading } = useSWR<ProductFacets>(
    "/api/products/facets",
    fetcher,
    { dedupingInterval: 300_000, revalidateOnFocus: false }
  );

  return {
    sizes: data?.sizes ? sortSizes(data.sizes) : [],
    colors: data?.colors ?? [],
    isLoading,
  };
}
