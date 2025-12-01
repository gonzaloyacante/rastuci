"use client";

import { Check } from "lucide-react";
import { useMemo } from "react";

interface CheckoutStepperProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export default function CheckoutStepper({
  currentStep,
  onStepClick,
}: CheckoutStepperProps) {
  // Nombres cortos para mobile, completos para desktop
  const stepData = useMemo(
    () => [
      { short: "Datos", full: "Información Personal" },
      { short: "Pago", full: "Método de Pago" },
      { short: "Envío", full: "Entrega / Retiro" },
      { short: "Revisar", full: "Revisar Pedido" },
    ],
    []
  );

  return (
    <div className="mb-6 sm:mb-10">
      {/* Vista Mobile: Barra de progreso compacta */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-primary">
            {stepData[currentStep]?.full}
          </span>
          <span className="text-xs muted">
            Paso {currentStep + 1} de {stepData.length}
          </span>
        </div>
        <div className="relative h-2 surface rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${((currentStep + 1) / stepData.length) * 100}%`,
            }}
          />
        </div>
        {/* Mini indicadores de paso en mobile */}
        <div className="flex justify-between mt-2 px-1">
          {stepData.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isClickable = index < currentStep;

            return (
              <button
                key={step.short}
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-all ${
                  isCompleted
                    ? "bg-primary text-white"
                    : isCurrent
                      ? "bg-primary/20 text-primary ring-2 ring-primary"
                      : "surface-secondary muted"
                } ${isClickable ? "cursor-pointer active:scale-95" : ""}`}
              >
                {isCompleted ? <Check size={14} /> : index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vista Desktop: Stepper horizontal completo */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between relative">
          {/* Línea de progreso de fondo */}
          <div className="absolute top-5 left-0 right-0 h-0.5 surface z-0" />

          {/* Línea de progreso activa */}
          <div
            className="absolute top-5 left-0 h-0.5 bg-primary z-0 transition-all duration-500 ease-in-out"
            style={{
              width: `${(currentStep / (stepData.length - 1)) * 100}%`,
            }}
          />

          {stepData.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isClickable = index < currentStep;

            return (
              <div
                key={step.full}
                className={`flex flex-col items-center z-10 ${
                  isClickable ? "cursor-pointer" : ""
                }`}
                onClick={() => isClickable && onStepClick(index)}
              >
                {/* Círculo del paso */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out transform ${
                    isCompleted
                      ? "bg-primary text-white scale-110 shadow-lg"
                      : isCurrent
                        ? "bg-primary text-white ring-4 ring-primary/20 shadow-md"
                        : "surface muted border-2 border-muted"
                  } ${isClickable ? "hover:scale-105" : ""}`}
                >
                  {isCompleted ? (
                    <Check size={16} className="text-white" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>

                {/* Nombre del paso - corto en tablet, largo en desktop */}
                <span
                  className={`text-xs mt-3 text-center max-w-16 md:max-w-24 leading-tight transition-all duration-300 ${
                    isCompleted || isCurrent
                      ? "text-primary font-semibold"
                      : "muted"
                  } ${isClickable ? "hover:text-primary" : ""}`}
                >
                  <span className="md:hidden">{step.short}</span>
                  <span className="hidden md:inline">{step.full}</span>
                </span>

                {/* Indicador de paso actual */}
                {isCurrent && (
                  <div className="w-1 h-1 bg-primary rounded-full mt-1 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
