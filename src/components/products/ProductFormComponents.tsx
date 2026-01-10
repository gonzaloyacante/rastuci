import { Button } from "@/components/ui/Button";
import { ColorChip } from "@/components/ui/ColorChip";
import { Input } from "@/components/ui/Input";
import {
  Check,
  HelpCircle,
  ImageIcon,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Image as LucideImage,
  Plus,
  AlertCircle,
} from "lucide-react";
import ImageUploadZone from "./ImageUploadZone";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { sortSizes } from "@/utils/sizes";

// ==============================================================================
// Shared Toggle Button
// ==============================================================================
interface ToggleButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

function ToggleButton({
  label,
  selected,
  onClick,
  icon,
  children,
}: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        selected
          ? "bg-primary text-white border-primary shadow-sm"
          : "bg-surface border-muted hover:border-primary/50 hover:bg-surface-secondary text-primary"
      )}
      aria-pressed={selected}
    >
      {icon}
      {children || label}
      {selected && <Check className="w-3.5 h-3.5 ml-1.5" />}
    </button>
  );
}

// ==============================================================================
// HelpTooltip - Componente de ayuda reutilizable con tooltip
// ==============================================================================
export function HelpTooltip({ text }: { text: string }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="text-muted hover:text-primary transition-colors"
        aria-label="Ayuda"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-primary text-white text-xs rounded-lg shadow-lg max-w-xs whitespace-normal">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-primary" />
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// PlaceholderImage - Placeholder para imágenes
// ==============================================================================
export function PlaceholderImage({ className }: { className?: string }) {
  return (
    <div
      className={`bg-muted rounded-lg flex items-center justify-center border border-muted ${className || "w-full h-48"}`}
    >
      <div className="text-center p-4">
        <ImageIcon className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground font-medium">
          Imagen no disponible
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          No se pudo cargar la imagen
        </p>
      </div>
    </div>
  );
}

// ==============================================================================
// ColorPicker - Selector de colores
// ==============================================================================
interface ColorPickerProps {
  colors: string[];
  colorImages?: Record<string, string[]>;
  onColorsChange: (colors: string[]) => void;
  onColorImagesChange?: (color: string, images: string[]) => void;
}

// Tipo para cada color
interface ColorOption {
  name: string;
  hex: string;
}

// Tipo para categoría de colores
interface ColorCategory {
  label: string;
  colors: ColorOption[];
}

// Paleta de colores expandida y organizada por categorías
export const COLOR_CATEGORIES: Record<string, ColorCategory> = {
  basicos: {
    label: "Básicos",
    colors: [
      { name: "Negro", hex: "#000000" },
      { name: "Blanco", hex: "#FFFFFF" },
      { name: "Gris Oscuro", hex: "#333333" },
      { name: "Gris", hex: "#808080" },
      { name: "Gris Claro", hex: "#D3D3D3" },
      { name: "Plata", hex: "#C0C0C0" },
    ],
  },
  rojos: {
    label: "Rojos y Rosas",
    colors: [
      { name: "Rojo", hex: "#FF0000" },
      { name: "Rojo Oscuro", hex: "#8B0000" },
      { name: "Carmesí", hex: "#DC143C" },
      { name: "Coral", hex: "#FF7F50" },
      { name: "Salmón", hex: "#FA8072" },
      { name: "Rosa", hex: "#FFC0CB" },
      { name: "Rosa Fuerte", hex: "#FF69B4" },
      { name: "Magenta", hex: "#FF00FF" },
      { name: "Fucsia", hex: "#FF1493" },
      { name: "Borgoña", hex: "#800020" },
    ],
  },
  naranjas: {
    label: "Naranjas y Marrones",
    colors: [
      { name: "Naranja", hex: "#FFA500" },
      { name: "Naranja Oscuro", hex: "#FF8C00" },
      { name: "Durazno", hex: "#FFCBA4" },
      { name: "Terracota", hex: "#E2725B" },
      { name: "Marrón", hex: "#8B4513" },
      { name: "Chocolate", hex: "#D2691E" },
      { name: "Camel", hex: "#C19A6B" },
      { name: "Beige", hex: "#F5F5DC" },
      { name: "Crema", hex: "#FFFDD0" },
      { name: "Canela", hex: "#D2691E" },
    ],
  },
  amarillos: {
    label: "Amarillos y Dorados",
    colors: [
      { name: "Amarillo", hex: "#FFFF00" },
      { name: "Amarillo Claro", hex: "#FFFFE0" },
      { name: "Limón", hex: "#FFF44F" },
      { name: "Dorado", hex: "#FFD700" },
      { name: "Mostaza", hex: "#FFDB58" },
      { name: "Ámbar", hex: "#FFBF00" },
      { name: "Oro Viejo", hex: "#CFB53B" },
    ],
  },
  verdes: {
    label: "Verdes",
    colors: [
      { name: "Verde", hex: "#008000" },
      { name: "Verde Lima", hex: "#32CD32" },
      { name: "Verde Menta", hex: "#98FF98" },
      { name: "Verde Oliva", hex: "#808000" },
      { name: "Verde Militar", hex: "#4B5320" },
      { name: "Verde Esmeralda", hex: "#50C878" },
      { name: "Verde Bosque", hex: "#228B22" },
      { name: "Turquesa", hex: "#40E0D0" },
      { name: "Aqua", hex: "#00FFFF" },
      { name: "Verde Agua", hex: "#7FFFD4" },
    ],
  },
  azules: {
    label: "Azules",
    colors: [
      { name: "Azul", hex: "#0000FF" },
      { name: "Azul Marino", hex: "#000080" },
      { name: "Azul Rey", hex: "#4169E1" },
      { name: "Celeste", hex: "#87CEEB" },
      { name: "Azul Cielo", hex: "#87CEEB" },
      { name: "Azul Bebé", hex: "#89CFF0" },
      { name: "Azul Petróleo", hex: "#006064" },
      { name: "Índigo", hex: "#4B0082" },
      { name: "Cian", hex: "#00FFFF" },
      { name: "Azul Acero", hex: "#4682B4" },
    ],
  },
  violetas: {
    label: "Violetas y Púrpuras",
    colors: [
      { name: "Morado", hex: "#800080" },
      { name: "Púrpura", hex: "#9B30FF" },
      { name: "Violeta", hex: "#EE82EE" },
      { name: "Lavanda", hex: "#E6E6FA" },
      { name: "Lila", hex: "#C8A2C8" },
      { name: "Ciruela", hex: "#8E4585" },
      { name: "Uva", hex: "#6F2DA8" },
      { name: "Malva", hex: "#E0B0FF" },
    ],
  },
  pasteles: {
    label: "🎨 Pasteles",
    colors: [
      { name: "Rosa Pastel", hex: "#FFD1DC" },
      { name: "Melocotón Pastel", hex: "#FFDAB9" },
      { name: "Amarillo Pastel", hex: "#FDFD96" },
      { name: "Verde Pastel", hex: "#77DD77" },
      { name: "Menta Pastel", hex: "#B4F0C2" },
      { name: "Celeste Pastel", hex: "#AEC6CF" },
      { name: "Azul Pastel", hex: "#A2D2FF" },
      { name: "Lavanda Pastel", hex: "#E6E6FA" },
      { name: "Lila Pastel", hex: "#DDA0DD" },
      { name: "Coral Pastel", hex: "#FFB7B2" },
      { name: "Durazno Pastel", hex: "#FFE5B4" },
      { name: "Crema Pastel", hex: "#FFFDD0" },
      { name: "Gris Perla", hex: "#E5E4E2" },
      { name: "Turquesa Pastel", hex: "#AFEEEE" },
      { name: "Salmón Pastel", hex: "#FFA07A" },
    ],
  },
  tierra: {
    label: "Tonos Tierra",
    colors: [
      { name: "Café", hex: "#6F4E37" },
      { name: "Tostado", hex: "#B87333" },
      { name: "Arena", hex: "#C2B280" },
      { name: "Ocre", hex: "#CC7722" },
      { name: "Siena", hex: "#A0522D" },
      { name: "Terracota", hex: "#E2725B" },
      { name: "Arcilla", hex: "#B66A50" },
      { name: "Óxido", hex: "#B7410E" },
    ],
  },
  metalicos: {
    label: "✨ Metálicos",
    colors: [
      { name: "Oro", hex: "#FFD700" },
      { name: "Plata", hex: "#C0C0C0" },
      { name: "Bronce", hex: "#CD7F32" },
      { name: "Cobre", hex: "#B87333" },
      { name: "Platino", hex: "#E5E4E2" },
      { name: "Oro Rosa", hex: "#E0BFB8" },
      { name: "Champagne", hex: "#F7E7CE" },
    ],
  },
};

// Lista plana para compatibilidad con código existente
export const COMMON_COLORS = Object.values(COLOR_CATEGORIES).flatMap(
  (cat) => cat.colors
);

export function ColorPicker({
  colors,
  onColorsChange,
  colorImages = {},
  onColorImagesChange,
}: ColorPickerProps) {
  const [newColor, setNewColor] = useState("");
  const [colorInput, setColorInput] = useState("#000000");
  const [colorName, setColorName] = useState("");
  const [activeCategory, setActiveCategory] = useState("basicos");
  const [expandedColor, setExpandedColor] = useState<string | null>(null);

  const toggleColorExpand = (color: string) => {
    if (expandedColor === color) {
      setExpandedColor(null);
    } else {
      setExpandedColor(color);
    }
  };

  // Colores de la categoría activa
  const activeCategoryColors = COLOR_CATEGORIES[activeCategory]?.colors || [];

  const toggleColor = (colorName: string) => {
    if (colors.includes(colorName)) {
      // Deselect
      onColorsChange(colors.filter((c) => c !== colorName));
      if (expandedColor === colorName) setExpandedColor(null);
    } else {
      // Select
      onColorsChange([...colors, colorName]);
    }
  };

  const addCustomColor = () => {
    if (newColor.trim() && !colors.includes(newColor.trim())) {
      toggleColor(newColor.trim());
      setNewColor("");
    }
  };

  const addFromPicker = () => {
    if (colorName.trim()) {
      const fullColor = `${colorName.trim()} (${colorInput})`;
      if (!colors.includes(fullColor)) {
        toggleColor(fullColor);
        setColorName("");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Paleta de Selección Rápida */}
      <div>
        <div className="flex flex-col gap-3 mb-4">
          <h3 className="text-sm font-medium">Seleccionar Colores</h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(COLOR_CATEGORIES).map((catKey) => (
              <button
                key={catKey}
                type="button"
                onClick={() => setActiveCategory(catKey)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full border transition-all",
                  activeCategory === catKey
                    ? "bg-primary text-white border-primary"
                    : "bg-surface border-muted hover:border-primary/50 text-foreground"
                )}
              >
                {COLOR_CATEGORIES[catKey].label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-4 bg-surface-secondary/30 rounded-xl border border-dashed border-muted">
          {activeCategoryColors.map((c) => {
            const isSelected = colors.some((col) => col.includes(c.name)); // Loose match for custom formats
            // Exact match preferred for toggle logic
            const exactMatch = colors.includes(c.name);

            return (
              <button
                key={c.name}
                type="button"
                onClick={() =>
                  exactMatch ? toggleColor(c.name) : toggleColor(c.name)
                } // Simplified, handles both
                className={cn(
                  "group relative w-10 h-10 rounded-full border-2 transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  exactMatch
                    ? "border-primary ring-2 ring-primary/20 scale-110 z-10"
                    : "border-transparent hover:border-primary/50 hover:scale-105"
                )}
                style={{ backgroundColor: c.hex }}
                title={c.name}
                aria-label={`Seleccionar color ${c.name}`}
                aria-pressed={exactMatch || isSelected}
              >
                {exactMatch && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                    <Check className="w-5 h-5 text-white drop-shadow-md" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Color Personalizado */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium mb-1.5 block">
            Color Hexadecimal/Picker
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              className="h-10 w-12 rounded cursor-pointer border-muted p-0.5 bg-surface"
            />
            <Input
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              placeholder="Nombre (ej. Azul Francia)"
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addFromPicker())
              }
            />
            <Button
              type="button"
              variant="outline"
              onClick={addFromPicker}
              disabled={!colorName}
              className="h-10 w-10 p-2"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium mb-1.5 block">
            Color Manual (Texto)
          </label>
          <div className="flex gap-2">
            <Input
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              placeholder="Ej. Multicolor"
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addCustomColor())
              }
            />
            <Button
              type="button"
              variant="outline"
              onClick={addCustomColor}
              disabled={!newColor}
              className="h-10 w-10 p-2"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Lista de Colores Seleccionados & Imágenes */}
      {colors.length > 0 && (
        <div className="space-y-3 pt-4 border-t">
          <h3 className="text-sm font-medium flex items-center gap-2">
            Colores Seleccionados
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
              {colors.length}
            </span>
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {colors.map((color) => {
              const isExpanded = expandedColor === color;
              const imgCount = colorImages[color]?.length || 0;

              return (
                <div
                  key={color}
                  className={cn(
                    "rounded-lg border transition-all overflow-hidden",
                    isExpanded
                      ? "border-primary shadow-md bg-surface"
                      : "border-muted bg-surface/50"
                  )}
                >
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-surface-secondary/50 transition-colors"
                    onClick={() => toggleColorExpand(color)}
                  >
                    <div className="flex items-center gap-3">
                      <ColorChip color={color} />
                      <span className="font-medium">{color}</span>
                      {imgCount > 0 && (
                        <span className="flex items-center gap-1 text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-medium">
                          <LucideImage className="w-3 h-3" /> {imgCount} fotos
                        </span>
                      )}
                      {imgCount === 0 && (
                        <span className="text-xs text-warning bg-warning/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Sin fotos
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-error hover:bg-error/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleColor(color);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {isExpanded && onColorImagesChange && (
                    <div className="p-4 border-t bg-surface-secondary/10">
                      <p className="text-xs text-muted-foreground mb-3">
                        Sube las fotos correspondientes al color{" "}
                        <strong>{color}</strong>.
                      </p>
                      <ImageUploadZone
                        existingImages={colorImages[color] || []}
                        onImagesChange={(imgs) =>
                          onColorImagesChange(color, imgs)
                        }
                        maxImages={5}
                        maxSizeMB={2}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// SizeManager - Gestor de talles
// ==============================================================================
interface SizeManagerProps {
  sizes: string[];
  onSizesChange: (sizes: string[]) => void;
}

const COMMON_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
] as const;

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
      {sizes.some((s) => !COMMON_SIZES.includes(s as any)) && (
        <div className="pt-2 border-t border-dashed mt-2">
          <p className="text-xs text-muted-foreground mb-2">
            Talles personalizados seleccionados:
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes
              .filter((s) => !COMMON_SIZES.includes(s as any))
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

// ==============================================================================
// FeatureManager - Gestor de características
// ==============================================================================
interface FeatureManagerProps {
  features: string[];
  onFeaturesChange: (features: string[]) => void;
}

const FEATURE_CATEGORIES = {
  material: {
    label: "Material",
    help: "Composición y tipo de tela del producto",
    items: [
      "100% Algodón",
      "100% Algodón orgánico",
      "Mezcla de algodón",
      "Poliéster",
      "Lana",
      "Seda",
      "Denim",
      "Jersey",
    ],
  },
  cuidado: {
    label: "Cuidado",
    help: "Instrucciones de lavado y mantenimiento",
    items: [
      "Lavable en máquina",
      "Lavar a mano",
      "No usar blanqueador",
      "Secar al aire",
      "Planchar a baja temperatura",
      "Lavar con colores similares",
    ],
  },
  diseño: {
    label: "Diseño",
    help: "Características del diseño y estilo",
    items: [
      "Diseño cómodo y fresco",
      "Diseño moderno",
      "Estampado de calidad",
      "Estampado que no se destiñe",
      "Botones de seguridad",
      "Cierre invisible",
      "Bolsillos funcionales",
    ],
  },
  caracteristicas: {
    label: "Características",
    help: "Propiedades adicionales del producto",
    items: [
      "Transpirable",
      "Resistente al agua",
      "Protección UV",
      "Antibacterial",
      "Hipoalergénico",
      "Elástico",
      "Forrado",
    ],
  },
} as const;

type FeatureCategoryKey = keyof typeof FEATURE_CATEGORIES;

export function FeatureManager({
  features,
  onFeaturesChange,
}: FeatureManagerProps) {
  const [newFeature, setNewFeature] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");

  const toggleFeature = (feature: string) => {
    if (features.includes(feature)) {
      onFeaturesChange(features.filter((f) => f !== feature));
    } else {
      onFeaturesChange([...features, feature]);
    }
  };

  const addCustomFeature = () => {
    if (newFeature.trim()) {
      const f = newFeature.trim();
      if (!features.includes(f)) toggleFeature(f);
      setNewFeature("");
    }
  };

  const allFeatures = Object.values(FEATURE_CATEGORIES).flatMap(
    (cat) => cat.items
  );

  const displayFeatures = useMemo(() => {
    if (selectedCategory === "todos") return allFeatures.slice(0, 30); // Limit full display
    return (
      FEATURE_CATEGORIES[selectedCategory as FeatureCategoryKey]?.items || []
    );
  }, [selectedCategory, allFeatures]);

  return (
    <div className="space-y-5">
      {/* Configuración Tabs */}
      <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setSelectedCategory("todos")}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-full border transition-all whitespace-nowrap",
            selectedCategory === "todos"
              ? "bg-primary text-white border-primary"
              : "bg-surface border-muted hover:border-primary"
          )}
        >
          Todos
        </button>
        {Object.entries(FEATURE_CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelectedCategory(key)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-full border transition-all whitespace-nowrap",
              selectedCategory === key
                ? "bg-primary text-white border-primary"
                : "bg-surface border-muted hover:border-primary"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {displayFeatures.map((feature) => (
          <ToggleButton
            key={feature}
            label={feature}
            selected={features.includes(feature)}
            onClick={() => toggleFeature(feature)}
          />
        ))}
      </div>

      {/* Manual Add */}
      <div className="flex gap-2">
        <Input
          value={newFeature}
          onChange={(e) => setNewFeature(e.target.value)}
          placeholder="Otra característica..."
          className="flex-1"
          onKeyDown={(e) =>
            e.key === "Enter" && (e.preventDefault(), addCustomFeature())
          }
        />
        <Button
          type="button"
          onClick={addCustomFeature}
          variant="outline"
          className="h-10 w-10 p-2"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Custom Features Display */}
      {features.some((f) => !allFeatures.includes(f as any)) && (
        <div className="pt-2 border-t border-dashed mt-2">
          <p className="text-xs text-muted-foreground mb-2">Personalizadas:</p>
          <div className="flex flex-wrap gap-2">
            {features
              .filter((f) => !allFeatures.includes(f as any))
              .map((f) => (
                <ToggleButton
                  key={f}
                  label={f}
                  selected={true}
                  onClick={() => toggleFeature(f)}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// FormField - Campo de formulario reutilizable
// ==============================================================================
interface FormFieldProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  required?: boolean;
}

export function FormField({
  id,
  label,
  icon,
  error,
  hint,
  children,
  required,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-2">
        {icon && <span className="inline mr-2">{icon}</span>}
        {label} {required && "*"}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground mt-1">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-error flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
}

// ==============================================================================
// ProductPreviewBadges - Badges de vista previa
// ==============================================================================
interface ProductPreviewBadgesProps {
  onSale?: boolean;
  stock?: number;
}

export function ProductPreviewBadges({
  onSale,
  stock,
}: ProductPreviewBadgesProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {onSale && (
        <span className="bg-error/10 text-error px-3 py-1 rounded-full text-sm font-medium">
          ⚡ En Oferta
        </span>
      )}
      {stock !== undefined && stock > 0 && (
        <span className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">
          ✓ {stock} en stock
        </span>
      )}
      {stock !== undefined && stock <= 5 && stock > 0 && (
        <span className="bg-warning/10 text-warning px-3 py-1 rounded-full text-sm font-medium">
          ⚠️ Stock limitado
        </span>
      )}
      {stock === 0 && (
        <span className="bg-error/10 text-error px-3 py-1 rounded-full text-sm font-medium">
          ✗ Sin stock
        </span>
      )}
    </div>
  );
}

// ==============================================================================
// StockIndicator - Indicador de nivel de stock
// ==============================================================================
export function StockIndicator({ stock }: { stock: number }) {
  const getStockInfo = () => {
    if (stock === 0) return { text: "Sin stock", className: "text-red-600" };
    if (stock <= 5) return { text: "Stock bajo", className: "text-red-600" };
    if (stock <= 10)
      return { text: "Stock medio", className: "text-yellow-600" };
    return { text: "Stock bueno", className: "text-green-600" };
  };

  const info = getStockInfo();

  return (
    <p className={`text-xs mt-1 font-medium ${info.className}`}>{info.text}</p>
  );
}
