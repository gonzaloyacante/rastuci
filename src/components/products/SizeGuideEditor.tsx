"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
// import { cn } from "@/lib/utils";
import { Plus, Ruler } from "lucide-react";
import { useMemo } from "react";

export interface SizeGuideData {
  columns: string[];
  rows: string[][];
}

interface SizeGuideEditorProps {
  sizes: string[];
  value?: SizeGuideData | null;
  onChange: (data: SizeGuideData | null) => void;
}

export default function SizeGuideEditor({
  sizes,
  value,
  onChange,
}: SizeGuideEditorProps) {
  // Derive columns from value, or default
  const columns = useMemo(() => {
    if (value?.columns && value.columns.length > 0) {
      return value.columns.slice(1);
    }
    return ["Ancho (cm)", "Largo (cm)"];
  }, [value?.columns]);

  // Derive row values map from value
  const rowValues = useMemo(() => {
    const map: Record<string, string[]> = {};
    if (value?.rows) {
      value.rows.forEach((row) => {
        const sizeName = row[0];
        const measures = row.slice(1);
        map[sizeName] = measures;
      });
    }
    return map;
  }, [value?.rows]);

  // Helper to trigger change with generated structure
  const triggerChange = (
    newCols: string[],
    newRowValues: Record<string, string[]>
  ) => {
    const fullColumns = ["Talle", ...newCols];

    // Generate rows ensuring consistency with current sizes and columns
    const generatedRows = sizes.map((size) => {
      const existingMeasures = newRowValues[size] || [];
      const safeMeasures = [...existingMeasures];

      // Pad or slice to match columns length
      while (safeMeasures.length < newCols.length) {
        safeMeasures.push("");
      }
      return [size, ...safeMeasures.slice(0, newCols.length)];
    });

    onChange({
      columns: fullColumns,
      rows: generatedRows,
    });
  };

  const addColumn = () => {
    triggerChange([...columns, "Nueva Medida"], rowValues);
  };

  const removeColumn = (index: number) => {
    const newCols = [...columns];
    newCols.splice(index, 1);

    // Also remove data for that column from all rows
    const newRowValues: Record<string, string[]> = {};
    Object.keys(rowValues).forEach((size) => {
      const measures = [...rowValues[size]];
      measures.splice(index, 1);
      newRowValues[size] = measures;
    });

    triggerChange(newCols, newRowValues);
  };

  const updateColumnName = (index: number, name: string) => {
    const newCols = [...columns];
    newCols[index] = name;
    triggerChange(newCols, rowValues);
  };

  const updateMeasurement = (size: string, colIndex: number, val: string) => {
    const existing = rowValues[size] || new Array(columns.length).fill("");
    const newMeasures = [...existing];
    // Expand if needed (though render ensures display, logic needs safety)
    while (newMeasures.length <= colIndex) newMeasures.push("");

    newMeasures[colIndex] = val;

    const newRowValues = {
      ...rowValues,
      [size]: newMeasures,
    };

    triggerChange(columns, newRowValues);
  };

  if (sizes.length === 0) {
    return (
      <div className="p-6 text-center border-2 border-dashed rounded-lg bg-surface-secondary/30 text-muted-foreground">
        <Ruler className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Selecciona talles arriba para habilitar la tabla de medidas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 overflow-x-auto">
      <div className="min-w-[600px] border rounded-lg overflow-hidden bg-surface">
        {/* Header Row */}
        <div className="flex items-center bg-muted/30 border-b">
          <div className="w-32 shrink-0 p-3 font-semibold text-sm text-primary">
            Talle
          </div>
          {columns.map((col, idx) => (
            <div
              key={`col-${idx}`}
              className="flex-1 min-w-[120px] p-2 border-l border-muted/50 relative group"
            >
              <Input
                value={col}
                onChange={(e) => updateColumnName(idx, e.target.value)}
                className="h-8 text-xs font-medium bg-transparent border-transparent hover:border-muted focus:bg-surface"
              />
              <button
                type="button"
                onClick={() => removeColumn(idx)}
                className="absolute top-1 right-1 p-1 text-muted-foreground hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                title="Eliminar columna"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </div>
          ))}
          <div className="w-20 shrink-0 p-2 border-l border-muted/50 flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addColumn}
              className="h-8 w-8 p-0 text-primary hover:bg-primary/10"
              title="Agregar columna"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Data Rows */}
        <div className="divide-y">
          {sizes.map((size) => (
            <div
              key={size}
              className="flex items-center hover:bg-surface-secondary/20"
            >
              <div className="w-32 shrink-0 p-3 font-bold text-sm text-primary flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs">
                  {size}
                </span>
              </div>
              {columns.map((_, colIdx) => {
                const val = rowValues[size]?.[colIdx] || "";
                return (
                  <div
                    key={`cell-${size}-${colIdx}`}
                    className="flex-1 min-w-[120px] p-2 border-l border-muted/50"
                  >
                    <Input
                      value={val}
                      onChange={(e) =>
                        updateMeasurement(size, colIdx, e.target.value)
                      }
                      placeholder="-"
                      className="h-8 text-sm"
                    />
                  </div>
                );
              })}
              <div className="w-20 shrink-0 border-l border-muted/50 p-2 text-center text-xs text-muted-foreground">
                cm
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground flex items-center gap-2">
        <Ruler className="w-3 h-3" />
        Tip: Puedes renombrar las columnas (ej: "Largo Manga", "Cintura")
        escribiendo sobre ellas.
      </p>
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
