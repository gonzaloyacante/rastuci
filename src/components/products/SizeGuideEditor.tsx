"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
// import { cn } from "@/lib/utils";
import { Plus, Ruler } from "lucide-react";
import { useEffect, useState } from "react";

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
  // Columns state: always start with "Talle" as read-only first column
  const [columns, setColumns] = useState<string[]>(
    value?.columns && value.columns.length > 0
      ? value.columns.slice(1) // Exclude "Talle" from editable state, we prepend it
      : ["Ancho (cm)", "Largo (cm)"]
  );

  // Measurements state: Map<Size, Map<ColumnIndex, Value>>
  // We store simply as valid rows keyed by size for persistence during size toggling
  const [rowValues, setRowValues] = useState<Record<string, string[]>>({});

  // Init from value
  useEffect(() => {
    if (value?.rows) {
      const newRowValues: Record<string, string[]> = {};
      value.rows.forEach((row) => {
        const sizeName = row[0]; // First col is always size
        const measures = row.slice(1);
        newRowValues[sizeName] = measures;
      });
      setRowValues(newRowValues);
    }
  }, [value]);

  // Sync effect: When sizes or columns or measurements change, propagate to parent
  useEffect(() => {
    if (sizes.length === 0) {
      // If no sizes, maybe nullify or keep empty
      // onChange(null);
      return;
    }

    const fullColumns = ["Talle", ...columns];
    const generatedRows = sizes.map((size) => {
      const existingMeasures = rowValues[size] || [];
      // Ensure measures array length matches columns length
      const safeMeasures = columns.map((_, i) => existingMeasures[i] || "");
      return [size, ...safeMeasures];
    });

    onChange({
      columns: fullColumns,
      rows: generatedRows,
    });
  }, [sizes, columns, rowValues, onChange]); // Be careful with onChange dependency loop, usually fine if stable

  const addColumn = () => {
    setColumns([...columns, "Nueva Medida"]);
  };

  const removeColumn = (index: number) => {
    const newCols = [...columns];
    newCols.splice(index, 1);
    setColumns(newCols);

    // Also remove that index from all saved rowValues
    const newRowValues = { ...rowValues };
    Object.keys(newRowValues).forEach((key) => {
      const vals = [...newRowValues[key]];
      vals.splice(index, 1);
      newRowValues[key] = vals;
    });
    setRowValues(newRowValues);
  };

  const updateColumnName = (index: number, name: string) => {
    const newCols = [...columns];
    newCols[index] = name;
    setColumns(newCols);
  };

  const updateMeasurement = (size: string, colIndex: number, val: string) => {
    const existing = rowValues[size] || new Array(columns.length).fill("");
    const newVals = [...existing];
    // Expand if needed
    while (newVals.length < columns.length) newVals.push("");

    newVals[colIndex] = val;
    setRowValues({
      ...rowValues,
      [size]: newVals,
    });
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
