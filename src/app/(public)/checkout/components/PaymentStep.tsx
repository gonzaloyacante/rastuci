"use client";

import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface PaymentStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function PaymentStep({ onNext, onBack }: PaymentStepProps) {
  // Estados para el formulario de pago
  const { selectedPaymentMethod: ctxSelected, setSelectedPaymentMethod } =
    useCart();

  const [selectedPaymentMethodLocal, setSelectedPaymentMethodLocal] =
    useState<string>(ctxSelected?.id || "");

  const [error, setError] = useState<string | null>(null);

  // Manejar continuar al siguiente paso
  const handleContinue = () => {
    if (!selectedPaymentMethodLocal) {
      setError("Por favor, selecciona un método de pago para continuar");
      return;
    }

    // Solo permitir continuar si se seleccionó MercadoPago o Efectivo
    if (
      !(
        selectedPaymentMethodLocal === "mercadopago" ||
        selectedPaymentMethodLocal === "cash"
      )
    ) {
      setError("Por favor, selecciona MercadoPago o Efectivo para continuar");
      return;
    }

    // Guardar datos de pago en el contexto si es necesario
    // Persistir en contexto
    setSelectedPaymentMethod(
      selectedPaymentMethodLocal === "mercadopago"
        ? {
            id: "mercadopago",
            name: "MercadoPago",
            icon: "wallet",
            description: "Paga con MercadoPago",
          }
        : {
            id: "cash",
            name: "Efectivo - Retiro en Local",
            icon: "dollar-sign",
            description: "Retiro y pago en efectivo",
          }
    );

    onNext();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="surface p-6 rounded-lg shadow-sm border border-muted">
        <h2 className="text-2xl font-bold mb-6 text-primary">Método de Pago</h2>

        {/* Mensaje de error */}
        {error && (
          <div className="surface border border-error text-error p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Selector de método de pago (solo MercadoPago y Efectivo) */}
        <PaymentMethodSelector
          selectedMethod={selectedPaymentMethodLocal}
          onMethodChange={setSelectedPaymentMethodLocal}
          allowedMethods={["mercadopago", "cash"]}
        />

        {/* Información de efectivo */}
        {selectedPaymentMethodLocal === "cash" && (
          <div className="mt-6 p-4 surface rounded-lg border border-muted">
            <h4 className="font-medium mb-2">Pago en efectivo</h4>
            <p className="text-sm muted mb-3">
              Podrás pagar en Rapipago, Pago Fácil y otros centros de pago.
            </p>
            <p className="text-sm muted">
              Te enviaremos las instrucciones por email después de confirmar la
              compra.
            </p>
          </div>
        )}

        {/* Botones de navegación */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="surface text-primary hover:brightness-95"
            leftIcon={<ChevronLeft size={16} />}
          >
            Volver
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedPaymentMethodLocal}
            className="btn-hero"
            rightIcon={<ChevronRight size={16} />}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
