"use client";

import { Button } from "@/components/ui/Button";
import { escapeCsvCell } from "@/utils/formatters";

// ============================================================================
// Bulk Actions Bar
// ============================================================================

interface BulkAction {
  label: string;
  onClick: () => void;
  variant?: "outline" | "ghost" | "secondary";
}

interface BulkActionsBarProps {
  selectedCount: number;
  actions: BulkAction[];
  onClear: () => void;
}

export function BulkActionsBar({
  selectedCount,
  actions,
  onClear,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-4 p-4 surface-secondary rounded-lg border">
      <span className="text-sm font-medium">
        {selectedCount} elemento{selectedCount !== 1 ? "s" : ""} seleccionado
        {selectedCount !== 1 ? "s" : ""}
      </span>
      <div className="flex gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            size="sm"
            onClick={action.onClick}
            variant={action.variant || "outline"}
          >
            {action.label}
          </Button>
        ))}
        <Button size="sm" onClick={onClear} variant="ghost">
          Limpiar selección
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// CSV Export Helper
// ============================================================================

export function downloadCSV(
  data: (string | number)[][],
  filename: string
): void {
  const csvContent = data
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
