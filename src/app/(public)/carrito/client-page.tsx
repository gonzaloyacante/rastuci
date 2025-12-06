"use client";

import { Button } from "@/components/ui/Button";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import QuantityButton from "@/components/ui/QuantityButton";
import { useCart } from "@/context/CartContext";
import { useShippingSettings } from "@/hooks/useShippingSettings";
import { logger } from "@/lib/logger";
import { formatPriceARS } from "@/utils/formatters";
import { AlertCircle, Check, ShoppingCart, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    images: string | string[];
    stock: number;
  };
  quantity: number;
  size: string;
  color: string;
}

const CartItemComponent = ({
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
  const [isRemoving, setIsRemoving] = useState(false);
  const [pendingQuantity, setPendingQuantity] = useState(item.quantity);

  const handleRemove = useCallback(async () => {
    setIsRemoving(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300)); // Animación
      onRemove(item.product.id, item.size, item.color);
      toast.success(`${item.product.name} eliminado del carrito`);
    } catch (error) {
      logger.error("Error removing item:", { error: error });
      toast.error("Error al eliminar el producto");
      setIsRemoving(false);
    }
  }, [item, onRemove]);

  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      if (newQuantity < 1) {
        handleRemove();
        return;
      }

      if (newQuantity > item.product.stock) {
        toast.error(`Stock máximo disponible: ${item.product.stock}`);
        return;
      }

      setPendingQuantity(newQuantity);

      // Debounce la actualización
      const timeoutId = setTimeout(() => {
        onUpdateQuantity(item.product.id, item.size, item.color, newQuantity);
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [item, onUpdateQuantity, handleRemove]
  );

  const imageUrl = useMemo(() => {
    return Array.isArray(item.product.images) && item.product.images.length > 0
      ? item.product.images[0]
      : "/placeholder.png";
  }, [item.product.images]);

  const isLowStock = item.product.stock < 5;
  // Usar salePrice si el producto está en oferta, sino usar price normal
  const effectivePrice = item.product.onSale && item.product.salePrice 
    ? item.product.salePrice 
    : item.product.price;
  const itemTotal = effectivePrice * (pendingQuantity || item.quantity);

  return (
    <div
      className={`
        surface p-3 sm:p-4 rounded-lg shadow-sm border border-muted
        transition-all duration-300 hover:shadow-md
        ${isRemoving ? "opacity-50 scale-95" : ""}
      `}
    >
      {/* Layout mobile: más compacto */}
      <div className="flex gap-3 sm:gap-4">
        {/* Imagen */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0">
          <Image
            src={imageUrl}
            alt={item.product.name}
            fill
            sizes="(max-width: 640px) 80px, 96px"
            className="object-cover rounded-md"
          />
          {isLowStock && (
            <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-warning text-warning-foreground rounded-full p-0.5 sm:p-1">
              <AlertCircle size={10} className="sm:w-3 sm:h-3" />
            </div>
          )}
        </div>

        {/* Info del producto */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3
              className="font-semibold text-sm sm:text-lg line-clamp-2 sm:truncate leading-tight"
              title={item.product.name}
            >
              {item.product.name}
            </h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-sm muted mt-1">
              <span className="px-1.5 py-0.5 surface rounded text-[11px] sm:text-xs">
                {item.color}
              </span>
              <span className="px-1.5 py-0.5 surface rounded text-[11px] sm:text-xs">
                Talle {item.size}
              </span>
            </div>
          </div>

          {/* Precio - visible en mobile debajo del nombre */}
          <div className="mt-2 sm:hidden">
            <p className="text-base font-bold text-primary">
              {formatPriceARS(effectivePrice)}
            </p>
            {pendingQuantity > 1 && (
              <p className="text-xs muted">
                Total: {formatPriceARS(itemTotal)}
              </p>
            )}
          </div>
        </div>

        {/* Precio desktop */}
        <div className="hidden sm:block text-right shrink-0">
          <p className="text-lg font-bold text-primary">
            {formatPriceARS(effectivePrice)}
          </p>
          {pendingQuantity > 1 && (
            <p className="text-sm muted">Total: {formatPriceARS(itemTotal)}</p>
          )}
        </div>
      </div>

      {/* Controles: cantidad y eliminar */}
      <div className="mt-3 pt-3 border-t border-muted">
        {/* Stock warning mobile */}
        {isLowStock && (
          <p className="text-[10px] sm:text-xs text-warning flex items-center gap-1 mb-2">
            <AlertCircle size={10} className="sm:w-3 sm:h-3" />
            Stock limitado: {item.product.stock} disponibles
          </p>
        )}

        {/* Controles */}
        <div className="flex items-center justify-between gap-2">
          <QuantityButton
            quantity={pendingQuantity}
            onIncrement={() => handleQuantityChange(pendingQuantity + 1)}
            onDecrement={() => handleQuantityChange(pendingQuantity - 1)}
            disabled={isRemoving}
          />

          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="text-error hover:text-error transition-colors p-2 rounded-lg hover:bg-error/10 disabled:opacity-50 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium"
            title="Eliminar producto"
          >
            {isRemoving ? (
              <X size={16} className="animate-spin sm:w-5 sm:h-5" />
            ) : (
              <Trash2 size={16} className="sm:w-5 sm:h-5" />
            )}
            <span className="hidden sm:inline">Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderSummary = ({
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
  shippingSettings: {
    freeShipping: boolean;
    freeShippingLabel: string;
    freeShippingDescription: string;
  };
}) => {
  const shipping = shippingSettings.freeShipping ? 0 : 0; // Si no es gratis, calcular costo
  const finalTotal = total + shipping;

  return (
    <div className="surface p-4 sm:p-6 rounded-lg shadow-sm border border-muted lg:sticky lg:top-24">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 font-montserrat">
        Resumen del Pedido
      </h2>

      <div className="space-y-3 mb-4 sm:mb-6">
        <div className="flex justify-between text-sm sm:text-base">
          <span className="text-content-secondary">Productos ({itemCount})</span>
          <span className="font-semibold">{formatPriceARS(total)}</span>
        </div>
        <div className="flex justify-between text-sm sm:text-base">
          <span className="text-content-secondary">Envío</span>
          {shippingSettings.freeShipping ? (
            <span className="text-success flex items-center gap-1 font-semibold">
              <Check size={14} className="sm:w-4 sm:h-4" />
              Gratis
            </span>
          ) : (
            <span className="font-semibold">{formatPriceARS(shipping)}</span>
          )}
        </div>
        <div className="border-t border-muted my-3"></div>
        <div className="flex justify-between font-bold text-xl sm:text-2xl">
          <span>Total</span>
          <span className="text-primary">{formatPriceARS(finalTotal)}</span>
        </div>
      </div>

      <Button
        variant="hero"
        size="xl"
        fullWidth
        onClick={onCheckout}
        disabled={isLoading || itemCount === 0}
        loading={isLoading}
        className="mb-4 text-base sm:text-lg py-3 sm:py-4"
      >
        PROCEDER AL PAGO
      </Button>

      <div className="text-xs sm:text-sm muted text-center space-y-1">
        {shippingSettings.freeShipping && (
          <p>{shippingSettings.freeShippingDescription}</p>
        )}
        <p className="flex items-center justify-center gap-1">
          <span>🔒</span> Pago seguro con MercadoPago
        </p>
      </div>
    </div>
  );
};

export default function CartPageClient() {
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
      // Validar stock antes del checkout
      const outOfStockItems = cartItems.filter(
        (item) => item.quantity > item.product.stock
      );

      if (outOfStockItems.length > 0) {
        toast.error("Algunos productos no tienen stock suficiente");
        setIsCheckingOut(false);
        return;
      }

      router.push("/checkout");
    } catch (error) {
      logger.error("Error during checkout:", { error: error });
      toast.error("Error al proceder al checkout");
      setIsCheckingOut(false);
    }
  }, [cartItems, router]);

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
      toast.success("Carrito vaciado");
    }
  }, [clearCart, confirm]);

  if (cartItems.length === 0) {
    return (
      <div className="surface text-primary min-h-screen flex flex-col">
        <main className="grow max-w-[1200px] mx-auto py-6 sm:py-8 px-4 sm:px-6 w-full">
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
      <main className="grow max-w-[1200px] mx-auto py-6 sm:py-8 px-4 sm:px-6 w-full">
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
