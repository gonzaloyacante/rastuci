"use client";

import React from 'react';
import Image from 'next/image';
import { CreditCard, Banknote, Building2 } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

const paymentMethods = [
  {
    id: 'credit_card',
    name: 'Tarjeta de crédito',
    description: 'Visa, Mastercard, American Express',
    icon: CreditCard,
    popular: true,
  },
  {
    id: 'debit_card',
    name: 'Tarjeta de débito',
    description: 'Débito inmediato',
    icon: CreditCard,
    popular: false,
  },
  {
    id: 'cash',
    name: 'Efectivo',
    description: 'Rapipago, Pago Fácil',
    icon: Banknote,
    popular: false,
  },
  {
    id: 'bank_transfer',
    name: 'Transferencia',
    description: 'Transferencia bancaria',
    icon: Building2,
    popular: false,
  },
];

export function PaymentMethodSelector({ selectedMethod, onMethodChange }: PaymentMethodSelectorProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Método de pago</h3>
      
      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;
          
          return (
            <button
              key={method.id}
              onClick={() => onMethodChange(method.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-primary surface-primary text-primary'
                  : 'border-muted surface hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'muted'}`} />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{method.name}</span>
                    {method.popular && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary text-white">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${isSelected ? 'text-primary/80' : 'muted'}`}>
                    {method.description}
                  </p>
                </div>
                
                <div className={`w-4 h-4 rounded-full border-2 ${
                  isSelected 
                    ? 'border-primary bg-primary' 
                    : 'border-muted'
                }`}>
                  {isSelected && (
                    <div className="w-full h-full rounded-full bg-white scale-50" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Logos de métodos de pago */}
      <div className="mt-4 p-3 surface rounded-lg border border-muted">
        <div className="flex items-center justify-center gap-4 opacity-60">
          <Image 
            src="https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9be0-11ec-aad4-c3381f368aaf-m.svg" 
            alt="Visa" 
            width={40}
            height={24}
            className="h-6 w-auto"
          />
          <Image 
            src="https://http2.mlstatic.com/storage/logos-api-admin/aa2b8f70-5c85-11ec-ae75-df2bef173be2-m.svg" 
            alt="Mastercard" 
            width={40}
            height={24}
            className="h-6 w-auto"
          />
          <Image 
            src="https://http2.mlstatic.com/storage/logos-api-admin/ce454480-445f-11eb-bf78-3b1ee7bf744c-m.svg" 
            alt="American Express" 
            width={40}
            height={24}
            className="h-6 w-auto"
          />
          <span className="text-xs muted">y más</span>
        </div>
      </div>
    </div>
  );
}
