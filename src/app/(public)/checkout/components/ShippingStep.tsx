"use client";

import { AgencySelector } from "@/components/checkout/AgencySelector";
import {
  DeliveryMode,
  ShippingMethodSelector,
} from "@/components/checkout/ShippingMethodSelector";
import { Button } from "@/components/ui/Button";
import { ShippingOption, useCart } from "@/context/CartContext";
import { logger } from "@/lib/logger";
import { formatPriceARS } from "@/utils/formatters";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Store,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";

// ============================================================================
// HELPER FUNCTIONS (fuera del componente)
// ============================================================================

/** Crear opciones de envío de fallback */
function createFallbackShippingOptions(type: "D" | "S"): ShippingOption[] {
  if (type === "D") {
    return [
      {
        id: "standard-home",
        name: "Envío Estándar a Domicilio",
        description: "Correo Argentino - Entrega en tu domicilio",
        price: 4500,
        estimatedDays: "5-7 días hábiles",
      },
      {
        id: "express-home",
        name: "Envío Express a Domicilio",
        description: "Correo Argentino - Entrega rápida",
        price: 7000,
        estimatedDays: "2-3 días hábiles",
      },
    ];
  }
  return [
    {
      id: "standard-agency",
      name: "Envío a Sucursal",
      description: "Retirá en la sucursal de Correo Argentino",
      price: 3500,
      estimatedDays: "5-7 días hábiles",
    },
  ];
}

/** Crear opción de retiro en local */
function createPickupOption(): ShippingOption {
  return {
    id: "pickup",
    name: "Retiro en Local",
    description: "Gratis en nuestro local",
    price: 0,
    estimatedDays: "Inmediato",
  };
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

interface ShippingStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function ShippingStep({ onNext, onBack }: ShippingStepProps) {
  const {
    customerInfo,
    selectedShippingOption,
    setSelectedShippingOption,
    calculateShippingCost,
    selectedPaymentMethod,
    selectedAgency,
    setSelectedAgency,
  } = useCart();

  // Estado local
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("home");

  // ============================================================================
  // EFECTOS
  // ============================================================================

  // Limpiar agencia seleccionada si cambia el modo
  useEffect(() => {
    if (deliveryMode !== "agency") {
      setSelectedAgency(null);
    }
  }, [deliveryMode, setSelectedAgency]);

  // Autoseleccionar opción de pickup cuando se selecciona ese modo
  useEffect(() => {
    if (deliveryMode === "pickup") {
      const pickupOption = createPickupOption();
      setShippingOptions([pickupOption]);
      setSelectedShippingOption(pickupOption);
      setError(null);
    }
  }, [deliveryMode, setSelectedShippingOption]);

  // Calcular costos de envío - solo cuando cambia el modo, CP o agencia seleccionada
  useEffect(() => {
    // Si es retiro en tienda (local), ya se maneja en otro useEffect
    if (deliveryMode === "pickup") {
      return;
    }

    // Si no hay código postal, no calcular
    if (!customerInfo?.postalCode) {
      setError("Se requiere código postal para calcular el envío");
      return;
    }

    // Si es agencia pero no hay agencia seleccionada, no calcular aún
    if (deliveryMode === "agency" && !selectedAgency) {
      setShippingOptions([]);
      setError(null);
      return;
    }

    const fetchShippingOptions = async () => {
      setLoading(true);
      setError(null);

      try {
        const type = deliveryMode === "agency" ? "S" : "D";
        const options = await calculateShippingCost(
          customerInfo.postalCode,
          type
        );

        if (options && options.length > 0) {
          setShippingOptions(options);
          // Seleccionar la primera opción automáticamente
          setSelectedShippingOption(options[0]);
        } else {
          // Usar fallback si no hay opciones
          const fallbackOptions = createFallbackShippingOptions(type);
          setShippingOptions(fallbackOptions);
          setSelectedShippingOption(fallbackOptions[0]);
        }
      } catch (err) {
        logger.error("Error al calcular envío:", { err });
        // En caso de error, usar opciones de fallback
        const type = deliveryMode === "agency" ? "S" : "D";
        const fallbackOptions = createFallbackShippingOptions(type);
        setShippingOptions(fallbackOptions);
        setSelectedShippingOption(fallbackOptions[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchShippingOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerInfo?.postalCode, deliveryMode, selectedAgency]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSelectOption = (option: ShippingOption) => {
    setSelectedShippingOption(option);
  };

  const handleContinue = () => {
    if (selectedShippingOption) {
      onNext();
    } else {
      setError("Por favor, selecciona una opción de envío para continuar");
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderShippingOptions = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 size={40} className="animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">
            Calculando opciones de envío...
          </p>
        </div>
      );
    }

    // Si es modo agencia y no hay agencia seleccionada
    if (deliveryMode === "agency" && !selectedAgency) {
      return (
        <div className="text-center py-8 text-muted-foreground border border-dashed border-muted rounded-lg">
          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
          Selecciona una sucursal para ver los costos de envío.
        </div>
      );
    }

    // Si no hay opciones (solo para home/agency, pickup siempre tiene)
    if (shippingOptions.length === 0 && deliveryMode !== "pickup") {
      return (
        <div className="text-center py-8 text-muted-foreground border border-dashed border-muted rounded-lg">
          <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
          {deliveryMode === "home"
            ? "No hay opciones de envío a domicilio disponibles."
            : "No hay opciones de envío a sucursal disponibles."}
        </div>
      );
    }

    return (
      <div className="space-y-3 mt-6">
        {shippingOptions.map((option) => {
          const disabled =
            String(selectedPaymentMethod) === "cash" && option.id !== "pickup";
          const isSelected = selectedShippingOption?.id === option.id;

          return (
            <div
              key={option.id}
              className={`border rounded-lg p-4 transition-all cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-muted surface hover:border-primary/50 hover:bg-muted/30"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => !disabled && handleSelectOption(option)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-start gap-3">
                  {option.id === "pickup" ? (
                    <Store
                      size={24}
                      className={`mt-0.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                    />
                  ) : deliveryMode === "agency" ? (
                    <MapPin
                      size={24}
                      className={`mt-0.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                    />
                  ) : (
                    <Truck
                      size={24}
                      className={`mt-0.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{option.name}</h3>
                    <p className="text-muted-foreground text-sm">
                      {option.description}
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Tiempo estimado: {option.estimatedDays}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">
                    {option.price === 0 ? (
                      <span className="text-green-600">Gratis</span>
                    ) : (
                      formatPriceARS(option.price)
                    )}
                  </span>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check size={16} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="max-w-3xl mx-auto">
      <div className="surface p-6 rounded-lg shadow-sm border border-muted">
        <h2 className="text-2xl font-bold mb-6 text-primary">
          Entrega / Retiro
        </h2>

        {/* Resumen de dirección */}
        {customerInfo && (
          <div className="surface p-4 rounded-lg mb-6 border border-muted">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-muted-foreground mt-1" />
              <div>
                <p className="font-medium">{customerInfo.name}</p>
                <p className="text-muted-foreground text-sm">
                  {customerInfo.address}
                </p>
                <p className="text-muted-foreground text-sm">
                  {customerInfo.city}, {customerInfo.province}, CP:{" "}
                  {customerInfo.postalCode}
                </p>
                <p className="text-muted-foreground text-sm">
                  {customerInfo.phone}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Selector de Método de Entrega */}
        <div className="mb-8">
          <ShippingMethodSelector
            value={deliveryMode}
            onChange={setDeliveryMode}
          />
        </div>

        {/* Selector de Agencia (solo si es retiro en sucursal) */}
        {deliveryMode === "agency" && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-lg font-semibold mb-4">
              Selecciona una sucursal
            </h3>
            <AgencySelector
              selectedAgency={selectedAgency}
              onSelectAgency={setSelectedAgency}
              initialProvince={customerInfo?.province}
              initialPostalCode={customerInfo?.postalCode}
            />
          </div>
        )}

        {/* Aviso: si el pago es en efectivo, solo retiro está disponible */}
        {String(selectedPaymentMethod) === "cash" &&
          deliveryMode !== "pickup" && (
            <div className="mb-4 p-3 rounded-md surface-secondary border border-muted text-primary">
              Has seleccionado <strong>Pago en efectivo</strong>. El envío a
              domicilio no está disponible para este método de pago. Solo está
              disponible la opción de <strong>Retiro en local</strong>.
            </div>
          )}

        {/* Mensaje de error */}
        {error && (
          <div className="surface border border-error text-error p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Opciones de envío calculadas */}
        {renderShippingOptions()}

        {/* Botones de navegación */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="surface text-primary hover:brightness-95"
            leftIcon={<ChevronLeft size={16} />}
          >
            Volver
          </Button>
          <Button
            onClick={handleContinue}
            disabled={
              !selectedShippingOption ||
              loading ||
              (deliveryMode === "agency" && !selectedAgency)
            }
            className="btn-hero"
            rightIcon={<ChevronRight size={16} />}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
