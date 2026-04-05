"use client";

import { AlertTriangle, Save } from "lucide-react";
import { useEffect, useState } from "react";

import { SettingsFormSkeleton } from "@/components/admin/skeletons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/Toast";
import { useSettings } from "@/hooks/useSettings";
import { logger } from "@/lib/logger";
import {
  defaultStoreSettings,
  type StoreSettings,
} from "@/lib/validation/store";

interface PaymentSettingsProps {
  initial?: StoreSettings;
  onSave?: (data: StoreSettings) => void;
}

export default function PaymentSettings({
  initial,
  onSave: _onSave,
}: PaymentSettingsProps) {
  const { show } = useToast();
  const [data, setData] = useState<StoreSettings>(
    initial || defaultStoreSettings
  );
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!initial);

  // SWR Hook
  const {
    settings,
    loading: loadingSettings,
    mutate: mutateSettings,
  } = useSettings<StoreSettings>("store");

  useEffect(() => {
    if (settings && !initial) {
      setData(settings);
      setLoading(false);
    }
  }, [settings, initial]);

  useEffect(() => {
    if (loadingSettings && !initial) setLoading(true);
  }, [loadingSettings, initial]);

  if (loading) return <SettingsFormSkeleton rows={3} />;

  // Helper to update payments nested object
  const updatePayment = (field: string, value: string | number) => {
    setData((prev) => ({
      ...prev,
      payments: {
        ...prev.payments,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || loadingSettings) return;

    setSaving(true);
    try {
      const res = await fetch("/api/settings/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Error al guardar configuración");

      show({ type: "success", message: "Configuración de pagos actualizada" });
      void mutateSettings();
    } catch (error) {
      show({ type: "error", message: "Error al guardar cambios" });
      logger.error("Error saving payment settings", { error: error });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Discounts Section */}
      <div className="surface-secondary rounded-lg p-4 space-y-4 border border-border">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🏷️</span>
          <h3 className="font-semibold text-lg text-content-primary">
            Descuentos por Método de Pago
          </h3>
        </div>
        <p className="text-sm text-content-secondary mb-4">
          Define el porcentaje de descuento automático que se aplicará en el
          Checkout según el método elegido. Si es 0%, no se mostrará descuento.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {/* C A S H */}
          <div className="bg-surface p-4 rounded-lg border border-border shadow-sm">
            <h4 className="font-medium text-emerald-600 mb-3 flex items-center gap-2">
              💵 Efectivo
            </h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="cashDiscount">Descuento (%)</Label>
                <div className="relative">
                  <Input
                    id="cashDiscount"
                    type="number"
                    min="0"
                    max="100"
                    value={data.payments.cashDiscount}
                    onChange={(e) =>
                      updatePayment("cashDiscount", Number(e.target.value))
                    }
                    className="pl-8"
                  />
                  <span className="absolute left-3 top-2.5 text-content-tertiary">
                    %
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-dashed border-border">
                <Label htmlFor="cashExpiration" className="text-xs">
                  Vencimiento Reserva (Horas)
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="cashExpiration"
                    type="number"
                    min="1"
                    value={data.payments.cashExpirationHours}
                    onChange={(e) =>
                      updatePayment(
                        "cashExpirationHours",
                        Number(e.target.value)
                      )
                    }
                    className="h-8 text-sm"
                  />
                  <span className="absolute right-3 top-2 text-xs text-content-tertiary">
                    hs
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* T R A N S F E R */}
          <div className="bg-surface p-4 rounded-lg border border-border shadow-sm">
            <h4 className="font-medium text-blue-600 mb-3 flex items-center gap-2">
              🏦 Transferencia
            </h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="transDiscount">Descuento (%)</Label>
                <div className="relative">
                  <Input
                    id="transDiscount"
                    type="number"
                    min="0"
                    max="100"
                    value={data.payments.transferDiscount}
                    onChange={(e) =>
                      updatePayment("transferDiscount", Number(e.target.value))
                    }
                    className="pl-8"
                  />
                  <span className="absolute left-3 top-2.5 text-content-tertiary">
                    %
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-dashed border-border">
                <Label htmlFor="transExpiration" className="text-xs">
                  Vencimiento Reserva (Horas)
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="transExpiration"
                    type="number"
                    min="1"
                    value={data.payments.transferExpirationHours}
                    onChange={(e) =>
                      updatePayment(
                        "transferExpirationHours",
                        Number(e.target.value)
                      )
                    }
                    className="h-8 text-sm"
                  />
                  <span className="absolute right-3 top-2 text-xs text-content-tertiary">
                    hs
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* M E R C A D O P A G O */}
          <div className="bg-surface p-4 rounded-lg border border-border shadow-sm">
            <h4 className="font-medium text-sky-500 mb-3 flex items-center gap-2">
              💳 MercadoPago
            </h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="mpDiscount">Descuento (%)</Label>
                <div className="relative">
                  <Input
                    id="mpDiscount"
                    type="number"
                    min="0"
                    max="100"
                    value={data.payments.mpDiscount}
                    onChange={(e) =>
                      updatePayment("mpDiscount", Number(e.target.value))
                    }
                    className="pl-8"
                  />
                  <span className="absolute left-3 top-2.5 text-content-tertiary">
                    %
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-dashed border-border">
                <Label htmlFor="mpExpiration" className="text-xs">
                  Abandono Carrito (Minutos)
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="mpExpiration"
                    type="number"
                    min="5"
                    value={data.payments.mpExpirationMinutes}
                    onChange={(e) =>
                      updatePayment(
                        "mpExpirationMinutes",
                        Number(e.target.value)
                      )
                    }
                    className="h-8 text-sm"
                  />
                  <span className="absolute right-3 top-2 text-xs text-content-tertiary">
                    min
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Details Section */}
      <div className="surface-secondary rounded-lg p-4 space-y-4 border border-border">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🏛️</span>
          <h3 className="font-semibold text-lg text-content-primary">
            Datos Bancarios (Para Email Automático)
          </h3>
        </div>
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-md text-sm flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
          <p>
            Estos datos se enviarán por correo al cliente que elija
            "Transferencia Bancaria". Asegúrate de que sean exactos.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bankName">Banco / Entidad</Label>
            <Input
              id="bankName"
              placeholder="Ej: Santander, MercadoPago, Brubank"
              value={data.payments.bankName || ""}
              onChange={(e) => updatePayment("bankName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankHolder">Titular de la Cuenta</Label>
            <Input
              id="bankHolder"
              placeholder="Nombre Apellido / Razón Social"
              value={data.payments.bankHolder || ""}
              onChange={(e) => updatePayment("bankHolder", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankCbu">CBU / CVU</Label>
            <Input
              id="bankCbu"
              placeholder="0000000000000000000000"
              value={data.payments.bankCbu || ""}
              onChange={(e) => updatePayment("bankCbu", e.target.value)}
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankAlias">Alias</Label>
            <Input
              id="bankAlias"
              placeholder="mi.alias.banco"
              value={data.payments.bankAlias || ""}
              onChange={(e) => updatePayment("bankAlias", e.target.value)}
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankCuit">CUIT (Opcional)</Label>
            <Input
              id="bankCuit"
              placeholder="20-12345678-9"
              value={data.payments.bankCuit || ""}
              onChange={(e) => updatePayment("bankCuit", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Guardando..." : "Guardar Configuración de Pagos"}
        </Button>
      </div>
    </form>
  );
}
