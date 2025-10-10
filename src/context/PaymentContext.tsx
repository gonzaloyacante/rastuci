"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  requiresShipping: boolean; // Nueva propiedad
}

interface PaymentContextType {
  availablePaymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  setSelectedPaymentMethod: (method: PaymentMethod | null) => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
};

interface PaymentProviderProps {
  children: ReactNode;
}

export const PaymentProvider = ({ children }: PaymentProviderProps) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

  // Métodos de pago actualizados para Argentina
  const availablePaymentMethods: PaymentMethod[] = [
    {
      id: "mercadopago",
      name: "MercadoPago",
      icon: "wallet",
      description: "Tarjetas, transferencias y más",
      requiresShipping: true,
    },
    {
      id: "cash",
      name: "Efectivo - Retiro en Local",
      icon: "dollar-sign",
      description: "Retiro en nuestro local de Buenos Aires",
      requiresShipping: false, // Sin envío, solo retiro
    },
  ];

  return (
    <PaymentContext.Provider
      value={{
        availablePaymentMethods,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};