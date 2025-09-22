"use client";

import Image from "next/image";
// import Link from "next/link"; // TODO: Implement when needed
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Trash2, ShoppingCart } from "lucide-react";
// import { ArrowLeft } from "lucide-react"; // TODO: Implement when needed
import QuantityButton from "@/components/ui/QuantityButton";
import EmptyState from "@/components/ui/EmptyState";
import { formatPriceARS } from "@/utils/formatters";

export default function CartPage() {
  const router = useRouter();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getItemCount,
  } = useCart();

  const total = getCartTotal();
  const itemCount = getItemCount();

  return (
    <div className="surface text-primary min-h-screen flex flex-col">
      <main className="flex-grow max-w-[1200px] mx-auto py-8 px-6 w-full">
        <h1
          className="text-3xl font-bold text-primary mb-8"
          style={{ fontFamily: "'Montserrat', sans-serif" }}>
          Mi Carrito ({itemCount} {itemCount === 1 ? "item" : "items"})
        </h1>

        {cartItems.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Tu carrito está vacío"
            description="Parece que todavía no has añadido nada. ¡Explora nuestros productos!"
            actionText="Ir a la tienda"
            actionHref="/productos"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}-${item.color}`}
                  className="flex items-center surface p-4 rounded-lg shadow-sm border border-muted">
                  <div
                    className="relative w-24 h-24 mr-4"
                    style={{ position: "relative" }}>
                    <Image
                      src={
                        Array.isArray(item.product.images)
                          ? item.product.images[0]
                          : "/placeholder.png"
                      }
                      alt={item.product.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg">
                      {item.product.name}
                    </h3>
                    <p className="text-sm muted">
                      Color: {item.color}
                    </p>
                    <p className="text-sm muted">Talla: {item.size}</p>
                    <p className="text-lg font-bold text-primary mt-1">
                      {formatPriceARS(item.product.price)}
                    </p>
                  </div>
                  <QuantityButton
                    quantity={item.quantity}
                    onIncrement={() =>
                      updateQuantity(
                        item.product.id,
                        item.size,
                        item.color,
                        item.quantity + 1
                      )
                    }
                    onDecrement={() =>
                      updateQuantity(
                        item.product.id,
                        item.size,
                        item.color,
                        item.quantity - 1
                      )
                    }
                  />
                  <button
                    onClick={() =>
                      removeFromCart(item.product.id, item.size, item.color)
                    }
                    className="ml-6 text-error hover:text-error transition">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="surface p-6 rounded-lg shadow-sm sticky top-24 border border-muted">
                <h2
                  className="text-2xl font-bold mb-6"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Resumen del Pedido
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPriceARS(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span className="text-success">Gratis</span>
                  </div>
                  <div className="border-t border-muted my-4"></div>
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span>{formatPriceARS(total)}</span>
                  </div>
                </div>
                <Button
                  variant="hero"
                  size="xl"
                  fullWidth
                  className="mt-6"
                  onClick={() => router.push("/checkout")}>
                  Proceder al Pago
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
