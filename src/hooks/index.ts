// Hooks consolidados y optimizados
export { useApi, usePaginatedApi } from "./useApi";
export {
  useIntersectionObserver,
  useLazyLoad,
  usePreload,
  useLazyLoadWithDelay,
} from "./useLazyLoad";

// Hooks principales - exports nombrados para mejor tree shaking
export { useProducts, useProduct, useRelatedProducts } from "./useProducts";
export { useCategories, useCategory } from "./useCategories";
export { useOrders } from "./useOrders";
export { useUsers } from "./useUsers";

// Hooks de utilidad
export { default as useDebounce } from "./useDebounce";
export { default as useInfiniteScroll } from "./useInfiniteScroll";
export { default as useLocalStorage } from "./useLocalStorage";

// Hooks específicos de dominio
export { useCart } from "./useCart";
export { useDashboard } from "./useDashboard";
export { useFavorites } from "./useFavorites";
export { useKeyboardNavigation } from "./useKeyboardNavigation";
export { useOCAService } from "./useOCA";
export { useProductSearch } from "./useProductSearch";
export { useReviews } from "./useReviews";
export { useSWR } from "./useSWR";

// Re-export de hooks de terceros para consistencia
export { useSession } from "next-auth/react";
export { useRouter } from "next/navigation";
export { useState, useEffect, useCallback, useMemo, useRef } from "react";

// Tipos
export type { Product } from "@/types";
export type { Category } from "@/types";
export type { Order } from "@/types";
export type { User } from "@/types";
