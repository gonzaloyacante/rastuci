"use client";

import { useState } from "react";
import { useCart, PaymentMethod } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import {
  Check,
  CreditCard,
  Wallet,
  DollarSign,
  ChevronRight,
  MapPin,
  Clock,
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

    setSelectedShippingOption,
  } = useCart();

  // Estado de error
  const [error, setError] = useState<string | null>(null);

  // Manejar selección de método de pago
  const handleSelectPayment = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setError(null);

    // Si selecciona efectivo, forzar envío de "pickup"
    if (method.id === "cash" && method.requiresShipping === false) {
      const pickupOption = {
        id: "pickup",
        name: "Retirar en Tienda",
        description: "Sin costo adicional",
        price: 0,
        estimatedDays: "Inmediato",
      };
      setSelectedShippingOption(pickupOption);
    }
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
          <div className="text-error border surface-secondary p-3 rounded-md mb-4">
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
                        : "muted"
                    }`}>
                    {getPaymentIcon(method.icon)}
                  </span>
                  <div>
                    <h3 className="font-semibold text-lg">{method.name}</h3>
                    <p className="muted text-sm">
                      {method.description}
                    </p>
                    {method.id === "cash" && (
                      <div className="mt-2 p-2 badge-warning border rounded text-sm">
                        <p className="text-warning font-medium flex items-center">
                          <MapPin size={16} className="mr-1" />
                          Retiro OBLIGATORIO en nuestro local
                        </p>
                        <p className="text-warning text-xs mt-1">
                          Dirección: [COMPLETAR CON DIRECCIÓN REAL], Buenos Aires
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {selectedPaymentMethod?.id === method.id && (
                  <div className="w-6 h-6 rounded-full text-primary flex items-center justify-center">
                    <Check size={16} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Información adicional según el método seleccionado */}
        {selectedPaymentMethod && (
          <div className="mt-6 p-4 surface-secondary rounded-lg">
            {selectedPaymentMethod.id === "mercadopago" && (
              <div className="space-y-4">
                <h3 className="font-medium flex items-center">
                  <Wallet className="mr-2" size={20} />
                  Pago con MercadoPago
                </h3>
                <p className="text-sm muted">
                  Al finalizar la compra, serás redirigido a MercadoPago para completar 
                  el pago de forma segura. Podrás usar:
                </p>
                <ul className="text-sm muted list-disc list-inside ml-4">
                  <li>Tarjetas de crédito y débito</li>
                  <li>Efectivo en Rapipago/Pago Fácil</li>
                  <li>Transferencia bancaria</li>
                  <li>Dinero en cuenta de MercadoPago</li>
                </ul>
              </div>
            )}

            {selectedPaymentMethod.id === "cash" && (
              <div className="space-y-4">
                <h3 className="font-medium flex items-center">
                  <DollarSign className="mr-2" size={20} />
                  Pago en Efectivo - Retiro en Local
                </h3>
                <div className="surface-secondary border rounded p-3">
                  <div className="flex items-start space-x-2">
                    <Clock className="text-primary mt-0.5" size={16} />
                    <div>
                      <p className="text-primary font-medium text-sm">
                        Horarios de atención:
                      </p>
                      <p className="text-primary text-sm">
                        Lunes a Viernes: 9:00 - 18:00<br />
                        Sábados: 9:00 - 13:00
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm muted">
                  • Pagarás en efectivo al retirar tu pedido<br />
                  • Te confirmaremos por WhatsApp cuando esté listo<br />
                  • No hay costo de envío
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
            className="text-primary hover:bg-opacity-90">
            Continuar
            <ChevronRight className="ml-2" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}