"use client";

import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import {
  Trash2,
  Plus,
  AlertCircle,
  Calculator,
  Download,
  Check,
} from "lucide-react";
import { useState, useMemo } from "react";
import { getColorHex } from "@/utils/colors";
import { ProductVariant } from "@/types";
import { sortVariantsBySize } from "@/utils/sizes";
import { HelpTooltip } from "./ProductFormComponents";

interface VariantManagerProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
  availableColors: string[];
  availableSizes: string[];
}

export default function VariantManager({
  variants,
  onChange,
  availableColors,
  availableSizes,
}: VariantManagerProps) {
  const { show } = useToast();
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [stockInput, setStockInput] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);

  const generateCombinations = () => {
    if (availableColors.length === 0 || availableSizes.length === 0) {
      setError(
        "Debes definir colores y talles primero en las secciones anteriores."
      );
      show({
        type: "error",
        message: "Debes definir colores y talles primero",
      });
      return;
    }

    const newVariants: ProductVariant[] = [...variants];
    let addedCount = 0;

    availableColors.forEach((color) => {
      availableSizes.forEach((size) => {
        const exists = newVariants.some(
          (v) => v.color === color && v.size === size
        );

        if (!exists) {
          newVariants.push({
            id: `temp-${Date.now()}-${Math.random()}`,
            productId: "",
            color,
            size,
            stock: 0,
            sku: `${color.substring(0, 3).toUpperCase()}-${size}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          });
          addedCount++;
        }
      });
    });

    if (addedCount > 0) {
      onChange(sortVariantsBySize(newVariants));
      setError(null);
      show({
        type: "success",
        message: `${addedCount} combinaciones generadas`,
      });
    } else {
      setError("Todas las combinaciones posibles ya existen.");
      show({
        type: "error",
        message: "Todas las combinaciones posibles ya existen",
      });
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
      show({ type: "error", message: "Esta variante ya existe" });
      return;
    }

    const newVariant: ProductVariant = {
      id: `temp-${Date.now()}`,
      productId: "",
      color: selectedColor,
      size: selectedSize,
      stock: stockInput === "" ? 0 : stockInput,
      sku: `${selectedColor.substring(0, 3).toUpperCase()}-${selectedSize}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    };

    onChange(sortVariantsBySize([...variants, newVariant]));
    setStockInput("");
    show({ type: "success", message: "Variante agregada" });
  };

  const handleRemove = (index: number) => {
    const updated = [...variants];
    updated.splice(index, 1);
    onChange(updated);
    show({ type: "success", message: "Variante eliminada" });
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

  const syncWarnings = useMemo(() => {
    const warnings: string[] = [];

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
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-primary/5 p-4 rounded-lg border border-primary/20">
        <div>
          <h4 className="text-sm font-semibold text-primary mb-1 flex items-center gap-2">
            <Calculator className="w-4 h-4" /> Generador de Combinaciones
          </h4>
          <p className="text-xs text-muted-foreground">
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

      <div className="p-4 border rounded-lg bg-surface-secondary/20">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Agregar Variante Manual
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium mb-1">Color</label>
            <Select
              value={selectedColor}
              onChange={setSelectedColor}
              placeholder="Seleccionar..."
              options={availableColors.map((c) => ({ value: c, label: c }))}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Talle</label>
            <Select
              value={selectedSize}
              onChange={setSelectedSize}
              placeholder="Seleccionar..."
              options={availableSizes.map((s) => ({ value: s, label: s }))}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Stock</label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={stockInput}
              onChange={(e) =>
                setStockInput(
                  e.target.value === "" ? "" : parseInt(e.target.value)
                )
              }
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

      {syncWarnings.length > 0 && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-warning">
              Advertencias de Sincronización
            </span>
          </div>
          <ul className="list-disc list-inside text-xs text-warning/80 space-y-1">
            {syncWarnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden shadow-sm bg-surface">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm table-fixed">
            <thead className="bg-muted sticky top-0 z-10">
              <tr className="border-b">
                <th className="p-3 text-left font-medium text-sm text-foreground w-[40%]">
                  Variante
                </th>
                <th className="p-3 text-left font-medium text-sm text-foreground w-[20%]">
                  Stock
                </th>
                <th className="p-3 text-left font-medium text-sm text-foreground w-[30%]">
                  <div className="flex items-center gap-1">
                    Código Interno
                    <HelpTooltip text="Código único para identificar esta variante en inventario" />
                  </div>
                </th>
                <th className="p-3 text-right font-medium w-[10%]"></th>
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
                    <td className="p-3 align-middle">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full border shadow-sm shrink-0"
                          style={{
                            backgroundColor:
                              getColorHex(variant.color) || "#ccc",
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground leading-tight">
                            {variant.color}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Talle: {variant.size}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 align-middle">
                      <Input
                        type="number"
                        min="0"
                        value={variant.stock}
                        onChange={(e) =>
                          handleUpdateStock(index, e.target.value)
                        }
                        className="h-8 w-full text-right"
                      />
                    </td>
                    <td className="p-3 align-middle">
                      <Input
                        type="text"
                        value={variant.sku || ""}
                        onChange={(e) => handleUpdateSku(index, e.target.value)}
                        className="h-8 w-full text-xs font-mono"
                        placeholder="Automático"
                      />
                    </td>
                    <td className="p-3 text-right align-middle">
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-destructive/10"
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

      <div className="flex justify-between items-center bg-success/10 p-4 rounded-md border border-success/20">
        <div className="flex items-center gap-2 text-success">
          <Check className="w-5 h-5" />
          <span className="text-sm font-medium">Resumen de Inventario</span>
        </div>
        <div className="text-right">
          <span className="block text-2xl font-bold text-success">
            {variants.reduce((acc, v) => acc + (v.stock || 0), 0)}
          </span>
          <span className="text-xs text-success/80">
            Unidades totales (Suma de variantes)
          </span>
        </div>
      </div>
    </div>
  );
}
