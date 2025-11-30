"use client";

import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { formatPriceARS } from "@/utils/formatters";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Tag,
  Truck,
  X,
} from "lucide-react";
import { useState } from "react";
// import { OrderSummaryCard } from "@/components/checkout/OrderSummaryCard";
// import { PaymentProcessor } from "@/components/checkout/PaymentProcessor";

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
    if (!couponCode.trim()) {
      return;
    }

    setCouponLoading(true);
    setCouponError(null);

    try {
      const success = await applyCoupon(couponCode);
      if (success) {
        setCouponCode("");
      } else {
        setCouponError("Cupón inválido o expirado");
      }
    } catch {
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
      <div className="surface p-4 md:p-6 rounded-lg shadow-sm border border-muted">
        <h2 className="text-2xl font-bold mb-4 md:mb-6 text-primary">
          Revisar Pedido
        </h2>

        {/* Mensaje de error */}
        {error && (
          <div className="surface border border-error text-error p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Detalles del pedido */}
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
              Detalles del Pedido
            </h3>

            {/* Productos */}
            <div className="space-y-3 mb-5 md:mb-6">
              {cartItems.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}-${item.color}`}
                  className="flex items-center justify-between p-2.5 md:p-3 surface border border-muted rounded-lg"
                >
                  <div className="flex items-center space-x-2.5 md:space-x-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 surface border border-muted rounded" />
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm muted">
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
            <div className="mb-5 md:mb-6">
              <h4 className="font-medium mb-2">Cupón de Descuento</h4>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 surface border border-muted rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Tag className="text-primary" size={16} />
                    <span className="font-medium">{appliedCoupon.code}</span>
                    <span className="text-sm text-primary">
                      -{appliedCoupon.discount}%
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-error hover:text-error"
                  >
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
                    className="flex-1 px-3 py-2 surface text-primary placeholder:muted border border-muted rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    size="sm"
                  >
                    {couponLoading ? "Aplicando..." : "Aplicar"}
                  </Button>
                </div>
              )}
              {couponError && (
                <p className="text-error text-sm mt-1">{couponError}</p>
              )}
            </div>
          </div>

          {/* Resumen */}
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
              Resumen
            </h3>

            {/* Información del cliente */}
            <div className="surface border border-muted p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-2">Información de Contacto</h4>
              <p className="text-sm">{customerInfo?.name}</p>
              <p className="text-sm">{customerInfo?.email}</p>
              <p className="text-sm">{customerInfo?.phone}</p>
            </div>

            {/* Envío */}
            {selectedShippingOption && (
              <div className="surface border border-muted p-4 rounded-lg mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Truck size={16} className="text-primary" />
                  <h4 className="font-medium">Envío</h4>
                </div>
                <p className="text-sm">{selectedShippingOption.name}</p>
                <p className="text-sm muted">
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
              <div className="surface border border-muted p-4 rounded-lg mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  {/* Icono sensible según método */}
                  {selectedPaymentMethod.id === "mercadopago" ? (
                    <CreditCard size={16} className="text-primary" />
                  ) : (
                    <Tag size={16} className="text-primary" />
                  )}
                  <h4 className="font-medium">Pago</h4>
                </div>
                <p className="text-sm">{selectedPaymentMethod.name}</p>
              </div>
            )}

            {/* Facturación */}
            {selectedBillingOption && (
              <div className="surface border border-muted p-4 rounded-lg mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText size={16} className="text-primary" />
                  <h4 className="font-medium">Facturación</h4>
                </div>
                <p className="text-sm">{selectedBillingOption.name}</p>
              </div>
            )}

            {/* Totales */}
            <div className="border-t border-muted pt-4">
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
                  <div className="flex justify-between text-primary">
                    <span>Descuento</span>
                    <span>-{formatPriceARS(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t border-muted pt-2">
                  <span>Total</span>
                  <span>{formatPriceARS(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-between mt-6 md:mt-8">
          <Button
            onClick={onBack}
            variant="outline"
            leftIcon={<ChevronLeft size={16} />}
          >
            Volver
          </Button>
          <Button
            onClick={onPlaceOrder}
            disabled={isSubmitting}
            className="btn-hero relative overflow-hidden"
            leftIcon={
              !isSubmitting ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              ) : undefined
            }
            rightIcon={!isSubmitting ? <ChevronRight size={16} /> : undefined}
            loading={isSubmitting}
          >
            {isSubmitting
              ? selectedPaymentMethod?.id === "mercadopago"
                ? "Procesando con MercadoPago..."
                : "Procesando pedido..."
              : selectedPaymentMethod?.id === "mercadopago"
                ? "Pagar con MercadoPago"
                : "Finalizar compra (Pago en efectivo y retiro)"}
          </Button>
        </div>
      </div>
    </div>
  );
}
