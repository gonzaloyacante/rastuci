"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { EnhancedForm, FormField } from "@/components/forms/EnhancedForm";
import { Button } from "@/components/ui/Button";

import type { InventoryItem, StockAdjustmentData } from "./inventory.types";
import { stockAdjustmentSchema } from "./inventory.types";

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
          Ajustar Stock — {item.productName}
          {item.color && item.size && (
            <span className="block text-sm font-normal muted">
              {item.color} · Talle {item.size}
            </span>
          )}
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
