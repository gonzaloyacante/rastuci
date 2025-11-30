import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Filter, RotateCcw } from "lucide-react";
import React from "react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: "select" | "multiselect" | "date" | "daterange";
  options?: FilterOption[];
  placeholder?: string;
}

export interface FilterValue {
  [key: string]: string | string[] | null;
}

interface FilterBarProps {
  fields: FilterField[];
  values: FilterValue;
  onChange: (key: string, value: string | string[] | null) => void;
  onReset: () => void;
  className?: string;
  showResetButton?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  fields,
  values,
  onChange,
  onReset,
  className = "",
  showResetButton = true,
}) => {
  const hasActiveFilters = Object.values(values).some(
    (value) =>
      value !== null &&
      value !== "" &&
      (!Array.isArray(value) || value.length > 0)
  );

  const renderFilterField = (field: FilterField) => {
    const value = values[field.key];

    switch (field.type) {
      case "select":
        return (
          <Select
            key={field.key}
            value={(value as string) || ""}
            onChange={(newValue) => onChange(field.key, newValue || null)}
            options={[
              {
                value: "",
                label:
                  field.placeholder || `Todos ${field.label.toLowerCase()}`,
              },
              ...(field.options || []),
            ]}
            placeholder={field.placeholder}
            className="min-w-[150px]"
          />
        );

      case "multiselect":
        // For now, we'll implement this as a simple select
        // In the future, this could be expanded to a proper multiselect
        return (
          <Select
            key={field.key}
            value={
              Array.isArray(value) ? value[0] || "" : (value as string) || ""
            }
            onChange={(newValue) =>
              onChange(field.key, newValue ? [newValue] : null)
            }
            options={[
              {
                value: "",
                label:
                  field.placeholder || `Todos ${field.label.toLowerCase()}`,
              },
              ...(field.options || []),
            ]}
            placeholder={field.placeholder}
            className="min-w-[150px]"
          />
        );

      case "date":
      case "daterange":
        return (
          <input
            key={field.key}
            type={field.type === "daterange" ? "date" : "date"}
            value={(value as string) || ""}
            onChange={(e) => onChange(field.key, e.target.value || null)}
            className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[150px]"
            placeholder={field.placeholder}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 bg-surface-secondary rounded-lg ${className}`}
    >
      <div className="flex items-center gap-2 text-content-secondary">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filtros:</span>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {fields.map((field) => (
          <div key={field.key} className="flex flex-col">
            <label className="text-xs text-content-secondary mb-1">
              {field.label}
            </label>
            {renderFilterField(field)}
          </div>
        ))}
      </div>

      {showResetButton && hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="ml-auto"
          leftIcon={<RotateCcw className="h-4 w-4" />}
        >
          Limpiar
        </Button>
      )}
    </div>
  );
};
