"use client";

import { EnhancedForm, FormField } from "@/components/forms/EnhancedForm";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import type { ReactNode } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { z } from "zod";

// ===== Types =====

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

// ===== Schema =====

export const stockAdjustmentSchema = z.object({
  quantity: z.number().int(),
  reason: z.string().min(5, "La razón debe tener al menos 5 caracteres"),
  reference: z.string().optional(),
});

export type StockAdjustmentData = z.infer<typeof stockAdjustmentSchema>;

// ===== Components =====

interface StatCardProps {
  icon: ReactNode;
  iconColor: string;
  label: string;
  value: string | number;
}

export function StatCard({ icon, iconColor, label, value }: StatCardProps) {
  return (
    <div className="surface border border-muted rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className={iconColor}>{icon}</div>
        <div>
          <p className="text-sm muted">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

interface InventoryFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  searchIcon: ReactNode;
  exportIcon: ReactNode;
  importIcon: ReactNode;
}

export function InventoryFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  categories,
  searchIcon,
  exportIcon,
  importIcon,
}: InventoryFiltersProps) {
  return (
    <div className="surface border border-muted rounded-lg p-4">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 muted">
              {searchIcon}
            </span>
            <Input
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 border border-muted rounded surface"
        >
          <option value="all">Todos los estados</option>
          <option value="in_stock">En Stock</option>
          <option value="low_stock">Stock Bajo</option>
          <option value="out_of_stock">Agotado</option>
          <option value="discontinued">Descontinuado</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-2 border border-muted rounded surface"
        >
          <option value="all">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <Button variant="outline" className="flex items-center gap-2">
          {exportIcon}
          Exportar
        </Button>

        <Button variant="outline" className="flex items-center gap-2">
          {importIcon}
          Importar
        </Button>
      </div>
    </div>
  );
}

export function getStatusBadge(status: string) {
  switch (status) {
    case "in_stock":
      return <Badge variant="success">En Stock</Badge>;
    case "low_stock":
      return <Badge variant="warning">Stock Bajo</Badge>;
    case "out_of_stock":
      return <Badge variant="error">Agotado</Badge>;
    case "discontinued":
      return <Badge variant="secondary">Descontinuado</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

interface InventoryTableProps {
  items: InventoryItem[];
  onViewItem: (item: InventoryItem) => void;
  onEditItem: (item: InventoryItem) => void;
  viewIcon: ReactNode;
  editIcon: ReactNode;
}

export function InventoryTable({
  items,
  onViewItem,
  onEditItem,
  viewIcon,
  editIcon,
}: InventoryTableProps) {
  return (
    <div className="surface border border-muted rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="surface border-b border-muted">
            <tr>
              <th className="text-left p-4">Producto</th>
              <th className="text-left p-4">SKU</th>
              <th className="text-left p-4">Categoría</th>
              <th className="text-center p-4">Stock Actual</th>
              <th className="text-center p-4">Stock Mín.</th>
              <th className="text-center p-4">Disponible</th>
              <th className="text-center p-4">Estado</th>
              <th className="text-center p-4">Valor</th>
              <th className="text-center p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-muted hover-surface">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <OptimizedImage
                      src={item.productImage}
                      alt={item.productName}
                      width={40}
                      height={40}
                      className="rounded"
                    />
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm muted">{item.supplier}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-mono text-sm">{item.sku}</td>
                <td className="p-4">{item.category}</td>
                <td className="p-4 text-center">
                  <span
                    className={`font-bold ${
                      item.currentStock <= item.minStock ? "text-error" : ""
                    }`}
                  >
                    {item.currentStock}
                  </span>
                </td>
                <td className="p-4 text-center">{item.minStock}</td>
                <td className="p-4 text-center">{item.availableStock}</td>
                <td className="p-4 text-center">
                  {getStatusBadge(item.status)}
                </td>
                <td className="p-4 text-center">
                  ${(item.currentStock * item.unitCost).toFixed(2)}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewItem(item)}
                    >
                      {viewIcon}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditItem(item)}
                    >
                      {editIcon}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface StockAdjustmentModalProps {
  item: InventoryItem;
  onSubmit: (data: StockAdjustmentData) => Promise<void>;
  onClose: () => void;
}

export function StockAdjustmentModal({
  item,
  onSubmit,
  onClose,
}: StockAdjustmentModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="surface rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold mb-4">
          Ajustar Stock - {item.productName}
        </h3>

        <div className="mb-4 p-3 surface border border-muted rounded">
          <p className="text-sm muted">
            Stock actual: <span className="font-bold">{item.currentStock}</span>
          </p>
          <p className="text-sm muted">
            Stock disponible:{" "}
            <span className="font-bold">{item.availableStock}</span>
          </p>
        </div>

        <EnhancedForm
          schema={stockAdjustmentSchema}
          onSubmit={onSubmit}
          submitText="Aplicar Ajuste"
        >
          {({
            register,
            errors,
          }: {
            register: UseFormRegister<StockAdjustmentData>;
            errors: FieldErrors<StockAdjustmentData>;
          }) => (
            <>
              <FormField
                name="quantity"
                label="Cantidad (+ para aumentar, - para disminuir)"
                type="number"
                placeholder="0"
                required
                register={register}
                errors={errors}
              />

              <FormField
                name="reason"
                label="Razón del ajuste"
                placeholder="Ej: Inventario físico, producto dañado, etc."
                required
                register={register}
                errors={errors}
              />

              <FormField
                name="reference"
                label="Referencia (opcional)"
                placeholder="Número de documento, orden, etc."
                register={register}
                errors={errors}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </>
          )}
        </EnhancedForm>
      </div>
    </div>
  );
}

interface ItemDetailsModalProps {
  item: InventoryItem;
  onClose: () => void;
  onAdjustStock: () => void;
}

export function ItemDetailsModal({
  item,
  onClose,
  onAdjustStock,
}: ItemDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Detalles del Inventario</h3>
          <Button variant="ghost" onClick={onClose}>
            ×
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <OptimizedImage
              src={item.productImage}
              alt={item.productName}
              width={200}
              height={200}
              className="rounded-lg"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium">{item.productName}</h4>
              <p className="text-sm muted">SKU: {item.sku}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="muted">Stock Actual</p>
                <p className="font-bold text-lg">{item.currentStock}</p>
              </div>
              <div>
                <p className="muted">Stock Mínimo</p>
                <p className="font-bold">{item.minStock}</p>
              </div>
              <div>
                <p className="muted">Stock Reservado</p>
                <p className="font-bold">{item.reservedStock}</p>
              </div>
              <div>
                <p className="muted">Disponible</p>
                <p className="font-bold">{item.availableStock}</p>
              </div>
              <div>
                <p className="muted">Costo Unitario</p>
                <p className="font-bold">${item.unitCost}</p>
              </div>
              <div>
                <p className="muted">Precio Unitario</p>
                <p className="font-bold">${item.unitPrice}</p>
              </div>
            </div>

            <div>
              <p className="muted">Proveedor</p>
              <p className="font-medium">{item.supplier}</p>
            </div>

            <div>
              <p className="muted">Ubicación</p>
              <p className="font-medium">{item.location}</p>
            </div>

            <div>
              <p className="muted">Último Restock</p>
              <p className="font-medium">
                {item.lastRestocked.toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={onAdjustStock} className="w-full">
            Ajustar Stock
          </Button>
        </div>
      </div>
    </div>
  );
}
