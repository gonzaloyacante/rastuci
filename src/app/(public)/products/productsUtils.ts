import { SORT_OPTIONS as SORT_OPTIONS_BASE } from "@/lib/constants";

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
    minPrecio?: string;
    maxPrecio?: string;
    talles?: string | string[];
    colores?: string | string[];
    minRating?: string;
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const SORT_OPTIONS = SORT_OPTIONS_BASE.map((opt) => ({
  value: opt.id,
  label: opt.label,
}));
