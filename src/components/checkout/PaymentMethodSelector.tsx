"use client";

import React from "react";
// Image import removed: logos not shown when limiting payment methods
import { CreditCard, Banknote, Building2 } from "lucide-react";

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  allowedMethods?: string[];
}

const paymentMethods = [
  {
    id: "credit_card",
    name: "Tarjeta de crédito",
    description: "Visa, Mastercard, American Express",
    icon: CreditCard,
    popular: true,
  },
  {
    id: "debit_card",
    name: "Tarjeta de débito",
    description: "Débito inmediato",
    icon: CreditCard,
    popular: false,
  },
  {
    id: "cash",
    name: "Efectivo",
    description: "Rapipago, Pago Fácil",
    icon: Banknote,
    popular: false,
  },
  {
    id: "bank_transfer",
    name: "Transferencia",
    description: "Transferencia bancaria",
    icon: Building2,
    popular: false,
  },
];

export function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  allowedMethods,
}: PaymentMethodSelectorProps) {
  const methodsToShow = allowedMethods
    ? paymentMethods.filter((m) => allowedMethods.includes(m.id))
    : paymentMethods;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Método de pago</h3>

      <div className="space-y-3">
        {methodsToShow.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <button
              key={method.id}
              onClick={() => onMethodChange(method.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? "border-primary surface-primary text-primary"
                  : "border-muted surface hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 ${isSelected ? "text-primary" : "muted"}`}
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{method.name}</span>
                    {method.popular && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary text-white">
                        Popular
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm ${isSelected ? "text-primary/80" : "muted"}`}
                  >
                    {method.description}
                  </p>
                </div>

                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    isSelected ? "border-primary bg-primary" : "border-muted"
                  }`}
                >
                  {isSelected && (
                    <div className="w-full h-full rounded-full bg-white scale-50" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
