// Hooks principales - exports nombrados para mejor tree shaking
export { useCategories, useCategory } from "./useCategories";
export { useInfiniteProducts } from "./useInfiniteProducts";
export { useInfiniteScroll } from "./useInfiniteScroll";
export { useFocusTrap, useKeyboardNavigation } from "./useKeyboardNavigation";
export {
  useIntersectionObserver,
  useLazyLoad,
  useLazyLoadWithDelay,
  usePreload,
} from "./useLazyLoad";
export { useOrderDetail } from "./useOrderDetail";
export { useOrderExport } from "./useOrderExport";
export { useOrders } from "./useOrders";
export { usePendingOrders } from "./usePendingOrders";
export { useProduct } from "./useProducts";
export { useProductStats } from "./useProductStats";
export { useUsers } from "./useUsers";

// Hooks específicos de dominio
export { useDashboard } from "./useDashboard";
export { useDocumentTitle } from "./useDocumentTitle";
export { useShippingSettings } from "./useShippingSettings";
export { useRouter } from "next/navigation";
export { useSession } from "next-auth/react";
export { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Tipos
export type { Category, Order, Product, User } from "@/types";
