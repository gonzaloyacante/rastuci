"use client";

import { Button } from "@/components/ui/Button";
import { CustomerInfo, useCart } from "@/context/CartContext";
import { ARGENTINA_PROVINCES } from "@/lib/constants";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface CustomerInfoStepProps {
  onNext: () => void;
}

export default function CustomerInfoStep({ onNext }: CustomerInfoStepProps) {
  const { customerInfo, updateCustomerInfo } = useCart();

  // Estado local para el formulario
  const [formData, setFormData] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    notes: "",
  });

  // Estado de errores
  const [errors, setErrors] = useState<
    Partial<Record<keyof CustomerInfo, string>>
  >({});

  // Cargar datos existentes si están disponibles
  useEffect(() => {
    if (customerInfo) {
      setFormData(customerInfo);
    }
  }, [customerInfo]);

  // Optimization: Prefetch shipping costs when postal code is valid (4 digits)
  const { calculateShippingCost } = useCart();
  useEffect(() => {
    const cp = formData.postalCode;
    if (cp && /^\d{4}$/.test(cp)) {
      // Trigger calculation in background to warm up cache
      // We fire both 'D' (Domicilio) and 'S' (Sucursal)
      calculateShippingCost(cp, "D").catch(() => {});
      calculateShippingCost(cp, "S").catch(() => {});
    }
  }, [formData.postalCode, calculateShippingCost]);

  // Manejar cambios en los campos
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    let finalValue = value;

    // Formateo de teléfono argentino (básico)
    if (name === "phone") {
      // Eliminar todo lo que no sea número
      const numbers = value.replace(/\D/g, "");

      // Aplicar formato visual simple mientras escribe
      // Ej: 11 1234 5678 (Móvil BsAs) o 261 123 4567 (Interior)
      // No es perfecto pero ayuda visualmente.
      // Si empieza con 11 (BsAs) y tiene más de 2 números
      if (numbers.length > 0) {
        if (numbers.startsWith("11")) {
          if (numbers.length <= 2) finalValue = numbers;
          else if (numbers.length <= 6)
            finalValue = `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
          else
            finalValue = `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6, 10)}`;
        } else {
          // Otros códigos de área (ej 261, 351) - asumiendo 3 dígitos + resto
          if (numbers.length <= 3) finalValue = numbers;
          else if (numbers.length <= 6)
            finalValue = `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
          else
            finalValue = `${numbers.slice(0, 3)} ${numbers.slice(3, 7)} ${numbers.slice(7, 11)}`;
        }
        // Limitar largo máximo para no romper
        if (finalValue.length > 15) finalValue = finalValue.slice(0, 15);
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    // Limpiar el error cuando el usuario escribe
    if (errors[name as keyof CustomerInfo]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validar el formulario
  const validateForm = () => {
    const newErrors: Partial<Record<keyof CustomerInfo, string>> = {};

    // Validaciones básicas
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es obligatorio";
    } else if (!/^[\d\s\-+()]{8,20}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Formato de teléfono inválido";
    }

    if (!formData.address.trim()) {
      newErrors.address = "La dirección es obligatoria";
    }

    if (!formData.city.trim()) {
      newErrors.city = "La ciudad es obligatoria";
    }

    if (!formData.province.trim()) {
      newErrors.province = "La provincia es obligatoria";
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "El código postal es obligatorio";
    } else {
      // Validar formato de código postal argentino (4 dígitos o 1 letra + 4 dígitos)
      const postalCodeRegex = /^[A-Z]?\d{4}$/i;
      if (!postalCodeRegex.test(formData.postalCode)) {
        newErrors.postalCode =
          "Código postal inválido. Debe tener 4 dígitos, o una letra seguida de 4 dígitos.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      updateCustomerInfo(formData);
      onNext();
    } else {
      // Scroll al primer error
      const firstErrorField = Object.keys(errors)[0] as keyof CustomerInfo;
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="surface p-6 rounded-lg shadow-sm border border-muted">
        <h2 className="text-2xl font-bold mb-6 text-primary">
          Información de Contacto
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Nombre */}
            <div className="col-span-2 md:col-span-1">
              <label
                htmlFor="name"
                className="block text-sm font-medium muted mb-1"
              >
                Nombre completo *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-3 border rounded-md ${
                  errors.name ? "border-error" : "border-muted"
                }`}
                placeholder="Ej: Juan Pérez"
              />
              {errors.name && (
                <p className="text-error text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="col-span-2 md:col-span-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium muted mb-1"
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-3 border rounded-md ${
                  errors.email ? "border-error" : "border-muted"
                }`}
                placeholder="Ej: juan@ejemplo.com"
              />
              {errors.email && (
                <p className="text-error text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Teléfono */}
            <div className="col-span-2 md:col-span-1">
              <label
                htmlFor="phone"
                className="block text-sm font-medium muted mb-1"
              >
                Teléfono *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full p-3 border rounded-md ${
                  errors.phone ? "border-error" : "border-muted"
                }`}
                placeholder="Ej: 11 1234-5678"
              />
              {errors.phone && (
                <p className="text-error text-xs mt-1">{errors.phone}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Dirección */}
            <div className="col-span-2">
              <label
                htmlFor="address"
                className="block text-sm font-medium muted mb-1"
              >
                Dirección *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full p-3 border rounded-md ${
                  errors.address ? "border-error" : "border-muted"
                }`}
                placeholder="Calle, número, piso, depto."
              />
              {errors.address && (
                <p className="text-error text-xs mt-1">{errors.address}</p>
              )}
            </div>

            {/* Ciudad */}
            <div className="col-span-2 md:col-span-1">
              <label
                htmlFor="city"
                className="block text-sm font-medium muted mb-1"
              >
                Ciudad *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full p-3 border rounded-md ${
                  errors.city ? "border-error" : "border-muted"
                }`}
                placeholder="Ej: Buenos Aires"
              />
              {errors.city && (
                <p className="text-error text-xs mt-1">{errors.city}</p>
              )}
            </div>

            {/* Provincia */}
            <div className="col-span-2 md:col-span-1">
              <label
                htmlFor="province"
                className="block text-sm font-medium muted mb-1"
              >
                Provincia *
              </label>
              <select
                id="province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                className={`w-full p-3 border rounded-md ${
                  errors.province ? "border-error" : "border-muted"
                }`}
              >
                <option value="">Seleccionar provincia</option>
                {ARGENTINA_PROVINCES.map((provincia) => (
                  <option key={provincia} value={provincia}>
                    {provincia}
                  </option>
                ))}
              </select>
              {errors.province && (
                <p className="text-error text-xs mt-1">{errors.province}</p>
              )}
            </div>

            {/* Código Postal */}
            <div className="col-span-2 md:col-span-1">
              <label
                htmlFor="postalCode"
                className="block text-sm font-medium muted mb-1"
              >
                Código Postal *
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className={`w-full p-3 border rounded-md ${
                  errors.postalCode ? "border-error" : "border-muted"
                }`}
                placeholder="Ej: 1414"
              />
              {errors.postalCode && (
                <p className="text-error text-xs mt-1">{errors.postalCode}</p>
              )}
            </div>

            {/* Notas adicionales */}
            <div className="col-span-2">
              <label
                htmlFor="notes"
                className="block text-sm font-medium muted mb-1"
              >
                Notas para la entrega (opcional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes || ""}
                onChange={handleChange}
                className="w-full p-3 border border-muted rounded-md"
                rows={3}
                placeholder="Instrucciones especiales para la entrega, referencias, etc."
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <Button
              type="submit"
              className="btn-hero"
              rightIcon={<ChevronRight size={16} />}
            >
              Continuar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
