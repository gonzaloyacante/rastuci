// Hooks para el manejo de datos de la API
export { useCart } from "./useCart";
export { useCategories } from "./useCategories";
export { useProducts } from "./useProducts";
export { useOrders } from "./useOrders";
export { useUsers } from "./useUsers";
export { useDashboard } from "./useDashboard";
export { useFavorites } from "./useFavorites";

// Tipos comunes
export type { Order } from "./useOrders";
export type { Product } from "./useProducts";
export type { Category } from "./useCategories";
export type { User } from "./useUsers";
export type {
  DashboardStats,
  RecentOrder,
  LowStockProduct,
  ProductCategoryData,
  MonthlySales,
} from "./useDashboard";
