"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import QuantityButton from "@/components/ui/QuantityButton";
import EmptyState from "@/components/ui/EmptyState";

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
    <div
      className="bg-white text-[#333333] min-h-screen flex flex-col"
      style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Header />

      <main className="flex-grow max-w-[1200px] mx-auto py-8 px-6 w-full">
        <h1
          className="text-3xl font-bold text-[#333333] mb-8"
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
                  className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm">
                  <div className="relative w-24 h-24 mr-4">
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
                    <p className="text-sm text-[#666666]">
                      Color: {item.color}
                    </p>
                    <p className="text-sm text-[#666666]">Talla: {item.size}</p>
                    <p className="text-lg font-bold text-[#E91E63] mt-1">
                      ${(item.product.price / 100).toFixed(2)}
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
                    className="ml-6 text-red-500 hover:text-red-700 transition cursor-pointer">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm sticky top-24">
                <h2
                  className="text-2xl font-bold mb-6"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Resumen del Pedido
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${(total / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span className="text-green-600">Gratis</span>
                  </div>
                  <div className="border-t border-gray-200 my-4"></div>
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span>${(total / 100).toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  className="w-full mt-6 bg-[#E91E63] text-white hover:bg-[#C2185B] h-12 text-lg"
                  onClick={() => router.push("/checkout")}>
                  Proceder al Pago
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
