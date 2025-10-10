"use client";

import React from 'react';
import { Loader2, ShoppingBag, CreditCard, Truck } from 'lucide-react';

interface CheckoutLoadingStateProps {
  message?: string;
  stage?: 'loading' | 'processing' | 'shipping' | 'payment';
}

const stageConfig = {
  loading: {
    icon: Loader2,
    message: 'Cargando...',
    color: 'text-primary',
    bgColor: 'surface-secondary'
  },
  processing: {
    icon: ShoppingBag,
    message: 'Procesando pedido...',
    color: 'text-primary',
    bgColor: 'surface-secondary'
  },
  shipping: {
    icon: Truck,
    message: 'Calculando envío...',
    color: 'text-success',
    bgColor: 'surface-secondary'
  },
  payment: {
    icon: CreditCard,
    message: 'Procesando pago...',
    color: 'text-primary',
    bgColor: 'surface-secondary'
  }
};

export function CheckoutLoadingState({ 
  message, 
  stage = 'loading' 
}: CheckoutLoadingStateProps) {
  const config = stageConfig[stage];
  const Icon = config.icon;
  const displayMessage = message || config.message;

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Spinner animado */}
      <div className={`relative w-16 h-16 mb-4 rounded-full ${config.bgColor} flex items-center justify-center`}>
        <Icon 
          className={`w-8 h-8 ${config.color} ${stage === 'loading' ? 'animate-spin' : 'animate-pulse'}`} 
        />
        
        {/* Anillo de carga */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary/20 animate-spin" />
      </div>

      {/* Mensaje */}
      <p className="text-lg font-medium text-primary mb-2">{displayMessage}</p>
      
      {/* Submensaje */}
      <p className="text-sm muted text-center max-w-xs">
        {stage === 'loading' && 'Preparando tu experiencia de compra...'}
        {stage === 'processing' && 'Validando productos y disponibilidad...'}
        {stage === 'shipping' && 'Obteniendo las mejores opciones de envío...'}
        {stage === 'payment' && 'Conectando con el procesador de pagos...'}
      </p>

      {/* Puntos de carga animados */}
      <div className="flex space-x-1 mt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-primary rounded-full animate-pulse"
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    </div>
  );
}
