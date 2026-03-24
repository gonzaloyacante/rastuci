import { SORT_OPTIONS as SORT_OPTIONS_BASE } from "@/lib/constants";
import { Product } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProductsPageClientProps {
  searchParams: {
    categoria?: string;
    buscar?: string;
    pagina?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  };
}

export interface FilterChip {
  id: string;
  label: string;
  onRemove: () => void;
}

export interface ProductsApiResponse {
  data?: {
    data?: Product[];
    total?: number;
    totalPages?: number;
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const SORT_OPTIONS = SORT_OPTIONS_BASE.map((opt) => ({
  value: opt.id,
  label: opt.label,
}));

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

export const fetcher = (url: string): Promise<ProductsApiResponse> =>
  fetch(url).then((res) => res.json());

// ---------------------------------------------------------------------------
// URL builder
// ---------------------------------------------------------------------------

export function buildProductsApiUrl(params: {
  page: number;
  sortBy: string;
  sortOrder: string;
  search: string;
  categoryId: string;
}): string {
  const qs = new URLSearchParams();
  qs.set("page", params.page.toString());
  qs.set("limit", "12");
  qs.set("sortBy", params.sortBy);
  qs.set("sortOrder", params.sortOrder);
  if (params.search) qs.set("search", params.search);
  if (params.categoryId) qs.set("categoryId", params.categoryId);
  return `/api/products?${qs.toString()}`;
}

export function buildProductsPageUrl(params: {
  search: string;
  category: string;
  sortBy: string;
  sortOrder: string;
  page: number;
}): string {
  const qs = new URLSearchParams();
  if (params.search) qs.set("buscar", params.search);
  if (params.category) qs.set("categoria", params.category);
  if (params.sortBy !== "createdAt") qs.set("sortBy", params.sortBy);
  if (params.sortOrder !== "desc") qs.set("sortOrder", params.sortOrder);
  if (params.page > 1) qs.set("pagina", params.page.toString());
  return qs.toString() ? `/productos?${qs.toString()}` : "/productos";
}
