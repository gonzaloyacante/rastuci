"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";

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

    // Guardar datos de pago en el contexto si es necesario
    // Persistir en contexto
    const methodMap: Record<
      string,
      { id: string; name: string; icon: string; description: string }
    > = {
      mercadopago: {
        id: "mercadopago",
        name: "MercadoPago",
        icon: "wallet",
        description: "Paga con MercadoPago",
      },
      cash: {
        id: "cash",
        name: "Efectivo - Retiro en Local",
        icon: "dollar-sign",
        description: "Retiro y pago en efectivo",
      },
      transfer: {
        id: "transfer",
        name: "Transferencia Bancaria",
        icon: "building",
        description: "Paga por transferencia bancaria",
      },
    };
    const method = methodMap[selectedPaymentMethodLocal];
    if (!method) {
      setError("Método de pago no válido");
      return;
    }
    setSelectedPaymentMethod(method);

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

        {/* Selector de método de pago */}
        <PaymentMethodSelector
          selectedMethod={selectedPaymentMethodLocal}
          onMethodChange={setSelectedPaymentMethodLocal}
          allowedMethods={["mercadopago", "cash", "transfer"]}
        />

        {/* Información de efectivo */}
        {selectedPaymentMethodLocal === "cash" && (
          <div className="mt-6 p-4 surface rounded-lg border border-muted">
            <h4 className="font-medium mb-2">Pago en efectivo</h4>
            <p className="text-sm muted mb-3">
              Pagarás en efectivo cuando retires tu pedido en nuestro local.
            </p>
            <p className="text-sm muted">
              Te confirmaremos la disponibilidad por email o WhatsApp.
            </p>
          </div>
        )}

        {/* Información de transferencia */}
        {selectedPaymentMethodLocal === "transfer" && (
          <div className="mt-6 p-4 surface rounded-lg border border-muted">
            <h4 className="font-medium mb-2">Transferencia Bancaria</h4>
            <p className="text-sm muted mb-3">
              Te enviaremos los datos bancarios por email para que realices la
              transferencia.
            </p>
            <p className="text-sm muted">
              Una vez acreditado el pago, tu pedido será confirmado.
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
