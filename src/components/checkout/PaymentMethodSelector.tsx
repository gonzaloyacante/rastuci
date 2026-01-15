"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Banknote, Building2, Wallet } from "lucide-react";

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  allowedMethods?: string[];
  discounts?: Record<string, number>;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiresShipping?: boolean;
}

const getIconComponent = (iconName: string) => {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    "credit-card": CreditCard,
    wallet: Wallet,
    "dollar-sign": Banknote,
    banknote: Banknote,
    building: Building2,
  };
  return icons[iconName] || Wallet;
};

export function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  allowedMethods,
  discounts,
}: PaymentMethodSelectorProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    fetch("/api/settings/payment-methods")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setPaymentMethods(data.data);
        }
      })
      .catch((err) => console.error("Error loading payment methods:", err));
  }, []);

  const methodsToShow = allowedMethods
    ? paymentMethods.filter((m) => allowedMethods.includes(m.id))
    : paymentMethods;

  if (methodsToShow.length === 0) {
    return <div className="text-muted">Cargando métodos de pago...</div>;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Método de pago</h3>

      <div className="space-y-3">
        {methodsToShow.map((method) => {
          const Icon = getIconComponent(method.icon);
          const isSelected = selectedMethod === method.id;
          const discount = discounts?.[method.id];
          const hasDiscount = typeof discount === "number" && discount > 0;

          return (
            <button
              key={method.id}
              onClick={() => onMethodChange(method.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left relative overflow-hidden ${
                isSelected
                  ? "border-primary surface-primary text-primary"
                  : "border-muted surface hover:border-primary/50"
              }`}
            >
              {hasDiscount && (
                <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg z-10 shadow-sm">
                  {discount}% OFF
                </div>
              )}
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 ${isSelected ? "text-primary" : "muted"}`}
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{method.name}</span>
                    {hasDiscount && (
                      <span className="text-xs text-green-600 font-bold ml-2">
                        -{discount}%
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
