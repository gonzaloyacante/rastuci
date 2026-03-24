"use client";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  MapPin,
  Store,
  Truck,
} from "lucide-react";

import { Spinner } from "@/components/ui/Spinner";
import { ShippingOption } from "@/context/CartContext";
import { formatPriceARS } from "@/utils/formatters";

// ============================================================================
// ESTADOS: Loading / Empty
// ============================================================================

export function ShippingLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-10">
      <Spinner size="lg" className="mb-3 sm:mb-4" />
      <p className="text-muted-foreground text-sm sm:text-base">
        Calculando opciones de envío...
      </p>
    </div>
  );
}

export function ShippingEmptyState({ deliveryMode }: { deliveryMode: string }) {
  if (deliveryMode === "agency") {
    return (
      <div className="text-center py-6 sm:py-8 text-muted-foreground border border-dashed border-muted rounded-lg text-sm sm:text-base">
        <MapPin className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
        Selecciona una sucursal para ver los costos de envío.
      </div>
    );
  }
  return (
    <div className="text-center py-6 sm:py-8 text-muted-foreground border border-dashed border-muted rounded-lg text-sm sm:text-base">
      <Truck className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
      {deliveryMode === "home"
        ? "No hay opciones de envío a domicilio disponibles."
        : "No hay opciones de envío a sucursal disponibles."}
    </div>
  );
}

// ============================================================================
// TARJETA DE OPCIÓN DE ENVÍO
// ============================================================================

export interface ShippingOptionCardProps {
  option: ShippingOption;
  isSelected: boolean;
  disabled: boolean;
  deliveryMode: string;
  freeShipping: boolean;
  onSelect: (option: ShippingOption) => void;
}

export function ShippingOptionCard({
  option,
  isSelected,
  disabled,
  deliveryMode,
  freeShipping,
  onSelect,
}: ShippingOptionCardProps) {
  const iconClass = `mt-2.5 shrink-0 sm:w-10 sm:h-10 ${isSelected ? "text-primary" : "text-muted-foreground"}`;
  const Icon =
    option.id === "pickup" ? Store : deliveryMode === "agency" ? MapPin : Truck;

  return (
    <div
      className={`border rounded-lg p-3 sm:p-4 transition-all cursor-pointer ${
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-muted surface hover:border-primary/50 hover:bg-muted/30"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={() => !disabled && onSelect(option)}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-start gap-2.5 sm:gap-3">
          <Icon size={20} className={iconClass} />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-md sm:text-base leading-tight">
              {option.name}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2 sm:line-clamp-none">
              {option.description}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pl-7 sm:pl-0">
          <span className="font-bold text-base sm:text-lg">
            {option.price === 0 && freeShipping ? (
              <span className="text-green-600">Sin cargo</span>
            ) : option.price === 0 ? (
              <span className="text-muted-foreground">Gratis</span>
            ) : (
              formatPriceARS(option.price)
            )}
          </span>
          {isSelected && (
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Check size={14} className="text-white sm:w-4 sm:h-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// BADGE DE FUENTE DE DATOS
// ============================================================================

export function DataSourceBadge({ isFallback }: { isFallback: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full ${
        isFallback
          ? "bg-amber-100 text-amber-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      {isFallback ? (
        <>
          <AlertCircle size={12} className="sm:w-3.5 sm:h-3.5" />
          <span>Precios estimados</span>
        </>
      ) : (
        <>
          <CheckCircle2 size={12} className="sm:w-3.5 sm:h-3.5" />
          <span className="hidden xs:inline">
            Precios actualizados de Correo Argentino
          </span>
          <span className="xs:hidden">Precios actualizados</span>
        </>
      )}
    </div>
  );
}

// ============================================================================
// RESUMEN DE DIRECCIÓN DEL CLIENTE
// ============================================================================

export interface CustomerAddressSummaryProps {
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
}

export function CustomerAddressSummary({
  name,
  address,
  city,
  province,
  postalCode,
  phone,
}: CustomerAddressSummaryProps) {
  return (
    <div className="surface p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 border border-muted">
      <div className="flex items-start gap-2 sm:gap-3">
        <MapPin
          size={18}
          className="text-muted-foreground mt-0.5 shrink-0 hidden sm:block"
        />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm sm:text-base truncate">{name}</p>
          <p className="text-muted-foreground text-xs sm:text-sm truncate">
            {address}
          </p>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {city}, {province}, CP: {postalCode}
          </p>
          <p className="text-muted-foreground text-xs sm:text-sm">{phone}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TARJETA DE RETIRO EN LOCAL
// ============================================================================

export function PickupLocationCard({ storeCity }: { storeCity?: string }) {
  const city = storeCity ?? "Don Torcuato, Buenos Aires";
  const mapsQuery = encodeURIComponent(
    storeCity ?? "Don Torcuato, Buenos Aires, Argentina"
  );
  return (
    <div className="rounded-lg border border-muted overflow-hidden">
      <div className="p-6 bg-muted/20 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <MapPin className="h-6 w-6 text-primary" />
        </div>
        <h4 className="font-medium text-lg mb-1">{city}</h4>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          Coordinaremos la dirección exacta por WhatsApp después de confirmar tu
          pedido
        </p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-muted hover:border-primary/50 text-sm font-medium rounded-full transition-all shadow-sm hover:shadow-md"
        >
          <MapPin className="h-4 w-4 text-primary" />
          Ver ubicación en Google Maps
        </a>
      </div>
    </div>
  );
}

// ============================================================================
// PANEL DE OPCIONES DE ENVÍO
// ============================================================================

export interface ShippingOptionsPanelProps {
  loading: boolean;
  shippingOptions: ShippingOption[];
  deliveryMode: string;
  selectedAgency: unknown;
  selectedShippingOption: ShippingOption | null;
  selectedPaymentMethodId: string | undefined;
  freeShipping: boolean;
  onSelect: (option: ShippingOption) => void;
}

export function ShippingOptionsPanel({
  loading,
  shippingOptions,
  deliveryMode,
  selectedAgency,
  selectedShippingOption,
  selectedPaymentMethodId,
  freeShipping,
  onSelect,
}: ShippingOptionsPanelProps) {
  if (loading) return <ShippingLoadingState />;
  if (deliveryMode === "agency" && !selectedAgency) {
    return <ShippingEmptyState deliveryMode="agency" />;
  }
  if (shippingOptions.length === 0 && deliveryMode !== "pickup") {
    return <ShippingEmptyState deliveryMode={deliveryMode} />;
  }
  return (
    <div className="space-y-3 mt-4 sm:mt-6">
      {shippingOptions.length > 0 && (
        <DataSourceBadge isFallback={!!shippingOptions[0]?.isFallback} />
      )}
      {shippingOptions.map((option) => (
        <ShippingOptionCard
          key={option.id}
          option={option}
          isSelected={selectedShippingOption?.id === option.id}
          disabled={
            selectedPaymentMethodId === "cash" && option.id !== "pickup"
          }
          deliveryMode={deliveryMode}
          freeShipping={freeShipping}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
