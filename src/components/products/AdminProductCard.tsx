"use client";

import {
  Check,
  Edit,
  Eye,
  Pencil,
  Power,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";

import { DynamicTags } from "@/components/products/DynamicTags";
import { PriceBadge } from "@/components/products/PriceBadge";
import { COMMON_COLORS } from "@/components/products/ProductFormComponents";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingStates";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { ProductImagePlaceholder } from "@/components/ui/ProductImagePlaceholder";
import { StockBadge } from "@/components/ui/StockBadge";
import { Product } from "@/types";
import { sortSizes } from "@/utils/sizes";

// ============================================================================
// InlineStockEditor — edición rápida de stock sin abrir el formulario completo
// ============================================================================

interface InlineStockEditorProps {
  productId: string;
  stock: number;
  onUpdateStock?: (id: string, stock: number) => Promise<void>;
}

export function InlineStockEditor({
  productId,
  stock,
  onUpdateStock,
}: InlineStockEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(stock));
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleStartEdit = (e: React.MouseEvent) => {
    if (!onUpdateStock) return;
    e.stopPropagation();
    setInputValue(String(stock));
    setIsEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleCancel = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    setIsEditing(false);
    setInputValue(String(stock));
  };

  const handleSave = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    if (!onUpdateStock) return;
    const newStock = parseInt(inputValue, 10);
    if (isNaN(newStock) || newStock < 0) {
      handleCancel();
      return;
    }
    if (newStock === stock) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onUpdateStock(productId, newStock);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") void handleSave(e);
    if (e.key === "Escape") handleCancel(e);
  };

  if (isEditing) {
    return (
      <div
        className="flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          type="number"
          min={0}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          className="w-16 h-7 text-sm text-center border border-primary rounded focus:outline-none focus:ring-1 focus:ring-primary bg-surface px-1"
          aria-label="Nuevo stock"
        />
        <button
          type="button"
          onClick={(e) => void handleSave(e)}
          disabled={isSaving}
          className="p-1 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50"
          title="Guardar"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSaving}
          className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
          title="Cancelar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <StockBadge stock={stock} />
      <span className="text-xs text-muted-foreground font-mono">({stock})</span>
      {onUpdateStock && (
        <button
          type="button"
          onClick={handleStartEdit}
          className="p-0.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          title="Editar stock"
        >
          <Pencil className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// AdminProductCard
// ============================================================================

interface AdminProductCardProps {
  product: Product;
  priority?: boolean;
  layout?: "grid" | "row";
  onEdit: (id: string) => void;
  onView?: (id: string) => void;
  onToggleActive?: (id: string, isActive: boolean) => void;
  onDelete?: (id: string) => void;
  onUpdateStock?: (id: string, stock: number) => Promise<void>;
}

export function AdminProductCard({
  product,
  priority = false,
  layout = "grid",
  onEdit,
  onView,
  onToggleActive,
  onDelete,
  onUpdateStock,
}: AdminProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const productImages = useMemo(() => {
    try {
      return typeof product.images === "string"
        ? JSON.parse(product.images)
        : product.images || [];
    } catch {
      return [];
    }
  }, [product.images]);

  const sortedSizes = useMemo(() => {
    if (!product.sizes) return [];
    return sortSizes(product.sizes);
  }, [product.sizes]);

  const mainImage = useMemo(
    () => (productImages.length > 0 ? productImages[0] : null),
    [productImages]
  );

  const effectiveStock = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, v) => sum + v.stock, 0);
    }
    return product.stock;
  }, [product.variants, product.stock]);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  // -------------------------------------------------------------------------
  // ADMIN - Vista de lista (fila horizontal compacta)
  // -------------------------------------------------------------------------
  if (layout === "row") {
    return (
      <div
        className={`group relative flex items-center gap-3 surface border border-theme rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition-all duration-200 ${product.isActive === false ? "opacity-60" : ""}`}
      >
        {/* Imagen miniatura */}
        <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-surface-secondary border border-theme">
          {imageError || !mainImage ? (
            <ProductImagePlaceholder className="w-full h-full" />
          ) : (
            <OptimizedImage
              src={mainImage}
              alt={product.name}
              width={56}
              height={56}
              className="object-cover w-full h-full"
              sizes="56px"
              priority={priority}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>

        {/* Nombre + categoría */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-base-primary truncate max-w-50">
              {product.name}
            </span>
            {product.isActive === false && (
              <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                DESACTIVADO
              </span>
            )}
            {product.onSale && (
              <span className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                OFERTA
              </span>
            )}
          </div>
          {product.categories && (
            <span className="text-xs text-muted-foreground truncate block">
              {product.categories.name}
            </span>
          )}
        </div>

        {/* Precio */}
        <div className="shrink-0 hidden sm:block text-sm font-bold text-base-primary whitespace-nowrap min-w-18 text-right">
          <PriceBadge
            price={product.price}
            salePrice={product.salePrice}
            onSale={product.onSale}
          />
        </div>

        {/* Stock editor inline */}
        <div className="shrink-0 hidden md:flex items-center min-w-30">
          <InlineStockEditor
            productId={product.id}
            stock={effectiveStock}
            onUpdateStock={onUpdateStock}
          />
        </div>

        {/* Acciones */}
        <div className="shrink-0 flex items-center gap-1">
          {onView && (
            <button
              type="button"
              onClick={() => onView(product.id)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="Ver producto"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(product.id)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          {onToggleActive && (
            <button
              type="button"
              onClick={() =>
                onToggleActive(product.id, !(product.isActive !== false))
              }
              className={`p-1.5 rounded-lg transition-colors ${
                product.isActive !== false
                  ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                  : "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              }`}
              title={
                product.isActive !== false
                  ? "Desactivar producto"
                  : "Activar producto"
              }
            >
              <Power className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(product.id)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // ADMIN - Vista de tarjeta (grid card)
  // -------------------------------------------------------------------------
  return (
    <div className="group relative surface border border-theme rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden h-full flex flex-col">
      {/* Image Section */}
      <div className="relative shrink-0">
        <div className="aspect-square surface-secondary rounded-t-xl overflow-hidden">
          {imageError || !mainImage ? (
            <ProductImagePlaceholder className="w-full h-full" />
          ) : (
            <div className="relative w-full h-full">
              {imageLoading && <LoadingSkeleton className="absolute inset-0" />}
              <OptimizedImage
                src={mainImage}
                alt={product.name}
                fill
                priority={priority}
                className={`object-cover transition-opacity duration-300 ${
                  imageLoading ? "opacity-0" : "opacity-100"
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
          )}
        </div>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {productImages.length > 1 && (
            <Badge className="bg-black/70 text-white hover:bg-black/80 backdrop-blur-sm shadow-sm border-0">
              +{productImages.length - 1} fotos
            </Badge>
          )}
        </div>

        {product.onSale && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-rose-600 text-white border-0 shadow-md font-bold hover:bg-rose-700">
              <TrendingUp className="h-3 w-3 mr-1" />
              OFERTA
            </Badge>
          </div>
        )}

        <div className="absolute top-12 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          {onView && (
            <Button
              size="sm"
              variant="outline"
              className="surface backdrop-blur-sm shadow-lg border-theme"
              onClick={() => onView(product.id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3 flex flex-col flex-1">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base leading-tight line-clamp-2 flex-1 text-base-primary group-hover:text-pink-600 transition-colors">
              {product.name}
            </h3>
          </div>
          {product.categories && (
            <Badge variant="outline" className="text-xs max-w-[140px] truncate">
              {product.categories.name}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          {sortedSizes && sortedSizes.length > 0 && (
            <div className="w-full">
              <span className="text-xs muted mb-1 block">Talles:</span>
              <DynamicTags
                items={sortedSizes}
                className="h-auto"
                itemClassName="text-[10px] px-1.5 py-0.5 border rounded-sm whitespace-nowrap bg-surface"
              />
            </div>
          )}

          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs muted">Colores:</span>
              <div className="flex gap-1">
                {product.colors.map((color, index) => {
                  const matchedColor = COMMON_COLORS.find(
                    (c) =>
                      c.name.toLowerCase() === color.toLowerCase() ||
                      color.toLowerCase().includes(c.name.toLowerCase())
                  );
                  const bgStyle = matchedColor ? matchedColor.hex : color;
                  return (
                    <div
                      key={`color-${index}`}
                      className="w-4 h-4 rounded-full border border-theme shadow-sm relative"
                      style={{ backgroundColor: bgStyle }}
                      title={color}
                    >
                      {(bgStyle.toLowerCase() === "#ffffff" ||
                        bgStyle.toLowerCase() === "white") && (
                        <div className="absolute inset-0 rounded-full border border-neutral-200" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-2">
            <InlineStockEditor
              productId={product.id}
              stock={effectiveStock}
              onUpdateStock={onUpdateStock}
            />
          </div>
        </div>

        <div className="pt-2 border-t border-theme mt-auto">
          <PriceBadge
            price={product.price}
            salePrice={product.salePrice}
            onSale={product.onSale}
          />
        </div>

        <div className="flex gap-2 flex-wrap mt-auto">
          {onToggleActive && (
            <Button
              size="sm"
              variant={product.isActive !== false ? "outline" : "primary"}
              className="flex-1 min-w-[3rem]"
              onClick={() =>
                onToggleActive(product.id, !(product.isActive !== false))
              }
              leftIcon={<Power className="h-4 w-4" />}
              title={
                product.isActive !== false
                  ? "Desactivar producto"
                  : "Activar producto"
              }
            >
              <span className="hidden sm:inline">
                {product.isActive !== false ? "Desactivar" : "Activar"}
              </span>
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="flex-1 min-w-[3rem]"
            onClick={() => onEdit(product.id)}
            leftIcon={<Edit className="h-4 w-4" />}
          >
            <span className="hidden sm:inline">Editar</span>
          </Button>
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 min-w-[2.5rem]"
              onClick={() => onDelete(product.id)}
              leftIcon={<Trash2 className="h-4 w-4" />}
              title="Eliminar producto"
            >
              {""}
            </Button>
          )}
        </div>
      </div>

      {product.isActive === false && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none z-10 rounded-xl">
          <span className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
            DESACTIVADO
          </span>
        </div>
      )}
    </div>
  );
}
