"use client";

import { ChevronLeft, ChevronRight, Store } from "lucide-react";
import { useState } from "react";

import { AgencySelector } from "@/components/checkout/AgencySelector";
import { ShippingMethodSelector } from "@/components/checkout/ShippingMethodSelector";
import { Button } from "@/components/ui/Button";
import { ShippingOption, useCart } from "@/context/CartContext";
import { useShippingSettings } from "@/hooks/useShippingSettings";

import {
  CustomerAddressSummary,
  PickupLocationCard,
  ShippingOptionsPanel,
} from "./shippingStepComponents";
import { useShippingOptions } from "./shippingStepUtils";

interface ShippingStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function ShippingStep({ onNext, onBack }: ShippingStepProps) {
  const { shipping: shippingSettings } = useShippingSettings();
  const {
    customerInfo,
    selectedShippingOption,
    setSelectedShippingOption,
    selectedPaymentMethod,
    selectedAgency,
    setSelectedAgency,
  } = useCart();

  const { shippingOptions, loading, error, deliveryMode, setDeliveryMode } =
    useShippingOptions();

  const [localError, setLocalError] = useState<string | null>(null);

  const handleSelectOption = (option: ShippingOption) => {
    setSelectedShippingOption(option);
  };

  const handleContinue = () => {
    if (selectedShippingOption) {
      onNext();
    } else {
      setLocalError("Por favor, selecciona una opción de envío para continuar");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-0 sm:px-4">
      <div className="surface p-4 sm:p-6 rounded-lg shadow-sm border border-muted">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-primary">
          Entrega / Retiro
        </h2>

        {/* Resumen de dirección - más compacto en mobile */}
        {customerInfo && (
          <CustomerAddressSummary
            name={customerInfo.name}
            address={customerInfo.address}
            city={customerInfo.city}
            province={customerInfo.province}
            postalCode={customerInfo.postalCode}
            phone={customerInfo.phone}
          />
        )}

        {/* Selector de Método de Entrega */}
        <div className="mb-6 sm:mb-8">
          <ShippingMethodSelector
            value={deliveryMode}
            onChange={setDeliveryMode}
          />
        </div>

        {/* Selector de Agencia (solo si es retiro en sucursal) */}
        {deliveryMode === "agency" && (
          <div className="mb-6 sm:mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
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

        {/* Mapa de ubicación para retiro en local */}
        {deliveryMode === "pickup" && (
          <div className="mb-6 sm:mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Ubicación del local
            </h3>
            <PickupLocationCard storeCity={shippingSettings?.storeCity} />
          </div>
        )}

        {/* Aviso: si el pago es en efectivo, solo retiro está disponible */}
        {selectedPaymentMethod?.id === "cash" && deliveryMode !== "pickup" && (
          <div className="mb-4 p-3 rounded-md surface-secondary border border-muted text-primary text-sm">
            Has seleccionado <strong>Pago en efectivo</strong>. El envío a
            domicilio no está disponible para este método de pago. Solo está
            disponible la opción de <strong>Retiro en local</strong>.
          </div>
        )}

        {/* Mensaje de error */}
        {(error ?? localError) && (
          <div className="surface border border-error text-error p-3 rounded-md mb-4 text-sm">
            {error ?? localError}
          </div>
        )}

        {/* Opciones de envío calculadas */}
        <ShippingOptionsPanel
          loading={loading}
          shippingOptions={shippingOptions}
          deliveryMode={deliveryMode}
          selectedAgency={selectedAgency}
          selectedShippingOption={selectedShippingOption}
          selectedPaymentMethodId={selectedPaymentMethod?.id}
          freeShipping={shippingSettings.freeShipping}
          onSelect={handleSelectOption}
        />

        {/* Botones de navegación - full width en mobile */}
        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-6 sm:mt-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="surface text-primary hover:brightness-95 w-full sm:w-auto"
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
            className="btn-hero w-full sm:w-auto"
            rightIcon={<ChevronRight size={16} />}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
