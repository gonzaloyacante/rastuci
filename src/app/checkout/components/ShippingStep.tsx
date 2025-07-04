"use client";

import { useState, useEffect } from "react";
import { useCart, ShippingOption } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Check, Truck, MapPin, ChevronRight, Loader2 } from "lucide-react";

interface ShippingStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function ShippingStep({ onNext }: ShippingStepProps) {
  const {
    customerInfo,
    selectedShippingOption,
    setSelectedShippingOption,
    calculateShippingCost,
    availableShippingOptions,
  } = useCart();

  // Estado local
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);

  // Cargar opciones de envío al montar el componente
  useEffect(() => {
    if (customerInfo?.postalCode) {
      calculateShippingByPostalCode();
    } else {
      // Si no hay código postal, usar opciones predeterminadas
      setShippingOptions(availableShippingOptions);
    }
  }, [customerInfo?.postalCode]);

  // Calcular costos de envío según código postal
  const calculateShippingByPostalCode = async () => {
    if (!customerInfo?.postalCode) return;

    setLoading(true);
    setError(null);

    try {
      const options = await calculateShippingCost(customerInfo.postalCode);
      setShippingOptions(options);

      // Si no hay opción seleccionada, seleccionar la primera por defecto
      if (!selectedShippingOption) {
        setSelectedShippingOption(options[0]);
      }
    } catch (error) {
      console.error("Error al calcular el costo de envío:", error);
      setError(
        "No se pudo calcular el costo de envío. Por favor verifica el código postal."
      );
      // Usar opciones predeterminadas en caso de error
      setShippingOptions(availableShippingOptions);
    } finally {
      setLoading(false);
    }
  };

  // Manejar selección de opción de envío
  const handleSelectOption = (option: ShippingOption) => {
    setSelectedShippingOption(option);
  };

  // Manejar continuar al siguiente paso
  const handleContinue = () => {
    if (selectedShippingOption) {
      onNext();
    } else {
      setError("Por favor, selecciona una opción de envío para continuar");
    }
  };

  // Renderizar las opciones de envío
  const renderShippingOptions = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 size={40} className="animate-spin text-[#E91E63] mb-4" />
          <p>Calculando opciones de envío...</p>
        </div>
      );
    }

    return (
      <div className="space-y-4 mt-6">
        {shippingOptions.map((option) => (
          <div
            key={option.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedShippingOption?.id === option.id
                ? "border-[#E91E63] bg-pink-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelectOption(option)}>
            <div className="flex justify-between items-center">
              <div className="flex items-start gap-3">
                {option.id === "pickup" ? (
                  <MapPin
                    size={24}
                    className={`mt-1 ${
                      selectedShippingOption?.id === option.id
                        ? "text-[#E91E63]"
                        : "text-gray-500"
                    }`}
                  />
                ) : (
                  <Truck
                    size={24}
                    className={`mt-1 ${
                      selectedShippingOption?.id === option.id
                        ? "text-[#E91E63]"
                        : "text-gray-500"
                    }`}
                  />
                )}
                <div>
                  <h3 className="font-semibold text-lg">{option.name}</h3>
                  <p className="text-gray-600 text-sm">{option.description}</p>
                  <p className="text-gray-600 text-sm mt-1">
                    Tiempo estimado: {option.estimatedDays}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg">
                  {option.price === 0
                    ? "Gratis"
                    : `$${(option.price / 100).toFixed(2)}`}
                </span>
                {selectedShippingOption?.id === option.id && (
                  <div className="w-6 h-6 rounded-full bg-[#E91E63] flex items-center justify-center">
                    <Check size={16} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-2">Opciones de Envío</h2>

        {/* Resumen de dirección */}
        {customerInfo && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-gray-500 mt-1" />
              <div>
                <p className="font-medium">{customerInfo.name}</p>
                <p className="text-gray-600 text-sm">{customerInfo.address}</p>
                <p className="text-gray-600 text-sm">
                  {customerInfo.city}, {customerInfo.province}, CP:{" "}
                  {customerInfo.postalCode}
                </p>
                <p className="text-gray-600 text-sm">{customerInfo.phone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Opciones de envío */}
        {renderShippingOptions()}

        {/* Botón para continuar */}
        <div className="flex justify-end mt-8">
          <Button
            onClick={handleContinue}
            disabled={!selectedShippingOption || loading}
            className="bg-[#E91E63] text-white hover:bg-[#C2185B]">
            Continuar
            <ChevronRight className="ml-2" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
