"use client";

import React, { useState, useEffect } from 'react';
import { Check, X, CreditCard, Shield, Clock, AlertCircle } from 'lucide-react';

interface PaymentProcessorProps {
  isProcessing: boolean;
  onComplete: (success: boolean, paymentId?: string, error?: string) => void;
  amount: number;
  paymentMethod?: 'saved_card' | 'new_card';
  cardInfo?: {
    last4?: string;
    brand?: string;
  };
}

type ProcessingStep = 'validating' | 'authorizing' | 'processing' | 'completed' | 'failed';

const stepMessages = {
  validating: 'Validando datos de la tarjeta...',
  authorizing: 'Autorizando con el banco...',
  processing: 'Procesando el pago...',
  completed: '¡Pago procesado exitosamente!',
  failed: 'Error en el procesamiento'
};

const stepIcons = {
  validating: CreditCard,
  authorizing: Shield,
  processing: Clock,
  completed: Check,
  failed: X
};

export function PaymentProcessor({ 
  isProcessing, 
  onComplete, 
  amount, 
  paymentMethod: _paymentMethod, 
  cardInfo 
}: PaymentProcessorProps) {
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('validating');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isProcessing) {
      setCurrentStep('validating');
      setProgress(0);
      setError(null);
      return;
    }

    const processPayment = async () => {
      try {
        // Paso 1: Validando
        setCurrentStep('validating');
        setProgress(10);
        await new Promise(resolve => setTimeout(resolve, 800));
        setProgress(25);

        // Paso 2: Autorizando
        setCurrentStep('authorizing');
        setProgress(40);
        await new Promise(resolve => setTimeout(resolve, 600));
        setProgress(60);

        // Paso 3: Procesando
        setCurrentStep('processing');
        setProgress(75);
        await new Promise(resolve => setTimeout(resolve, 600));
        setProgress(90);

        // Simular resultado
        const success = Math.random() > 0.15; // 85% éxito
        
        if (success) {
          setCurrentStep('completed');
          setProgress(100);
          await new Promise(resolve => setTimeout(resolve, 500));
          onComplete(true, `payment_${Date.now()}`);
        } else {
          const errorTypes = {
            'invalid_card': 'Tarjeta inválida o expirada',
            'insufficient_funds': 'Fondos insuficientes',
            'expired_card': 'Tarjeta vencida',
            'security_code_invalid': 'Código de seguridad incorrecto'
          };
          const errorKeys = Object.keys(errorTypes) as Array<keyof typeof errorTypes>;
          const randomError = errorKeys[Math.floor(Math.random() * errorKeys.length)];
          const errorMessage = errorTypes[randomError];
          
          setCurrentStep('failed');
          setError(errorMessage);
          await new Promise(resolve => setTimeout(resolve, 1000));
          onComplete(false, undefined, errorMessage);
        }
      } catch {
        setCurrentStep('failed');
        setError('Error inesperado en el procesamiento');
        onComplete(false, undefined, 'Error inesperado');
      }
    };

    processPayment();
  }, [isProcessing, onComplete]);

  if (!isProcessing) return null;

  const CurrentIcon = stepIcons[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="surface rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        {/* Icono animado */}
        <div className="relative mb-6">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ${
            currentStep === 'completed' 
              ? 'surface-secondary text-success' 
              : currentStep === 'failed'
              ? 'surface-secondary text-error'
              : 'bg-primary/10 text-primary'
          }`}>
            <CurrentIcon 
              size={32} 
              className={`transition-all duration-300 ${
                currentStep === 'validating' || currentStep === 'authorizing' || currentStep === 'processing'
                  ? 'animate-pulse'
                  : ''
              }`} 
            />
          </div>
          
          {/* Anillo de progreso */}
          {(currentStep === 'validating' || currentStep === 'authorizing' || currentStep === 'processing') && (
            <div className="absolute inset-0 w-20 h-20 mx-auto">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="muted"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 36}`}
                  strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
                  className="text-primary transition-all duration-500 ease-out"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Mensaje principal */}
        <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
          currentStep === 'completed' 
            ? 'text-success' 
            : currentStep === 'failed'
            ? 'text-error'
            : 'text-primary'
        }`}>
          {currentStep === 'failed' && error ? error : stepMessages[currentStep]}
        </h3>

        {/* Información del pago */}
        <div className="text-sm muted mb-4">
          <p className="font-medium">${amount.toLocaleString('es-AR')}</p>
          {cardInfo && (
            <p>
              {cardInfo.brand} •••• {cardInfo.last4}
            </p>
          )}
        </div>

        {/* Barra de progreso */}
        {currentStep !== 'completed' && currentStep !== 'failed' && (
          <div className="w-full surface-secondary rounded-full h-2 mb-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Mensaje de seguridad */}
        {(currentStep === 'validating' || currentStep === 'authorizing' || currentStep === 'processing') && (
          <div className="flex items-center justify-center text-xs muted mt-4">
            <Shield size={12} className="mr-1" />
            <span>Conexión segura SSL</span>
          </div>
        )}

        {/* Mensaje de error con opción de reintentar */}
        {currentStep === 'failed' && (
          <div className="mt-4 p-3 surface-secondary rounded-lg border border-error">
            <div className="flex items-center justify-center text-error mb-2">
              <AlertCircle size={16} className="mr-2" />
              <span className="text-sm font-medium">Error en el pago</span>
            </div>
            <p className="text-xs text-error mb-3">
              Verifica los datos de tu tarjeta e intenta nuevamente
            </p>
          </div>
        )}

        {/* Mensaje de éxito */}
        {currentStep === 'completed' && (
          <div className="mt-4 p-3 surface-secondary rounded-lg border border-success">
            <div className="flex items-center justify-center text-success mb-2">
              <Check size={16} className="mr-2" />
              <span className="text-sm font-medium">Pago exitoso</span>
            </div>
            <p className="text-xs text-success">
              Recibirás la confirmación por email
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
