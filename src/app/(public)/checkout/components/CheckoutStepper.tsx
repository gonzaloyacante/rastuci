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
  const stepNames = useMemo(
    () => [
      "Información Personal",
      "Método de Pago",
      "Entrega / Retiro",
      "Revisar Pedido",
    ],
    []
  );

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between relative">
        {/* Línea de progreso de fondo */}
        <div className="absolute top-5 left-0 right-0 h-0.5 surface z-0" />

        {/* Línea de progreso activa */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-primary z-0 transition-all duration-500 ease-in-out"
          style={{
            width: `${(currentStep / (stepNames.length - 1)) * 100}%`,
          }}
        />

        {stepNames.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = index < currentStep;

          return (
            <div
              key={step || `step-${index}`}
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

              {/* Nombre del paso */}
              <span
                className={`text-xs mt-3 text-center max-w-20 leading-tight transition-all duration-300 ${
                  isCompleted || isCurrent
                    ? "text-primary font-semibold"
                    : "muted"
                } ${isClickable ? "hover:text-primary" : ""}`}
              >
                {step}
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
  );
}
