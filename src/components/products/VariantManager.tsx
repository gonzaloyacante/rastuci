"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Trash2,
  Plus,
  AlertCircle,
  Info,
  Calculator,
  Download,
  Check,
  HelpCircle,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { getColorHex } from "@/utils/colors"; // Assuming this utility exists, otherwise we'll handle it
import { ProductVariant } from "@/types";

interface VariantManagerProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
  availableColors: string[]; // Colors defined in the parent form
  availableSizes: string[]; // Sizes defined in the parent form
}

export default function VariantManager({
  variants,
  onChange,
  availableColors,
  availableSizes,
}: VariantManagerProps) {
  // Batch Add State - now driven by selection of existing lists to avoid typos
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [stockInput, setStockInput] = useState(0);

  const [error, setError] = useState<string | null>(null);

  // Auto-generate variants from available colors/sizes
  const generateCombinations = () => {
    if (availableColors.length === 0 || availableSizes.length === 0) {
      setError(
        "Debes definir colores y talles primero en las secciones anteriores."
      );
      return;
    }

    const newVariants: ProductVariant[] = [...variants];
    let addedCount = 0;

    availableColors.forEach((color) => {
      availableSizes.forEach((size) => {
        // Check if exists
        const exists = newVariants.some(
          (v) => v.color === color && v.size === size
        );

        if (!exists) {
          newVariants.push({
            id: `temp-${Date.now()}-${Math.random()}`, // Temp ID
            productId: "", // Placeholder
            color,
            size,
            stock: 0, // Default stock 0
            sku: `${color.substring(0, 3).toUpperCase()}-${size}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          });
          addedCount++;
        }
      });
    });

    if (addedCount > 0) {
      onChange(newVariants);
      setError(null);
    } else {
      setError("Todas las combinaciones posibles ya existen.");
    }
  };

  const handleAddSingle = () => {
    setError(null);
    if (!selectedColor) {
      setError("Selecciona un color");
      return;
    }
    if (!selectedSize) {
      setError("Selecciona un talle");
      return;
    }

    const exists = variants.some(
      (v) => v.color === selectedColor && v.size === selectedSize
    );

    if (exists) {
      setError(`La variante ${selectedColor} - ${selectedSize} ya existe`);
      return;
    }

    const newVariant: ProductVariant = {
      id: `temp-${Date.now()}`,
      productId: "",
      color: selectedColor,
      size: selectedSize,
      stock: stockInput,
      sku: `${selectedColor.substring(0, 3).toUpperCase()}-${selectedSize}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    };

    onChange([...variants, newVariant]);
    setStockInput(0);
  };

  const handleRemove = (index: number) => {
    const updated = [...variants];
    updated.splice(index, 1);
    onChange(updated);
  };

  const handleUpdateStock = (index: number, val: string) => {
    const num = parseInt(val);
    if (isNaN(num) || num < 0) return;

    const updated = [...variants];
    updated[index] = { ...updated[index], stock: num };
    onChange(updated);
  };

  const handleUpdateSku = (index: number, val: string) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], sku: val };
    onChange(updated);
  };

  // Sync Check: Warnings if variants use colors/sizes not in the main lists
  const syncWarnings = useMemo(() => {
    const warnings: string[] = [];
    const usedColors = new Set(variants.map((v) => v.color));
    const usedSizes = new Set(variants.map((v) => v.size));

    // Check for variants with deleted colors/sizes
    variants.forEach((v) => {
      if (!availableColors.includes(v.color)) {
        warnings.push(
          `La variante "${v.color} - ${v.size}" usa un color que ya no está en la lista principal.`
        );
      }
      if (!availableSizes.includes(v.size)) {
        warnings.push(
          `La variante "${v.color} - ${v.size}" usa un talle que ya no está en la lista principal.`
        );
      }
    });

    return warnings;
  }, [variants, availableColors, availableSizes]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-blue-50/50 p-4 rounded-lg border border-blue-100">
        <div>
          <h4 className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-2">
            <Calculator className="w-4 h-4" /> Generador de Combinaciones
          </h4>
          <p className="text-xs text-blue-700">
            Crea automáticamente todas las combinaciones posibles basadas en los
            colores ({availableColors.length}) y talles ({availableSizes.length}
            ) definidos arriba.
          </p>
        </div>
        <Button
          type="button"
          onClick={generateCombinations}
          variant="secondary"
          size="sm"
          className="whitespace-nowrap"
          disabled={availableColors.length === 0 || availableSizes.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Generar Todas
        </Button>
      </div>

      {/* Manual Add */}
      <div className="p-4 border rounded-lg bg-surface-secondary/20">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Agregar Variante Manual
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium mb-1">Color</label>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">Seleccionar...</option>
              {availableColors.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Talle</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">Seleccionar...</option>
              {availableSizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Stock</label>
            <Input
              type="number"
              min="0"
              value={stockInput}
              onChange={(e) => setStockInput(parseInt(e.target.value) || 0)}
            />
          </div>

          <Button type="button" onClick={handleAddSingle} variant="secondary">
            Agregar
          </Button>
        </div>

        {error && (
          <p className="text-sm text-error mt-3 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {error}
          </p>
        )}
      </div>

      {/* Warnings */}
      {syncWarnings.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">
              Advertencias de Sincronización
            </span>
          </div>
          <ul className="list-disc list-inside text-xs text-orange-700 space-y-1">
            {syncWarnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* List */}
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-100 dark:bg-neutral-800 sticky top-0 z-10">
              <tr className="border-b">
                <th className="p-3 text-left font-medium text-sm text-foreground">
                  Variante (Color / Talle)
                </th>
                <th className="p-3 text-left font-medium text-sm text-foreground w-32">
                  Stock
                </th>
                <th className="p-3 text-left font-medium text-sm text-foreground w-48">
                  <div className="flex items-center gap-1">
                    Código Interno
                    <span className="relative group">
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                        Código único para identificar esta variante en
                        inventario
                      </span>
                    </span>
                  </div>
                </th>
                <th className="p-3 text-right font-medium w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y bg-surface">
              {variants.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No hay variantes definidas. Genera combinaciones o agrega
                    manualmente.
                  </td>
                </tr>
              ) : (
                variants.map((variant, index) => (
                  <tr
                    key={index}
                    className="hover:bg-surface-secondary/50 transition-colors group"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <div
                            className="w-4 h-4 rounded-full border shadow-sm"
                            style={{
                              backgroundColor:
                                getColorHex(variant.color) || "#ccc",
                            }}
                          />
                          <span className="font-medium">{variant.color}</span>
                        </div>
                        <span className="text-muted-foreground">/</span>
                        <span className="font-mono bg-muted/30 px-2 py-0.5 rounded text-xs">
                          {variant.size}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Input
                        type="number"
                        min="0"
                        value={variant.stock}
                        onChange={(e) =>
                          handleUpdateStock(index, e.target.value)
                        }
                        className="h-8 w-24 text-right pr-2"
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        type="text"
                        value={variant.sku || ""}
                        onChange={(e) => handleUpdateSku(index, e.target.value)}
                        className="h-8 w-full text-xs font-mono"
                        placeholder="Código automático"
                      />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        className="text-muted-foreground hover:text-error transition-colors p-1 rounded hover:bg-surface-secondary"
                        title="Eliminar variante"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center bg-green-50 p-4 rounded-md border border-green-100">
        <div className="flex items-center gap-2 text-green-800">
          <Check className="w-5 h-5" />
          <span className="text-sm font-medium">Resumen de Inventario</span>
        </div>
        <div className="text-right">
          <span className="block text-2xl font-bold text-green-900">
            {variants.reduce((acc, v) => acc + v.stock, 0)}
          </span>
          <span className="text-xs text-green-700">
            Unidades totales (Suma de variantes)
          </span>
        </div>
      </div>
    </div>
  );
}
