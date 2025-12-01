"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { User } from "lucide-react";

interface CustomerData {
  email: string;
  firstName: string;
  lastName: string;
  identificationType: string;
  identificationNumber: string;
}

interface CustomerFormProps {
  data: CustomerData;
  onChange: (data: CustomerData) => void;
}

export function CustomerForm({ data, onChange }: CustomerFormProps) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const identificationTypes = [
    { value: "DNI", label: "DNI" },
    { value: "CUIL", label: "CUIL" },
    { value: "CUIT", label: "CUIT" },
    { value: "Pasaporte", label: "Pasaporte" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        <h4 className="font-semibold text-sm sm:text-base">Datos personales</h4>
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
          Email *
        </label>
        <Input
          type="email"
          placeholder="tu@email.com"
          value={data.email}
          onChange={(e) => handleChange("email", e.target.value)}
          required
          className="text-base sm:text-sm" // text-base evita zoom en iOS
        />
        <p className="text-[11px] sm:text-xs muted mt-1">
          Te enviaremos la confirmación de compra a este email
        </p>
      </div>

      {/* Nombre y Apellido - stack en mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
            Nombre *
          </label>
          <Input
            type="text"
            placeholder="Tu nombre"
            value={data.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            required
            className="text-base sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
            Apellido *
          </label>
          <Input
            type="text"
            placeholder="Tu apellido"
            value={data.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            required
            className="text-base sm:text-sm"
          />
        </div>
      </div>

      {/* Tipo y número de documento - responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
            Tipo de documento
          </label>
          <Select
            options={identificationTypes}
            value={data.identificationType}
            onChange={(value) => handleChange("identificationType", value)}
            placeholder="Tipo"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
            Número de documento
          </label>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="12345678"
            value={data.identificationNumber}
            onChange={(e) =>
              handleChange(
                "identificationNumber",
                e.target.value.replace(/\D/g, "")
              )
            }
            className="text-base sm:text-sm"
          />
        </div>
      </div>

      {/* Nota informativa */}
      <div className="p-2.5 sm:p-3 surface rounded-lg border border-muted">
        <p className="text-xs sm:text-sm muted">
          <strong>Importante:</strong> Los datos deben coincidir con los de tu
          tarjeta o documento de identidad.
        </p>
      </div>
    </div>
  );
}
