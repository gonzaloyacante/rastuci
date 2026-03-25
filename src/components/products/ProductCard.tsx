"use client";

import React from "react";

import { AdminProductCard } from "@/components/products/AdminProductCard";
import { PublicProductCard } from "@/components/products/PublicProductCard";
import { Product } from "@/types";

// ============================================================================
// Tipos
// ============================================================================

interface ProductCardBaseProps {
  product: Product;
  priority?: boolean;
}

interface PublicProductCardProps extends ProductCardBaseProps {
  variant?: "public" | "grid" | "list";
  layout?: "grid" | "list";
}

interface AdminProductCardProps extends ProductCardBaseProps {
  variant: "admin";
  layout?: "card" | "row";
  onEdit: (id: string) => void;
  onView?: (id: string) => void;
  onToggleActive?: (id: string, isActive: boolean) => void;
  onDelete?: (id: string) => void;
  onUpdateStock?: (id: string, stock: number) => Promise<void>;
}

export type ProductCardProps = PublicProductCardProps | AdminProductCardProps;

// ============================================================================
// ProductCard — router a variantes especializadas
// ============================================================================

const ProductCard = React.memo((props: ProductCardProps) => {
  const { product, priority = false } = props;

  if (props.variant === "admin") {
    const { layout, onEdit, onView, onToggleActive, onDelete, onUpdateStock } =
      props as AdminProductCardProps;
    return (
      <AdminProductCard
        product={product}
        priority={priority}
        layout={layout === "row" ? "row" : "grid"}
        onEdit={onEdit}
        onView={onView}
        onToggleActive={onToggleActive}
        onDelete={onDelete}
        onUpdateStock={onUpdateStock}
      />
    );
  }

  const { layout, variant } = props as PublicProductCardProps;
  const resolvedLayout: "grid" | "list" =
    layout || (variant === "list" ? "list" : "grid");

  return (
    <PublicProductCard
      product={product}
      priority={priority}
      layout={resolvedLayout}
    />
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
// Named export for backwards compatibility with stories and legacy imports
export { ProductCard };
