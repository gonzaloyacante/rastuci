"use client";

import { useState, useEffect } from "react";
import { useCart, BillingOption, CustomerInfo } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Check, FileText, ChevronRight } from "lucide-react";

interface BillingStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function BillingStep({ onNext }: BillingStepProps) {
  const {
    selectedBillingOption,
    setSelectedBillingOption,
    availableBillingOptions,
    customerInfo,
    updateCustomerInfo,
  } = useCart();

  // Estado local
  const [error, setError] = useState<string | null>(null);
  const [documentInfo, setDocumentInfo] = useState({
    documentType: customerInfo?.documentType || "",
    documentNumber: customerInfo?.documentNumber || "",
  });

  // Manejar selección de opción de facturación
  const handleSelectBilling = (option: BillingOption) => {
    setSelectedBillingOption(option);
    setError(null);
  };

  // Manejar cambios en los campos de documento
  const handleDocumentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDocumentInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Actualizar la información del cliente cuando cambia el documento
  useEffect(() => {
    if (
      customerInfo &&
      (documentInfo.documentType || documentInfo.documentNumber)
    ) {
      const updatedInfo: CustomerInfo = {
        ...customerInfo,
        documentType: documentInfo.documentType,
        documentNumber: documentInfo.documentNumber,
      };
      updateCustomerInfo(updatedInfo);
    }
  }, [
    documentInfo.documentType,
    documentInfo.documentNumber,
    customerInfo,
    updateCustomerInfo,
  ]);

  // Manejar continuar al siguiente paso
  const handleContinue = () => {
    if (!selectedBillingOption) {
      setError(
        "Por favor, selecciona una opción de facturación para continuar"
      );
      return;
    }

    // Validar que se haya ingresado información de documento si es requerido
    if (selectedBillingOption.requiresDocument) {
      if (!documentInfo.documentType || !documentInfo.documentNumber) {
        setError("Por favor, completa la información de documento fiscal");
        return;
      }
    }

    onNext();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="surface p-6 rounded-lg shadow-sm border border-muted">
        <h2 className="text-2xl font-bold mb-6 text-primary">Facturación</h2>

        {/* Mensaje de error */}
        {error && (
          <div className="surface border border-error text-error p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Opciones de facturación */}
        <div className="space-y-4 mt-6">
          {availableBillingOptions.map((option) => (
            <div
              key={option.id}
              className={`border rounded-lg p-4 transition-all ${
                selectedBillingOption?.id === option.id
                  ? "border-primary surface"
                  : "border-muted surface hover:border-primary"
              }`}
              onClick={() => handleSelectBilling(option)}>
              <div className="flex justify-between items-center">
                <div className="flex items-start gap-3">
                  <FileText
                    size={24}
                    className={`mt-1 ${
                      selectedBillingOption?.id === option.id
                        ? "text-primary"
                        : "muted"
                    }`}
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{option.name}</h3>
                    {option.requiresDocument && (
                      <p className="muted text-sm">
                        Requiere documento fiscal
                      </p>
                    )}
                  </div>
                </div>
                {selectedBillingOption?.id === option.id && (
                  <div className="w-6 h-6 rounded-full btn-hero flex items-center justify-center">
                    <Check size={16} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Campos adicionales para documento si se requiere */}
        {selectedBillingOption?.requiresDocument && (
          <div className="mt-6 p-4 surface border border-muted rounded-lg">
            <h3 className="font-medium mb-4">Información Fiscal</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de documento */}
              <div>
                <label
                  htmlFor="documentType"
                  className="block text-sm font-medium muted mb-1">
                  Tipo de Documento *
                </label>
                <select
                  id="documentType"
                  name="documentType"
                  value={documentInfo.documentType}
                  onChange={handleDocumentChange}
                  className="w-full p-3 border border-muted rounded-md">
                  <option value="">Seleccionar tipo</option>
                  <option value="DNI">DNI</option>
                  <option value="CUIT">CUIT</option>
                  <option value="CUIL">CUIL</option>
                </select>
              </div>

              {/* Número de documento */}
              <div>
                <label
                  htmlFor="documentNumber"
                  className="block text-sm font-medium muted mb-1">
                  Número de Documento *
                </label>
                <input
                  type="text"
                  id="documentNumber"
                  name="documentNumber"
                  value={documentInfo.documentNumber}
                  onChange={handleDocumentChange}
                  className="w-full p-3 border border-muted rounded-md"
                  placeholder="Ej: 30123456789"
                />
              </div>
            </div>

            {selectedBillingOption.id === "invoiceA" && (
              <p className="text-sm muted mt-4">
                Para Factura A, es necesario proporcionar un CUIT válido de
                empresa o responsable inscripto.
              </p>
            )}
          </div>
        )}

        {/* Botón para continuar */}
        <div className="flex justify-end mt-8">
          <Button
            onClick={handleContinue}
            disabled={!selectedBillingOption}
            className="btn-hero">
            Continuar
            <ChevronRight className="ml-2" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
