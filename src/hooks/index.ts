// Hooks consolidados y optimizados
export { useApi, usePaginatedApi } from "./useApi";
export {
  useIntersectionObserver,
  useLazyLoad,
  useLazyLoadWithDelay,
  usePreload,
} from "./useLazyLoad";

// Hooks principales - exports nombrados para mejor tree shaking
export { useCategories, useCategory } from "./useCategories";
export { useOrders } from "./useOrders";
export { useProduct, useProducts, useRelatedProducts } from "./useProducts";
export { useUsers } from "./useUsers";

// Hooks específicos de dominio
export { useCart } from "./useCart";
export { useDashboard } from "./useDashboard";
export { useDocumentTitle } from "./useDocumentTitle";
export { useHomeData } from "./useHomeData";

export { useSession } from "next-auth/react";
export { useRouter } from "next/navigation";
export { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Tipos
export type { Category, Order, Product, User } from "@/types";
