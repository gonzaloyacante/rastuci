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

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  // const [shippingOption, _setShippingOption] = useState<ShippingOption | null>(
  //   null
  // );
  // Redundant state currently unused in simplified flow
  const [customerData, setCustomerData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    identificationType: "DNI",
    identificationNumber: "",
  });

  // Card data state removed: tarjetas no están visibles en el flujo simplificado

  const { items: _items, discount, shippingCost, total } = getOrderSummary();
  const subtotal = getCartTotal(); // Gross subtotal

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

    // En el flujo simplificado sólo se permiten MercadoPago y Efectivo

    setIsProcessing(true);

    try {
      const { items, discount, shippingCost } = getOrderSummary();

      // Preparar items para MercadoPago - USAR PRECIO CON DESCUENTO (salePrice) SI APLICA
      const mpItems = items.map((item) => ({
        title: `${item.product.name} (${item.size} - ${item.color})`,
        quantity: item.quantity,
        unit_price:
          item.product.onSale && item.product.salePrice
            ? item.product.salePrice
            : item.product.price,
        currency_id: "ARS",
        picture_url: Array.isArray(item.product.images)
          ? item.product.images[0]
          : undefined,
        description: item.product.description || undefined,
      }));

      // Preparar datos del cliente
      const customer = {
        name: `${customerData.firstName} ${customerData.lastName}`,
        email: customerData.email,
      };

      // Metadata para el webhook y createFullOrder
      // CRITICAL: Must include detailed address info for the Order First pattern
      const metadata = {
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customerInfo?.phone || "",
        customerAddress: customerInfo?.address || "",
        customerCity: customerInfo?.city || "",
        customerProvince: customerInfo?.province || "",
        customerPostalCode: customerInfo?.postalCode || "",
        shippingAgencyCode: selectedAgency || "", // Store the agency (Puntopick/Andreani/CA ID)
        paymentMethod: selectedPaymentMethod,
        discount: discount,
        shippingCost: shippingCost,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        shippingMethodName: selectedShippingOption?.name, // Pass the explicit name (e.g., "Sucursal Correo Argentino")
      };

      // Crear preferencia en MercadoPago
      const response = await fetch("/api/payments/mercadopago/preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: mpItems,
          customer,
          metadata,
          discount: discount, // Send explicit discount to API
          shippingCost: shippingCost, // Send explicit shipping cost
          shippingMethodName: selectedShippingOption?.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Error creando la preferencia de pago"
        );
      }

      const data = await response.json();

      if (!data.data?.init_point) {
        throw new Error("Respuesta inválida del servidor");
      }

      // Redirigir a MercadoPago
      window.location.href = data.data.init_point;
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
            allowedMethods={[PAYMENT_METHODS.MERCADOPAGO, PAYMENT_METHODS.CASH]}
          />

          {selectedPaymentMethod === PAYMENT_METHODS.CASH && (
            <div className="p-4 surface rounded-lg border border-muted mt-4">
              <h4 className="font-medium mb-2">Pago en efectivo</h4>
              <p className="text-sm muted mb-3">
                Podrás pagar en Rapipago, Pago Fácil y otros centros de pago.
              </p>
              <p className="text-sm muted">
                Te enviaremos las instrucciones por email después de confirmar
                la compra.
              </p>
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
                Procesando pago...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Pagar ${total.toLocaleString("es-AR")}
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-sm muted mt-4">
            <Shield className="w-4 h-4" />
            <span>Pago seguro con MercadoPago</span>
          </div>
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
            discount={discount}
            total={total}
            onEditStep={() => {}}
            agency={selectedAgency}
          />
        </div>
      </div>
    </div>
  );
}
