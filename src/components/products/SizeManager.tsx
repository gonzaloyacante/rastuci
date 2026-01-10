import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { sortSizes } from "@/utils/sizes";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ToggleButton } from "./ProductHelpers";
import { COMMON_SIZES } from "./constants";

// ==============================================================================
// SizeManager - Gestor de talles
// ==============================================================================
interface SizeManagerProps {
  sizes: string[];
  onSizesChange: (sizes: string[]) => void;
}

export function SizeManager({ sizes, onSizesChange }: SizeManagerProps) {
  const [newSize, setNewSize] = useState("");

  const toggleSize = (size: string) => {
    if (sizes.includes(size)) {
      onSizesChange(sortSizes(sizes.filter((s) => s !== size)));
    } else {
      onSizesChange(sortSizes([...sizes, size]));
    }
  };

  const addCustomSize = () => {
    if (newSize.trim()) {
      const s = newSize.trim();
      if (!sizes.includes(s)) toggleSize(s);
      setNewSize("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {COMMON_SIZES.map((size) => (
          <ToggleButton
            key={size}
            label={size}
            selected={sizes.includes(size)}
            onClick={() => toggleSize(size)}
          />
        ))}
      </div>

      {/* Custom Size Input */}
      <div className="flex gap-2 max-w-xs">
        <Input
          value={newSize}
          onChange={(e) => setNewSize(e.target.value)}
          placeholder="Otro talle..."
          onKeyDown={(e) =>
            e.key === "Enter" && (e.preventDefault(), addCustomSize())
          }
          className="h-10"
        />
        <Button
          type="button"
          onClick={addCustomSize}
          variant="outline"
          className="shrink-0 h-10 w-10 p-2"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Display additional custom sizes not in common list */}
      {sizes.some((s) => !(COMMON_SIZES as readonly string[]).includes(s)) && (
        <div className="pt-2 border-t border-dashed mt-2">
          <p className="text-xs text-muted-foreground mb-2">
            Talles personalizados seleccionados:
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes
              .filter((s) => !(COMMON_SIZES as readonly string[]).includes(s))
              .map((s) => (
                <ToggleButton
                  key={s}
                  label={s}
                  selected={true}
                  onClick={() => toggleSize(s)}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
