"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import {
  ChevronLeft,
  ShoppingBag,
  User,
  Truck,
  CreditCard,
  FileText,
  Tag,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import Image from "next/image";

interface ReviewStepProps {
  onPlaceOrder: () => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
  error: string | null;
}

export default function ReviewStep({
  onPlaceOrder,
  onBack,
  isSubmitting,
  error,
}: ReviewStepProps) {
  const {
    cartItems,
    customerInfo,
    selectedShippingOption,
    selectedPaymentMethod,
    selectedBillingOption,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getOrderSummary,
  } = useCart();

  // Estado local
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applyCouponLoading, setApplyCouponLoading] = useState(false);

  // Obtener el resumen del pedido
  const orderSummary = getOrderSummary();

  // Manejar aplicación de cupón
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Ingresa un código de cupón");
      return;
    }

    setApplyCouponLoading(true);
    setCouponError(null);

    try {
      const success = await applyCoupon(couponCode);
      if (!success) {
        setCouponError("Cupón inválido o expirado");
      }
    } catch (error) {
      console.error("Error al aplicar cupón:", error);
      setCouponError("Ocurrió un error al aplicar el cupón");
    } finally {
      setApplyCouponLoading(false);
    }
  };

  // Manejar eliminación de cupón
  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponCode("");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Resumen de la compra e información */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del cliente */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <User size={20} className="text-[#E91E63]" />
                <h3 className="font-semibold text-lg">Información Personal</h3>
              </div>
            </div>
            {customerInfo && (
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-medium text-gray-800">{customerInfo.name}</p>
                <p>{customerInfo.email}</p>
                <p>{customerInfo.phone}</p>
                <p>{customerInfo.address}</p>
                <p>
                  {customerInfo.city}, {customerInfo.province},{" "}
                  {customerInfo.postalCode}
                </p>
                {customerInfo.notes && <p>Notas: {customerInfo.notes}</p>}
              </div>
            )}
          </div>

          {/* Información de envío */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Truck size={20} className="text-[#E91E63]" />
                <h3 className="font-semibold text-lg">Método de Envío</h3>
              </div>
            </div>
            {selectedShippingOption && (
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-medium text-gray-800">
                  {selectedShippingOption.name}
                </p>
                <p>{selectedShippingOption.description}</p>
                <p>Tiempo estimado: {selectedShippingOption.estimatedDays}</p>
                <p className="font-medium text-gray-800">
                  {selectedShippingOption.price === 0
                    ? "Gratis"
                    : `$${(selectedShippingOption.price / 100).toFixed(2)}`}
                </p>
              </div>
            )}
          </div>

          {/* Información de pago */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <CreditCard size={20} className="text-[#E91E63]" />
                <h3 className="font-semibold text-lg">Método de Pago</h3>
              </div>
            </div>
            {selectedPaymentMethod && (
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-medium text-gray-800">
                  {selectedPaymentMethod.name}
                </p>
                <p>{selectedPaymentMethod.description}</p>
              </div>
            )}
          </div>

          {/* Información de facturación */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-[#E91E63]" />
                <h3 className="font-semibold text-lg">Facturación</h3>
              </div>
            </div>
            {selectedBillingOption && (
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-medium text-gray-800">
                  {selectedBillingOption.name}
                </p>
                {selectedBillingOption.requiresDocument &&
                  customerInfo?.documentType &&
                  customerInfo?.documentNumber && (
                    <p>
                      {customerInfo.documentType}: {customerInfo.documentNumber}
                    </p>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
            <h2 className="text-xl font-bold mb-6">Resumen del Pedido</h2>

            {/* Lista de productos */}
            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
              {cartItems.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}-${item.color}`}
                  className="flex gap-3">
                  <div className="relative w-16 h-16 flex-shrink-0">
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
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#E91E63] rounded-full flex items-center justify-center text-white text-xs">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium text-sm">{item.product.name}</p>
                    <p className="text-xs text-gray-500">
                      Talla: {item.size}, Color: {item.color}
                    </p>
                    <p className="font-bold text-sm text-[#E91E63]">
                      ${(item.product.price / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Cupón de descuento */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Tag size={16} className="text-[#E91E63]" />
                <h3 className="font-medium">Cupón de descuento</h3>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 p-2 rounded-md border border-green-200">
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-green-600" />
                    <span className="text-sm font-medium">
                      {appliedCoupon.code} ({appliedCoupon.discount}% descuento)
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-red-600 hover:text-red-800">
                    Quitar
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Código de cupón"
                      className="flex-grow p-2 text-sm border border-gray-300 rounded-md"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={applyCouponLoading}
                      className="bg-gray-800 text-white hover:bg-gray-700 text-sm py-1">
                      {applyCouponLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        "Aplicar"
                      )}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-red-500 text-xs mt-1">{couponError}</p>
                  )}
                </>
              )}
            </div>

            {/* Totales */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${(orderSummary.subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Envío</span>
                <span>
                  {orderSummary.shippingCost === 0
                    ? "Gratis"
                    : `$${(orderSummary.shippingCost / 100).toFixed(2)}`}
                </span>
              </div>
              {orderSummary.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento</span>
                  <span>-${(orderSummary.discount / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>${(orderSummary.total / 100).toFixed(2)}</span>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Botones */}
            <div className="mt-6 space-y-3">
              <Button
                onClick={onPlaceOrder}
                disabled={isSubmitting}
                className="w-full bg-[#E91E63] text-white hover:bg-[#C2185B] h-12 text-base">
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin mr-2" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} className="mr-2" />
                    Confirmar Compra
                  </>
                )}
              </Button>
              <Button
                onClick={onBack}
                disabled={isSubmitting}
                className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300">
                <ChevronLeft size={16} className="mr-2" />
                Volver
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
