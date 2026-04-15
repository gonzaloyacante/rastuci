"use client";

import { Button } from "@/components/ui/Button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

import type { InventoryItem } from "./inventory.types";

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
