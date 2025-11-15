"use client";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useCart } from "@/context/CartContext";
import { logger } from "@/lib/logger";
import { CreditCard, Loader2, Lock, Shield } from "lucide-react";
import { useState } from "react";
import { CustomerForm } from "./CustomerForm";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import {
  ShippingCostCalculator,
  type ShippingOption,
} from "./ShippingCostCalculator";

interface CheckoutFormProps {
  onPaymentSuccess?: (paymentId: string) => void;
  onPaymentError?: (error: string) => void;
}

export function CheckoutForm({
  onPaymentSuccess: _onPaymentSuccess,
  onPaymentError,
}: CheckoutFormProps) {
  const { cartItems, getCartTotal, clearCart: _clearCart } = useCart();
  const { show } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [shippingOption, setShippingOption] = useState<ShippingOption | null>(
    null
  );
  const [customerData, setCustomerData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    identificationType: "DNI",
    identificationNumber: "",
  });

  // Card data state removed: tarjetas no están visibles en el flujo simplificado

  const subtotal = getCartTotal();
  const shippingCost = shippingOption?.cost || 0;
  const total = subtotal + shippingCost;

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
      // Preparar items para MercadoPago
      const items = cartItems.map((item) => ({
        title: `${item.product.name} (${item.size} - ${item.color})`,
        quantity: item.quantity,
        unit_price: item.product.price,
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

      // Metadata para el webhook
      const metadata = {
        customerName: customer.name,
        customerEmail: customer.email,
        paymentMethod: selectedPaymentMethod,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
      };

      // Crear preferencia en MercadoPago
      const response = await fetch("/api/payments/mercadopago/preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          customer,
          metadata,
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
            <h2 className="text-2xl font-bold mb-2">Finalizar compra</h2>
            <p className="muted">Completa tus datos para procesar el pago</p>
          </div>

          {/* Datos del cliente */}
          <CustomerForm data={customerData} onChange={setCustomerData} />

          {/* Calculadora de envío */}
          <ShippingCostCalculator
            onShippingChange={setShippingOption}
            className="border border-muted rounded-lg p-4"
          />

          {/* Método de pago (solo MercadoPago y Efectivo) */}
          <PaymentMethodSelector
            selectedMethod={selectedPaymentMethod}
            onMethodChange={setSelectedPaymentMethod}
            allowedMethods={["mercadopago", "cash"]}
          />

          {/* Nota: el formulario de tarjeta se mantiene en el repo pero no se muestra en el flujo simplificado */}

          {/* Información de efectivo */}
          {selectedPaymentMethod === "cash" && (
            <div className="p-4 surface rounded-lg border border-muted">
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

          {/* Botón de pago */}
          <Button
            onClick={handlePayment}
            disabled={isProcessing || !selectedPaymentMethod}
            className="w-full h-12 text-lg font-medium"
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

          {/* Seguridad */}
          <div className="flex items-center justify-center gap-2 text-sm muted">
            <Shield className="w-4 h-4" />
            <span>Pago seguro con MercadoPago</span>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="lg:sticky lg:top-6">
          <div className="surface rounded-lg border border-muted p-6">
            <h3 className="text-lg font-semibold mb-4">Resumen del pedido</h3>

            <div className="space-y-3 mb-4">
              {cartItems.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}-${item.color}`}
                  className="flex justify-between"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.product.name}</p>
                    <p className="text-xs muted">
                      Talle: {item.size} • Color: {item.color} • Cant:{" "}
                      {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    $
                    {(item.product.price * item.quantity).toLocaleString(
                      "es-AR"
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-muted pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString("es-AR")}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                {shippingOption ? (
                  <div className="text-right">
                    <div
                      className={
                        shippingOption.cost === 0
                          ? "text-success font-medium"
                          : ""
                      }
                    >
                      {shippingOption.cost === 0
                        ? "Gratis"
                        : `$${shippingOption.cost.toLocaleString("es-AR")}`}
                    </div>
                    <div className="text-xs text-muted">
                      {shippingOption.description}
                    </div>
                  </div>
                ) : (
                  <span className="text-muted">Calcular envío</span>
                )}
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-muted pt-2">
                <span>Total</span>
                <span>${total.toLocaleString("es-AR")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
