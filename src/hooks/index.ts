// Hooks principales - exports nombrados para mejor tree shaking
export { useProducts, useProduct, useRelatedProducts } from "./useProducts";
export { useCategories, useCategory } from "./useCategories";
export { useOrders } from "./useOrders";
export { useUsers } from "./useUsers";
export { useDashboard } from "./useDashboard";
export { useCart } from "./useCart";
export { useFavorites } from "./useFavorites";

// Hooks de utilidad
export { default as useLocalStorage } from "./useLocalStorage";
export { default as useDebounce } from "./useDebounce";
export { default as useIntersectionObserver } from "./useIntersectionObserver";

// Re-export de hooks de terceros para consistencia
export { useSession } from "next-auth/react";
export { useRouter } from "next/navigation";
export { useState, useEffect, useCallback, useMemo, useRef } from "react";

// Tipos
export type { Product } from "@/types";
export type { Category } from "@/types";
export type { Order } from "@/types";
export type { User } from "@/types";
