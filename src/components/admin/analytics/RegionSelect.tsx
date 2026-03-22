"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

interface RegionSelectProps {
  value: string;
  onChange: (value: string) => void;
  regions?: { label: string; value: string }[];
}

const defaultRegions = [
  { label: "Todas las regiones", value: "all" },
  { label: "Buenos Aires", value: "Buenos Aires" },
  { label: "Córdoba", value: "Córdoba" },
  { label: "Rosario", value: "Rosario" },
  { label: "Mendoza", value: "Mendoza" },
  { label: "Santa Fe", value: "Santa Fe" },
  { label: "Tucumán", value: "Tucumán" },
];

export function RegionSelect({
  value,
  onChange,
  regions = defaultRegions,
}: RegionSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">Región</label>
      <Select
        value={value || "all"}
        onValueChange={(v: string) => onChange(v === "all" ? "" : v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Todas las regiones" />
        </SelectTrigger>
        <SelectContent>
          {regions.map((region) => (
            <SelectItem
              key={region.value || "all"}
              value={region.value || "all"}
            >
              {region.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
