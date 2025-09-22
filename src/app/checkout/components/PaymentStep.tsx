"use client";

import { useState } from "react";
import { useCart, PaymentMethod } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import {
  Check,
  CreditCard,
  Wallet,
  Building,
  DollarSign,
  ChevronRight,
} from "lucide-react";

interface PaymentStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function PaymentStep({ onNext }: PaymentStepProps) {
  const {
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    availablePaymentMethods,
  } = useCart();

  // Estado de error
  const [error, setError] = useState<string | null>(null);

  // Manejar selección de método de pago
  const handleSelectPayment = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setError(null);
  };

  // Manejar continuar al siguiente paso
  const handleContinue = () => {
    if (selectedPaymentMethod) {
      onNext();
    } else {
      setError("Por favor, selecciona un método de pago para continuar");
    }
  };

  // Devolver el ícono correcto según el tipo de pago
  const getPaymentIcon = (icon: string) => {
    switch (icon) {
      case "credit-card":
        return <CreditCard size={24} />;
      case "wallet":
        return <Wallet size={24} />;
      case "bank":
        return <Building size={24} />;
      case "dollar-sign":
        return <DollarSign size={24} />;
      default:
        return <CreditCard size={24} />;
    }
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

        {/* Opciones de pago */}
        <div className="space-y-4 mt-6">
          {availablePaymentMethods.map((method) => (
            <div
              key={method.id}
              className={`border rounded-lg p-4 transition-all ${
                selectedPaymentMethod?.id === method.id
                  ? "border-primary surface"
                  : "border-muted surface hover:border-primary"
              }`}
              onClick={() => handleSelectPayment(method)}>
              <div className="flex justify-between items-center">
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1 ${
                      selectedPaymentMethod?.id === method.id
                        ? "text-primary"
                        : "muted"
                    }`}>
                    {getPaymentIcon(method.icon)}
                  </span>
                  <div>
                    <h3 className="font-semibold text-lg">{method.name}</h3>
                    <p className="muted text-sm">
                      {method.description}
                    </p>
                  </div>
                </div>
                {selectedPaymentMethod?.id === method.id && (
                  <div className="w-6 h-6 rounded-full btn-hero flex items-center justify-center">
                    <Check size={16} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Información adicional según el método seleccionado */}
        {selectedPaymentMethod && (
          <div className="mt-6 p-4 surface border border-muted rounded-lg">
            {selectedPaymentMethod.id === "credit" && (
              <div className="space-y-4">
                <h3 className="font-medium">Información de la Tarjeta</h3>
                <p className="text-sm muted">
                  Al finalizar la compra, serás redirigido a una pasarela de
                  pago segura para completar la transacción.
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="h-8 w-12 surface border border-muted rounded flex items-center justify-center text-primary text-xs font-bold">
                    VISA
                  </div>
                  <div className="h-8 w-12 surface border border-muted rounded flex items-center justify-center text-primary text-xs font-bold">
                    MC
                  </div>
                  <div className="h-8 w-12 surface border border-muted rounded flex items-center justify-center text-primary text-xs font-bold">
                    AMEX
                  </div>
                </div>
              </div>
            )}

            {selectedPaymentMethod.id === "mercadopago" && (
              <div className="space-y-4">
                <h3 className="font-medium">Pago con MercadoPago</h3>
                <p className="text-sm muted">
                  Al finalizar la compra, serás redirigido a MercadoPago para
                  completar el pago de forma segura.
                </p>
              </div>
            )}

            {selectedPaymentMethod.id === "transfer" && (
              <div className="space-y-4">
                <h3 className="font-medium">Transferencia Bancaria</h3>
                <p className="text-sm muted">
                  Recibirás los datos bancarios por email al finalizar la
                  compra. Tu pedido se procesará una vez confirmado el pago.
                </p>
              </div>
            )}

            {selectedPaymentMethod.id === "cash" && (
              <div className="space-y-4">
                <h3 className="font-medium">Pago en Efectivo</h3>
                <p className="text-sm muted">
                  Pagarás al recibir tu pedido. Asegúrate de tener el importe
                  exacto disponible.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Botón para continuar */}
        <div className="flex justify-end mt-8">
          <Button
            onClick={handleContinue}
            disabled={!selectedPaymentMethod}
            className="btn-hero">
            Continuar
            <ChevronRight className="ml-2" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
