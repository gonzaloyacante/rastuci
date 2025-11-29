"use client";

import { Button } from "@/components/ui/Button";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import QuantityButton from "@/components/ui/QuantityButton";
import { useCart } from "@/context/CartContext";
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
  const itemTotal = item.product.price * (pendingQuantity || item.quantity);

  return (
    <div
      className={`
        flex items-center surface p-4 rounded-lg shadow-sm border border-muted
        transition-all duration-300 hover:shadow-md
        ${isRemoving ? "opacity-50 scale-95" : ""}
      `}
    >
      <div className="relative w-24 h-24 mr-4 shrink-0">
        <Image
          src={imageUrl}
          alt={item.product.name}
          fill
          className="object-cover rounded-md"
          priority
        />
        {isLowStock && (
          <div className="absolute -top-2 -right-2 bg-warning text-warning-foreground rounded-full p-1">
            <AlertCircle size={12} />
          </div>
        )}
      </div>

      <div className="grow min-w-0">
        <h3
          className="font-semibold text-lg truncate"
          title={item.product.name}
        >
          {item.product.name}
        </h3>
        <div className="flex flex-wrap gap-2 text-sm muted mb-2">
          <span>Color: {item.color}</span>
          <span>•</span>
          <span>Talla: {item.size}</span>
        </div>
        <p className="text-lg font-bold text-primary">
          {formatPriceARS(item.product.price)}
        </p>
        {pendingQuantity > 1 && (
          <p className="text-sm muted">Total: {formatPriceARS(itemTotal)}</p>
        )}
        {isLowStock && (
          <p className="text-xs text-warning flex items-center gap-1 mt-1">
            <AlertCircle size={12} />
            Stock limitado: {item.product.stock} disponibles
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <QuantityButton
          quantity={pendingQuantity}
          onIncrement={() => handleQuantityChange(pendingQuantity + 1)}
          onDecrement={() => handleQuantityChange(pendingQuantity - 1)}
          disabled={isRemoving}
        />

        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className="text-error hover:text-error transition-colors p-2 rounded-full hover:bg-error/10 disabled:opacity-50"
          title="Eliminar producto"
        >
          {isRemoving ? (
            <X size={20} className="animate-spin" />
          ) : (
            <Trash2 size={20} />
          )}
        </button>
      </div>
    </div>
  );
};

const OrderSummary = ({
  total,
  itemCount,
  onCheckout,
  isLoading,
}: {
  total: number;
  itemCount: number;
  onCheckout: () => void;
  isLoading: boolean;
}) => {
  const shipping = 0; // Envío gratis
  const finalTotal = total + shipping;

  return (
    <div className="surface p-6 rounded-lg shadow-sm sticky top-24 border border-muted">
      <h2 className="text-2xl font-bold mb-6 font-montserrat">
        Resumen del Pedido
      </h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span>Productos ({itemCount})</span>
          <span>{formatPriceARS(total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Envío</span>
          <span className="text-success flex items-center gap-1">
            <Check size={14} />
            Gratis
          </span>
        </div>
        <div className="border-t border-muted my-4"></div>
        <div className="flex justify-between font-bold text-xl">
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
        className="mb-4"
      >
        Proceder al Pago
      </Button>

      <div className="text-xs muted text-center space-y-1">
        <p>Envío gratis a todo el país</p>
        <p>Pago seguro con MercadoPago</p>
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
        <main className="grow max-w-[1200px] mx-auto py-8 px-6 w-full">
          <h1 className="text-3xl font-bold text-primary mb-8 font-montserrat">
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
      <main className="grow max-w-[1200px] mx-auto py-8 px-6 w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary font-montserrat">
            Mi Carrito ({itemCount} {itemCount === 1 ? "item" : "items"})
          </h1>

          {cartItems.length > 0 && (
            <Button
              variant="ghost"
              onClick={handleClearCart}
              className="text-muted hover:text-error"
            >
              Vaciar Carrito
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
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
          <div className="lg:col-span-1">
            <OrderSummary
              total={total}
              itemCount={itemCount}
              onCheckout={handleCheckout}
              isLoading={isCheckingOut}
            />
          </div>
        </div>
      </main>
      {ConfirmDialog}
    </div>
  );
}
