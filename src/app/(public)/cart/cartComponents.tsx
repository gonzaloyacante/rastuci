"use client";

import { AlertCircle, Check, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import QuantityButton from "@/components/ui/QuantityButton";
import { useToast } from "@/components/ui/Toast";
import VacationCard from "@/components/vacation/VacationCard";
import { useVacationSettings } from "@/hooks/useVacationSettings";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { ShippingSettings } from "@/lib/validation/shipping";
import { getColorHex } from "@/utils/colors";
import { formatPriceARS } from "@/utils/formatters";

import {
  CartItem,
  getItemVariantStock,
  isFreeShippingApplicable,
} from "./cartUtils";

// ---------------------------------------------------------------------------
// CartItemComponent
// ---------------------------------------------------------------------------

export const CartItemComponent = ({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (
    id: string,
    size: string,
    color: string,
    quantity: number
  ) => void;
  onRemove: (id: string, size: string, color: string) => void;
}) => {
  const { show } = useToast();
  const [isRemoving, setIsRemoving] = useState(false);
  const [pendingQuantity, setPendingQuantity] = useState(item.quantity);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleRemove = useCallback(async () => {
    setIsRemoving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      onRemove(item.product.id, item.size, item.color);
      show({
        type: "success",
        message: `${item.product.name} eliminado del carrito`,
      });
    } catch (error) {
      logger.error("Error removing item:", { error });
      show({ type: "error", message: "Error al eliminar el producto" });
      setIsRemoving(false);
    }
  }, [item, onRemove, show]);

  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      if (newQuantity < 1) {
        void handleRemove();
        return;
      }
      const variantStock = getItemVariantStock(item);
      if (newQuantity > variantStock) {
        show({
          type: "error",
          message: `Stock máximo disponible: ${variantStock}`,
        });
        return;
      }
      setPendingQuantity(newQuantity);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        onUpdateQuantity(item.product.id, item.size, item.color, newQuantity);
      }, 300);
    },
    [item, onUpdateQuantity, handleRemove, show]
  );

  const imageUrl = useMemo(
    () =>
      Array.isArray(item.product.images) && item.product.images.length > 0
        ? item.product.images[0]
        : PLACEHOLDER_IMAGE,
    [item.product.images]
  );

  const isLowStock = getItemVariantStock(item) < 5;
  const hasSale = !!(
    item.product.onSale && typeof item.product.salePrice === "number"
  );
  const effectivePrice =
    hasSale && (item.product.salePrice as number) > 0
      ? (item.product.salePrice as number)
      : item.product.price;
  const itemTotal = effectivePrice * (pendingQuantity || item.quantity);

  return (
    <div
      className={`surface p-4 sm:p-6 rounded-xl shadow-sm border border-muted transition-all duration-300 hover:shadow-md ${isRemoving ? "opacity-50 scale-95" : ""}`}
    >
      <div className="flex gap-4 sm:gap-6 items-start">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0">
          <Link href={`/productos/${item.product.id}`}>
            <OptimizedImage
              src={imageUrl}
              alt={item.product.name}
              fill
              sizes="(max-width: 640px) 96px, 128px"
              className="object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-muted/50"
            />
          </Link>
          {isLowStock && (
            <div className="absolute -top-2 -right-2 bg-warning text-warning-foreground rounded-full p-1 shadow-sm z-10">
              <AlertCircle size={14} className="sm:w-4 sm:h-4" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between h-full min-h-24 sm:min-h-32">
          <div className="space-y-2">
            <Link
              href={`/productos/${item.product.id}`}
              className="group block"
            >
              <h3
                className="font-bold text-lg sm:text-xl leading-tight group-hover:text-primary/80 transition-colors font-montserrat"
                title={item.product.name}
              >
                {item.product.name}
              </h3>
            </Link>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full border border-muted-foreground/30"
                  style={{ backgroundColor: getColorHex(item.color) }}
                />
                <span className="capitalize">{item.color}</span>
              </div>
              <span className="text-muted-foreground/40">|</span>
              <span className="font-medium">Talle {item.size}</span>
            </div>
          </div>

          <div className="mt-auto pt-2 sm:hidden">
            <div className="flex items-baseline gap-2">
              {hasSale && (
                <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/60">
                  {formatPriceARS(item.product.price)}
                </span>
              )}
              <span className="text-lg font-bold text-primary">
                {formatPriceARS(effectivePrice)}
              </span>
            </div>
            {pendingQuantity > 1 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Subtotal:{" "}
                <span className="font-medium text-foreground">
                  {formatPriceARS(itemTotal)}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-end text-right shrink-0 ml-4">
          <p className="text-xl font-bold text-primary">
            {formatPriceARS(effectivePrice)}
          </p>
          {hasSale && (
            <p className="text-sm text-muted-foreground line-through decoration-muted-foreground/60">
              {formatPriceARS(item.product.price)}
            </p>
          )}
          {pendingQuantity > 1 && (
            <p className="text-sm text-muted-foreground mt-1">
              Subtotal:{" "}
              <span className="font-medium text-foreground">
                {formatPriceARS(itemTotal)}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-muted/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          {isLowStock ? (
            <p className="text-xs text-warning flex items-center gap-1.5 font-medium">
              <AlertCircle size={14} />
              ¡Últimas {getItemVariantStock(item)} unidades!
            </p>
          ) : (
            <span className="hidden sm:block text-xs text-muted-foreground/50">
              Disponible
            </span>
          )}
        </div>
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              Cantidad:
            </span>
            <QuantityButton
              quantity={pendingQuantity}
              onIncrement={() => handleQuantityChange(pendingQuantity + 1)}
              onDecrement={() => handleQuantityChange(pendingQuantity - 1)}
              disabled={isRemoving}
            />
          </div>
          <div className="h-6 w-px bg-muted hidden sm:block"></div>
          <Button
            onClick={handleRemove}
            disabled={isRemoving}
            variant="ghost"
            className="text-muted-foreground hover:text-error hover:bg-error/5 transition-all px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium group h-auto"
            title="Eliminar producto"
          >
            <Trash2
              size={16}
              className="group-hover:text-error transition-colors"
            />
            <span className="group-hover:underline decoration-error/30 underline-offset-2">
              Eliminar
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// OrderSummary — helpers
// ---------------------------------------------------------------------------

function ShippingCostLabel({
  shippingSettings,
  isFreeShipping,
}: {
  shippingSettings: ShippingSettings;
  isFreeShipping: boolean;
}) {
  if (isFreeShipping) {
    return (
      <span className="text-success flex items-center gap-1 font-semibold">
        <Check size={14} className="sm:w-4 sm:h-4" />
        {shippingSettings.freeShippingLabel ?? "Gratis"}
      </span>
    );
  }
  return (
    <span className="text-xs sm:text-sm text-muted-foreground font-medium text-right max-w-[50%]">
      {shippingSettings.shippingCostDescription ??
        "Se calculará en el checkout"}
    </span>
  );
}

function FreeShippingHint({
  shippingSettings,
  isFreeShipping,
  total,
}: {
  shippingSettings: ShippingSettings;
  isFreeShipping: boolean;
  total: number;
}) {
  if (isFreeShipping) return <p>{shippingSettings.freeShippingDescription}</p>;
  const min = shippingSettings.freeShippingMinAmount;
  if (shippingSettings.freeShipping && min && total < min) {
    return (
      <p className="text-orange-600">
        ¡Agregá {formatPriceARS(min - total)} más para envío gratis!
      </p>
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// OrderSummary
// ---------------------------------------------------------------------------

export const OrderSummary = ({
  total,
  itemCount,
  onCheckout,
  isLoading,
  shippingSettings,
}: {
  total: number;
  itemCount: number;
  onCheckout: () => void;
  isLoading: boolean;
  shippingSettings: ShippingSettings;
}) => {
  const { isVacationMode } = useVacationSettings();
  const isFreeShipping = isFreeShippingApplicable(total, shippingSettings);

  return (
    <div className="surface p-4 sm:p-6 rounded-lg shadow-sm border border-muted lg:sticky lg:top-24">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 font-montserrat">
        Resumen del Pedido
      </h2>
      <div className="space-y-3 mb-4 sm:mb-6">
        <div className="flex justify-between text-sm sm:text-base">
          <span className="text-muted-foreground">Productos ({itemCount})</span>
          <span className="font-semibold">{formatPriceARS(total)}</span>
        </div>
        <div className="flex justify-between text-sm sm:text-base">
          <span className="text-muted-foreground">
            {shippingSettings.shippingLabel ?? "Envío"}
          </span>
          <ShippingCostLabel
            shippingSettings={shippingSettings}
            isFreeShipping={isFreeShipping}
          />
        </div>
        <div className="border-t border-muted my-3"></div>
        <div className="flex justify-between font-bold text-xl sm:text-2xl">
          <span>Total</span>
          <span className="text-primary">{formatPriceARS(total)}</span>
        </div>
      </div>

      <Button
        variant="hero"
        size="xl"
        fullWidth
        onClick={onCheckout}
        disabled={isLoading || itemCount === 0 || isVacationMode}
        loading={isLoading}
        className="mb-4 text-base sm:text-lg py-3 sm:py-4 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isVacationMode ? "TIENDA EN PAUSA" : "PROCEDER AL PAGO"}
      </Button>

      {isVacationMode && (
        <div className="mb-4 animate-in fade-in slide-in-from-top-2">
          <VacationCard condensed />
        </div>
      )}

      <div className="text-xs sm:text-sm muted text-center space-y-1">
        <FreeShippingHint
          shippingSettings={shippingSettings}
          isFreeShipping={isFreeShipping}
          total={total}
        />
        <p className="flex items-center justify-center gap-1">
          <span>🔒</span> Pago seguro con MercadoPago
        </p>
      </div>
    </div>
  );
};
