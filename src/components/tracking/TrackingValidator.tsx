"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  useTrackingValidation,
  type TrackingValidationResponse,
} from "@/hooks/useTrackingValidation";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Loader2,
  Package,
  Search,
  Truck,
} from "lucide-react";
import { useState } from "react";

interface TrackingValidatorProps {
  onValidationSuccess?: (result: TrackingValidationResponse) => void;
  onValidationError?: (error: string) => void;
  className?: string;
  placeholder?: string;
  showDetails?: boolean;
}

export function TrackingValidator({
  onValidationSuccess,
  onValidationError,
  className = "",
  placeholder = "Ingresa tu número de tracking",
  showDetails = true,
}: TrackingValidatorProps) {
  const [trackingInput, setTrackingInput] = useState("");
  const { isLoading, error, validationResult, validateTracking, clearResult } =
    useTrackingValidation();

  const handleValidate = async () => {
    if (!trackingInput.trim()) {
      return;
    }

    try {
      const result = await validateTracking(trackingInput);
      onValidationSuccess?.(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al validar tracking";
      onValidationError?.(errorMessage);
    }
  };

  const handleInputChange = (value: string) => {
    setTrackingInput(value);
    if (validationResult || error) {
      clearResult();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleValidate();
    }
  };

  const getStatusIcon = (status?: string) => {
    if (!status) {
      return <Package className="w-5 h-5 text-primary" />;
    }

    switch (status.toUpperCase()) {
      case "ENTREGADO":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "EN_TRANSITO":
      case "EN_DISTRIBUCION":
        return <Truck className="w-5 h-5 text-primary" />;
      case "PENDIENTE":
      case "PREPARACION":
        return <Clock className="w-5 h-5 text-warning" />;
      default:
        return <Package className="w-5 h-5 text-primary" />;
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) {
      return "text-muted";
    }

    switch (status.toUpperCase()) {
      case "ENTREGADO":
        return "text-success";
      case "EN_TRANSITO":
      case "EN_DISTRIBUCION":
        return "text-primary";
      case "PENDIENTE":
      case "PREPARACION":
        return "text-warning";
      case "RETENIDO":
      case "DEVUELTO":
        return "text-error";
      default:
        return "text-muted";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Input y botón de búsqueda */}
      <div className="flex gap-2">
        <Input
          type="text"
          value={trackingInput}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          disabled={isLoading}
          leftIcon={<Package className="w-4 h-4" />}
          containerClassName="flex-1"
        />
        <Button
          onClick={handleValidate}
          disabled={!trackingInput.trim() || isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          {isLoading ? "Validando..." : "Buscar"}
        </Button>
      </div>

      {/* Resultado de la validación */}
      {validationResult && (
        <div className="surface border border-muted rounded-lg p-4">
          {validationResult.exists ? (
            <div className="space-y-3">
              {/* Estado exitoso */}
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-success mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-success">
                    ¡Tracking encontrado!
                  </h3>
                  <p className="text-sm muted mt-1">
                    El número de tracking{" "}
                    <span className="font-mono font-medium">
                      {validationResult.trackingNumber}
                    </span>{" "}
                    es válido.
                  </p>
                </div>
              </div>

              {/* Detalles del tracking */}
              {showDetails &&
                (validationResult.status || validationResult.description) && (
                  <div className="border-t border-muted pt-3">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(validationResult.status)}
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">Estado del Envío</h4>
                        {validationResult.status && (
                          <p
                            className={`text-sm font-medium ${getStatusColor(validationResult.status)}`}
                          >
                            {validationResult.status.replace(/_/g, " ")}
                          </p>
                        )}
                        {validationResult.description && (
                          <p className="text-sm muted mt-1">
                            {validationResult.description}
                          </p>
                        )}
                        {validationResult.lastUpdate && (
                          <p className="text-xs muted mt-1">
                            Última actualización:{" "}
                            {new Date(
                              validationResult.lastUpdate
                            ).toLocaleString("es-ES")}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Enlace a seguimiento externo */}
                    <div className="mt-3 pt-3 border-t border-muted">
                      <a
                        href={`https://www.correoargentino.com.ar/seguimiento?codigo=${validationResult.trackingNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ver seguimiento completo en Correo Argentino
                      </a>
                    </div>
                  </div>
                )}
            </div>
          ) : (
            // Estado de error
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-error mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-error">
                  Tracking no encontrado
                </h3>
                <p className="text-sm muted mt-1">
                  {validationResult.error ||
                    "El número de tracking no existe o no se puede validar en este momento."}
                </p>
                <div className="mt-2 text-xs muted">
                  <p>• Verifica que el número esté escrito correctamente</p>
                  <p>• El envío puede no haber sido procesado aún</p>
                  <p>• Intenta nuevamente en unos minutos</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error de validación */}
      {error && !validationResult && (
        <div className="surface border border-error rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-error mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-error">Error de validación</h3>
              <p className="text-sm muted mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente simple para validación inline
export function SimpleTrackingValidator({
  onValidate,
}: {
  onValidate?: (result: TrackingValidationResponse) => void;
}) {
  return (
    <TrackingValidator
      onValidationSuccess={onValidate}
      className="max-w-md"
      placeholder="Número de tracking"
      showDetails={false}
    />
  );
}
