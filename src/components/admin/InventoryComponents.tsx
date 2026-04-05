// Backward-compatible re-exports. Import directly from inventory/ for new code.
export type {
  InventoryItem,
  InventoryStats,
  StockAdjustmentData,
  StockMovement,
} from "./inventory/inventory.types";
export { stockAdjustmentSchema } from "./inventory/inventory.types";
export { InventoryFilters } from "./inventory/InventoryFilters";
export { getStatusBadge, InventoryTable } from "./inventory/InventoryTable";
export { ItemDetailsModal } from "./inventory/ItemDetailsModal";
export { StockAdjustmentModal } from "./inventory/StockAdjustmentModal";
export { StatCard } from "@/components/admin/StatCard";
