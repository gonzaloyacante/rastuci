"use client";

import { Button } from "@/components/ui/Button";
import { ColorChip } from "@/components/ui/ColorChip";
import { Input } from "@/components/ui/Input";
import { Check, HelpCircle, ImageIcon, Trash2, X } from "lucide-react";
import { useState } from "react";

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
      className={`bg-muted rounded-lg flex items-center justify-center ${className || "w-full h-48"}`}
    >
      <div className="text-center">
        <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Sin imagen</p>
      </div>
    </div>
  );
}

// ==============================================================================
// ColorPicker - Selector de colores
// ==============================================================================
interface ColorPickerProps {
  colors: string[];
  onColorsChange: (colors: string[]) => void;
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
const COLOR_CATEGORIES: Record<string, ColorCategory> = {
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
const COMMON_COLORS = Object.values(COLOR_CATEGORIES).flatMap(
  (cat) => cat.colors
);

export function ColorPicker({ colors, onColorsChange }: ColorPickerProps) {
  const [newColor, setNewColor] = useState("");
  const [colorInput, setColorInput] = useState("#000000");
  const [colorName, setColorName] = useState("");
  const [activeCategory, setActiveCategory] = useState("basicos");

  // Colores de la categoría activa
  const activeCategoryColors = COLOR_CATEGORIES[activeCategory]?.colors || [];

  const addColor = () => {
    if (newColor.trim() && !colors.includes(newColor.trim())) {
      onColorsChange([...colors, newColor.trim()]);
      setNewColor("");
    }
  };

  const addColorFromPicker = () => {
    if (!colorName.trim()) {
      return; // Nombre obligatorio
    }
    const fullColor = `${colorName.trim()} (${colorInput})`;
    if (
      !colors.some((c) => c.toLowerCase().includes(colorName.toLowerCase()))
    ) {
      onColorsChange([...colors, fullColor]);
      setColorName("");
    }
  };

  const addPredefinedColor = (name: string, hex: string) => {
    const fullColor = `${name} (${hex})`;
    if (!colors.some((c) => c.toLowerCase().includes(name.toLowerCase()))) {
      onColorsChange([...colors, fullColor]);
    }
  };

  const removeColor = (colorToRemove: string) => {
    onColorsChange(colors.filter((color) => color !== colorToRemove));
  };

  return (
    <div className="space-y-4">
      {/* Categorías de colores */}
      <div>
        <p className="text-sm font-medium mb-2">Paleta de Colores</p>

        {/* Tabs de categorías */}
        <div className="flex flex-wrap gap-1 mb-3 pb-2 border-b border-muted">
          {Object.entries(COLOR_CATEGORIES).map(([key, category]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveCategory(key)}
              className={`px-3 py-1 text-xs rounded-full transition-all ${
                activeCategory === key
                  ? "bg-primary text-white"
                  : "bg-surface-secondary hover:bg-surface-tertiary text-muted"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Colores de la categoría activa */}
        <div className="flex flex-wrap gap-2 min-h-[60px]">
          {activeCategoryColors.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => addPredefinedColor(c.name, c.hex)}
              disabled={colors.some((col) =>
                col.toLowerCase().includes(c.name.toLowerCase())
              )}
              className="group relative"
              title={`Agregar ${c.name} (${c.hex})`}
            >
              <div
                className={`w-9 h-9 rounded-lg border-2 transition-all ${
                  colors.some((col) =>
                    col.toLowerCase().includes(c.name.toLowerCase())
                  )
                    ? "border-success opacity-50 scale-90"
                    : "border-muted hover:border-primary hover:scale-110"
                }`}
                style={{
                  backgroundColor: c.hex,
                  boxShadow:
                    c.hex === "#FFFFFF"
                      ? "inset 0 0 0 1px rgba(0,0,0,0.1)"
                      : undefined,
                }}
              >
                {colors.some((col) =>
                  col.toLowerCase().includes(c.name.toLowerCase())
                ) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                  </div>
                )}
              </div>
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 bg-surface px-1 rounded shadow">
                {c.name}
              </span>
            </button>
          ))}
        </div>

        {/* Contador de colores disponibles */}
        <p className="text-xs muted mt-2">
          {activeCategoryColors.length} colores en esta categoría •
          {COMMON_COLORS.length} colores totales disponibles
        </p>
      </div>

      {/* Color picker HTML5 */}
      <div>
        <p className="text-sm font-medium mb-2">Color Personalizado</p>
        <div className="flex gap-2 items-center flex-wrap">
          <input
            type="color"
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            className="w-12 h-10 rounded border-2 border-muted cursor-pointer"
          />
          <Input
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
            placeholder="Nombre del color (obligatorio)"
            className="w-40"
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addColorFromPicker())
            }
          />
          <span className="text-xs muted font-mono">{colorInput}</span>
          <Button
            type="button"
            onClick={addColorFromPicker}
            variant="outline"
            size="sm"
            disabled={!colorName.trim()}
          >
            Agregar
          </Button>
        </div>
        {!colorName.trim() && (
          <p className="text-xs text-muted mt-1">
            * El nombre del color es obligatorio
          </p>
        )}
      </div>

      {/* Input manual para nombres o hex */}
      <div>
        <p className="text-sm font-medium mb-2">
          Color Manual (nombre o código hex)
        </p>
        <div className="flex gap-2">
          <Input
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            placeholder="Ej: Rojo, #FF0000, rgba(255,0,0,1)"
            className="flex-1"
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addColor())
            }
          />
          <Button type="button" onClick={addColor} variant="outline" size="sm">
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Colores seleccionados */}
      {colors.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">
            Colores Seleccionados ({colors.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <div
                key={color}
                className="flex items-center gap-1 bg-surface px-3 py-1.5 rounded-full text-sm border border-muted"
              >
                <ColorChip color={color} size="sm" />
                <span className="font-medium">{color}</span>
                <button
                  type="button"
                  onClick={() => removeColor(color)}
                  className="text-error hover:bg-error hover:text-white rounded-full p-1 transition-colors ml-1"
                  title={`Eliminar ${color}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
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

  const addSize = () => {
    if (newSize.trim() && !sizes.includes(newSize.trim())) {
      onSizesChange([...sizes, newSize.trim()]);
      setNewSize("");
    }
  };

  const removeSize = (sizeToRemove: string) => {
    onSizesChange(sizes.filter((size) => size !== sizeToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={newSize}
          onChange={(e) => setNewSize(e.target.value)}
          placeholder="Talle personalizado"
          className="flex-1"
          onKeyPress={(e) =>
            e.key === "Enter" && (e.preventDefault(), addSize())
          }
        />
        <Button type="button" onClick={addSize} variant="outline" size="sm">
          <Check className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Talles comunes:</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() =>
                !sizes.includes(size) && onSizesChange([...sizes, size])
              }
              className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                sizes.includes(size)
                  ? "bg-primary text-white border-primary"
                  : "border-muted hover:border-primary hover:bg-primary/10"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {sizes.map((size, index) => (
          <div
            key={`item-${index}`}
            className="flex items-center gap-1 bg-primary text-white px-2 py-1 rounded-full text-sm"
          >
            <span>{size}</span>
            <button
              type="button"
              onClick={() => removeSize(size)}
              className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
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

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      onFeaturesChange([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const addPredefinedFeature = (feature: string) => {
    if (!features.includes(feature)) {
      onFeaturesChange([...features, feature]);
    }
  };

  const removeFeature = (featureToRemove: string) => {
    onFeaturesChange(features.filter((feature) => feature !== featureToRemove));
  };

  const allFeatures = Object.values(FEATURE_CATEGORIES).flatMap(
    (cat) => cat.items
  );
  const displayFeatures =
    selectedCategory === "todos"
      ? allFeatures
      : FEATURE_CATEGORIES[selectedCategory as FeatureCategoryKey]?.items || [];

  return (
    <div className="space-y-4">
      {/* Categorías de características */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm font-medium">Categorías de Características</p>
          <HelpTooltip text="Selecciona una categoría para ver sugerencias predefinidas o agrega características personalizadas" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("todos")}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              selectedCategory === "todos"
                ? "bg-primary text-white border-primary"
                : "border-muted hover:border-primary"
            }`}
          >
            Todos
          </button>
          {Object.entries(FEATURE_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                selectedCategory === key
                  ? "bg-primary text-white border-primary"
                  : "border-muted hover:border-primary"
              }`}
              title={cat.help}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Características sugeridas */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm font-medium">Características Sugeridas</p>
          {selectedCategory !== "todos" && (
            <HelpTooltip
              text={
                FEATURE_CATEGORIES[selectedCategory as FeatureCategoryKey]
                  ?.help || ""
              }
            />
          )}
        </div>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-surface/50 rounded-lg">
          {displayFeatures.map((feature) => (
            <button
              key={feature}
              type="button"
              onClick={() => addPredefinedFeature(feature)}
              disabled={features.includes(feature)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                features.includes(feature)
                  ? "bg-success/10 border-success text-success cursor-not-allowed"
                  : "border-muted hover:border-primary hover:bg-primary/5"
              }`}
              title={
                features.includes(feature)
                  ? "Ya agregada"
                  : `Agregar ${feature}`
              }
            >
              {feature}
              {features.includes(feature) && (
                <Check className="inline h-3 w-3 ml-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Input personalizado */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm font-medium">Característica Personalizada</p>
          <HelpTooltip text="Agrega cualquier característica específica que no esté en las sugerencias" />
        </div>
        <div className="flex gap-2">
          <Input
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            placeholder="Ej: Resistente a manchas"
            className="flex-1"
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addFeature())
            }
          />
          <Button
            type="button"
            onClick={addFeature}
            variant="outline"
            size="sm"
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Características seleccionadas */}
      {features.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">
            Características Agregadas ({features.length})
          </p>
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div
                key={`feature-${index}-${feature.slice(0, 10)}`}
                className="flex items-center justify-between p-3 bg-surface rounded-lg border border-muted hover:border-primary transition-colors group"
              >
                <span className="flex-1 text-sm">{feature}</span>
                <button
                  type="button"
                  onClick={() => removeFeature(feature)}
                  className="text-error hover:bg-error hover:text-white rounded-full p-1.5 transition-colors opacity-70 group-hover:opacity-100"
                  title={`Eliminar ${feature}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
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
