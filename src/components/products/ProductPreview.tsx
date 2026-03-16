"use client";

import {
  CheckCircle,
  Info,
  List,
  Palette,
  Ruler,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { getColorHex } from "@/utils/colors";
import { formatPriceARS } from "@/utils/formatters";

import { PlaceholderImage } from "./ProductFormComponents";

// ==============================================================================
// TYPES
// ==============================================================================
export interface ProductPreviewProps {
  images: string[];
  name?: string;
  category?: string;
  description?: string;
  price: number;
  salePrice: number | null;
  discountPercentage?: number | null;
  onSale?: boolean;
  stock: number;
  features: string[];
  sizes: string[];
  colors: string[];
  colorImages?: Record<string, string[]>;
}

// ==============================================================================
// COMPONENT
// ==============================================================================
export default function ProductPreview({
  images,
  name,
  category,
  description,
  price,
  salePrice,
  discountPercentage,
  onSale,
  stock,
  features,
  sizes,
  colors,
  colorImages,
}: ProductPreviewProps) {
  const [selectedPreviewColor, setSelectedPreviewColor] = useState<
    string | null
  >(null);

  const allColorImages = useMemo(() => {
    return Object.values(colorImages || {}).flat();
  }, [colorImages]);

  const displayImages = useMemo(() => {
    if (selectedPreviewColor && colorImages?.[selectedPreviewColor]?.length) {
      return colorImages[selectedPreviewColor];
    }
    if (images && images.length > 0) return images;
    if (allColorImages.length > 0) return allColorImages;
    return [];
  }, [selectedPreviewColor, colorImages, images, allColorImages]);

  const mainImageSrc = displayImages.length > 0 ? displayImages[0] : null;

  return (
    <div className="bg-surface rounded-lg p-4 sm:p-6 border">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Galería de Imágenes */}
        <div className="space-y-4">
          {displayImages.length > 0 ? (
            <>
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden border-2 border-muted">
                <Image
                  key={mainImageSrc || "main"}
                  src={mainImageSrc!}
                  alt="Vista previa"
                  width={500}
                  height={500}
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              {displayImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {displayImages.slice(0, 4).map((img, idx) => (
                    <div
                      key={`thumb-${idx}`}
                      className="aspect-square bg-muted rounded overflow-hidden border border-muted hover:border-primary transition-colors"
                    >
                      <Image
                        src={img}
                        alt={`Miniatura ${idx + 1}`}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <PlaceholderImage className="aspect-square" />
          )}
        </div>

        {/* Información del Producto */}
        <div className="space-y-5">
          <div>
            <p className="text-xs sm:text-sm uppercase tracking-wide text-muted-foreground mb-2">
              Categoría: {category || "No seleccionada"}
            </p>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">
              {name || "Nombre del producto"}
            </h3>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            {stock > 0 ? (
              <span className="text-sm font-semibold text-success flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                En Stock ({stock})
              </span>
            ) : (
              <span className="text-sm font-semibold muted flex items-center gap-1">
                Sin Stock
              </span>
            )}
            {onSale && (
              <span className="text-sm font-bold text-error flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                OFERTA
              </span>
            )}
          </div>

          {/* Precio */}
          <div className="space-y-2 py-4 border-y border-muted">
            {discountPercentage && discountPercentage > 0 && salePrice ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-success">
                    {formatPriceARS(Number(salePrice))}
                  </span>
                  <span className="bg-error text-white px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold">
                    -{discountPercentage}% OFF
                  </span>
                </div>
                <span className="text-base sm:text-lg text-muted-foreground line-through">
                  {formatPriceARS(price)}
                </span>
                <p className="text-sm text-success font-medium">
                  ¡Ahorrás {formatPriceARS(price - Number(salePrice))}!
                </p>
              </div>
            ) : (
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">
                {formatPriceARS(price)}
              </span>
            )}
          </div>

          <p className="text-primary/90 leading-relaxed">
            {description || "Descripción del producto aparecerá aquí..."}
          </p>

          {features.length > 0 && (
            <div className="bg-surface-secondary p-4 rounded-lg">
              <p className="font-semibold mb-2 flex items-center gap-2">
                <List className="h-4 w-4" />
                Características
              </p>
              <ul className="space-y-1.5">
                {features.map((feature, index) => (
                  <li
                    key={`feat-${index}`}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="text-success mt-1">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sizes.length > 0 && (
            <div>
              <p className="font-semibold mb-2 flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Talles Disponibles
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size, index) => (
                  <span
                    key={`size-${index}`}
                    className="px-4 py-2 border-2 border-muted rounded-lg text-sm font-medium hover:border-primary transition-colors"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div>
              <p className="font-semibold mb-2 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Colores Disponibles
              </p>
              <div className="flex flex-wrap gap-3">
                {colors.map((color, index) => {
                  const colorImg = colorImages?.[color]?.[0];
                  return (
                    <div
                      key={`color-${index}`}
                      className={`relative group w-10 h-10 rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${selectedPreviewColor === color ? "border-primary ring-2 ring-primary/30" : "border-muted hover:border-primary"}`}
                      title={`${color} (Click para ver)`}
                      onClick={() => setSelectedPreviewColor(color)}
                    >
                      {colorImg ? (
                        <Image
                          src={colorImg}
                          alt={color}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: getColorHex(color) }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-sm text-muted-foreground flex items-start gap-2">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <span>
            Esta es una vista previa de cómo se verá el producto en la tienda.
            Verifica que toda la información sea correcta antes de guardar.
          </span>
        </p>
      </div>
    </div>
  );
}
