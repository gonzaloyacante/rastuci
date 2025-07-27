"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import {
  Check,
  CreditCard,
  Truck,
  FileText,
  ChevronLeft,
  ChevronRight,
  Tag,
  X,
} from "lucide-react";
import { formatPriceARS } from "@/utils/formatters";

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
    getCartTotal,
    selectedShippingOption,
    selectedPaymentMethod,
    selectedBillingOption,
    customerInfo,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotal = getCartTotal();
  const shippingCost = selectedShippingOption?.price || 0;
  const discount = appliedCoupon
    ? (subtotal * appliedCoupon.discount) / 100
    : 0;
  const total = subtotal + shippingCost - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError(null);

    try {
      const success = await applyCoupon(couponCode);
      if (success) {
        setCouponCode("");
      } else {
        setCouponError("Cupón inválido o expirado");
      }
    } catch (error) {
      setCouponError("Error al aplicar el cupón");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Revisar Pedido</h2>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Detalles del pedido */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Detalles del Pedido</h3>

            {/* Productos */}
            <div className="space-y-3 mb-6">
              {cartItems.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}-${item.color}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded"></div>
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.size} - {item.color} x {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold">
                    {formatPriceARS(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Cupón */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">Cupón de Descuento</h4>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Tag className="text-green-600" size={16} />
                    <span className="font-medium">{appliedCoupon.code}</span>
                    <span className="text-sm text-green-600">
                      -{appliedCoupon.discount}%
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-red-500 hover:text-red-700">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Código de cupón"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    size="sm">
                    {couponLoading ? "Aplicando..." : "Aplicar"}
                  </Button>
                </div>
              )}
              {couponError && (
                <p className="text-red-600 text-sm mt-1">{couponError}</p>
              )}
            </div>
          </div>

          {/* Resumen */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resumen</h3>

            {/* Información del cliente */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-2">Información de Contacto</h4>
              <p className="text-sm">{customerInfo?.name}</p>
              <p className="text-sm">{customerInfo?.email}</p>
              <p className="text-sm">{customerInfo?.phone}</p>
            </div>

            {/* Envío */}
            {selectedShippingOption && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Truck size={16} className="text-gray-600" />
                  <h4 className="font-medium">Envío</h4>
                </div>
                <p className="text-sm">{selectedShippingOption.name}</p>
                <p className="text-sm text-gray-600">
                  {selectedShippingOption.description}
                </p>
                <p className="font-semibold mt-1">
                  {selectedShippingOption.price === 0
                    ? "Gratis"
                    : formatPriceARS(selectedShippingOption.price)}
                </p>
              </div>
            )}

            {/* Pago */}
            {selectedPaymentMethod && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CreditCard size={16} className="text-gray-600" />
                  <h4 className="font-medium">Pago</h4>
                </div>
                <p className="text-sm">{selectedPaymentMethod.name}</p>
              </div>
            )}

            {/* Facturación */}
            {selectedBillingOption && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText size={16} className="text-gray-600" />
                  <h4 className="font-medium">Facturación</h4>
                </div>
                <p className="text-sm">{selectedBillingOption.name}</p>
              </div>
            )}

            {/* Totales */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPriceARS(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span>
                    {shippingCost === 0
                      ? "Gratis"
                      : formatPriceARS(shippingCost)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento</span>
                    <span>-{formatPriceARS(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                  <span>Total</span>
                  <span>{formatPriceARS(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-between mt-8">
          <Button onClick={onBack} variant="outline">
            <ChevronLeft className="mr-2" size={16} />
            Volver
          </Button>
          <Button
            onClick={onPlaceOrder}
            disabled={isSubmitting}
            className="bg-[#E91E63] text-white hover:bg-[#C2185B]">
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Procesando...</span>
              </div>
            ) : (
              <>
                <span>Confirmar Pedido</span>
                <ChevronRight className="ml-2" size={16} />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
