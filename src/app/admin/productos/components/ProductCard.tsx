"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Product } from "@/types";
import { formatCurrency } from "@/utils/formatters";
import {
  AlertTriangle,
  CheckCircle,
  Edit,
  Eye,
  ImageIcon,
  Package,
  Star,
  Trash2,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView?: (id: string) => void;
  viewMode?: "grid" | "list";
}

const ProductImagePlaceholder = ({ className }: { className?: string }) => (
  <div
    className={`bg-gradient-to-br from-muted/50 to-muted rounded-lg flex items-center justify-center ${className || "w-full h-48"}`}
  >
    <div className="text-center opacity-60">
      <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm text-muted-foreground font-medium">Sin imagen</p>
    </div>
  </div>
);

const StockBadge = ({ stock }: { stock: number }) => {
  if (stock === 0) {
    return (
      <Badge variant="error" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Sin stock
      </Badge>
    );
  }

  if (stock <= 5) {
    return (
      <Badge variant="warning" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Stock bajo ({stock})
      </Badge>
    );
  }

  if (stock <= 10) {
    return (
      <Badge variant="info" className="flex items-center gap-1">
        <Package className="h-3 w-3" />
        Stock medio ({stock})
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="flex items-center gap-1 border-success text-success"
    >
      <CheckCircle className="h-3 w-3" />
      Stock bueno ({stock})
    </Badge>
  );
};

const PriceBadge = ({
  price,
  salePrice,
  onSale,
}: {
  price: number;
  salePrice?: number | null;
  onSale?: boolean;
}) => {
  const hasDiscount = onSale && salePrice && salePrice < price;
  const discountPercentage = hasDiscount
    ? Math.round(((price - salePrice!) / price) * 100)
    : 0;

  return (
    <div className="min-h-[48px] flex flex-col justify-center">
      {hasDiscount ? (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-success">
              {formatCurrency(salePrice!)}
            </span>
            {discountPercentage > 0 && (
              <Badge variant="error" className="text-xs">
                -{discountPercentage}%
              </Badge>
            )}
          </div>
          <span className="text-sm text-muted-foreground line-through">
            {formatCurrency(price)}
          </span>
        </div>
      ) : (
        <span className="text-lg font-bold">{formatCurrency(price)}</span>
      )}
    </div>
  );
};

export default function ProductCard({
  product,
  onEdit,
  onDelete,
  onView,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const productImages = Array.isArray(product.images)
    ? product.images
    : typeof product.images === "string"
      ? JSON.parse(product.images)
      : [];

  const mainImage = productImages[0];

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  return (
    <div className="group bg-surface border border-muted rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
      {/* Image Section */}
      <div className="relative">
        <div className="aspect-square bg-muted rounded-t-xl overflow-hidden">
          {imageError || !mainImage ? (
            <ProductImagePlaceholder className="w-full h-full" />
          ) : (
            <div className="relative w-full h-full">
              {imageLoading && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              )}
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className={`object-cover transition-opacity duration-300 ${
                  imageLoading ? "opacity-0" : "opacity-100"
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}
        </div>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.onSale && (
            <div className="bg-black/90 text-white px-2.5 py-1 rounded-md shadow-lg backdrop-blur-sm border border-white/10 flex items-center gap-1 text-xs font-semibold">
              <TrendingUp className="h-3 w-3" />
              OFERTA
            </div>
          )}
          {productImages.length > 1 && (
            <Badge variant="info" className="shadow-lg">
              +{productImages.length - 1} fotos
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onView && (
            <Button
              size="sm"
              variant="outline"
              className="bg-surface/90 backdrop-blur-sm border-muted shadow-lg"
              onClick={() => onView(product.id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Header with Rating */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base leading-tight line-clamp-2 flex-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            {product.rating &&
              product.reviewCount &&
              product.reviewCount > 0 && (
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  <span className="text-sm font-medium">
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({product.reviewCount})
                  </span>
                </div>
              )}
          </div>

          {product.category && (
            <Badge variant="outline" className="text-xs">
              {product.category.name}
            </Badge>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-2">
          {/* Sizes - Show all */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground mb-1 block">
                Talles:
              </span>
              <div className="flex flex-wrap gap-1">
                {product.sizes.map((size, index) => (
                  <Badge
                    key={`size-${index}`}
                    variant="outline"
                    className="text-xs px-2 py-0.5"
                  >
                    {size}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Colores:</span>
              <div className="flex gap-1">
                {product.colors.map((color, index) => (
                  <div
                    key={`color-${index}`}
                    className="w-4 h-4 rounded-full border border-muted"
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          <StockBadge stock={product.stock} />
        </div>

        {/* Price */}
        <div className="pt-2 border-t border-muted">
          <PriceBadge
            price={product.price}
            salePrice={product.salePrice}
            onSale={product.onSale}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onEdit(product.id)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(product.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
