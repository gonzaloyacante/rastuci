
import { cn } from "@/lib/utils";
import { Check, HelpCircle, ImageIcon } from "lucide-react";
import { useState } from "react";

// ==============================================================================
// Shared Toggle Button
// ==============================================================================
export interface ToggleButtonProps {
    label: string;
    selected: boolean;
    onClick: () => void;
    icon?: React.ReactNode;
    children?: React.ReactNode;
}

export function ToggleButton({
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
// ProductPreviewBadges
// ==============================================================================
export interface ProductPreviewBadgesProps {
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
// StockIndicator
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
