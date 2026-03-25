"use client";

import { ShoppingCart, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useCart } from "@/context/CartContext";
import { useShippingSettings } from "@/hooks/useShippingSettings";
import { logger } from "@/lib/logger";

import { CartItemComponent, OrderSummary } from "./cartComponents";
import { computeOutOfStockItems } from "./cartUtils";

export default function CartPageClient() {
  const { show } = useToast();
  const router = useRouter();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getItemCount,
    clearCart,
  } = useCart();
  const { shipping } = useShippingSettings();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const total = useMemo(() => getCartTotal(), [getCartTotal]);
  const itemCount = useMemo(() => getItemCount(), [getItemCount]);

  const handleUpdateQuantity = useCallback(
    (id: string, size: string, color: string, quantity: number) => {
      updateQuantity(id, size, color, quantity);
    },
    [updateQuantity]
  );

  const handleRemoveItem = useCallback(
    (id: string, size: string, color: string) => {
      removeFromCart(id, size, color);
    },
    [removeFromCart]
  );

  const handleCheckout = useCallback(async () => {
    setIsCheckingOut(true);

    try {
      const outOfStockItems = computeOutOfStockItems(cartItems);

      if (outOfStockItems.length > 0) {
        show({
          type: "error",
          message: "Algunos productos no tienen stock suficiente",
        });
        setIsCheckingOut(false);
        return;
      }

      router.push("/finalizar-compra");
    } catch (error) {
      logger.error("Error during checkout:", { error: error });
      show({ type: "error", message: "Error al proceder al checkout" });
      setIsCheckingOut(false);
    }
  }, [cartItems, router, show]);

  const handleClearCart = useCallback(async () => {
    const confirmed = await confirm({
      title: "Vaciar carrito",
      message:
        "¿Estás seguro de que quieres vaciar el carrito? Esta acción no se puede deshacer.",
      confirmText: "Sí, vaciar",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (confirmed) {
      clearCart();
      show({ type: "success", message: "Carrito vaciado" });
    }
  }, [clearCart, confirm, show]);

  if (cartItems.length === 0) {
    return (
      <div className="surface text-primary min-h-screen flex flex-col">
        <main className="grow max-w-300 mx-auto py-6 sm:py-8 px-4 sm:px-6 w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-6 sm:mb-8 font-montserrat">
            Mi Carrito (0 items)
          </h1>

          <EmptyState
            icon={ShoppingCart}
            title="Tu carrito está vacío"
            description="Parece que todavía no has añadido nada. ¡Explora nuestros productos y encuentra algo que te guste!"
            actionText="Explorar Productos"
            actionHref="/productos"
          />
        </main>
      </div>
    );
  }

  return (
    <div className="surface text-primary min-h-screen flex flex-col">
      <main className="grow max-w-300 mx-auto py-6 sm:py-8 px-4 sm:px-6 w-full">
        {/* Header - responsive */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary font-montserrat">
            Mi Carrito <span className="text-muted">({itemCount})</span>
          </h1>

          {cartItems.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCart}
              className="text-error hover:text-error hover:bg-error/10 text-xs sm:text-sm"
            >
              <Trash2 size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline ml-1.5">Vaciar</span>
            </Button>
          )}
        </div>

        {/* Grid responsive */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4 order-2 lg:order-1">
            {cartItems.map((item) => (
              <CartItemComponent
                key={`${item.product.id}-${item.size}-${item.color}`}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <OrderSummary
              total={total}
              itemCount={itemCount}
              onCheckout={handleCheckout}
              isLoading={isCheckingOut}
              shippingSettings={shipping}
            />
          </div>
        </div>
      </main>
      {ConfirmDialog}
    </div>
  );
}
