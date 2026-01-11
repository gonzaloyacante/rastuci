import { cn } from "@/lib/utils";
import { Check, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { StockBadge } from "@/components/ui/StockBadge";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

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
      className={`relative overflow-hidden bg-muted rounded-lg border border-muted flex flex-col items-center justify-center ${className || "w-full h-48"}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-12 h-12 text-muted/50"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <span className="text-muted/50 text-sm mt-2">Imagen no disponible</span>
    </div>
  );
}

// ==============================================================================
// ColorSwatch - Selector de color con fallback de imágenes
// ==============================================================================
interface ColorSwatchProps {
  color: string;
  images: string[];
  isSelected: boolean;
  onClick: () => void;
  colorHex?: string;
  className?: string;
}

export function ColorSwatch({
  color,
  images,
  isSelected,
  onClick,
  colorHex,
  className,
}: ColorSwatchProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasValidImage, setHasValidImage] = useState(true);

  // Cada vez que cambian las imágenes o el color, reseteamos el índice
  useEffect(() => {
    setCurrentImageIndex(0);
    setHasValidImage(Boolean(images && images.length > 0));
  }, [images, color]);

  const handleImageError = () => {
    // Si tenemos más imágenes para probar, avanzamos al siguiente índice
    if (images && currentImageIndex < images.length - 1) {
      setCurrentImageIndex((prev) => prev + 1);
    } else {
      // Si ya probamos todas, marcamos como inválido para mostrar fallback de color
      setHasValidImage(false);
    }
  };

  const showImage = hasValidImage && images && images.length > 0;
  const currentSrc = showImage ? images[currentImageIndex] : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative rounded-md border-2 transition-all overflow-hidden",
        isSelected
          ? "border-primary ring-2 ring-offset-2 ring-primary ring-offset-surface"
          : "border-transparent hover:border-primary/50",
        className
      )}
      title={`Seleccionar color ${color}`}
    >
      {currentSrc ? (
        <div className="w-16 h-16 relative bg-neutral-100 dark:bg-neutral-800 rounded-sm overflow-hidden">
          <OptimizedImage
            src={currentSrc}
            alt={color}
            fill
            className="object-cover"
            sizes="64px"
            quality={60}
            onError={handleImageError}
            showTextFallback={false}
          />
        </div>
      ) : (
        <div
          className="w-12 h-12"
          style={{ backgroundColor: colorHex || "#ccc" }}
        />
      )}
    </button>
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
      {stock !== undefined && <StockBadge stock={stock} />}
    </div>
  );
}

// ==============================================================================
// StockIndicator
// ==============================================================================
export function StockIndicator({ stock }: { stock: number }) {
  return (
    <div className="mt-1">
      <StockBadge stock={stock} className="text-xs px-2 py-0.5" />
    </div>
  );
}
