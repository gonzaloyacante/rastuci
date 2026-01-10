
import { Button } from "@/components/ui/Button";
import { ColorChip } from "@/components/ui/ColorChip";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import {
    AlertCircle,
    Check,
    ChevronDown,
    ChevronUp,
    Image as LucideImage,
    Plus,
    X,
} from "lucide-react";
import { useState } from "react";
import ImageUploadZone from "./ImageUploadZone";
import { COLOR_CATEGORIES } from "./constants";

// ==============================================================================
// ColorPicker - Selector de colores
// ==============================================================================
interface ColorPickerProps {
    colors: string[];
    colorImages?: Record<string, string[]>;
    onColorsChange: (colors: string[]) => void;
    onColorImagesChange?: (color: string, images: string[]) => void;
}

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
