import { z } from "zod";

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reservedStock: number;
  availableStock: number;
  unitCost: number;
  unitPrice: number;
  supplier: string;
  location: string;
  lastRestocked: Date;
  status: "in_stock" | "low_stock" | "out_of_stock" | "discontinued";
  movements: StockMovement[];
  variantId?: string;
  color?: string;
  size?: string;
}

export interface StockMovement {
  id: string;
  type: "in" | "out" | "adjustment" | "transfer";
  quantity: number;
  reason: string;
  reference?: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  topMovingProducts: InventoryItem[];
  slowMovingProducts: InventoryItem[];
}

export const stockAdjustmentSchema = z.object({
  quantity: z.number().int(),
  reason: z.string().min(5, "La razón debe tener al menos 5 caracteres"),
  reference: z.string().optional(),
});

export type StockAdjustmentData = z.infer<typeof stockAdjustmentSchema>;
