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
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Método de Pago</h2>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Opciones de pago */}
        <div className="space-y-4 mt-6">
          {availablePaymentMethods.map((method) => (
            <div
              key={method.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedPaymentMethod?.id === method.id
                  ? "border-[#E91E63] bg-pink-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleSelectPayment(method)}>
              <div className="flex justify-between items-center">
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1 ${
                      selectedPaymentMethod?.id === method.id
                        ? "text-[#E91E63]"
                        : "text-gray-500"
                    }`}>
                    {getPaymentIcon(method.icon)}
                  </span>
                  <div>
                    <h3 className="font-semibold text-lg">{method.name}</h3>
                    <p className="text-gray-600 text-sm">
                      {method.description}
                    </p>
                  </div>
                </div>
                {selectedPaymentMethod?.id === method.id && (
                  <div className="w-6 h-6 rounded-full bg-[#E91E63] flex items-center justify-center">
                    <Check size={16} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Información adicional según el método seleccionado */}
        {selectedPaymentMethod && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            {selectedPaymentMethod.id === "credit" && (
              <div className="space-y-4">
                <h3 className="font-medium">Información de la Tarjeta</h3>
                <p className="text-sm text-gray-600">
                  Al finalizar la compra, serás redirigido a una pasarela de
                  pago segura para completar la transacción.
                </p>
                <div className="flex flex-wrap gap-2">
                  <img src="/img/visa.svg" alt="Visa" className="h-8" />
                  <img
                    src="/img/mastercard.svg"
                    alt="Mastercard"
                    className="h-8"
                  />
                  <img
                    src="/img/amex.svg"
                    alt="American Express"
                    className="h-8"
                  />
                </div>
              </div>
            )}

            {selectedPaymentMethod.id === "mercadopago" && (
              <div className="space-y-4">
                <h3 className="font-medium">Pago con MercadoPago</h3>
                <p className="text-sm text-gray-600">
                  Al finalizar la compra, serás redirigido a MercadoPago para
                  completar el pago de forma segura.
                </p>
              </div>
            )}

            {selectedPaymentMethod.id === "transfer" && (
              <div className="space-y-4">
                <h3 className="font-medium">Transferencia Bancaria</h3>
                <p className="text-sm text-gray-600">
                  Recibirás los datos bancarios por email al finalizar la
                  compra. Tu pedido se procesará una vez confirmado el pago.
                </p>
              </div>
            )}

            {selectedPaymentMethod.id === "cash" && (
              <div className="space-y-4">
                <h3 className="font-medium">Pago en Efectivo</h3>
                <p className="text-sm text-gray-600">
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
            className="bg-[#E91E63] text-white hover:bg-[#C2185B]">
            Continuar
            <ChevronRight className="ml-2" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
