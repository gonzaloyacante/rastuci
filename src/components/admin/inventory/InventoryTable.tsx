"use client";

import type { ReactNode } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { formatCurrency } from "@/utils/formatters";

import type { InventoryItem } from "./inventory.types";

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
                      {item.color && item.size ? (
                        <p className="text-xs muted">
                          {item.color} · Talle {item.size}
                        </p>
                      ) : (
                        <p className="text-sm muted">{item.supplier}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4 font-mono text-sm">{item.sku}</td>
                <td className="p-4">{item.category}</td>
                <td className="p-4 text-center">
                  <span
                    className={`font-bold ${item.currentStock <= item.minStock ? "text-error" : ""}`}
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
                  {formatCurrency(item.currentStock * item.unitCost)}
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
