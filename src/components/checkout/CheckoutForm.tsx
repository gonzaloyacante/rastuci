"use client";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useCart } from "@/context/CartContext";
import { PAYMENT_METHODS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { CreditCard, Loader2, Lock, Shield } from "lucide-react";
import { useState } from "react";
import { CustomerForm } from "./CustomerForm";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { OrderSummaryCard } from "./OrderSummaryCard";
import { useSettings } from "@/hooks/useSettings";
import { StoreSettings } from "@/lib/validation/store";
// import {
//   ShippingCostCalculator,
//   type ShippingOption,
// } from "./ShippingCostCalculator";

// type ShippingOption = {
//   name: string;
//   cost: number;
//   provider?: string;
//   description?: string;
// };

interface CheckoutFormProps {
  onPaymentSuccess?: (paymentId: string) => void;
  onPaymentError?: (error: string) => void;
}

export function CheckoutForm({
  onPaymentSuccess: _onPaymentSuccess,
  onPaymentError,
}: CheckoutFormProps) {
  const {
    cartItems,
    getCartTotal,
    clearCart: _clearCart,
    getOrderSummary,
    selectedShippingOption,
    selectedAgency,
    customerInfo,
  } = useCart();
  const { show } = useToast();

  const { settings } = useSettings<StoreSettings>("store");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");

  const [customerData, setCustomerData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    identificationType: "DNI",
    identificationNumber: "",
  });

  // Calculate Dynamic Discount from Settings
  const getDynamicDiscount = () => {
    if (!settings?.payments) return 0;
    if (selectedPaymentMethod === PAYMENT_METHODS.CASH)
      return settings.payments.cashDiscount || 0;
    if (selectedPaymentMethod === PAYMENT_METHODS.TRANSFER)
      return settings.payments.transferDiscount || 0;
    if (selectedPaymentMethod === PAYMENT_METHODS.MERCADOPAGO)
      return settings.payments.mpDiscount || 0;
    return 0;
  };

  const dynamicDiscountPercent = getDynamicDiscount();
  const { shippingCost } = getOrderSummary();
  const subtotal = getCartTotal();
  // Calculate discount amount
  const discountAmount = (subtotal * dynamicDiscountPercent) / 100;

  // Recalculate Total
  // Note: Shipping Cost logic might change if Cash (Pickup Only)
  // For now we assume shippingCost comes from selectedShippingOption in context.
  // Ideally, if Cash -> Force Pickup -> ShippingCost = 0.
  // But context controls shippingCost.
  // We'll pass the updated values to OrderSummaryCard and API.

  const currentTotal = subtotal + shippingCost - discountAmount;

  // Discounts Map for Badge - always provide values
  const discountsMap: Record<string, number> = {
    [PAYMENT_METHODS.CASH]: settings?.payments?.cashDiscount ?? 0,
    [PAYMENT_METHODS.TRANSFER]: settings?.payments?.transferDiscount ?? 0,
    [PAYMENT_METHODS.MERCADOPAGO]: settings?.payments?.mpDiscount ?? 0,
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      show({
        type: "error",
        title: "Error",
        message: "Selecciona un método de pago",
      });
      return;
    }

    if (
      !customerData.email ||
      !customerData.firstName ||
      !customerData.lastName
    ) {
      show({
        type: "error",
        title: "Error",
        message: "Completa todos los datos personales",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // const { items } = getOrderSummary(); // Items not needed here if handled by backend/context
      // const { items } = getOrderSummary();

      // Preparar items para MercadoPago
      // Fix: Don't apply discount here to unit price if we send general discount field?
      // Checkout API handles it. We just send cart items.

      const customer = {
        name: `${customerData.firstName} ${customerData.lastName}`,
        email: customerData.email,
        phone: customerData.identificationNumber, // Using ID field as phone proxy if needed, or update form
        address: customerInfo?.address || customerData.identificationNumber, // Legacy field mapping check?
        // Note: CustomerForm should ideally have Phone/Address fields if we require them.
        // Assuming CustomerForm updates customerInfo in context or we specifically ask for them.
        city: customerInfo?.city || "",
        province: customerInfo?.province || "",
        postalCode: customerInfo?.postalCode || "",
      };

      // Call Checkout API
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price, // API will re-fetch for security, this is informational
            name: item.product.name,
            size: item.size,
            color: item.color,
          })),
          customer,
          shippingMethod: selectedShippingOption,
          paymentMethod: selectedPaymentMethod,
          shippingAgency: selectedAgency ? { code: selectedAgency } : undefined,
          orderData: {
            total: currentTotal,
            subtotal: subtotal,
            shippingCost: shippingCost,
            discount: discountAmount, // Send dynamic discount
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || "Error al procesar el pedido"
        );
      }

      const data = await response.json();

      if (data.success) {
        if (
          data.paymentMethod === PAYMENT_METHODS.MERCADOPAGO &&
          data.initPoint
        ) {
          window.location.href = data.initPoint;
        } else if (data.orderId) {
          // Redirect to success page or show success
          window.location.href = `/checkout/success?orderId=${data.orderId}&method=${data.paymentMethod}`;
        } else {
          // Fallback
          show({
            type: "success",
            title: "Pedido Creado",
            message: data.message,
          });
          // Clear cart?
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error procesando el pago";
      logger.error("Error en checkout", { error });

      show({
        type: "error",
        title: "Error de pago",
        message: errorMessage,
      });

      onPaymentError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-12 h-12 muted mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Carrito vacío</h3>
        <p className="muted">Agrega productos para continuar con el pago</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Formulario de pago */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Revisar Pedido</h2>
            <p className="muted">Confirma los detalles antes de pagar</p>
          </div>

          {/* Datos del cliente */}
          <CustomerForm data={customerData} onChange={setCustomerData} />

          {/* Método de pago */}
          <PaymentMethodSelector
            selectedMethod={selectedPaymentMethod}
            onMethodChange={setSelectedPaymentMethod}
            allowedMethods={[
              PAYMENT_METHODS.MERCADOPAGO,
              PAYMENT_METHODS.CASH,
              PAYMENT_METHODS.TRANSFER,
            ]}
            discounts={discountsMap}
          />

          {/* Messages based on Selection */}
          {selectedPaymentMethod === PAYMENT_METHODS.CASH && (
            <div className="p-4 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200 mt-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                💵 Pago en Efectivo (Solo Retiro)
              </h4>
              <p className="text-sm mb-3">
                Tu pedido quedará reservado por{" "}
                <strong>
                  {settings?.payments?.cashExpirationHours || 72} horas
                </strong>
                .
              </p>
              <p className="text-sm">
                Te enviaremos los detalles para retirar por el local.
              </p>
            </div>
          )}

          {selectedPaymentMethod === PAYMENT_METHODS.TRANSFER && (
            <div className="p-4 bg-blue-50 text-blue-900 rounded-lg border border-blue-200 mt-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                🏦 Transferencia Bancaria
              </h4>
              <p className="text-sm mb-3">
                Tendrás{" "}
                <strong>
                  {settings?.payments?.transferExpirationHours || 48} horas
                </strong>{" "}
                para enviar el comprobante.
              </p>
              <p className="text-sm">
                Al confirmar, recibirás los datos bancarios por email.
              </p>
            </div>
          )}

          {selectedPaymentMethod === PAYMENT_METHODS.MERCADOPAGO && (
            <div className="p-4 surface rounded-lg border border-muted mt-4">
              <div className="flex items-center justify-center gap-2 text-sm muted">
                <Shield className="w-4 h-4" />
                <span>
                  Te redirigiremos a Mercado Pago para completar la compra de
                  forma segura.
                </span>
              </div>
            </div>
          )}

          <Button
            onClick={handlePayment}
            disabled={isProcessing || !selectedPaymentMethod}
            className="w-full h-12 text-lg font-medium mt-6"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Confirmar ${currentTotal.toLocaleString("es-AR")}
              </>
            )}
          </Button>
        </div>

        {/* Resumen del pedido */}
        <div className="lg:sticky lg:top-6">
          <OrderSummaryCard
            items={cartItems.map((item) => ({
              id: item.product.id,
              name: item.product.name,
              price: item.product.price,
              image: Array.isArray(item.product.images)
                ? item.product.images[0]
                : undefined,
              quantity: item.quantity,
              size: item.size,
              color: item.color,
              onSale: item.product.onSale,
              salePrice: item.product.salePrice || undefined,
            }))}
            customerInfo={{
              name:
                `${customerData.firstName} ${customerData.lastName}`.trim() ||
                customerInfo?.name ||
                "",
              email: customerData.email || customerInfo?.email || "",
              phone: customerInfo?.phone || "",
              address: customerInfo?.address || "",
              city: customerInfo?.city || "",
              province: customerInfo?.province || "",
              postalCode: customerInfo?.postalCode || "",
            }}
            shippingOption={{
              id: selectedShippingOption?.id || "",
              name: selectedShippingOption?.name || "Envío por definir",
              description: selectedShippingOption?.description || "",
              price: selectedShippingOption?.price || 0,
              estimatedDays: selectedShippingOption?.estimatedDays || "",
            }}
            paymentMethod={{
              id: selectedPaymentMethod,
              name:
                selectedPaymentMethod === PAYMENT_METHODS.MERCADOPAGO
                  ? "Mercado Pago"
                  : selectedPaymentMethod === PAYMENT_METHODS.CASH
                    ? "Efectivo"
                    : "No seleccionado",
              description: selectedPaymentMethod ? "Procesamiento seguro" : "",
            }}
            subtotal={subtotal}
            shippingCost={shippingCost}
            discount={discountAmount}
            total={currentTotal}
            onEditStep={() => {}}
            agency={selectedAgency}
          />
        </div>
      </div>
    </div>
  );
}
